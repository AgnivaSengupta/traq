"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Target,
  TerminalSquare,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyzeResumeMatch } from "@/lib/actions/analyze-actions";

type RequirementAssessment = {
  requirementText: string;
  category: "responsibility" | "skill";
  status: "matched" | "partial" | "missing";
  resumeEvidence: string[];
  confidence: number;
};

type BulletSuggestion = {
  originalQuote: string;
  matchedRequirement: string;
  changeType: "missing_keyword" | "clarify_impact" | "quantify_result";
  suggestedRewrite: string;
  reasoning: string;
  confidence: number;
};

type LegacyAnalysisResult = {
  matchScore?: number;
  summary?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  missingKeywords?: string[];
  jdResponsibilities?: { text: string; matched: boolean }[];
  bulletSuggestions?: {
    originalConcept?: string;
    originalQuote?: string;
    suggestedRewrite?: string;
    reasoning?: string;
    matchedRequirement?: string;
    changeType?: BulletSuggestion["changeType"];
    confidence?: number;
  }[];
  requirementAssessments?: RequirementAssessment[];
};

interface AnalyzeFitClientProps {
  jobData: {
    _id: string;
    company: string;
    position: string;
    analysisResult: LegacyAnalysisResult;
  };
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-500 stroke-green-500";
  if (score >= 60) return "text-orange-500 stroke-orange-500";
  return "text-red-500 stroke-red-500";
}

function getRequirementClasses(status: RequirementAssessment["status"]) {
  if (status === "matched") {
    return {
      container: "bg-green-50/50 border-green-100",
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      text: "text-foreground",
      pill: "bg-green-100 text-green-700",
      label: "Matched",
    };
  }

  if (status === "partial") {
    return {
      container: "bg-orange-50/40 border-orange-100",
      icon: <div className="w-5 h-5 rounded-full border-2 border-orange-300" />,
      text: "text-foreground",
      pill: "bg-orange-100 text-orange-700",
      label: "Partial",
    };
  }

  return {
    container: "bg-muted/30 border-dashed border-border",
    icon: <XCircle className="w-5 h-5 text-red-400" />,
    text: "text-muted-foreground",
    pill: "bg-red-100 text-red-700",
    label: "Missing",
  };
}

function getSuggestionLabel(changeType: BulletSuggestion["changeType"]) {
  if (changeType === "clarify_impact") return "Clarify impact";
  if (changeType === "quantify_result") return "Quantify result";
  return "Keyword alignment";
}

function normalizeAnalysisResult(analysisResult: LegacyAnalysisResult) {
  const requirementAssessments =
    analysisResult.requirementAssessments ??
    [
      ...(analysisResult.jdResponsibilities || []).map((requirement) => ({
        requirementText: requirement.text,
        category: "responsibility" as const,
        status: requirement.matched ? ("matched" as const) : ("missing" as const),
        resumeEvidence: [],
        confidence: requirement.matched ? 0.8 : 0.55,
      })),
      ...(analysisResult.matchedSkills || []).map((skill) => ({
        requirementText: skill,
        category: "skill" as const,
        status: "matched" as const,
        resumeEvidence: [],
        confidence: 0.8,
      })),
      ...((analysisResult.missingSkills || analysisResult.missingKeywords || []).map((skill) => ({
        requirementText: skill,
        category: "skill" as const,
        status: "missing" as const,
        resumeEvidence: [],
        confidence: 0.55,
      })) ?? []),
    ];

  const bulletSuggestions = (analysisResult.bulletSuggestions || []).map(
    (suggestion) => ({
      originalQuote: suggestion.originalQuote || suggestion.originalConcept || "",
      matchedRequirement:
        suggestion.matchedRequirement || "Resume alignment",
      changeType: suggestion.changeType || "clarify_impact",
      suggestedRewrite: suggestion.suggestedRewrite || "",
      reasoning: suggestion.reasoning || "Legacy suggestion",
      confidence: suggestion.confidence ?? 0.7,
    }),
  );

  return {
    matchScore: analysisResult.matchScore ?? 0,
    summary: analysisResult.summary || "No summary available yet.",
    matchedSkills: analysisResult.matchedSkills || [],
    missingSkills:
      analysisResult.missingSkills || analysisResult.missingKeywords || [],
    requirementAssessments,
    bulletSuggestions: bulletSuggestions.filter(
      (suggestion) => suggestion.originalQuote && suggestion.suggestedRewrite,
    ),
  };
}

