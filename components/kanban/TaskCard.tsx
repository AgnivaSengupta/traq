"use client"; // Ensure this is a client component

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Delete,
  MapPin,
  MoreHorizontal,
  Pen,
  Loader2,
  Wallet, // Import loader icon
} from "lucide-react";
import { JobApplication } from "@/lib/models/models.types";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
// 1. Import Alert Dialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteJob } from "@/lib/actions/job.actions";

interface TaskCardProps {
  job: JobApplication;
  onDragStart: (e: React.DragEvent, jobId: string) => void;
}

const TaskCard = ({ job, onDragStart }: TaskCardProps) => {
  // 2. Add state for Dialog visibility and Loading
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const initials = job.company
    ? job.company.substring(0, 2).toUpperCase()
    : "??";

  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#10b981", 
    "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  ];
  const colorIndex = job.company ? job.company.length % colors.length : 0;
  const avatarColor = colors[colorIndex];

  const formattedDate = job.applicationDate
    ? new Date(job.applicationDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // 3. Handle the actual deletion
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteJob(job._id);
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, job._id)}
        className={cn(
          "task-card-shell group relative cursor-grab overflow-hidden rounded-lg border border-border/80 bg-card px-3 py-2 shadow-sm",
          "hover:border-border hover:shadow-md focus-within:border-border focus-within:shadow-md",
          "active:cursor-grabbing active:shadow-lg active:opacity-80 motion-reduce:transition-none",
        )}
      >
        <div className="flex min-h-6 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
            <span className="truncate text-xs font-medium text-muted-foreground">
              {job.company}
            </span>
          </div>

          <div className="task-card-menu shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
                  aria-label={`Open actions for ${job.company}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Pen className="mr-2 h-2 w-2" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Delete className="mr-2 h-2 w-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="task-card-extra pointer-events-none mt-3 space-y-3 group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
          <p className="ml-1 text-base font-medium leading-snug text-foreground">
            {job.position}
          </p>

          <div className="mb-2 flex items-center justify-between gap-2">
            <Badge
              variant="secondary"
              className="rounded-sm bg-blue-400/30 text-xs"
            >
              Internship
            </Badge>

            {formattedDate && (
              <Badge variant="link" className="h-auto p-0 text-xs text-red-800">
                <Calendar className="mr-1 h-3 w-3" />
                {formattedDate}
              </Badge>
            )}
          </div>

          <div className="h-[0.25px] w-full bg-zinc-300/50"></div>

          {(job.location || job.salary) && (
            <div className="flex flex-wrap justify-between gap-2">
              {job.location && (
                <div className="flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  <MapPin className="mr-1 h-3 w-3" />
                  <span className="truncate">{job.location}</span>
                </div>
              )}
              {job.salary && (
                <div className="flex items-center rounded bg-green-50 px-1.5 py-0.5 text-[10px] text-green-700">
                  <Wallet className="mr-1 h-3 w-3" />
                  <span className="truncate">{job.salary}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              application for <span className="font-semibold text-foreground">{job.company}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                 // Prevent default to handle the async action manually
                 e.preventDefault(); 
                 handleDeleteConfirm();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskCard;
