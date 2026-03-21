import mongoose, { Schema, Document } from "mongoose";

export interface IExtractedJD {
  companyIntro: string | null;
  coreResponsibilities: string[];
  requiredSkills: string[];
}

export interface IAnalysisResult {
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  requirementAssessments: {
    requirementText: string;
    category: "responsibility" | "skill";
    status: "matched" | "partial" | "missing";
    resumeEvidence: string[];
    confidence: number;
  }[];
  bulletSuggestions: {
    originalQuote: string;
    matchedRequirement: string;
    changeType: "missing_keyword" | "clarify_impact" | "quantify_result";
    suggestedRewrite: string;
    reasoning: string;
    confidence: number;
  }[];
}

const extractedJdSchema = new mongoose.Schema(
  {
    companyIntro: {
      type: String,
      default: null,
    },
    coreResponsibilities: {
      type: [String],
      default: [],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

export interface IJobApplication extends Document {
  company: string;
  position: string;
  location?: string;
  status: string;
  columnId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  userId: string;
  order: number;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  applicationDate: Date;
  tags?: string[];
  description?: IExtractedJD;
  resume?: mongoose.Types.ObjectId;
  analysisResult?: IAnalysisResult;
  analyzedResumeId?: mongoose.Types.ObjectId;
  analysisFingerprint?: string;
  analysisJdFingerprint?: string;
  analyzedResumeFileKey?: string;
  lastAnalyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    company: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      default: "applied",
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: "Column",
      required: true,
      index: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    order: { type: Number, required: true, default: 0 },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    notes: { type: String },
    salary: { type: String },
    jobUrl: { type: String },
    applicationDate: { type: Date },
    tags: [{ type: String }],
    description: { type: extractedJdSchema },
    resume: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      required: false,
    },
    analysisResult: {
      type: Object, // We can store the raw JSON object here
      required: false,
    },
    analyzedResumeId: { // <--- NEW FIELD
        type: Schema.Types.ObjectId,
        ref: "Resume",
        required: false,
        default: null
      },
    analysisFingerprint: {
      type: String,
      required: false,
      default: null,
    },
    analysisJdFingerprint: {
      type: String,
      required: false,
      default: null,
    },
    analyzedResumeFileKey: {
      type: String,
      required: false,
      default: null,
    },
    lastAnalyzedAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true },
);

export default mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
