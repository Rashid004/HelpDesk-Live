"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { updateTicketStatusSchema, type TicketStatus, type UpdateTicketStatusDTO } from "@repo/shared";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateTicketStatus } from "../../lib/api";
import { applyApiFieldErrors } from "../../lib/formErrors";
import type { TicketView } from "../../lib/types";
import { Button } from "../ui/Button";
import { Field, FieldError } from "../ui/Field";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "inProgress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

/**
 * Uses @repo/shared's updateTicketStatusSchema directly as the form
 * resolver — its `.refine` (resolutionNote required when status is
 * "resolved") is the exact rule the backend enforces, so this can't drift
 * out of sync with it. A resolutionNote left blank is caught right here,
 * before the request ever goes out.
 */
export function AgentStatusForm({
  ticket,
  onUpdated,
}: {
  ticket: TicketView;
  onUpdated: () => void;
}): React.JSX.Element {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTicketStatusDTO>({
    resolver: zodResolver(updateTicketStatusSchema),
    defaultValues: { status: ticket.status, note: "", resolutionNote: ticket.resolutionNote ?? "" },
  });
  const status = watch("status");

  async function onSubmit(values: UpdateTicketStatusDTO): Promise<void> {
    setServerError(null);
    try {
      await updateTicketStatus(ticket.id, values);
      onUpdated();
    } catch (err) {
      if (applyApiFieldErrors(err, setError)) return;
      setServerError(
        err instanceof Error ? err.message : "Couldn't update the ticket. Please try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && <FieldError>{serverError}</FieldError>}

      <Field label="Status" htmlFor="status" required error={errors.status?.message}>
        <Select
          id="status"
          options={STATUS_OPTIONS}
          invalid={!!errors.status}
          disabled={isSubmitting}
          {...register("status")}
        />
      </Field>

      <Field
        label="Note"
        htmlFor="note"
        hint="Optional — recorded in the ticket's status history."
        error={errors.note?.message}
      >
        <Textarea
          id="note"
          rows={2}
          invalid={!!errors.note}
          disabled={isSubmitting}
          {...register("note")}
        />
      </Field>

      {status === "resolved" && (
        <Field
          label="Resolution note"
          htmlFor="resolutionNote"
          required
          hint="Required to resolve — this is what goes in the customer's email."
          error={errors.resolutionNote?.message}
        >
          <Textarea
            id="resolutionNote"
            rows={3}
            invalid={!!errors.resolutionNote}
            disabled={isSubmitting}
            {...register("resolutionNote")}
          />
        </Field>
      )}

      <Button type="submit" loading={isSubmitting} fullWidth>
        Update status
      </Button>
    </form>
  );
}
