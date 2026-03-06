"use client";

import {
  Circle,
  File,
  FileSearch,
  MapPin,
  Paperclip,
  Pin,
  Wallet,
} from "lucide-react";
import { Badge } from "../ui/badge";
import ApplicationsList from "./ApplicationsList";
import Header from "./Header";
import { JobApplication } from "@/lib/models/models.types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface userApplications extends Omit<JobApplication, "columnId"> {
  columnId: {
    _id: string;
    name: string;
  };
}

interface Props {
  initialApplications: userApplications[];
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

  const router = useRouter();

  // New state to track the loading transition
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeClick = async () => {
    if (!selectedJobId) return;

    // 1. Trigger the loading animations instantly
    setIsAnalyzing(true);

    try {
      // 2. Here is where you will eventually call your AI Server Action:
      // await runAiResumeAnalysis(selectedJob?.resumeId, selectedJobId);

      // For now, let's simulate a 3-second AI thinking delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 3. Once the AI is done and saved to the DB, route to the new page!
      router.push(`/applications/${selectedJobId}/analyze`);
    } catch (error) {
      console.error("Analysis failed", error);
      setIsAnalyzing(false); // Reset if it fails
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

  const selectedJob = filteredJobs.find((job) => job._id === selectedJobId);

  return (
    <div className="flex flex-1 gap-2 overflow-x-hidden">
      <div className="w-[50%]">
        <Header tabs={TABS} activetab={activeTab} onTabChange={setActiveTab} />

        <div className="overflow-y-auto h-[calc(100vh-150px)]">
          <ApplicationsList
            userApplications={filteredJobs}
            selectedJobId={selectedJobId}
            onSelectToggle={setSelectedJobId}
          />
        </div>
      </div>
      <div className="w-[50%] py-4 px-2 relative">
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
              {/*<File className="h-4 w-4" />*/}
              {/*<Paperclip className="h-4 e-4" />
              <p>Resume version</p>*/}
              <div className="flex items-center justify-between w-full">
                {/* Left Side: The Attached Resume */}
                {selectedJob?.company ? (
                  <div className="flex items-center gap-2 font-serif tracking-wider text-green-600 hover:text-green-800 cursor-pointer">
                    <Paperclip className="h-4 w-4" />
                    {/* Assuming resumeId gets populated with the Resume object */}
                    <p className="underline decoration-green-600/30 underline-offset-4">
                      {selectedJob?.resume || "Frontend_v2.pdf"}
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

            {selectedJob?.description?.coreResponsibilities && (
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

            {selectedJob?.description?.requiredSkills && (
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
      </div>
    </div>
  );
}
