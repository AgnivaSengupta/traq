import { Plus, MoreHorizontal } from "lucide-react";
// import type { Task, TaskStatus } from "@/data/kanban";
import TaskCard from "./TaskCard";
import { JobApplication } from "@/lib/models/models.types";

// const statusColors: Record<TaskStatus, string> = {
//   todo: "bg-kanban-todo",
//   "in-progress": "bg-kanban-progress",
//   "in-review": "bg-kanban-review",
// };

interface KanbanColumnProps {
  id: string;
  label: string;
  jobs: JobApplication[];
  onDragStart: (e: React.DragEvent, jobId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  isDragOver: boolean;
  // onAddTask: (columnId: string, position: string, company: string) => void;
  onAddTask: () => void;
}

const KanbanColumn = ({
  id,
  label,
  jobs,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
  onAddTask,
}: KanbanColumnProps) => {
  // const [isAdding, setIsAdding] = useState(false);
  // const [newPosition, setNewPosition] = useState("");
  // const [newCompany, setNewCompany] = useState("");
  // const inputRef = useRef<HTMLTextAreaElement>(null);

  // useEffect(() => {
  //   if (isAdding) inputRef.current?.focus();
  // }, [isAdding]);

  // const handleSubmit = () => {
  //   if (newPosition.trim() || newCompany.trim()) {
  //     onAddTask(id, newPosition.trim(), newCompany.trim());

  //     setNewPosition("");
  //     setNewCompany("");
  //     setIsAdding(false);
  //   }
  // };

  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter" && !e.shiftKey) {
  //     e.preventDefault();
  //     handleSubmit();
  //   }
  //   if (e.key === "Escape") {
  //     setNewPosition("");
  //     setNewCompany("");
  //     setIsAdding(false);
  //   }
  // };

  return (
    <div
      className={`flex min-w-[300px] flex-1 flex-col overflow-visible rounded-sm bg-[#F8F8F6] p-3 transition-colors ${
        isDragOver ? "bg-kanban-bg/80 ring-2 ring-kanban-progress/30" : ""
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, id)}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 pb-1">
        <span className={`h-2.5 w-2.5 rounded-full`} />
        <span className="text-lg font-serif tracking-wider text-foreground">{label}</span>
        <span className="text-lg font-serif text-muted-foreground">{jobs.length}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onAddTask}
            className="rounded p-1 text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-full overflow-visible rounded-sm bg-[#EFEFED] p-2">
        {/* New task form */}
        {/*{isAdding && (
          <div className="mb-2.5 rounded-lg border border-kanban-progress/40 bg-card p-3 shadow-sm">
            <input
              ref={inputRef}
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Company (e.g. Google)"
              className="w-full rounded bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            <textarea
              ref={inputRef}
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Task title…"
              rows={2}
              className="w-full resize-none rounded bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleSubmit}
                disabled={!newPosition.trim()}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setNewPosition("");
                  setIsAdding(false);
                }}
                className="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}*/}

        {/* Cards */}
        <div className="flex flex-col gap-2 pb-4">
          {jobs.map((job) => (
            <TaskCard key={job._id} job={job} onDragStart={onDragStart} />
          ))}

          {/* Drop zone hint */}
          {isDragOver && jobs.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-kanban-progress/40 py-8 text-xs text-muted-foreground">
              Drop to change status
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn;
