import { Calendar, DollarSign, GripVertical, MapPin } from "lucide-react";
import type { Task } from "@/data/kanban";
import { JobApplication } from "@/lib/models/models.types";

interface TaskCardProps {
  job: JobApplication;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const TaskCard = ({ job, onDragStart }: TaskCardProps) => {
  const initials = job.company
    ? job.company.substring(0, 2).toUpperCase()
    : "??";

  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
  ];
  const colorIndex = job.company ? job.company.length % colors.length : 0;
  const avatarColor = colors[colorIndex];

  // const formattedDate = job.applicationDate
  //     ? new Date(job.applicationDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  //     : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, job._id)}
      className="group relative cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing active:shadow-lg active:opacity-80"
    >
      {/* Header: ID + assignee */}
      <div className="flex items-center gap-2">
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

      {/* Title */}
      <p className="mt-3 text-sm font-medium leading-snug text-foreground">
        {job.position}
      </p>

      {(job.location || job.salary) && (
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {job.location && (
            <div className="flex items-center text-[10px] text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded">
              <MapPin className="w-3 h-3 mr-1" />
              {job.location}
            </div>
          )}
          {job.salary && (
            <div className="flex items-center text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
              <DollarSign className="w-3 h-3 mr-1" />
              {job.salary}
            </div>
          )}
        </div>
      )}

      {/* Footer: tags, points, date, grip */}
      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
        {job.tags && job.tags.map((tag) => (
          <div key={tag.label} className="border border-border rounded-xs">
            <span
              key={tag.label}
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium text-red-800 ${
                tag.variant === "bug"
                  ? "bg-kanban-bug/15 text-kanban-bug"
                  : "bg-kanban-tag text-muted-foreground"
              }`}
            >
              {tag.label}
            </span>
          </div>
        ))}

        {/*{task.dueDate && (
          <div className="border border-border rounded-xs">
            <span className="ml-auto flex items-center gap-1 text-[11px] px-1.5 py-0.5  text-red-800">
              <Calendar className="h-3.5 w-3.5" />
              {task.dueDate}
            </span>
          </div>
        )}*/}

        <GripVertical className="ml-auto h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default TaskCard;
