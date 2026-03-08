"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  UploadCloud, 
  Target,
  TerminalSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// MOCK DATA
const mockAnalysisData = {
  jobTitle: "Frontend Developer",
  company: "Vercel",
  matchScore: 68,
  summary: "Your resume shows strong foundational React skills, but misses key requirements around performance optimization and CI/CD pipelines mentioned in the JD.",
  matchedSkills: ["React", "TypeScript", "Tailwind CSS", "Git"],
  missingKeywords: ["Next.js App Router", "Webpack", "Web Vitals", "GitHub Actions"],
  jdResponsibilities: [
    { text: "Build and maintain scalable UI components using React and TypeScript.", matched: true },
    { text: "Optimize web applications for maximum speed and Core Web Vitals.", matched: false },
    { text: "Collaborate with designers to implement pixel-perfect layouts.", matched: true },
    { text: "Set up and maintain automated testing and CI/CD pipelines.", matched: false },
  ],
  bulletSuggestions: [
    {
      originalConcept: "Built a responsive portfolio website using React and CSS.",
      suggestedRewrite: "Engineered a high-performance portfolio application using React and Tailwind CSS, optimizing components to improve Core Web Vitals by 15%.",
      reasoning: "Adds the 'Web Vitals' keyword and shifts the tone from 'building' to 'engineering for performance', matching the JD's focus."
    },
    {
      originalConcept: "Pushed code to GitHub and deployed on Vercel.",
      suggestedRewrite: "Architected automated CI/CD pipelines using GitHub Actions for seamless deployment to Vercel.",
      reasoning: "Directly addresses the missing CI/CD and GitHub Actions requirements."
    }
  ]
};

export default function AnalyzeFitPage() {
  const router = useRouter();
  const data = mockAnalysisData;

  // Calculate SVG stroke array for the circular progress gauge
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.matchScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 stroke-green-500";
    if (score >= 60) return "text-orange-500 stroke-orange-500";
    return "text-red-500 stroke-red-500";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* --- Header --- */}
      {/*<header className="flex items-center justify-between border-b border-border bg-card px-8 py-4 shrink-0">
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
            <h1 className="text-xl font-serif tracking-wide text-foreground">
              {data.jobTitle} <span className="text-muted-foreground">@ {data.company}</span>
            </h1>
            <p className="text-sm text-muted-foreground font-dmsans">
              Resume Analysis & Tailoring Guide
            </p>
          </div>
        </div>
        

      </header>*/}
      
      <header className="flex justify-between items-center gap-3 border-b border-border bg-card px-5 py-3">
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
              {data.jobTitle} <span className="text-muted-foreground">@ {data.company}</span>
            </h1>
            <p className="text-sm text-muted-foreground font-dmsans">
              Resume Analysis & Tailoring Guide
            </p>
          </div>
        </div>
        
        <Button variant='outline' className="flex items-center gap-2 cursor-pointer">
          <UploadCloud className="w-4 h-4" />
          Upload Tailored Resume
        </Button>
      </header>

      {/* --- Main Split Pane --- */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden h-[calc(100vh-80px)] max-w-[1600px] mx-auto w-full">
        
        {/* LEFT PANE: The Target (JD Context) */}
        <div className="w-[40%] flex flex-col bg-card border border-border rounded-md overflow-hidden shadow-sm">
          <div className="bg-muted/30 px-6 py-4 border-b border-border shrink-0">
            <h2 className="font-serif text-lg font-medium flex items-center gap-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              The Target
            </h2>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-8 pr-4">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Core Responsibilities</h3>
              <div className="space-y-4 font-dmsans">
                {data.jdResponsibilities.map((resp, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-lg border ${resp.matched ? 'bg-green-50/50 border-green-100' : 'bg-muted/30 border-dashed border-border'}`}>
                    <div className="mt-0.5 shrink-0">
                      {resp.matched ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${resp.matched ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {resp.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT PANE: The Analysis & Refactor */}
        <div className="w-[60%] flex flex-col bg-card border border-border rounded-md overflow-hidden shadow-sm">
          <div className="bg-orange-50/50 px-6 py-4 border-b border-orange-100 shrink-0 flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-orange-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              AI Action Plan
            </h2>
          </div>

          <div className="p-8 overflow-y-auto flex-1 space-y-10 pr-6">
            
            {/* 1. EXECUTIVE SUMMARY & SCORE */}
            <section className="flex items-center gap-8 pb-8 border-b border-border">
              {/* SVG Donut Chart */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r={radius} className="stroke-muted fill-none" strokeWidth="8" />
                  <circle 
                    cx="64" cy="64" r={radius} 
                    className={`fill-none transition-all duration-1000 ease-out ${getScoreColor(data.matchScore)}`} 
                    strokeWidth="8" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-3xl font-serif font-bold ${getScoreColor(data.matchScore).split(' ')[0]}`}>
                    {data.matchScore}%
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-serif font-semibold mb-2">Review Summary</h3>
                <p className="text-[15px] text-muted-foreground font-dmsans leading-relaxed mb-4">
                  {data.summary}
                </p>
                
                {/* Keyword Gaps moved into the summary section for immediate context */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-semibold text-muted-foreground mr-2 self-center">Missing Keywords:</span>
                  {data.missingKeywords.map(skill => (
                    <Badge key={skill} variant="outline" className="bg-red-50 text-red-700 border-red-200 border-dashed">
                      <XCircle className="w-3 h-3 mr-1" /> {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. UNIFIED DIFF VIEWER */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <TerminalSquare className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-serif font-semibold">Suggested Refactors</h3>
                <span className="ml-2 text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {data.bulletSuggestions.length} changes requested
                </span>
              </div>

              <div className="space-y-8">
                {data.bulletSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    {/* The "Why" explanation floating above the diff */}
                    <p className="text-sm text-muted-foreground font-medium pl-3 border-l-2 border-orange-400">
                      <span className="font-bold text-foreground">Why: </span>
                      {suggestion.reasoning}
                    </p>

                    {/* The Diff Box */}
                    <div className="font-mono text-[13px] rounded-sm overflow-hidden border border-border bg-zinc-50/30 leading-relaxed shadow-sm">
                      
                      {/* Deletion (Old Resume Bullet) */}
                      <div className="flex w-full bg-[#FFEBE9] text-[#24292F] px-4 py-3">
                        <span className="w-8 text-red-500 select-none opacity-70 shrink-0 text-right pr-4">-</span>
                        <span className="flex-1 whitespace-pre-wrap">{suggestion.originalConcept}</span>
                      </div>
                      
                      {/* Insertion (AI Suggested Rewrite) */}
                      <div className="flex w-full bg-[#E6FFEC] text-[#24292F] px-4 py-3 border-t border-white/50">
                        <span className="w-8 text-green-600 select-none opacity-70 shrink-0 text-right pr-4">+</span>
                        <span className="flex-1 whitespace-pre-wrap">{suggestion.suggestedRewrite}</span>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}