export default function AnalyzeFitClient({ jobData }: AnalyzeFitClientProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const router = useRouter();

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await analyzeResumeMatch(jobData._id, true);
      if (response.success) {
        router.refresh();
      } else {
        alert(response.error || "Failed to regenerate");
      }
    } catch (error) {
      alert("Failed to regenerate");
      console.error(error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const data = normalizeAnalysisResult(jobData.analysisResult);
  const responsibilityAssessments = data.requirementAssessments.filter(
    (requirement) => requirement.category === "responsibility",
  );
  const skillAssessments = data.requirementAssessments.filter(
    (requirement) => requirement.category === "skill",
  );

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (data.matchScore / 100) * circumference;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-5 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-serif tracking-wide text-foreground">
              {jobData.position}{" "}
              <span className="text-muted-foreground">@ {jobData.company}</span>
            </h1>
            <p className="font-dmsans text-sm text-muted-foreground">
              Resume Analysis & Tailoring Guide
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex cursor-pointer items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`}
            />
            {isRegenerating ? "Analyzing..." : "Regenerate Analysis"}
          </Button>
          <Button variant="outline" className="flex cursor-pointer items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Upload Tailored Resume
          </Button>
        </div>
      </header>

      <div className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-[1600px] flex-1 gap-6 overflow-hidden p-6">
        <div className="flex w-[40%] flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <div className="shrink-0 border-b border-border bg-muted/30 px-6 py-4">
            <h2 className="flex items-center gap-2 font-serif text-lg font-medium">
              <Target className="w-5 h-5 text-muted-foreground" />
              The Target
            </h2>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto p-6 pr-4">
            <section>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Responsibilities
              </h3>
              <div className="space-y-4 font-dmsans">
                {responsibilityAssessments.map((requirement, index) => {
                  const styles = getRequirementClasses(requirement.status);
                  return (
                    <div
                      key={`${requirement.requirementText}-${index}`}
                      className={`rounded-lg border p-3 ${styles.container}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5 shrink-0">{styles.icon}</div>
                        <div className="flex-1">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className={`text-sm leading-relaxed ${styles.text}`}>
                              {requirement.requirementText}
                            </p>
                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles.pill}`}
                            >
                              {styles.label}
                            </span>
                          </div>
                          {requirement.resumeEvidence.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Resume Evidence
                              </p>
                              {requirement.resumeEvidence.map((quote) => (
                                <div
                                  key={quote}
                                  className="rounded-md bg-background/70 px-3 py-2 text-sm text-muted-foreground"
                                >
                                  {quote}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Skills Review
              </h3>
              <div className="space-y-3">
                {skillAssessments.map((requirement, index) => {
                  const styles = getRequirementClasses(requirement.status);
                  return (
                    <div
                      key={`${requirement.requirementText}-${index}`}
                      className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {requirement.requirementText}
                        </p>
                        {requirement.resumeEvidence[0] && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            Evidence: {requirement.resumeEvidence[0]}
                          </p>
                        )}
                      </div>
                      <span
                        className={`ml-3 shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles.pill}`}
                      >
                        {styles.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="flex w-[60%] flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-orange-50/50 px-6 py-4">
            <h2 className="flex items-center gap-2 font-serif text-lg font-medium text-orange-900">
              <Sparkles className="w-5 h-5 text-orange-500" />
              AI Action Plan
            </h2>
          </div>

          <div className="flex-1 space-y-10 overflow-y-auto p-8 pr-6">
            <section className="flex items-center gap-8 border-b border-border pb-8">
              <div className="relative flex shrink-0 items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className="stroke-muted fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className={`fill-none transition-all duration-1000 ease-out ${getScoreColor(data.matchScore)}`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span
                    className={`text-3xl font-serif font-bold ${getScoreColor(data.matchScore).split(" ")[0]}`}
                  >
                    {data.matchScore}%
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="mb-2 text-xl font-serif font-semibold">Review Summary</h3>
                <p className="mb-4 font-dmsans text-[15px] leading-relaxed text-muted-foreground">
                  {data.summary}
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="mr-2 self-center text-sm font-semibold text-muted-foreground">
                    Matched Skills:
                  </span>
                  {data.matchedSkills.length > 0 ? (
                    data.matchedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No explicit skill matches yet.</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="mr-2 self-center text-sm font-semibold text-muted-foreground">
                    Missing Keywords:
                  </span>
                  {data.missingSkills.length > 0 ? (
                    data.missingSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-red-200 border-dashed bg-red-50 text-red-700"
                      >
                        <XCircle className="w-3 h-3 mr-1" /> {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No critical missing keywords detected.</span>
                  )}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6 flex items-center gap-2">
                <TerminalSquare className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-serif font-semibold">Grounded Rewrite Suggestions</h3>
                <span className="ml-2 rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                  {data.bulletSuggestions.length} changes requested
                </span>
              </div>

              <div className="space-y-8">
                {data.bulletSuggestions.length > 0 ? (
                  data.bulletSuggestions.map((suggestion, index) => (
                    <div key={`${suggestion.originalQuote}-${index}`} className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {getSuggestionLabel(suggestion.changeType)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Confidence: {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>

                      <p className="border-l-2 border-orange-400 pl-3 text-sm font-medium text-muted-foreground">
                        <span className="font-bold text-foreground">Requirement: </span>
                        {suggestion.matchedRequirement}
                      </p>

                      <p className="border-l-2 border-border pl-3 text-sm font-medium text-muted-foreground">
                        <span className="font-bold text-foreground">Why: </span>
                        {suggestion.reasoning}
                      </p>

                      <div className="overflow-hidden rounded-sm border border-border bg-zinc-50/30 font-mono text-[13px] leading-relaxed shadow-sm">
                        <div className="flex w-full bg-[#FFEBE9] px-4 py-3 text-[#24292F]">
                          <span className="w-8 shrink-0 select-none pr-4 text-right text-red-500 opacity-70">
                            -
                          </span>
                          <span className="flex-1 whitespace-pre-wrap">
                            {suggestion.originalQuote}
                          </span>
                        </div>

                        <div className="flex w-full border-t border-white/50 bg-[#E6FFEC] px-4 py-3 text-[#24292F]">
                          <span className="w-8 shrink-0 select-none pr-4 text-right text-green-600 opacity-70">
                            +
                          </span>
                          <span className="flex-1 whitespace-pre-wrap">
                            {suggestion.suggestedRewrite}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                    No grounded rewrites are needed right now. The existing resume already supports the strongest JD requirements.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
