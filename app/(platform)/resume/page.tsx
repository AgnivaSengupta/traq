"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Download,
  File,
  Plus,
  Loader2,
  Eye,
  X,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path to your Shadcn buttons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { getFileViewUrl } from "@/lib/actions/upload";
import { getUserResumes, saveResumeRecord, deleteResume } from "@/lib/actions/resume";
import Image from "next/image";

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
      style={{ animationDelay: `${index * 70}ms` }}
      className="group relative flex cursor-pointer items-start gap-5 overflow-hidden rounded-md border border-border/70 bg-background/95 px-4 py-5 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition-all duration-300 ease-out  hover:border-orange-200 hover:bg-white hover:shadow-[0_18px_40px_rgba(251,146,60,0.12)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 md:items-center"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.12),transparent_38%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 ring-1 ring-orange-100 transition-transform duration-300 group-hover:scale-[1.04] group-hover:rotate-[-2deg]">
        <File className="size-7 fill-red-300 text-red-500" />
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="mb-1 text-sm font-medium text-orange-500 transition-transform duration-300 group-hover:translate-x-0.5">
          {resume.label}
        </div>

        <h3 className="mb-1.5 truncate text-base font-medium text-foreground transition-transform duration-300 group-hover:translate-x-0.5">
          {resume.name}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            {new Date(resume.updatedAt)
              .toLocaleDateString("en-GB")
              .replace(/\//g, ".")}
          </span>
          <span className="text-gray-300">•</span>
          <span>Version: {resume.version}</span>
        </div>
      </div>

      <div className="relative mt-2 flex shrink-0 items-center gap-3 md:mt-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleViewPDF(resume.fileKey)} // Pass the actual R2 key here
          disabled={isPreviewLoading}
          className="cursor-pointer border border-transparent bg-white/70 shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 group-hover:border-orange-100 group-hover:bg-white"
        >
          <Eye className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" /> View
        </Button>

        <button className="hidden text-sm font-medium text-orange-500 transition-all duration-300 hover:text-orange-600 group-hover:translate-x-0.5 sm:block">
          Download
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground transition-all duration-300 hover:bg-orange-50 hover:text-orange-600 group-hover:rotate-90"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="sm:hidden">
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>Rename file</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => triggerReplaceUpload(resume.fileKey)}
            >
              Replace file
            </DropdownMenuItem>
            <DropdownMenuItem>View applications</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(resume._id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function UploadingResumeCard({ file }: { file: File }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-dashed border-orange-500/40 bg-background px-4 py-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/8 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      <div className="flex items-start gap-5 md:items-center">
        <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
          <FileUp className="size-6 text-orange-500 motion-safe:animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>

        <div className="z-10 min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-orange-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            Uploading to Vault...
          </div>

          <h3 className="mb-2 truncate text-base font-medium text-foreground">
            {file.name}
          </h3>

          <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 animate-[slide_1s_ease-in-out_infinite_alternate]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumeLoadingCard({ index }: { index: number }) {
  return (
    <div
      style={{ animationDelay: `${index * 80}ms` }}
      className="flex items-start gap-5 rounded-2xl border border-border/60 bg-background/80 px-4 py-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 md:items-center"
    >
      <div className="h-12 w-12 shrink-0 rounded-2xl bg-muted animate-pulse" />
      <div className="flex-1 space-y-3">
        <div className="h-3 w-20 rounded-full bg-orange-100 animate-pulse" />
        <div className="h-4 w-2/3 rounded-full bg-muted animate-pulse" />
        <div className="h-3 w-40 rounded-full bg-muted/80 animate-pulse" />
      </div>
      <div className="hidden h-9 w-24 rounded-full bg-muted animate-pulse md:block" />
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
    const timeoutId = window.setTimeout(() => {
      void fetchResumes();
    }, 0);

    return () => window.clearTimeout(timeoutId);
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
      <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-3">
        <span className="ml-3 text-2xl font-serif tracking-wider">
          Resume Vault
        </span>
      </header>

      <div className="mx-auto flex w-[80%] flex-col p-10">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4">
            <h1 className="mb-2 font-serif text-xl font-semibold tracking-wider">
              Versions
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Keep polished resume variants ready for fast applications, quick previews, and clean replacements.
            </p>
          </div>

          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <Button
              variant="outline"
              className="cursor-pointer rounded-full border-orange-200 bg-white px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:shadow-[0_12px_30px_rgba(251,146,60,0.15)]"
              onClick={triggerNewUpload}
              disabled={isUploading}
            >
              {isUploading && !uploadTargetKey ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Add Resume
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-md border border-border/70 bg-secondary/70 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.06)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5">
          <div className="flex flex-col gap-3">
            {uploadingFile && <UploadingResumeCard file={uploadingFile} />}

            {resumes === null &&
              !uploadingFile &&
              Array.from({ length: 3 }).map((_, index) => (
                <ResumeLoadingCard key={index} index={index} />
              ))}

            {resumes !== null && resumes.length === 0 && !uploadingFile && (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-background/70 px-6 py-14 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
                <div className="rounded-full bg-orange-50 p-4 shadow-inner shadow-orange-100/70">
                  <Image
                    src="/Empty_folder_bgless.png"
                    alt="Empty Folder"
                    width={180}
                    height={96}
                    className="motion-safe:animate-[float_4s_ease-in-out_infinite]"
                  />
                </div>

                <h3 className="mt-5 text-center font-serif text-lg tracking-wider text-foreground">
                  No resumes found
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Add your first version and it will appear here with preview and replace actions.
                </p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in">
            <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-4">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                <h2 className="font-semibold">Resume Preview</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewUrl(null)}
                  className="transition-transform duration-200 hover:rotate-90"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <iframe
                src={`${previewUrl}#toolbar=0`}
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
