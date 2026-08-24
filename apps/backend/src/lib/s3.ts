import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { generateS3Key, getBucketName, getS3Client, isS3Initialized } from "../config/s3.js";
import { ApiError } from "../utils/ApiError.js";

const UPLOAD_URL_TTL_SECONDS = 5 * 60; // presigned PUT URL is valid for 5 minutes


export async function createUploadUrl(
  originalFileName: string,
  contentType: string,
  category: "attachments" | "avatars",
) {
  if (!isS3Initialized()) {
    throw new ApiError("File upload is not available right now", 503);
  }

  const key = generateS3Key(originalFileName, category);

  const uploadUrl = await getSignedUrl(
    getS3Client(),
    new PutObjectCommand({ Bucket: getBucketName(), Key: key, ContentType: contentType }),
    { expiresIn: UPLOAD_URL_TTL_SECONDS },
  );

  const fileUrl = `https://${getBucketName()}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl, key };
}
