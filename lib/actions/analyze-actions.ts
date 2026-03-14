"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import z from "zod";
import connectDB from "../db";
import { JobApplication } from "../models";
// import  PdfParse from "pdf-parse";
import { extractText } from "unpdf";
import { generateObject } from "ai";
import { getFileViewUrl } from "./upload";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_KEY });

// zod schema for the analyzed data
const AnalyzeSchema = z.object({
  matchScore: z.number().min(0).max(100).describe("Estimated ATS match percentage"),
  summary: z.string().describe("A 2-4 line executive summary of the resume's fit"),
  matchedSkills: z.array(z.string()).describe("Required skills found in the resume"),
  missingSkills: z.array(z.string()).describe("Missing skills in the resume compared to the JD"),
  jdResponsibilities: z.array(z.object({
    text: z.string().describe("The core responsibilty of JD"),
    matched: z.boolean().describe("True core responsibiliy from the JD"),
  })),
  bulletSuggestions: z.array(z.object({
      originalConcept: z.string().describe("A direct quote of a weak bullet point from the resume"),
      suggestedRewrite: z.string().describe("The optimized, ATS-friendly rewrite of that bullet"),
      reasoning: z.string().describe("Why this rewrite is better")
    })).max(10)
}) 


export async function analyzeResumeMatch(jobId: string) {
  try {
    await connectDB();
    
    const job = await JobApplication.findById(jobId).populate("resume");
    if (!job) throw new Error("Job Application not found");
    if (!job.resume || !job.resume.fileKey) throw new Error("No resume linked!");
    
    const urlResult = await getFileViewUrl(job.resume.fileKey);
        if (!urlResult.success || !urlResult.url) {
          throw new Error("Failed to access the resume file in secure storage.");
        }
    
    const response = await fetch(urlResult.url);
    if (!response.ok) throw new Error("Failed to download PDF from S3.");
    
    const arrayBuffer = await response.arrayBuffer();
    
    const pdfData = await extractText(new Uint8Array(arrayBuffer));
    const resumeText = pdfData.text;
    
    const jdContext = `
        Job Title: ${job.position}
        Company: ${job.company}
        Core Respnsibilities: ${job.description.coreResponsibilities?.join(" | ")}
        Required Skills: ${job.description.requiredSkills?.join(" | ")}
      `;
  
    const { object: analysisResult } = await generateObject({
          model: openrouter.chat('arcee-ai/trinity-large-preview:free'), 
          schema: AnalyzeSchema,
          prompt: `
            You are an expert technical recruiter and ATS parsing software.
            Compare the candidate's Resume against the Job Description.
            Be highly critical. If a skill is not explicitly in the resume, mark it as missing.
            For bullet suggestions, focus on quantifiable metrics and matching the JD's exact keywords.
            
            --- JOB DESCRIPTION ---
            ${jdContext}
            
            --- CANDIDATE RESUME ---
            ${resumeText}
          `,
        });
  
    job.analysisResult = analysisResult;
        job.lastAnalyzedAt = new Date();
        await job.save();
    
        // 6. Return the data to the frontend
        return { success: true, data: analysisResult };
  } catch (err: any) {
    console.error("Analysis failed: ", err);
    return {success: false, error: err.message || "Failed to analyze resume"}
  }
}