"use server";

import { createHash } from "crypto";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import z from "zod";
import { revalidatePath } from "next/cache";
import connectDB from "../db";
import { JobApplication } from "../models";
import { extractText } from "unpdf";
import { getFileViewUrl } from "./upload";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_KEY });
const analysisModel = openrouter.chat("nvidia/nemotron-3-super-120b-a12b:free");
const ANALYSIS_VERSION = "resume-analysis-v2";

const ResumeEvidenceSchema = z.object({
  explicitSkills: z.array(z.string()).max(40),
  evidenceBullets: z
    .array(
      z.object({
        quote: z.string(),
        focus: z.string(),
      }),
    )
    .max(25),
});

const RequirementAssessmentSchema = z.object({
  requirementText: z.string(),
  category: z.enum(["responsibility", "skill"]),
  status: z.enum(["matched", "partial", "missing"]),
  resumeEvidence: z.array(z.string()).max(3),
  confidence: z.number().min(0).max(1),
});

const ComparisonSchema = z.object({
  matchedSkills: z.array(z.string()).max(20),
  missingSkills: z.array(z.string()).max(20),
  requirementAssessments: z.array(RequirementAssessmentSchema).max(40),
});

const SuggestionSchema = z.object({
  originalQuote: z.string(),
  matchedRequirement: z.string(),
  changeType: z.enum(["missing_keyword", "clarify_impact", "quantify_result"]),
  suggestedRewrite: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
});

type ResumeEvidence = z.infer<typeof ResumeEvidenceSchema>;
type ComparisonResult = z.infer<typeof ComparisonSchema>;
type BulletSuggestion = z.infer<typeof SuggestionSchema>;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function canonicalize(value: string) {
  return normalizeWhitespace(value).toLowerCase();
}

function dedupePreserveOrder(values: string[]) {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const value of values) {
    const normalized = normalizeWhitespace(value);
    if (!normalized) continue;

    const key = canonicalize(normalized);
    if (seen.has(key)) continue;

    seen.add(key);
    deduped.push(normalized);
  }

  return deduped;
}

function toTextContent(raw: unknown) {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw
      .filter((value): value is string => typeof value === "string")
      .join("\n");
  }
  if (raw && typeof raw === "object" && "text" in raw) {
    return toTextContent((raw as { text: unknown }).text);
  }
  return "";
}

function normalizeResumeText(raw: unknown) {
  const lines = toTextContent(raw)
    .split(/\r?\n/)
    .map((line) => line.replace(/\u0000/g, "").trim())
    .filter(Boolean);

  const collapsedLines: string[] = [];

  for (const line of lines) {
    const previousLine = collapsedLines[collapsedLines.length - 1];

    if (previousLine && canonicalize(previousLine) === canonicalize(line)) {
      continue;
    }

    if (
      previousLine &&
      !/[.!?:]$/.test(previousLine) &&
      !/^[\u2022\-*]/.test(line) &&
      previousLine.length < 120
    ) {
      collapsedLines[collapsedLines.length - 1] = `${previousLine} ${line}`;
      continue;
    }

    collapsedLines.push(line);
  }

  return collapsedLines.join("\n");
}

function extractResumeBullets(normalizedResume: string) {
  return dedupePreserveOrder(
    normalizedResume
      .split(/\n+/)
      .map((line) => line.replace(/^[\u2022\-*]\s*/, "").trim())
      .filter((line) => line.length > 20),
  ).slice(0, 30);
}

function buildNormalizedJd(job: {
  position: string;
  company: string;
  description?: {
    companyIntro?: string | null;
    coreResponsibilities?: string[];
    requiredSkills?: string[];
  };
}) {
  return {
    title: normalizeWhitespace(job.position || ""),
    company: normalizeWhitespace(job.company || ""),
    intro: normalizeWhitespace(job.description?.companyIntro || ""),
    responsibilities: dedupePreserveOrder(
      job.description?.coreResponsibilities || [],
    ),
    skills: dedupePreserveOrder(job.description?.requiredSkills || []),
  };
}

