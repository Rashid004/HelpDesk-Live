import type { FileType } from "@repo/shared";

/**
 * Mirrors apps/backend/src/utils/constants.ts — not shared via @repo/shared
 * because the backend never put them there. Kept in sync by hand; the
 * backend's own check (ticket.service.ts's getAttachmentUploadUrl) is the
 * real gate — this is just so a bad file is rejected before spending a
 * round trip on a presigned URL that would fail anyway.
 */
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

export const ATTACHMENT_ACCEPT = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_DOCUMENT_EXTENSIONS].join(
  ",",
);

/** "image/png" -> "image"; anything else -> "document" (matches fileTypeEnum). */
export function deriveFileType(file: File): FileType {
  return file.type.startsWith("image/") ? "image" : "document";
}

function extensionOf(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext ? `.${ext}` : "";
}

export function validateAttachmentExtension(file: File): string | null {
  const fileType = deriveFileType(file);
  const allowed = fileType === "image" ? ALLOWED_IMAGE_EXTENSIONS : ALLOWED_DOCUMENT_EXTENSIONS;
  const ext = extensionOf(file.name);
  if (!allowed.includes(ext)) {
    return `That file type isn't supported. Allowed: ${allowed.join(", ")}`;
  }
  return null;
}
