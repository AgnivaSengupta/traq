"use client";

import { useState, useCallback } from "react";
// import { Star, Share2, Filter, LayoutGrid } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import { BoardData, JobApplication } from "@/lib/models/models.types";
import NewJobDialog from "./NewJobDialog";
import { JobFormData } from "./NewJobDialog";
import {
  createJobApplication,
  updateJobStatus,
} from "@/lib/actions/job.actions";

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
          allJobs.push({ ...job, columnId: col._id, status: col.name });
        });
      }
    });
    return allJobs;
  });

  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const handleOpenAddDialog = (columnId: string) => {
    setActiveColumnId(columnId);
    setIsDialogOpen(true);
  };

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

  // const handleAddJob = useCallback((columnId: string, position: string, company: string) => {
  //   const newJob: JobApplication = {
  //     _id: `temp-${Date.now()}`,
  //     position: position,
  //     company: company || "Unknown company", //default ==  need to ask the user
  //     status: "applied",
  //     order: 0,
  //     // boardId: boardData._id,
  //     columnId: columnId,
  //     salary: "50k",
  //     location: "Bangalore, India"
  //   };

  //   setApplications((prev) => [newJob, ...prev]);

  // }, [boardData]);

  const handleAddJob = useCallback(
    async (jobData: JobFormData) => {
      if (!activeColumnId) return;

      const tempId = `temp-${Date.now()}`;
      const newJob: JobApplication = {
        _id: tempId,
        position: jobData.position,
        company: jobData.company,
        salary: jobData.salary,
        location: jobData.location,
        jobUrl: jobData.link,
        applicationDate: jobData.applicationDate,
        description: jobData.description,
        status: "applied", // You might want to map activeColumnId to a status name if needed
        order: 0,
        columnId: activeColumnId,
        // userId: boardData.userId, // <--- Pass User ID from props
        // boardId: boardData._id,   // <--- Pass Board ID from props
      };

      setApplications((prev) => [newJob, ...prev]);
      setIsDialogOpen(false);

      try {
        // B. SERVER UPDATE:
        // Call the Server Action to save to DB
        const response = await createJobApplication({
          company: jobData.company,
          position: jobData.position,
          columnId: activeColumnId,
          salary: jobData.salary,
          location: jobData.location,
          jobUrl: jobData.link,
          applicationDate: jobData.applicationDate,
          description: jobData.description,
          userId: boardData.userId, // <--- Pass User ID from props
          boardId: boardData._id, // <--- Pass Board ID from props
        });

        if (response.success && response.job) {
          // C. SYNC:
          // Replace the temporary card with the real one from the DB (which has the real _id)
          setApplications((prev) =>
            prev.map((job) => (job._id === tempId ? response.job : job)),
          );
        } else {
          // Handle error (optional: revert the UI change)
          console.error("Failed to save job to DB");
        }
      } catch (error) {
        console.error("Error in handleAddJob:", error);
        // Optional: Remove the optimistic job if save failed
        setApplications((prev) => prev.filter((job) => job._id !== tempId));
      }
    },
    [activeColumnId, boardData],
  );

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData("jobId", jobId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent, newColumnId: string) => {
      e.preventDefault();
      const jobId = e.dataTransfer.getData("jobId");
      setApplications((prev) =>
        prev.map((t) =>
          t._id === jobId ? { ...t, columnId: newColumnId } : t,
        ),
      );
      setDragOverColumn(null);

      // call the server action to save move to mongoDB
      try {
        const response = await updateJobStatus(jobId, newColumnId);

        if (!response.success) {
          // Error handling: Revert the move if the DB update failed
          console.error("Failed to update DB:", response.error);

          // Optional: you can show a toast notification here "Failed to move card"
          // and revert the state if critical
        }
      } catch (error) {
        console.error("Network error updating job:", error);
      }
    },
    [],
  );

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
        <span className="text-2xl font-serif tracking-wider ml-3">
          Job Board
        </span>
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
            // onAddTask={handleAddJob}
            onAddTask={() => handleOpenAddDialog(col._id)}
          />
        ))}
      </div>

      <NewJobDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleAddJob}
      />
    </div>
  );
};

export default KanbanBoard;