function buildAnalysisFingerprint(
  normalizedResume: string,
  normalizedJd: ReturnType<typeof buildNormalizedJd>,
) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: ANALYSIS_VERSION,
        resume: normalizedResume,
        jd: normalizedJd,
      }),
    )
    .digest("hex");
}

function buildJdFingerprint(normalizedJd: ReturnType<typeof buildNormalizedJd>) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: ANALYSIS_VERSION,
        jd: normalizedJd,
      }),
    )
    .digest("hex");
}

function quoteExistsInResume(quote: string, resumeText: string) {
  return canonicalize(resumeText).includes(canonicalize(quote));
}

function skillExistsInResume(
  skill: string,
  resumeText: string,
  explicitSkills: string[],
) {
  const normalizedSkill = canonicalize(skill);
  return (
    explicitSkills.some(
      (candidate) => canonicalize(candidate) === normalizedSkill,
    ) || canonicalize(resumeText).includes(normalizedSkill)
  );
}

function computeMatchScore(
  requirementAssessments: ComparisonResult["requirementAssessments"],
) {
  if (requirementAssessments.length === 0) return 0;

  const earned = requirementAssessments.reduce((total, requirement) => {
    if (requirement.status === "matched") return total + 1;
    if (requirement.status === "partial") return total + 0.5;
    return total;
  }, 0);

  return Math.round((earned / requirementAssessments.length) * 100);
}

function buildSummary(matchScore: number, comparison: ComparisonResult) {
  const matchedCount = comparison.requirementAssessments.filter(
    (requirement) => requirement.status === "matched",
  ).length;
  const partialCount = comparison.requirementAssessments.filter(
    (requirement) => requirement.status === "partial",
  ).length;
  const missingCount = comparison.requirementAssessments.filter(
    (requirement) => requirement.status === "missing",
  ).length;

  const skillSentence =
    comparison.missingSkills.length > 0
      ? `Top uncovered skill gaps are ${comparison.missingSkills.slice(0, 3).join(", ")}.`
      : "The resume already covers the major skills called out in the job description.";

  return `This resume currently maps to ${matchedCount} matched requirements, ${partialCount} partial matches, and ${missingCount} missing requirements for an overall fit score of ${matchScore}%. ${skillSentence}`;
}

function filterRequirementAssessments(
  comparison: ComparisonResult,
  normalizedResume: string,
  explicitSkills: string[],
) {
  const validatedAssessments = comparison.requirementAssessments.map(
    (requirement) => {
      const validatedEvidence = dedupePreserveOrder(
        requirement.resumeEvidence.filter((quote) =>
          quoteExistsInResume(quote, normalizedResume),
        ),
      );

      const alreadyPresent =
        requirement.category === "skill"
          ? skillExistsInResume(
              requirement.requirementText,
              normalizedResume,
              explicitSkills,
            )
          : validatedEvidence.length > 0;

      let nextStatus = requirement.status;
      if (alreadyPresent && nextStatus === "missing") nextStatus = "matched";
      if (
        alreadyPresent &&
        nextStatus === "partial" &&
        validatedEvidence.length > 0
      ) {
        nextStatus = "matched";
      }

      return {
        ...requirement,
        status: nextStatus,
        resumeEvidence: validatedEvidence,
      };
    },
  );

  const matchedSkills = dedupePreserveOrder(
    comparison.matchedSkills.filter((skill) =>
      skillExistsInResume(skill, normalizedResume, explicitSkills),
    ),
  );

  const missingSkills = dedupePreserveOrder(
    comparison.missingSkills.filter(
      (skill) => !skillExistsInResume(skill, normalizedResume, explicitSkills),
    ),
  );

  return {
    matchedSkills,
    missingSkills,
    requirementAssessments: validatedAssessments,
  };
}

