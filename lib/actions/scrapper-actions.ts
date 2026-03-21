"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import * as cheerio from "cheerio";
import z from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_KEY,
});

type ScrapeSeedData = {
  jobTitle?: string | null;
  companyName?: string | null;
  location?: string | null;
  estimatedSalary?: string | null;
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isAshbyUrl(url: URL) {
  return (
    url.hostname === "jobs.ashbyhq.com" ||
    url.hostname.endsWith(".ashbyhq.com")
  );
}

function getTextFromHtml(html: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, header, footer, nav").remove();
  return normalizeWhitespace($("body").text()).substring(0, 15000);
}

function extractAshbyJobPosting($: cheerio.CheerioAPI): {
  cleanText: string | null;
  seedData: ScrapeSeedData;
} {
  const jsonLdCandidates = $('script[type="application/ld+json"]')
    .map((_, element) => $(element).html() || "")
    .get();

  for (const candidate of jsonLdCandidates) {
    try {
      const parsed = JSON.parse(candidate) as
        | Record<string, unknown>
        | Array<Record<string, unknown>>;
      const entries = Array.isArray(parsed) ? parsed : [parsed];

      const jobPosting = entries.find(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          entry["@type"] === "JobPosting",
      );

      if (!jobPosting) continue;

      const descriptionHtml =
        typeof jobPosting.description === "string"
          ? jobPosting.description
          : "";

      const descriptionText = descriptionHtml
        ? normalizeWhitespace(cheerio.load(descriptionHtml).text())
        : null;

      const hiringOrganization =
        typeof jobPosting.hiringOrganization === "object" &&
        jobPosting.hiringOrganization !== null
          ? (jobPosting.hiringOrganization as Record<string, unknown>)
          : null;

      const jobLocations = Array.isArray(jobPosting.jobLocation)
        ? (jobPosting.jobLocation as Array<Record<string, unknown>>)
        : [];

      const location = jobLocations
        .map((jobLocation) => {
          const address =
            typeof jobLocation.address === "object" && jobLocation.address !== null
              ? (jobLocation.address as Record<string, unknown>)
              : null;
          if (!address) return null;

          const locality =
            typeof address.addressLocality === "string"
              ? address.addressLocality
              : "";
          const region =
            typeof address.addressRegion === "string" ? address.addressRegion : "";
          const country =
            typeof address.addressCountry === "string"
              ? address.addressCountry
              : "";

          return [locality, region, country].filter(Boolean).join(", ");
        })
        .find((value) => value && value.length > 0) || null;

      const baseSalary =
        typeof jobPosting.baseSalary === "object" && jobPosting.baseSalary !== null
          ? (jobPosting.baseSalary as Record<string, unknown>)
          : null;
      const salaryValue =
        baseSalary &&
        typeof baseSalary.value === "object" &&
        baseSalary.value !== null
          ? (baseSalary.value as Record<string, unknown>)
          : null;

      const minValue =
        salaryValue && typeof salaryValue.minValue === "number"
          ? salaryValue.minValue
          : null;
      const maxValue =
        salaryValue && typeof salaryValue.maxValue === "number"
          ? salaryValue.maxValue
          : null;
      const currency =
        baseSalary && typeof baseSalary.currency === "string"
          ? baseSalary.currency
          : null;
      const unitText =
        salaryValue && typeof salaryValue.unitText === "string"
          ? salaryValue.unitText
          : null;

      const estimatedSalary =
        minValue !== null || maxValue !== null
          ? `${currency ? `${currency} ` : ""}${minValue ?? ""}${
              minValue !== null && maxValue !== null ? " - " : ""
            }${maxValue ?? ""}${unitText ? ` / ${unitText}` : ""}`.trim()
          : null;

      return {
        cleanText: descriptionText,
        seedData: {
          jobTitle:
            typeof jobPosting.title === "string" ? jobPosting.title : null,
          companyName:
            hiringOrganization &&
            typeof hiringOrganization.name === "string"
              ? hiringOrganization.name
              : null,
          location,
          estimatedSalary,
        },
      };
    } catch {
      continue;
    }
  }

  return { cleanText: null, seedData: {} };
}

export async function scrapeAndSummarizeJD(_prevState: unknown, formData: FormData) {
  const url = formData.get("url") as string;

  if (!url) {
    return { error: "Please provide a valid URL.", data: null };
  }

  try {
    const parsedUrl = new URL(url);
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch webpage.");

    const html = await response.text();
    const $ = cheerio.load(html);

    let cleanText = "";
    let seedData: ScrapeSeedData = {};

    if (isAshbyUrl(parsedUrl)) {
      const ashbyData = extractAshbyJobPosting($);
      cleanText = ashbyData.cleanText || "";
      seedData = ashbyData.seedData;
    }

    if (!cleanText) {
      cleanText = getTextFromHtml(html);
    }

    if (!cleanText || cleanText.length < 200) {
      return {
        error:
          "Failed to extract meaningful job text from this page. The site may require a site-specific scraper.",
        data: null,
      };
    }

    const { object } = await generateObject({
      model: openrouter("arcee-ai/trinity-large-preview:free"),
      schema: z.object({
        jobTitle: z.string().describe("The official title of the job position."),
        companyName: z
          .string()
          .nullable()
          .describe("The name of the hiring company."),
        companyIntro: z
          .string()
          .nullable()
          .describe("A short 3-4 line description/intro about the company"),
        coreResponsibilities: z
          .array(z.string())
          .describe("List of main day-to-day duties."),
        requiredSkills: z
          .array(z.string())
          .describe("Must-have skills, tools, or qualifications."),
        estimatedSalary: z
          .string()
          .nullable()
          .describe("Salary range or compensation details if mentioned."),
        location: z.string().nullable().describe("The job location only."),
      }),
      prompt: `Analyze the following job description text and extract the required structured data.

Known page metadata:
- Job title: ${seedData.jobTitle || "Unknown"}
- Company: ${seedData.companyName || "Unknown"}
- Location: ${seedData.location || "Unknown"}
- Salary: ${seedData.estimatedSalary || "Unknown"}

If the page metadata above is reliable, prefer it over uncertain inference from the body text.

Job description text:
${cleanText}`,
    });

    return {
      error: null,
      data: {
        ...object,
        jobTitle: seedData.jobTitle || object.jobTitle,
        companyName: seedData.companyName || object.companyName,
        location: seedData.location || object.location,
        estimatedSalary: seedData.estimatedSalary || object.estimatedSalary,
      },
    };
  } catch (error) {
    console.error("Extraction error:", error);
    return {
      error:
        "Failed to process the job description. The site might be blocking scrapers.",
      data: null,
    };
  }
}
