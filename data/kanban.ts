export type TaskStatus = "wishlist" | "applied" | "interview" | "offer" | "rejection";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  tags: { label: string; variant: "bug" | "scope" }[];
  points?: number;
  dueDate?: string;
  assigneeInitials: string;
  assigneeColor: string;
}

export const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "wishlist", label: "Wishlist" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejection", label: "Rejection" },
];

export const initialTasks: Task[] = [
  {
    id: "MSP-105",
    title: "Frontend Developer at Acme Corp",
    status: "wishlist",
    tags: [{ label: "Remote", variant: "scope" }],
    points: 3,
    assigneeInitials: "AJ",
    assigneeColor: "hsl(260 60% 65%)",
  },
  {
    id: "MSP-104",
    title: "Full-Stack Engineer at Startup X",
    status: "wishlist",
    tags: [{ label: "Hybrid", variant: "scope" }],
    points: 5,
    assigneeInitials: "KR",
    assigneeColor: "hsl(200 70% 55%)",
  },
  {
    id: "MSP-103",
    title: "React Developer at BigTech",
    status: "applied",
    tags: [{ label: "On-site", variant: "scope" }],
    dueDate: "Mar 12",
    assigneeInitials: "TM",
    assigneeColor: "hsl(340 65% 55%)",
  },
  {
    id: "MSP-102",
    title: "UI Engineer at DesignCo",
    status: "applied",
    tags: [{ label: "Remote", variant: "scope" }],
    dueDate: "Mar 15",
    assigneeInitials: "LS",
    assigneeColor: "hsl(160 50% 45%)",
  },
  {
    id: "MSP-101",
    title: "Software Engineer at CloudNet",
    status: "interview",
    tags: [{ label: "Hybrid", variant: "scope" }],
    dueDate: "Mar 20",
    assigneeInitials: "DP",
    assigneeColor: "hsl(30 70% 55%)",
  },
  {
    id: "MSP-98",
    title: "Senior Dev at DataFlow",
    status: "interview",
    tags: [{ label: "Remote", variant: "scope" }],
    dueDate: "Mar 14",
    assigneeInitials: "AJ",
    assigneeColor: "hsl(260 60% 65%)",
  },
  {
    id: "MSP-97",
    title: "Lead Engineer at ScaleUp",
    status: "offer",
    tags: [{ label: "On-site", variant: "scope" }],
    dueDate: "Mar 13",
    assigneeInitials: "KR",
    assigneeColor: "hsl(200 70% 55%)",
  },
  {
    id: "MSP-92",
    title: "Junior Dev at LearnCo",
    status: "rejection",
    tags: [{ label: "Remote", variant: "scope" }],
    assigneeInitials: "LS",
    assigneeColor: "hsl(160 50% 45%)",
  },
];