function filterSuggestions(
  suggestions: BulletSuggestion[],
  normalizedResume: string,
  requirementAssessments: ComparisonResult["requirementAssessments"],
) {
  const weakRequirements = new Set(
    requirementAssessments
      .filter((requirement) => requirement.status !== "matched")
      .map((requirement) => canonicalize(requirement.requirementText)),
  );

  const seenQuotes = new Set<string>();

  return suggestions.filter((suggestion) => {
    if (suggestion.confidence < 0.65) return false;
    if (!quoteExistsInResume(suggestion.originalQuote, normalizedResume)) {
      return false;
    }
    if (!weakRequirements.has(canonicalize(suggestion.matchedRequirement))) {
      return false;
    }

    const quoteKey = canonicalize(suggestion.originalQuote);
    if (seenQuotes.has(quoteKey)) return false;
    seenQuotes.add(quoteKey);

    if (
      canonicalize(suggestion.originalQuote) ===
      canonicalize(suggestion.suggestedRewrite)
    ) {
      return false;
    }

    return true;
  });
}

async function extractResumeEvidence(
  normalizedResume: string,
  resumeBullets: string[],
) {
  const { object } = await generateObject({
    model: analysisModel,
    schema: ResumeEvidenceSchema,
    prompt: `You are extracting explicit evidence from a resume for later comparison.

Rules:
- Copy quotes verbatim from the resume text when listing evidence bullets.
- Do not invent metrics, employers, tools, or responsibilities.
- Only list skills that are explicitly stated.
- If a bullet is already strong, keep it as-is in the quote.

Resume text:
${normalizedResume}

Candidate bullet-like lines:
${resumeBullets.join("\n")}`,
  });

  return {
    explicitSkills: dedupePreserveOrder(object.explicitSkills),
    evidenceBullets: object.evidenceBullets.filter((bullet) =>
      quoteExistsInResume(bullet.quote, normalizedResume),
    ),
  };
}

async function compareResumeToJd(
  normalizedJd: ReturnType<typeof buildNormalizedJd>,
  resumeEvidence: ResumeEvidence,
  normalizedResume: string,
) {
  const { object } = await generateObject({
    model: analysisModel,
    schema: ComparisonSchema,
    prompt: `Compare this structured job description against explicit resume evidence.

Rules:
- Mark a requirement as matched only if the resume clearly and explicitly supports it.
- Mark a requirement as partial if the resume is directionally relevant but missing specificity.
- Mark a requirement as missing if it is not explicitly present.
- Never mark a skill as missing if it appears in the resume evidence or resume text.
- Use exact resume quotes in resumeEvidence where possible.

Job description:
${JSON.stringify(normalizedJd, null, 2)}

Resume evidence:
${JSON.stringify(resumeEvidence, null, 2)}

Normalized resume text:
${normalizedResume}`,
  });

  return object;
}

async function generateRewriteSuggestions(
  normalizedJd: ReturnType<typeof buildNormalizedJd>,
  weakRequirements: ComparisonResult["requirementAssessments"],
  resumeEvidence: ResumeEvidence,
  normalizedResume: string,
) {
  if (weakRequirements.length === 0) return [];

  const { object } = await generateObject({
    model: analysisModel,
    schema: z.object({
      bulletSuggestions: z.array(SuggestionSchema).max(8),
    }),
    prompt: `Create targeted resume rewrite suggestions for only the weak or missing requirements below.

Rules:
- Suggest a rewrite only when the existing quote is real and explicitly present in the resume.
- Do not invent metrics, tools, ownership, team size, or outcomes.
- Do not rewrite bullets that already satisfy the requirement.
- Avoid style-only edits.
- Keep rewrites faithful to the original quote and only improve clarity, keyword alignment, or impact framing.

Weak requirements:
${JSON.stringify(weakRequirements, null, 2)}

Resume evidence:
${JSON.stringify(resumeEvidence, null, 2)}

Normalized JD:
${JSON.stringify(normalizedJd, null, 2)}

Normalized resume text:
${normalizedResume}`,
  });

  return object.bulletSuggestions;
}

