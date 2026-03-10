"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  Loader2,
  Eye,
  X,
  FileUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path to your Shadcn buttons
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { getFileViewUrl } from "@/lib/actions/upload";
import { getUserResumes, saveResumeRecord, deleteResume } from "@/lib/actions/resume";
import { Resume } from "@/lib/models/models.types";
import Image from "next/image";

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
  _id: string;
  // uploadDate: string;
  // validUntil: string;
  // usageCount: number;
  userId: string;
  name: string;
  fileKey: string;
  version: number;
  label?: string;
  // fileUrl: string;
  tags?: string[];
  isActive: boolean;
  updatedAt: string;
}

function ResumeCard({
  resume,
  index,
  isPreviewLoading,
  handleViewPDF,
  triggerReplaceUpload,
  handleDelete,
}: {
  resume: ResumeProps;
  index: number;
  isPreviewLoading: boolean;
  handleViewPDF: (fileKey: string) => void;
  triggerReplaceUpload: (existingKey: string) => void;
  handleDelete: (resumeId: string) => void;
}) {
  return (
    <div
      key={resume._id}
      // Add a top border to all items except the first one
      className={`flex items-start md:items-center gap-5 py-6 group hover:bg-muted/30 transition-colors px-2 rounded-lg bg-background border border-border cursor-pointer`}
    >
      {/* 1. Left Icon Container (File Type) */}
      <div className="flex items-center justify-center w-12 h-12 rounded shrink-0">
        <File className="size-7 text-red-500 fill-red-300" />
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
            {new Date(resume.updatedAt)
              .toLocaleDateString("en-GB")
              .replace(/\//g, ".")}
          </span>
          <span className="text-gray-300">|</span>

          <span className="text-gray-300">|</span>
          <span>Version: {resume.version}</span>
        </div>
      </div>

      {/* 3. Right Action Area */}
      <div className="flex items-center gap-4 shrink-0 mt-2 md:mt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewPDF(resume.fileKey)} // Pass the actual R2 key here
          disabled={isPreviewLoading}
          className="cursor-pointer"
        >
          <Eye className="w-4 h-4 mr-2" /> View
        </Button>

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
            <DropdownMenuItem
              onClick={() => triggerReplaceUpload(resume.fileKey)}
            >
              Replace file
            </DropdownMenuItem>
            <DropdownMenuItem>View applications</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(resume._id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function UploadingResumeCard({ file }: { file: File }) {
  return (
    <div className="flex items-start md:items-center gap-5 py-6 px-2 rounded-lg bg-background border border-dashed border-orange-500/50 relative overflow-hidden">
      {/* Animated subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />

      {/* Left Icon Container - Bouncing */}
      <div className="flex items-center justify-center w-12 h-12 rounded shrink-0 bg-orange-100 relative z-10">
        <FileUp className="size-6 text-orange-500 animate-bounce" />
      </div>

      {/* Main Content Column - Pulsing text/skeleton */}
      <div className="flex-1 min-w-0 z-10">
        <div className="text-sm font-medium text-orange-500 mb-1 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Uploading to Vault...
        </div>

        <h3 className="text-base font-medium text-foreground truncate mb-2">
          {file.name}
        </h3>

        {/* Indeterminate Progress Bar */}
        <div className="w-full max-w-md h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 w-1/3 rounded-full animate-[slide_1s_ease-in-out_infinite_alternate]" />
        </div>
      </div>
    </div>
  );
}

export default function ResumeVaultPage() {
  const [resumes, setResumes] = useState<ResumeProps[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, error } = useFileUpload();

  const [uploadTargetKey, setUploadTargetKey] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // fetch the resumes from the database
  const fetchResumes = useCallback(async () => {
    const result = await getUserResumes();
    if (result.success && result.data) {
      setResumes(result.data as ResumeProps[]);
    } else {
      setResumes([]); // Fallback to empty array on error
    }
  }, []);

  // 2. Fetch on mount
  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // upload logic
  const triggerNewUpload = () => {
    setUploadTargetKey(null); // --> null means new upload
    fileInputRef.current?.click();
  };

  const triggerReplaceUpload = (existingKey: string) => {
    setUploadTargetKey(existingKey);
    fileInputRef.current?.click();
  };

  // 3. Function to handle the file once selected
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploadingFile(file);
    const finalKey = await uploadFile(file, uploadTargetKey || undefined);

    if (finalKey) {
      // file uploaded in R2 successfully
      // Need to update the DB
      const dbResult = await saveResumeRecord(file.name, finalKey);

      if (dbResult.error) {
        alert(
          "File uploaded, but failed to save to database: " + dbResult.error,
        );
      } else {
        setUploadTargetKey(null);
      }
    }
    setUploadingFile(null);
    setUploadTargetKey(null);
    event.target.value = "";
  };

  const handleViewPDF = async (fileKey: string) => {
    setIsPreviewLoading(true);
    // filekey would be stored in the DB
    const result = await getFileViewUrl(fileKey);

    if (result.success && result.url) {
      setPreviewUrl(result.url);
    } else {
      // need to add a toast
      alert("Failed to load PDF");
    }

    setIsPreviewLoading(false);
  };

  const handleDelete = async (resumeId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this resume? This cannot be undone.",
      )
    ) {
      return;
    }

    const result = await deleteResume(resumeId);

    if (result.error) {
      alert("Failed to delete: " + result.error);
    } else {
      // Re-fetch the data to remove the card from the screen
      await fetchResumes();
    }
  };
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

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }} // Hides the default input
            />
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={triggerNewUpload}
              disabled={isUploading}
            >
              {isUploading && !uploadTargetKey ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Add Resume
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="h-full bg-secondary rounded-md p-2">
          <div className="flex flex-col gap-2">
            {uploadingFile && <UploadingResumeCard file={uploadingFile} />}

            {resumes === null && !isUploading && (
              <div className="flex flex-col items-center justify-center py-10">
                <Image
                  src="/Empty_folder_bgless.png"
                  alt="Empty Folder"
                  width={200}
                  height={100}
                />

                <h3 className="text-center font-serif tracking-wider text-lg text-foreground">
                  No resumes found
                </h3>
              </div>
            )}
            {resumes !== null &&
              resumes.map((resume, index) => (
                <ResumeCard
                  key={resume._id}
                  resume={resume}
                  index={index}
                  isPreviewLoading={isPreviewLoading}
                  handleViewPDF={handleViewPDF}
                  triggerReplaceUpload={triggerReplaceUpload}
                  handleDelete={handleDelete}
                />
              ))}
          </div>
        </div>

        {previewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-5xl h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden border border-border">
              <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold">Resume Preview</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewUrl(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* The iframe displaying the pre-signed URL */}
              <iframe
                src={`${previewUrl}#toolbar=0`} // #toolbar=0 hides the default browser PDF controls for a cleaner look
                className="w-full h-full bg-zinc-100"
                title="PDF Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
