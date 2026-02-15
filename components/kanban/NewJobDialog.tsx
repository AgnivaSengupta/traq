import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Link as LinkIcon, Loader2 } from "lucide-react";

interface NewJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: JobFormData) => void;
}

export interface JobFormData {
  company: string;
  position: string;
  salary: string;
  location: string;
  link?: string;
  applicationDate?: string;
}

export default function NewJobDialog({
  isOpen,
  onClose,
  onSubmit,
}: NewJobDialogProps) {
  const [activeTab, setActiveTab] = useState("link");
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const [formData, setFormData] = useState<JobFormData>({
    company: "",
    position: "",
    salary: "",
    location: "",
    link: "",
    applicationDate: "",
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        company: "",
        position: "",
        salary: "",
        location: "",
        link: "",
        applicationDate: "",
      });
      setUrlInput("");
      setActiveTab("link");
      setIsLoading(false);
    }
  }, [isOpen]);

  // Simulate fetching data from the URL (Mock Scraper)
  const handleUrlAnalyze = () => {
    if (!urlInput) return;
    setIsLoading(true);

    // TODO: Replace this timeout with a real API call to your backend scraper
    setTimeout(() => {
      // Mock data extraction based on the URL text (just for demo purposes)
      const mockCompany = urlInput.includes("linkedin")
        ? "LinkedIn Job"
        : "Unknown Company";

      setFormData({
        company: mockCompany,
        position: "Software Engineer (Imported)",
        salary: "$120k - $160k",
        location: "Remote",
        link: urlInput,
      });

      setIsLoading(false);
      setActiveTab("manual"); // Switch to manual tab for review
    }, 1500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.position) return;

    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Job Application</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">
              <LinkIcon className="w-3 h-3 mr-2" />
              Import from URL
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          {/* --- TAB 1: LINK IMPORT --- */}
          <TabsContent value="link" className="py-4">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">Job Posting URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    placeholder="https://linkedin.com/jobs/..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste the link to auto-fill details using AI.
                </p>
              </div>

              <Button
                onClick={handleUrlAnalyze}
                disabled={!urlInput || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 text-yellow-300" />
                    Auto-Fill Details
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* --- TAB 2: MANUAL FORM --- */}
          <TabsContent value="manual">
            <form onSubmit={handleManualSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">
                  Position
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salary" className="text-right">
                  Salary
                </Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g. $120k"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g. Remote"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right">
                  Deadline
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.applicationDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicationDate: e.target.value,
                    })
                  }
                  className="col-span-3"
                  // placeholder="e.g. 15.02.26"
                  required
                />
              </div>

              {/* Hidden Link Field Display (Optional) */}
              {formData.link && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs text-muted-foreground">
                    Source
                  </Label>
                  <div className="col-span-3 text-xs text-blue-500 truncate">
                    {formData.link}
                  </div>
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Save Application</Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
