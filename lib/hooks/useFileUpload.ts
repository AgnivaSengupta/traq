// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useState } from "react";
import { generateUploadUrl } from "../actions/upload";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const uploadFile = async (file: File, existingKey?: string) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const result = await generateUploadUrl(file.name, file.type, existingKey);
      if (result.error || !result.url) {
        throw new Error(result.error || "Failed to generate upload URL");
      }
      
      const uploadResponse = await fetch(result.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload the file");
      }
      
      return result.finalKey;
      
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message || "An unexpected error occurred");
      return null;
    } finally {
      setIsUploading(false);
    };
  };
  
  return {
    uploadFile, 
    isUploading,
    error,
  }
}