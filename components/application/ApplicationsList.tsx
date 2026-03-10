"use client";

import { JobApplication } from "@/lib/models/models.types";
import { userApplications } from "./ApplicationsView";
// import { useState } from 'react';

// Mock data - eventually this will come from your MongoDB database
const mockJobs = [
  {
    id: "1",
    title: "Software Engineering Intern",
    company: "Oracle",
    location: "Remote",
    compensation: "$40-50/hr",
    status: "Applied",
    date: "2d ago",
  },
  {
    id: "2",
    title: "Full Stack Developer",
    company: "Vercel",
    location: "San Francisco, CA",
    compensation: "$120k-$150k",
    status: "Interviewing",
    date: "5h ago",
  },
  {
    id: "3",
    title: "Frontend Engineer",
    company: "Linear",
    location: "Remote",
    compensation: "€80k-€100k",
    status: "Wishlist",
    date: "1w ago",
  },
  {
    id: "4",
    title: "Software Engineering Intern",
    company: "Oracle",
    location: "Remote",
    compensation: "$40-50/hr",
    status: "Applied",
    date: "2d ago",
  },
  {
    id: "5",
    title: "Full Stack Developer",
    company: "Vercel",
    location: "San Francisco, CA",
    compensation: "$120k-$150k",
    status: "Interviewing",
    date: "5h ago",
  },
  {
    id: "6",
    title: "Frontend Engineer",
    company: "Linear",
    location: "Remote",
    compensation: "€80k-€100k",
    status: "Wishlist",
    date: "1w ago",
  },
  {
    id: "7",
    title: "Software Engineering Intern",
    company: "Oracle",
    location: "Remote",
    compensation: "$40-50/hr",
    status: "Applied",
    date: "2d ago",
  },
  {
    id: "8",
    title: "Full Stack Developer",
    company: "Vercel",
    location: "San Francisco, CA",
    compensation: "$120k-$150k",
    status: "Interviewing",
    date: "5h ago",
  },
  {
    id: "9",
    title: "Frontend Engineer",
    company: "Linear",
    location: "Remote",
    compensation: "€80k-€100k",
    status: "Wishlist",
    date: "1w ago",
  },
];

interface Props {
  userApplications: userApplications[];
  selectedJobId: string | null;
  onSelectToggle: (jobId: string | null) => void;
}

export default function ApplicationsList({
  userApplications,
  selectedJobId,
  onSelectToggle,
}: Props) {
  // const [selectedJobId, setSelectedJobId] = useState<string>('1');

  return (
    <div className="flex flex-col  overflow-y-auto bg-secondary ml-3 p-4 gap-2 rounded-md">
      {userApplications.map((job) => {
        const isSelected = selectedJobId === job._id;
        const formattedDate = job.applicationDate
          ? new Date(job.applicationDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : null;

        return (
          <div
            key={job._id}
            onClick={() => onSelectToggle(job._id)}
            className={`
              cursor-pointer px-5 py-3 border border-border transition-all duration-100 bg-background rounded-md mx-auto w-full
              ${isSelected ? "border border-ring" : "hover:bg-secondary border border-border"}
            `}
          >
            {/* Top row: Title and Time */}
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-serif font-semibold text-gray-900 text-lg tracking-wider">
                {job.position}
              </h3>
              <span className="text-xs text-blue-600 font-dmsans font-medium whitespace-nowrap ml-3">
                {formattedDate}
              </span>
            </div>

            {/* Company Name */}
            <p className="text-sm text-gray-500 mb-3">{job.company}</p>

            {/* Tags matching your right-pane aesthetic */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-mono border border-dashed border-gray-300 px-2 py-0.5 rounded text-gray-600">
                {job.location}
              </span>
              <span className="text-xs font-mono border border-dashed border-gray-300 px-2 py-0.5 rounded text-gray-600">
                {job.salary}
              </span>

              {/* Dynamic Status Pill */}
              <span
                className={`text-[10px] uppercase tracking-wider font-bold ml-auto px-2 py-1 rounded-sm
                ${
                  job.columnId.name === "Applied"
                    ? "bg-blue-50 text-blue-700"
                    : job.columnId.name === "Interviewing"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {job.columnId.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
