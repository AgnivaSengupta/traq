import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
  userId: string;
  name: string;
  label?: string;
  fileUrl: string;
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  label: { type: String },
  fileUrl: { type: String, required: true },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);
