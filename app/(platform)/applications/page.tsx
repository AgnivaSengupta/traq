"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  Download,
  Calendar,
  ExternalLink,
  Trash2,
  PenLine,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Mock Data (Replace with DB fetch later) ---
const MOCK_APPLICATIONS = [
  {
    id: "1",
    company: "Vercel",
    logo: "https://logo.clearbit.com/vercel.com",
    role: "Frontend Engineer",
    status: "Interview",
    appliedDate: "2024-02-10",
    salary: "$120k - $160k",
    location: "Remote",
    resumeVersion: "v2_frontend.pdf",
    matchScore: 92,
  },
  {
    id: "2",
    company: "Linear",
    logo: "https://logo.clearbit.com/linear.app",
    role: "Product Designer",
    status: "Applied",
    appliedDate: "2024-02-12",
    salary: "$140k - $180k",
    location: "San Francisco",
    resumeVersion: "v1_design.pdf",
    matchScore: 85,
  },
  {
    id: "3",
    company: "Raycast",
    logo: "https://logo.clearbit.com/raycast.com",
    role: "iOS Engineer",
    status: "Offer",
    appliedDate: "2024-01-28",
    salary: "£90k - £110k",
    location: "London",
    resumeVersion: "v3_mobile.pdf",
    matchScore: 98,
  },
  {
    id: "4",
    company: "Supabase",
    logo: "https://logo.clearbit.com/supabase.com",
    role: "Developer Advocate",
    status: "Rejected",
    appliedDate: "2024-01-15",
    salary: "$100k - $130k",
    location: "Remote",
    resumeVersion: "v1_devrel.pdf",
    matchScore: 65,
  },
  {
    id: "5",
    company: "Resend",
    logo: "https://logo.clearbit.com/resend.com",
    role: "Software Engineer",
    status: "Applied",
    appliedDate: "2024-02-14",
    salary: "Not listed",
    location: "Remote",
    resumeVersion: "v2_fullstack.pdf",
    matchScore: 78,
  },
];

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Filter Logic (Simple client-side for MVP)
  const filteredApps = MOCK_APPLICATIONS.filter((app) =>
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white w-full">
      
      <header className="flex justify-between items-center gap-3 border-b border-border bg-card px-5 py-3">
        <span className="text-2xl font-serif tracking-wider ml-3">Applications</span>
        {/*<button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          Add Application
        </button>*/}
        
        <Button variant='default' className="cursor-pointer">
          <Plus className="w-3 h-3" />
          Add Application
        </Button>
      </header>

      {/* --- Toolbar --- */}
      <div className="flex items-center gap-3 px-8 py-4 bg-background ">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filters (Visual Only for now) */}
        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
          <Filter className="h-3.5 w-3.5" />
          <span>Status</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>Sort</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all ml-auto">
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* --- Table Area --- */}
      <div className="flex-1 overflow-auto">
        <table className="w-[95%] text-left border-collapse mx-auto">
          <thead className="bg-gray-100 sticky top-0 z-10 text-base font-serif text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-8 py-3 border-b border-gray-100">Company</th>
              <th className="px-6 py-3 border-b border-gray-100">Status</th>
              <th className="px-6 py-3 border-b border-gray-100">Date Applied</th>
              <th className="px-6 py-3 border-b border-gray-100">Resume</th>
              <th className="px-6 py-3 border-b border-gray-100 text-center">Score</th>
              <th className="px-6 py-3 border-b border-gray-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {filteredApps.map((app) => (
              <tr 
                key={app.id} 
                className="group hover:bg-gray-50/80 transition-colors cursor-default"
                onClick={() => setActiveMenu(null)} // Close menu on row click
              >
                {/* Company & Role */}
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    {/*<div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={app.logo} alt={app.company} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = "")} />
                    </div>*/}
                    <div>
                      <div className="font-medium text-gray-900">{app.role}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-gray-700">{app.company}</span>
                        <span>•</span>
                        <span>{app.location}</span>
                        <span>•</span>
                        <span>{app.salary}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  <StatusBadge status={app.status} />
                </td>

                {/* Date */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {new Date(app.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </td>

                {/* Resume Link */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-blue-600 transition-colors cursor-pointer w-fit">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[120px] underline decoration-gray-300 underline-offset-2 group-hover:decoration-blue-400">
                        {app.resumeVersion}
                    </span>
                  </div>
                </td>

                 {/* Match Score */}
                 <td className="px-6 py-4 text-center">
                  <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    app.matchScore >= 90 ? "bg-green-50 text-green-700 border-green-100" :
                    app.matchScore >= 70 ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                    "bg-red-50 text-red-700 border-red-100"
                  }`}>
                    {app.matchScore}%
                  </div>
                </td>

                {/* Actions Menu */}
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === app.id ? null : app.id);
                    }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {/* Dropdown Menu (Quick & Dirty Implementation) */}
                  {activeMenu === app.id && (
                    <div className="absolute right-8 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                       <DropdownItem icon={ExternalLink} label="View Job Posting" />
                       <DropdownItem icon={PenLine} label="Edit Application" />
                       <div className="h-px bg-gray-100 my-1" />
                       <DropdownItem icon={Trash2} label="Delete" destructive />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Applied: "bg-gray-100 text-gray-600 border-gray-200",
    Interview: "bg-blue-50 text-blue-700 border-blue-200",
    Offer: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const currentStyle = styles[status as keyof typeof styles] || styles.Applied;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}>
      {status}
    </span>
  );
}

function DropdownItem({ icon: Icon, label, destructive }: { icon: any, label: string, destructive?: boolean }) {
    return (
        <button className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 ${destructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
        </button>
    )
}