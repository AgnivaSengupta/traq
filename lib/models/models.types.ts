export interface JobApplication {
  _id: string;
  company: string;
  position: string;
  location?: string;
  status: string;
  columnId?: string;
  order: number;
  notes?: string;
  salary: string;
  jobUrl?: string;
  tags?: string[];
  description?: string;
}

export interface Column {
  _id: string;
  name: string;
  order: number;
  boardId: string;
  jobApplications: JobApplication[];
}

export interface BoardData {
  _id: string;
  userId: string;
  name: string;
  columns: Column[];
}
