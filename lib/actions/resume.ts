"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth";
import connectDB from "../db";
import Resume from "../models/resume";
import { headers } from "next/headers";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_API,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_TOKEN_ID as string,
    secretAccessKey: process.env.R2_SECRET_ID as string,
  },
});

export async function saveResumeRecord(name: string, fileKey: string) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    await connectDB();

    const existingResume = await Resume.findOne({
      fileKey,
      userId: session.user.id,
    });

    if (existingResume) {
      existingResume.version += 1;
      existingResume.updatedAt = new Date();
      await existingResume.save();
      return { success: true };
    }

    await Resume.create({
      userId: session.user.id,
      name: name,
      fileKey: fileKey,
    });

    revalidatePath("/resume");
    return { success: true };
  } catch (error) {
    console.error("Error saving resume to DB:", error);
    console.error(
      "Database operation failed! Rolling back R2 upload...",
      error,
    );

    // --- THE COMPENSATING TRANSACTION ---
    // If the database fails, immediately delete the file from R2
    try {
      await S3.send(
        new DeleteObjectCommand({
          Bucket: "traq",
          Key: fileKey,
        }),
      );
      console.log(
        `Successfully rolled back (deleted) orphaned file: ${fileKey}`,
      );
    } catch (s3Error) {
      // If this fails, you have a true orphaned file. You should log this to a
      // monitoring service (like Sentry) so you can manually delete it later.
      console.error("CRITICAL: Failed to delete orphaned file in R2:", s3Error);
    }
    return { error: "Failed to save record. Uploads are cancelled." };
  }
}

export async function getUserResumes() {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized.", data: null };
    await connectDB();

    const resumes = await Resume.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    // Serialize the IDs
    const serializeResumes = resumes.map((resume) => ({
      ...resume,
      _id: resume._id.toString(),
      createdAt: resume.createdAt.toString(),
      updatedAt: resume.updatedAt.toString(),
    }));

    return { success: true, data: serializeResumes };
  } catch (error) {
    console.error("Error getting user resumes:", error);
    return { error: "Failed to get resumes." };
  }
}

export async function deleteResume(resumeId: string) {
  try {
    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };

    await connectDB();

    // double checking the resume exists and belongs to the user
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: session.user.id,
    });

    if (!resume) return { error: "Resume not found or unauthorized." };

    await resume.deleteOne({ _id: resumeId });

    try {
      await S3.send(
        new DeleteObjectCommand({ Bucket: "traq", Key: resume.fileKey }),
      );
      console.log(`Successfully deleted file from R2: ${resume.fileKey}`);
    } catch (r2Error) {
      // If R2 deletion fails but DB succeeded, the file is orphaned.
      // The app will still work perfectly, but you should log this to clean up later.
      console.error(
        "Failed to delete file from R2, but DB record was removed:",
        r2Error,
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting resume:", error);
    return { error: "Failed to delete resume." };
  }
}
