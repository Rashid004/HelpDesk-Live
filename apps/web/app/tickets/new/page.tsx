"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema, type CreateTicketDTO } from "@repo/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { ScreenLoader } from "../../../components/app/ScreenLoader";
import { TopBar } from "../../../components/app/TopBar";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Field, FieldError } from "../../../components/ui/Field";
import { FileInput } from "../../../components/ui/FileInput";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Textarea } from "../../../components/ui/Textarea";
import { useAuthGuard } from "../../../hooks/useAuthGuard";
import { useSession } from "../../../hooks/useSession";
import { createTicket, requestAttachmentUpload, uploadToPresignedUrl } from "../../../lib/api";
import { ATTACHMENT_ACCEPT, deriveFileType, validateAttachmentExtension } from "../../../lib/attachments";
import { applyApiFieldErrors } from "../../../lib/formErrors";

const CATEGORY_OPTIONS = [
  { value: "technical", label: "Technical" },
  { value: "billing", label: "Billing" },
  { value: "accountIssue", label: "Account issue" },
  { value: "other", label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

type Phase = "idle" | "uploading" | "creating";

// z.input, not z.output (CreateTicketDTO) — `priority` carries a default in
// the schema, so it's optional on the way in but required once resolved.
// Same split signup/page.tsx uses for the same reason.
type CreateTicketFormInput = z.input<typeof createTicketSchema>;

export default function NewTicketPage(): React.JSX.Element {
  const { ready } = useAuthGuard("customer");
  const { user } = useSession();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketFormInput, unknown, CreateTicketDTO>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { priority: "normal", category: "technical" },
    mode: "onTouched",
  });

  if (!ready || !user) return <ScreenLoader label="Checking your session…" />;

  function handleFileSelect(f: File | null): void {
    setFile(f);
    setFileError(f ? validateAttachmentExtension(f) : null);
  }

  async function onSubmit(values: CreateTicketDTO): Promise<void> {
    setServerError(null);
    if (file && fileError) return; // FileInput already shows the reason

    try {
      let attachments: CreateTicketDTO["attachments"];

      if (file) {
        setPhase("uploading");
        setProgress(0);
        const fileType = deriveFileType(file);
        const { uploadUrl, fileUrl } = await requestAttachmentUpload({
          fileName: file.name,
          fileType,
          contentType: file.type || "application/octet-stream",
        });
        await uploadToPresignedUrl(uploadUrl, file, setProgress);
        attachments = [{ fileUrl, fileType }];
      }

      setPhase("creating");
      const ticket = await createTicket({ ...values, attachments });
      router.push(`/tickets/${ticket.id}`);
    } catch (err) {
      setPhase("idle");
      setProgress(undefined);
      if (applyApiFieldErrors(err, setError)) return;
      setServerError(
        err instanceof Error ? err.message : "We couldn't create your ticket. Please try again.",
      );
    }
  }

  const busy = isSubmitting || phase !== "idle";

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar user={user} />

      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl sm:text-4xl font-black">New ticket</h1>
          <p className="text-sm text-muted">
            Describe the problem — an agent will pick it up and chat with you live.
          </p>
        </div>

        <Card>
          {serverError && (
            <div className="mb-4">
              <FieldError>{serverError}</FieldError>
            </div>
          )}

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Title" htmlFor="title" required error={errors.title?.message}>
              <Input
                id="title"
                placeholder="Export button does nothing on Reports"
                invalid={!!errors.title}
                disabled={busy}
                {...register("title")}
              />
            </Field>

            <Field
              label="Description"
              htmlFor="description"
              required
              error={errors.description?.message}
              hint="At least 10 characters — the more detail, the faster an agent can help."
            >
              <Textarea
                id="description"
                rows={5}
                placeholder="What happened, what you expected, and steps to reproduce…"
                invalid={!!errors.description}
                disabled={busy}
                {...register("description")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="category" required error={errors.category?.message}>
                <Select
                  id="category"
                  options={CATEGORY_OPTIONS}
                  invalid={!!errors.category}
                  disabled={busy}
                  {...register("category")}
                />
              </Field>

              <Field label="Priority" htmlFor="priority" error={errors.priority?.message}>
                <Select
                  id="priority"
                  options={PRIORITY_OPTIONS}
                  invalid={!!errors.priority}
                  disabled={busy}
                  {...register("priority")}
                />
              </Field>
            </div>

            <Field label="Attachment" htmlFor="attachment">
              <FileInput
                file={file}
                onSelect={handleFileSelect}
                accept={ATTACHMENT_ACCEPT}
                disabled={busy}
                progress={phase === "uploading" ? progress : undefined}
              />
            </Field>
            {fileError && <FieldError>{fileError}</FieldError>}

            <Button type="submit" fullWidth loading={busy} disabled={!!fileError} className="mt-2">
              {phase === "uploading"
                ? "Uploading attachment…"
                : phase === "creating"
                  ? "Creating ticket…"
                  : "Create ticket"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
