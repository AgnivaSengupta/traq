"use client"

import { useState, useCallback } from "react";
import { Star, Share2, Filter, LayoutGrid } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import { BoardData, JobApplication } from "@/lib/models/models.types";

// let nextId = 120;

interface Props {
  boardData: BoardData;
}

const KanbanBoard = ({ boardData }: Props) => {
  // const [tasks, setTasks] = useState<JobApplication[]>();
  // 
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    if (!boardData || !boardData.columns) return [];
    
    const allJobs: JobApplication[] = [];
    boardData.columns.forEach((col) => {
      if (col.jobApplications && col.jobApplications.length > 0) {
        col.jobApplications.forEach((job) => {
          allJobs.push({ ...job, columnId: col._id, status: col.name })
        })
      }
    });
    return allJobs;
  });

  
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // const handleAddTask = useCallback((status: string, title: string) => {
  //   const assignee = ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)];
  //   const newTask: Task = {
  //     id: `MSP-${nextId++}`,
  //     title,
  //     status,
  //     tags: [{ label: "MSP Scope", variant: "scope" }],
  //     assigneeInitials: assignee.initials,
  //     assigneeColor: assignee.color,
  //   };
  //   setTasks((prev) => [newTask, ...prev]);
  // }, []);
  
  
  const handleAddJob = useCallback((columnId: string, position: string, company: string) => {
    const newJob: JobApplication = {
      _id: `temp-${Date.now()}`,
      position: position,
      company: company || "Unknown company", //default ==  need to ask the user
      status: "applied",
      order: 0,
      // boardId: boardData._id,
      columnId: columnId,
      salary: "50k",
      location: "Bangalore, India"
    };
    
    setApplications((prev) => [newJob, ...prev]);
    
  }, [boardData]);

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData("jobId", jobId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, newColumnId: string) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("jobId");
    setApplications((prev) =>
      prev.map((t) => (t._id === jobId ? { ...t, columnId: newColumnId } : t))
    );
    setDragOverColumn(null);
    
    // call the server action to save move to mongoDB
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
        <span className="text-sm text-muted-foreground">MSP Launch</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-semibold text-foreground">Board</span>
        <Star className="h-4 w-4 text-muted-foreground/50 ml-1" />

        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <LayoutGrid className="h-3.5 w-3.5" />
            Board
          </button>
        </div>
      </header>

      {/* Columns */}
      <div
        className="flex flex-1 gap-6 overflow-x-auto p-6"
        onDragLeave={handleDragLeave}
      >
        {boardData.columns.map((col) => (
          <KanbanColumn
            key={col._id}
            id={col._id}
            label={col.name}
            jobs={applications.filter((t) => t.columnId === col._id)}
            onDragStart={handleDragStart}
            onDragOver={(e) => handleDragOver(e, col._id)}
            onDrop={handleDrop}
            isDragOver={dragOverColumn === col._id}
            onAddTask={handleAddJob}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
