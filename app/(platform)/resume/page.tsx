"use client";

import { useState } from "react";
import {
  FileText,
  Upload,
  MoreVertical,
  ExternalLink,
  Trash2,
  Calendar,
  Briefcase,
  Download,
  File,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path to your Shadcn buttons
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data: Later you will fetch this from your database
const MOCK_RESUMES = [
  {
    id: "res-1",
    name: "Software Engineer - Fullstack.pdf",
    label: "Fullstack",
    version: "v2.1",
    uploadDate: "2026-02-15",
    validUntil: "2026-06-15",
    fileUrl: "#",
    usageCount: 12,
    tags: ["MERN", "Next.js"],
  },
  {
    id: "res-2",
    name: "Backend Developer - Go.pdf",
    label: "Backend",
    version: "v1.0",
    uploadDate: "2026-03-01",
    validUntil: "2026-07-01",
    fileUrl: "#",
    usageCount: 4,
    tags: ["Go", "Microservices"],
  },
  {
    id: "res-3",
    name: "Agniva_Sengupta_SDE_Intern.pdf",
    label: "Internship",
    version: "v3.0",
    uploadDate: "2026-03-04",
    validUntil: "2026-09-04",
    fileUrl: "#",
    usageCount: 1,
    tags: ["Internship"],
  },
];

interface ResumeProps {
  id: string;
  name: string;
  label: string;
  version: string;
  uploadDate: string;
  validUntil: string;
  fileUrl: string;
  usageCount: number;
  tags: string[];
}

function ResumeCard({ resume, index }: { resume: ResumeProps; index: number }) {
  return (
    <div
      key={resume.id}
      // Add a top border to all items except the first one
      className={`flex items-start md:items-center gap-5 py-6 group hover:bg-muted/30 transition-colors px-2 rounded-lg bg-background border border-border cursor-pointer`}
    >
      {/* 1. Left Icon Container (File Type) */}
      <div className="flex items-center justify-center w-12 h-12 rounded shrink-0">
        <File className="size-7 text-red-500 fill-red-300"/>
      </div>

      {/* 2. Main Content Column */}
      <div className="flex-1 min-w-0">
        {/* Highlight Label */}
        <div className="text-sm font-medium text-orange-500 mb-1">
          {resume.label}
        </div>

        {/* File Name */}
        <h3 className="text-base font-medium text-foreground truncate mb-1.5">
          {resume.name}
        </h3>

        {/* Subtitle / Metadata */}
        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
          <span>
            {new Date(resume.uploadDate)
              .toLocaleDateString("en-GB")
              .replace(/\//g, ".")}
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Active until{" "}
            {new Date(resume.validUntil)
              .toLocaleDateString("en-GB")
              .replace(/\//g, ".")}
          </span>
          <span className="text-gray-300">|</span>
          <span>Used in {resume.usageCount} applications</span>
        </div>
      </div>

      {/* 3. Right Action Area */}
      <div className="flex items-center gap-4 shrink-0 mt-2 md:mt-0">
        <button className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors hidden sm:block">
          Download
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="sm:hidden">
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>Rename file</DropdownMenuItem>
            <DropdownMenuItem>View applications</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function ResumeVaultPage() {
  const [resumes, setResumes] = useState(MOCK_RESUMES);

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
        <span className="text-2xl font-serif tracking-wider ml-3">
          Resume Vault
        </span>
      </header>

      <div className="flex flex-col p-10 w-[80%] mx-auto">
        <div className="flex justify-between">        
          <h1 className="font-serif font-semibold text-xl tracking-wider mb-4">
            Versions
          </h1>
          
          <Button variant='outline' className="cursor-pointer">
            <Plus />
            Add Resume
          </Button>
        </div>
        <div className="h-full bg-secondary rounded-md p-2">
          <div className="flex flex-col gap-2">
            {resumes.map((resume, index) => (
              <ResumeCard key={index} resume={resume} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
