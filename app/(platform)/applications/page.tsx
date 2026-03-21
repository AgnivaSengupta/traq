// "use client"

import ApplicationsList from "@/components/application/ApplicationsList";
import ApplicationsView from "@/components/application/ApplicationsView";
import Header from "@/components/application/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserApplications } from "@/lib/actions/job.actions";
import { getSession } from "@/lib/auth";
import { File } from "lucide-react";
// import { useState } from "react";

const TABS = ['All', 'Wishlist', 'Applied', 'Interviewing', 'Offered', 'Rejected'];

export default async function ApplicationPage() {

  // const [activeTab, setActiveTab] = useState<string>("All");
  const session = await getSession();
  if (!session) return (<div>Please Log in</div>)
  
  const response = await getUserApplications(session?.user.id);
  const applications = response.applications;
  

  return (
    <div className="flex flex-1 flex-col h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
        <span className="text-2xl font-serif tracking-wider ml-3">
          Applications
        </span>
      </header>
      
      <ApplicationsView initialApplications={applications}/>
      
    </div>
  );
}
