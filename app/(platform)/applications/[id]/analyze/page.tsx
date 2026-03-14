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

  // 4. Sanitize the MongoDB document for the Client Component
  const cleanJobData = JSON.parse(JSON.stringify(job));

  // 5. Pass it as a prop!
  return <AnalyzeFitClient jobData={cleanJobData} />;
}