export async function analyzeResumeMatch(
  jobId: string,
  forceRegenerate = false,
) {
  try {
    await connectDB();

    const job = await JobApplication.findById(jobId).populate("resume");
    if (!job) throw new Error("Job Application not found");
    if (!job.resume || !job.resume.fileKey)
      throw new Error("No resume linked!");
    if (!job.description) {
      throw new Error("No job description available for analysis.");
    }

    const normalizedJd = buildNormalizedJd(job);
    const jdFingerprint = buildJdFingerprint(normalizedJd);
    const currentResumeId =
      typeof job.resume._id?.toString === "function"
        ? job.resume._id.toString()
        : String(job.resume._id);

    const hasFastReusableAnalysis =
      !forceRegenerate &&
      Boolean(job.analysisResult) &&
      job.analyzedResumeId?.toString() === currentResumeId &&
      job.analyzedResumeFileKey === job.resume.fileKey &&
      job.analysisJdFingerprint === jdFingerprint;

    if (hasFastReusableAnalysis) {
      return { success: true, data: job.analysisResult, cached: true };
    }

    const urlResult = await getFileViewUrl(job.resume.fileKey);
    if (!urlResult.success || !urlResult.url) {
      throw new Error("Failed to access the resume file in secure storage.");
    }

    const response = await fetch(urlResult.url);
    if (!response.ok) throw new Error("Failed to download PDF from S3.");

    const arrayBuffer = await response.arrayBuffer();
    const pdfData = await extractText(new Uint8Array(arrayBuffer), {
      mergePages: true,
    });
    const normalizedResume = normalizeResumeText(pdfData.text);
    const resumeBullets = extractResumeBullets(normalizedResume);
    const analysisFingerprint = buildAnalysisFingerprint(
      normalizedResume,
      normalizedJd,
    );

    const hasReusableAnalysis =
      !forceRegenerate &&
      Boolean(job.analysisResult) &&
      Boolean(job.analysisFingerprint) &&
      job.analysisFingerprint === analysisFingerprint &&
      job.analyzedResumeId?.toString() === currentResumeId;

    if (hasReusableAnalysis) {
      return { success: true, data: job.analysisResult, cached: true };
    }

    const resumeEvidence = await extractResumeEvidence(
      normalizedResume,
      resumeBullets,
    );
    const rawComparison = await compareResumeToJd(
      normalizedJd,
      resumeEvidence,
      normalizedResume,
    );

    const validatedComparison = filterRequirementAssessments(
      rawComparison,
      normalizedResume,
      resumeEvidence.explicitSkills,
    );

    const weakRequirements = validatedComparison.requirementAssessments.filter(
      (requirement) => requirement.status !== "matched",
    );

    const rawSuggestions = await generateRewriteSuggestions(
      normalizedJd,
      weakRequirements,
      resumeEvidence,
      normalizedResume,
    );

    const bulletSuggestions = filterSuggestions(
      rawSuggestions,
      normalizedResume,
      validatedComparison.requirementAssessments,
    );

    const matchScore = computeMatchScore(
      validatedComparison.requirementAssessments,
    );
    const analysisResult = {
      matchScore,
      summary: buildSummary(matchScore, validatedComparison),
      matchedSkills: validatedComparison.matchedSkills,
      missingSkills: validatedComparison.missingSkills,
      requirementAssessments: validatedComparison.requirementAssessments,
      bulletSuggestions,
    };

    job.analysisResult = analysisResult;
    job.analyzedResumeId = job.resume._id;
    job.analysisFingerprint = analysisFingerprint;
    job.analysisJdFingerprint = jdFingerprint;
    job.analyzedResumeFileKey = job.resume.fileKey;
    job.lastAnalyzedAt = new Date();
    await job.save();

    revalidatePath("/applications");
    revalidatePath(`/applications/${jobId}/analyze`);

    return { success: true, data: analysisResult, cached: false };
  } catch (error) {
    console.error("Analysis failed: ", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to analyze resume",
    };
  }
}
