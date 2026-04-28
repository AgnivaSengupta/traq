"use client";

import {
  Circle,
  FileSearch,
  MapPin,
  Paperclip,
  Upload,
  Wallet,
  Loader2,
  PanelRightClose,
} from "lucide-react";
import { Badge } from "../ui/badge";
import ApplicationsList from "./ApplicationsList";
import Header from "./Header";
import { JobApplication } from "@/lib/models/models.types";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getUserResumes, linkResume } from "@/lib/actions/resume";
import { analyzeResumeMatch } from "@/lib/actions/analyze-actions";

// 1. Define the shape of the AI analysis so TypeScript can autocomplete it
export interface IAnalysisResult {
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  requirementAssessments: {
    requirementText: string;
    category: "responsibility" | "skill";
    status: "matched" | "partial" | "missing";
    resumeEvidence: string[];
    confidence: number;
  }[];
  bulletSuggestions: {
    originalQuote: string;
    matchedRequirement: string;
    changeType: "missing_keyword" | "clarify_impact" | "quantify_result";
    suggestedRewrite: string;
    reasoning: string;
    confidence: number;
  }[];
}

// 2. Extend your userApplications to include the populated fields
export interface userApplications extends Omit<
  JobApplication,
  "columnId" | "resume"
> {
  columnId: {
    _id: string;
    name: string;
  };
  // We omit the original "resume" and redefine it here as a populated object
  resume?: {
    _id: string;
    name: string;
  };
  // Add our new AI tracking fields!
  analysisResult?: IAnalysisResult;
  analyzedResumeId?: string;
  analysisFingerprint?: string | null;
  analysisJdFingerprint?: string | null;
  analyzedResumeFileKey?: string | null;
  applicationDate?: string | null;
  lastAnalyzedAt?: string | null;
}

interface Props {
  initialApplications: userApplications[];
}

interface ResumeProps {
  _id: string;
  userId: string;
  name: string;
  fileKey: string;
  version: number;
  label?: string;
  tags?: string[];
  isActive: boolean;
  updatedAt: string;
}

const TABS = [
  "All",
  "Wishlist",
  "Applied",
  "Interviewing",
  "Offered",
  "Rejected",
];

