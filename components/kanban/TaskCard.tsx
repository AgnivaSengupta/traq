"use client"; // Ensure this is a client component

import { useState } from "react";
import {
  Calendar,
  Delete,
  DollarSign,
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
        className="group relative cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing active:shadow-lg active:opacity-80"
      >
        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {job.company}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Added onMouseDown stopPropagation so clicking menu doesn't start drag */}
              <button 
                onMouseDown={(e) => e.stopPropagation()}
                className="rounded p-1 text-muted-foreground hover:bg-accent transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Pen className="w-2 h-2 mr-2" />
                Edit
              </DropdownMenuItem>

              {/* 4. Change Delete Item to open the Dialog instead of deleting immediately */}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                <Delete className="w-2 h-2 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mt-3 ml-1 text-base font-medium leading-snug text-foreground">
          {job.position}
        </p>

        <div className="flex justify-between items-center mt-4 mb-2">
          <Badge
            variant="secondary"
            className="rounded-sm text-xs bg-blue-400/30"
          >
            Internship
          </Badge>

          {formattedDate && (
            <Badge variant="link" className="text-xs text-red-800 p-0 h-auto">
              <Calendar className="h-3 w-3 mr-1" />
              {formattedDate}
            </Badge>
          )}
        </div>

        <div className="w-full h-[0.25px] bg-zinc-300/50 "></div>

        {(job.location || job.salary) && (
          <div className="flex justify-between mt-2 ">
            {job.location && (
              <div className="flex items-center text-[10px] text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded">
                <MapPin className="w-3 h-3 mr-1" />
                {job.location}
              </div>
            )}
            {job.salary && (
              <div className="flex items-center text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                <Wallet className="w-3 h-3 mr-1" />
                {job.salary}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. The Alert Dialog Component */}
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