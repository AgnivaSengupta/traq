"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import * as cheerio from "cheerio";
import z from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_KEY,
});

export async function scrapeAndSummarizeJD(prevState: any, formData: FormData) {
  const url = formData.get("url") as string;

  if (!url) {
    return { error: "Please provide a valid URL.", data: null };
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch webpage.");

    const html = await response.text();

    const $ = cheerio.load(html);
    $("script, style, noscript, header, footer, nav").remove();

    const cleanText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 15000);
    
    // console.log(cleanText);

    const { object } = await generateObject({
          // You can swap this to a free model like 'meta-llama/llama-3-8b-instruct:free' for testing
          model: openrouter('arcee-ai/trinity-large-preview:free'), 
          schema: z.object({
            jobTitle: z.string().describe('The official title of the job position.'),
            companyName: z.string().nullable().describe('The name of the hiring company.'),
            companyIntro: z.string().nullable().describe('A short 3-4 line description/intro about the company'),
            coreResponsibilities: z.array(z.string()).describe('List of main day-to-day duties.'),
            requiredSkills: z.array(z.string()).describe('Must-have skills, tools, or qualifications.'),
            estimatedSalary: z.string().nullable().describe('Salary range or compensation details if mentioned.'),
            location: z.string().nullable().describe('The job location only.'),
          }),
          prompt: `Analyze the following job description text and extract the required structured data:\n\n${cleanText}`,
        });
    
    return { error: null, data: object };
  } catch (error) {
      console.error("Extraction error:", error);
      return { error: 'Failed to process the job description. The site might be blocking scrapers.', data: null };
  }
}
