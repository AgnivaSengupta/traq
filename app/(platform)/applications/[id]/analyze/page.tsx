import { redirect } from "next/navigation";
import connectDB from "@/lib/db"; 
import JobApplication from "@/lib/models/jobApplication"; 
import AnalyzeFitClient from "./AnalyzeFitClient";

export default async function AnalyzePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. Await the params to get the ID (Required in Next.js 15+)
  const resolvedParams = await params;
  const jobId = resolvedParams.id;

  await connectDB();
  
  // 2. Fetch the job and the saved AI result
  const job = await JobApplication.findById(jobId).lean();

  // 3. Security & UX Checks
  if (!job) {
    redirect("/applications");
  }
  if (!job.analysisResult) {
    // If they manually type the URL but haven't analyzed yet, kick them back
    redirect("/applications"); 
  }

  const cleanJobData = {
    _id: job._id.toString(),
    company: job.company,
    position: job.position,
    analysisResult: job.analysisResult,
  };

  return <AnalyzeFitClient jobData={cleanJobData} />;
}
