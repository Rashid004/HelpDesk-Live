import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";
import { logger } from "./logger.js";
import { env } from "./env.js";

let s3Client: S3Client;
let bucketName: string;

// ===========================
// INITIALIZATION
// ===========================

export function initializeS3(): void {
  if (
    !env.AWS_ACCESS_KEY_ID ||
    !env.AWS_SECRET_ACCESS_KEY ||
    !env.AWS_REGION ||
    !env.AWS_S3_BUCKET_NAME
  ) {
    logger.warn("AWS S3 credentials not set — S3 disabled");
    return;
  }

  try {
    s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
      requestHandler: {
        connectionTimeout: 5000,
        requestTimeout: 10000,
      },
      // Prevent SDK from baking CRC32 checksums into presigned URLs, which
      // causes 403s because S3 requires the uploaded file's checksum to match
      // the signed placeholder value (AAAAAA== = zeros), which it never will.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });

    bucketName = env.AWS_S3_BUCKET_NAME;

    logger.info(
      {
        region: env.AWS_REGION,
        bucket: bucketName,
        accessKeyId: env.AWS_ACCESS_KEY_ID.substring(0, 8) + "...",
      },
      "S3 client initialized",
    );

    // Test asynchronously — don't block startup
    testBucketAccess();
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        region: env.AWS_REGION,
      },
      "Failed to initialize AWS S3 client",
    );
    throw new Error(
      `AWS S3 initialization failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

async function testBucketAccess(): Promise<void> {
  try {
    logger.info({ bucket: bucketName }, "Testing S3 bucket access");
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));

    logger.info({ bucket: bucketName }, "S3 bucket access test succeeded");
  } catch (error) {
    logger.error(
      {
        bucket: bucketName,
        error: error instanceof Error ? error.message : "Unknown error",
        errorCode: (error as any)?.Code,
        errorName: (error as any)?.name,
        statusCode: (error as any)?.$metadata?.httpStatusCode,
      },
      "S3 bucket access test failed",
    );
    logger.warn(
      { bucket: bucketName },
      "Server will continue but S3 operations may fail",
    );
  }
}

// ===========================
// GETTERS
// ===========================

export function getS3Client(): S3Client {
  if (!s3Client) {
    throw new Error("S3 client not initialized. Call initializeS3() first.");
  }
  return s3Client;
}

export function getBucketName(): string {
  if (!bucketName) {
    throw new Error("S3 bucket not configured. Call initializeS3() first.");
  }
  return bucketName;
}

export function isS3Initialized(): boolean {
  return !!s3Client && !!bucketName;
}

// ===========================
// HELPERS
// ===========================

/**
 * Generate an S3 key with an organized folder structure.
 * Format: category[/subFolder]/timestamp_random_sanitizedName.ext
 */
export function generateS3Key(
  originalFileName: string,
  category: "attachments" | "avatars" | "temp" = "temp",
  subFolder?: string,
): string {
  const timestamp = Date.now();
  const randomString = randomBytes(4).toString("hex");
  const extension = originalFileName.split(".").pop()?.toLowerCase() || "";
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");

  const sanitizedBaseName = baseName
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 50);

  const folder = subFolder ? `${category}/${subFolder}` : category;
  const s3Key = `${folder}/${timestamp}_${randomString}_${sanitizedBaseName}.${extension}`;

  logger.debug(
    { originalFileName, s3Key, category, subFolder },
    "Generated S3 key",
  );

  return s3Key;
}

/**
 * Validate a file's extension against a list of allowed extensions.
 */
export function validateFileExtension(
  fileName: string,
  allowedExtensions: string[],
): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return allowedExtensions.includes(`.${ext}`);
}
