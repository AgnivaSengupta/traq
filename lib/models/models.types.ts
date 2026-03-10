import { IExtractedJD } from "./jobApplication";

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
  description?: IExtractedJD;
  resume?: string;
  applicationDate?: string;
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

export interface Resume {
  _id: string;
  userId: string;
  name: string;
  fileKey: string;
  version: number;
  label?: string;
  fileUrl: string;
  tags?: string[];
  isActive: boolean;
}

