"use server";
import { JobApplication, Column } from "../models";
import connectDB from "../db";
import { revalidatePath } from "next/cache";
import { IExtractedJD } from "../models/jobApplication";


interface CreateJobParams {
  userId: string; // <--- Add this
  boardId: string; // <--- Add this
  company: string;
  position: string;
  columnId: string;
  salary?: string;
  location?: string;
  jobUrl?: string;
  applicationDate?: string;
  description?: IExtractedJD;
}

export async function createJobApplication(params: CreateJobParams) {
  try {
    await connectDB();

    // 1. Create the new job in MongoDB
    const newJob = await JobApplication.create({
      userId: params.userId, // <--- Pass to DB
      boardId: params.boardId, // <--- Pass to DB
      company: params.company,
      position: params.position,
      columnId: params.columnId,
      salary: params.salary,
      location: params.location,
      jobUrl: params.jobUrl,
      applicationDate: params.applicationDate,
      description: params.description,
      order: 0, // You might want to calculate the max order + 1 here dynamically
      status: "applied",
    });

    await Column.findByIdAndUpdate(params.columnId, {
      $push: { jobApplications: newJob._id },
    });

    // 2. Convert Mongoose document to a plain JS object to pass to client
    // (This handles converting _id ObjectIds to strings)
    const jobObject = JSON.parse(JSON.stringify(newJob));

    // 3. Revalidate the board page so it fetches the new data on refresh
    revalidatePath("/board");

    return { success: true, job: jobObject };
  } catch (error) {
    console.error("Error creating job:", error);
    return { success: false, error: "Failed to create job" };
  }
}


export async function updateJobStatus(jobId: string, newColumnId: string) {
  try {
    await connectDB();

    // 1. Find the current job to get its OLD column ID
    const currentJob = await JobApplication.findById(jobId);
    if (!currentJob) return { success: false, error: "Job not found" };

    const oldColumnId = currentJob.columnId;

    // optimization: If the column hasn't actually changed, do nothing
    if (oldColumnId.toString() === newColumnId) {
      return { success: true };
    }

    // 2. Update the Job's columnId
    await JobApplication.findByIdAndUpdate(
      jobId,
      { columnId: newColumnId },
      { new: true }
    );

    // 3. Remove job reference from the OLD Column
    if (oldColumnId) {
      await Column.findByIdAndUpdate(oldColumnId, {
        $pull: { jobApplications: jobId }
      });
    }

    // 4. Add job reference to the NEW Column
    await Column.findByIdAndUpdate(newColumnId, {
      $push: { jobApplications: jobId }
    });

    revalidatePath("/board");
    return { success: true };
  } catch (error) {
    console.error("Error updating job status:", error);
    return { success: false, error: "Failed to update job status" };
  }
}


export async function deleteJob(jobId: string) {
  try {
    await connectDB()
    
    const currentJob = await JobApplication.findById(jobId);
    if (!currentJob) return { success: false, error: "Job not found" };
    
    const columnId = currentJob.columnId;
    if (columnId) {
      await Column.findByIdAndUpdate(columnId, {
        $pull: { jobApplications: jobId }
      });
    }
    
    await JobApplication.findByIdAndDelete(jobId);
    
    revalidatePath("/board");
    return { success: true };
    
  } catch(error) {
    console.error("Error deleting job:", error);
    return { success: false, error: "Failed to delete job" };
  }
}


export async function getUserApplications(userId: string) {
  try {
    await connectDB();
    const userApplications = await JobApplication.find({ userId: userId })
      .populate("columnId", "name")
      .populate("resume", "name")
      .sort({createdAt: -1})
      .lean();

    const applications = userApplications.map((job) => ({
      ...job,
      _id: job._id.toString(),
      boardId: job.boardId?.toString?.() ?? null,
      columnId: job.columnId
        ? {
            ...job.columnId,
            _id: job.columnId._id.toString(),
          }
        : null,
      resume: job.resume
        ? {
            ...job.resume,
            _id: job.resume._id.toString(),
          }
        : null,
      analyzedResumeId: job.analyzedResumeId?.toString?.() ?? null,
      analysisFingerprint: job.analysisFingerprint ?? null,
      analysisJdFingerprint: job.analysisJdFingerprint ?? null,
      analyzedResumeFileKey: job.analyzedResumeFileKey ?? null,
      createdAt: job.createdAt?.toISOString?.() ?? null,
      updatedAt: job.updatedAt?.toISOString?.() ?? null,
      applicationDate: job.applicationDate?.toISOString?.() ?? null,
      lastAnalyzedAt: job.lastAnalyzedAt?.toISOString?.() ?? null,
    }));
    
    return { success: true, applications };
  } catch (error) {
    console.log("Error fetching the data: ", error);
    return {success: false, error: "Failed to fetch data"}
  }
}

export async function getJDAnalysis(_jobId: string) {
  try {
    void _jobId;
    
  } catch {
    
  }
}