export default function ApplicationsView({ initialApplications }: Props) {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    initialApplications.length > 0 ? initialApplications[0]._id : null,
  );
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);
  const [resumes, setResumes] = useState<ResumeProps[]>([]);
  const router = useRouter();

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedVaultResumeId, setSelectedVaultResumeId] = useState<
    string | null
  >(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const handleDialogChange = (open: boolean) => {
    setIsLinkDialogOpen(open);
    if (!open) {
      // Reset state when modal closes
      setSelectedVaultResumeId(null);
      setUploadFile(null);
    }
  };

  const handleLinkSubmit = async () => {
    if (!selectedJobId || (!selectedVaultResumeId && !uploadFile)) return;

    setIsLinking(true);
    try {
      if (uploadFile) {
        // 1. Logic to upload the new file via Server Action / Uploadthing
        console.log("Uploading and linking new file:", uploadFile.name);
        // const newResume = await uploadAndCreateResume(uploadFile);
        // await linkResumeToJob(selectedJobId, newResume._id);
      } else if (selectedVaultResumeId) {
        // 2. Logic to link an existing resume from the vault
        console.log("Linking vault resume ID:", selectedVaultResumeId);
        await linkResume(selectedVaultResumeId, selectedJobId);
      }

      // Close dialog & refresh router to see new data
      setIsLinkDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to link resume", error);
    } finally {
      setIsLinking(false);
    }
  };

  // New state to track the loading transition
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // const handleAnalyzeClick = async () => {
  //   if (!selectedJobId) return;

  //   // 1. Trigger the loading animations instantly
  //   setIsAnalyzing(true);

  //   try {
  //     // 2. Here is where you will eventually call your AI Server Action:
  //     // await runAiResumeAnalysis(selectedJob?.resumeId, selectedJobId);

  //     // For now, let's simulate a 3-second AI thinking delay
  //     await new Promise((resolve) => setTimeout(resolve, 3000));

  //     // 3. Once the AI is done and saved to the DB, route to the new page!
  //     router.push(`/applications/${selectedJobId}/analyze`);
  //   } catch (error) {
  //     console.error("Analysis failed", error);
  //     setIsAnalyzing(false); // Reset if it fails
  //   }
  // };

  const handleAnalyzeClick = async () => {
    if (!selectedJobId) return;

    // 1. Find the current job to do some quick checks
    const currentJob = initialApplications.find((j) => j._id === selectedJobId);

    // 3. Validation Check: They must link a resume before analyzing
    if (!currentJob?.resume) {
      alert("Please link a resume to this job before analyzing.");
      return;
    }
    // 2. Fast path: if an analysis already exists for the linked resume,
    // open it directly instead of asking the server to recompute.
    if (
      currentJob?.analysisResult &&
      currentJob.analyzedResumeId === currentJob.resume._id
    ) {
      router.push(`/applications/${selectedJobId}/analyze`);
      return;
    }

    // 4. Trigger the loading animations
    setIsAnalyzing(true);

    try {
      // 5. Call the real AI Server Action
      const response = await analyzeResumeMatch(selectedJobId);

      if (response.success) {
        // Refresh the router to get fresh data with analysisResult for next time
        router.refresh();
        // Once the AI is done and saved to the DB, route to the new page!
        router.push(`/applications/${selectedJobId}/analyze`);
      } else {
        // Handle backend errors (like PDF parsing failures)
        console.error("Analysis Server Error:", response.error);
        alert(response.error || "Failed to analyze resume.");
        setIsAnalyzing(false);
      }
    } catch (error) {
      // Handle severe network/client errors
      console.error("Analysis failed catastrophically", error);
      alert("An unexpected error occurred while analyzing.");
      setIsAnalyzing(false);
    }
  };

  const filteredJobs = initialApplications.filter((job) => {
    if (activeTab === "All") return true;

    const normalizedTab = activeTab.toLocaleLowerCase();
    const normalizedJobStatus = job?.columnId.name.toLocaleLowerCase() || "";

    return normalizedTab === normalizedJobStatus;
  });

  // after filtering, need to select the first job to display the description --> UX improvement
  useEffect(() => {
    if (filteredJobs.length > 0) {
      const stillInit = filteredJobs.some((job) => job._id === selectedJobId);
      if (!stillInit) {
        setSelectedJobId(filteredJobs[0]._id);
      }
    } else {
      setSelectedJobId(null);
    }
  }, [activeTab, filteredJobs, selectedJobId]);

  const fetchResumes = useCallback(async () => {
    const result = await getUserResumes();
    if (result.success && result.data) {
      setResumes(result.data as ResumeProps[]);
    } else {
      setResumes([]); // Fallback to empty array on error
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const selectedJob = filteredJobs.find((job) => job._id === selectedJobId);
  
  const validResponsibilities = selectedJob?.description?.coreResponsibilities?.filter(
    (point) => point && point.trim().length > 0
  ) || [];
  
  const validSkills = selectedJob?.description?.requiredSkills?.filter(
    (point) => point && point.trim().length > 0
  ) || [];
  
  return (
    <div className="flex flex-1 gap-2 overflow-x-hidden">
      <div
        className={`transition-all duration-400 ease-in-out ${
          isRightPanelOpen ? "w-[50%]" : "w-full max-w-4xl mx-auto"
        }`}
      >
        <Header tabs={TABS} activetab={activeTab} onTabChange={setActiveTab} />

        <div className="overflow-y-auto h-[calc(100vh-150px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <ApplicationsList
            userApplications={filteredJobs}
            selectedJobId={selectedJobId}
            onSelectToggle={setSelectedJobId}
            openRightPanel={setIsRightPanelOpen}
          />
        </div>
      </div>
      <div
        className={`relative transition-all duration-400 ease-in-out ${
          isRightPanelOpen
            ? "w-[50%] py-4 px-2 opacity-100 visible"
            : "w-0 py-4 px-0 opacity-0 overflow-hidden invisible"
        }`}
      >
        {isRightPanelOpen && (
          <>
            {isAnalyzing && (
              <div className="absolute inset-4 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl border border-orange-500/20 shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-95">
                <div className="relative flex items-center justify-center w-20 h-20 mb-6 bg-orange-100 rounded-full animate-pulse">
                  <FileSearch className="w-10 h-10 text-orange-500 absolute" />
                  {/* An outer spinning ring for extra flair */}
                  <div className="absolute w-full h-full border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-serif tracking-wide text-foreground mb-2">
                  Analyzing Fit...
                </h3>
                <p className="text-sm text-muted-foreground font-dmsans animate-pulse">
                  Scanning resume and matching ATS keywords
                </p>
              </div>
            )}
            <div className="flex flex-col gap-8 h-full p-6 rounded-2xl border border-black overflow-y-hidden">
              <PanelRightClose
                className="absolute w-5 h-5 right-8 top-12 cursor-pointer text-muted-foreground hover:text-foreground z-10 transition-colors"
                onClick={() => setIsRightPanelOpen(false)}
              />
              <div className="border-b border-border">
                <h1 className="font-serif text-3xl tracking-wide">
                  {selectedJob?.position}
                </h1>
                <h2 className="text-red-600 font-serif font-semibold tracking-widest">
                  @ {selectedJob?.company}
                </h2>
                <div className="flex justify-between my-2">
                  <div className="flex gap-2">
                    {selectedJob?.location && (
                      <Badge
                        className="rounded-xs border border-dashed border-black"
                        variant="secondary"
                      >
                        <MapPin className="size-3" />
                        {selectedJob?.location}
                      </Badge>
                    )}

                    {selectedJob?.salary && (
                      <Badge
                        className="rounded-xs border border-dashed border-black"
                        variant="secondary"
                      >
                        <Wallet />
                        {selectedJob?.salary}
                      </Badge>
                    )}
                  </div>

                  <p>
                    <span className="text-blue-500">@</span>applied on Date
                  </p>
                </div>

                <div className="flex items-center gap-2 font-serif tracking-wider text-green-600 hover:text-green-800 mt-4 mb-2 cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    {/* Left Side: The Attached Resume */}
                    {selectedJob?.company ? (
                      <div className="flex items-center gap-2 font-serif tracking-wider text-green-600 hover:text-green-800 cursor-pointer">
                        {/*<Paperclip className="h-4 w-4" />*/}
                        <p className="underline decoration-green-600/30 underline-offset-4">
                          {
                            <Dialog
                              open={isLinkDialogOpen}
                              onOpenChange={handleDialogChange}
                            >
                              <DialogTrigger asChild>
                                {/*<Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full justify-start truncate"
                                    >
                                      {selectedResumeName || "Select file from vault"}
                                    </Button>*/}

                                <button
                                  className={`flex items-center gap-2 font-serif tracking-wider cursor-pointer transition-colors outline-none ${
                                    selectedJob?.resume?.name
                                      ? "text-green-600 hover:text-green-800"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <Paperclip className="h-4 w-4" />
                                  <p
                                    className={`underline underline-offset-4 ${
                                      selectedJob?.resume?.name
                                        ? "decoration-green-600/30"
                                        : "decoration-muted-foreground/30"
                                    }`}
                                  >
                                    {selectedJob?.resume?.name ||
                                      "Link a resume"}
                                  </p>
                                </button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader className="font-serif text-xl tracking-wide">
                                  {/* Dynamically change the title based on if they are linking or updating */}
                                  {selectedJob?.resume?.name
                                    ? "Update linked resume"
                                    : "Link a resume"}
                                </DialogHeader>
                                <DialogDescription>
                                  Select a resume from resume vault to link.
                                </DialogDescription>
                                <div className="flex flex-col  gap-2 w-full">
                                  <div className="flex gap-5 items-center">
                                    <p className="font-serif text-lg tracking-wide">
                                      Choose a file
                                    </p>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          Select file
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent className="w-full">
                                        {resumes.map((resume) => (
                                          <DropdownMenuItem
                                            key={resume._id}
                                            onClick={() => {
                                              setSelectedVaultResumeId(
                                                resume._id,
                                              );
                                              setUploadFile(null); // Clear upload if they pick from vault
                                            }}
                                            className="cursor-pointer"
                                          >
                                            {resume.name}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  <div className="w-full h-0.5 bg-primary opacity-20 relative my-4">
                                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-secondary w-8 text-center">
                                      or
                                    </div>
                                  </div>
                                  <DialogDescription>
                                    Upload a new file
                                  </DialogDescription>
                                  <div className="w-full flex flex-col gap-2 justify-center items-center border border-primary border-dashed rounded-md p-4 mt-2">
                                    <Upload className="w-6 h-6" />
                                    <Input
                                      type="file"
                                      className="w-full cursor-pointer max-w-[250px]"
                                      onChange={(e) => {
                                        if (
                                          e.target.files &&
                                          e.target.files.length > 0
                                        ) {
                                          setUploadFile(e.target.files[0]);
                                          setSelectedVaultResumeId(null); // Clear vault selection
                                        }
                                      }}
                                    />
                                    {uploadFile && (
                                      <p className="text-xs text-green-600 mt-2 font-dmsans truncate max-w-[300px]">
                                        Selected: {uploadFile.name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <DialogFooter className="mt-6">
                                  <Button
                                    variant="ghost"
                                    onClick={() => setIsLinkDialogOpen(false)}
                                    disabled={isLinking}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleLinkSubmit}
                                    disabled={
                                      isLinking ||
                                      (!selectedVaultResumeId && !uploadFile)
                                    }
                                  >
                                    {isLinking && (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    )}
                                    Link Resume
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-serif tracking-wider text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        <Paperclip className="h-4 w-4" />
                        <p className="underline decoration-muted-foreground/30 underline-offset-4">
                          Link a resume
                        </p>
                      </div>
                    )}

                    {/* Right Side: The AI Trigger */}
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-sm text-sm font-medium tracking-wider transition-colors cursor-pointer"
                      onClick={() => handleAnalyzeClick()}
                    >
                      Analyze Fit
                    </button>
                  </div>
                </div>
              </div>

              <div id="body" className="overflow-y-auto flex flex-1 flex-col">
                <p className="font-dmsans">
                  {selectedJob?.description?.companyIntro}
                </p>

                {validResponsibilities.length > 0 && (
                  <div className="my-2">
                    <h2 className="font-serif text-xl font-semibold tracking-wider mb-2">
                      Core responsibilities:{" "}
                    </h2>
                    <div className="pl-2">
                      {selectedJob?.description?.coreResponsibilities.map(
                        (point, index) => (
                          <div
                            key={index}
                            className="relative flex gap-2 items-center pl-6"
                          >
                            <div className="absolute left-1 top-4">
                              <Circle className="size-2 fill-black" />
                            </div>
                            <ul className="my-1">{point}</ul>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {validSkills.length > 0 && (
                  <div className="my-2">
                    <h2 className="font-serif text-xl font-semibold tracking-wider mb-2">
                      Required Skills:{" "}
                    </h2>
                    <div className="pl-2">
                      {selectedJob?.description?.requiredSkills.map(
                        (point, index) => (
                          <div
                            key={index}
                            className="relative flex gap-2 items-center pl-6"
                          >
                            <div className="absolute left-1 top-4">
                              <Circle className="size-2 fill-black" />
                            </div>
                            <ul className="my-1">{point}</ul>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
