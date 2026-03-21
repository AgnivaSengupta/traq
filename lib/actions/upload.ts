"use server";

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_API,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_TOKEN_ID as string,
    secretAccessKey: process.env.R2_SECRET_ID as string,
  },
});

export async function generateUploadUrl(fileName: string, contentType: string, existingKey?: string) {
  try {
    if (!fileName || !contentType) {
      return { error: "Missing required fields" };
    }

    const uniqueFilename = existingKey || `${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: "traq",
      Key: uniqueFilename,
      ContentType: contentType,
    });

    // generating the getSignedUrl
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 600 }); 

    return {
      success: true,
      url: signedUrl,
      finalKey: uniqueFilename,
    };

  } catch (error) {
    console.error("Error generating the pre-signed URL: ", error);
    return { error: "Internal Server Error - Upload Fail!" };
  }
}

// generate temp view URL
export async function getFileViewUrl (fileKey: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: "traq",
      Key: fileKey,
    });
    
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 600 });
    return { success: true, url: signedUrl };
  } catch {
    console.error("Error generating the view URL");
    return { error: "Failed to generate view URL" };
  }
}

export async function getPublicFileUrl(fileKey: string) {
  const publicBaseUrl =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;

  if (!publicBaseUrl) {
    return {
      error:
        "Missing public file base URL. Set NEXT_PUBLIC_R2_PUBLIC_URL or R2_PUBLIC_URL.",
    };
  }

  const normalizedBaseUrl = publicBaseUrl.endsWith("/")
    ? publicBaseUrl.slice(0, -1)
    : publicBaseUrl;

  return {
    success: true,
    url: `${normalizedBaseUrl}/${fileKey}`,
  };
}
