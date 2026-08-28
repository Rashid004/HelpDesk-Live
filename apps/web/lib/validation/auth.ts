import { signupSchema } from "@repo/shared";
import { z } from "zod";

/**
 * Client-only extension of the shared `signupSchema` — adds the
 * `confirmPassword` field, which is a UI concern the backend never sees.
 * The real submit payload is `signupSchema`-shaped (confirmPassword stripped).
 */
export const signupFormSchema = signupSchema
  .extend({
    confirmPassword: z.string().min(1, "Please re-enter your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignupFormInput = z.input<typeof signupFormSchema>;
export type SignupFormValues = z.output<typeof signupFormSchema>;

/* ---- Lightweight password strength hint --------------------------- */

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too short" | "Weak" | "Fair" | "Good" | "Strong";
}

export function passwordStrength(pw: string): PasswordStrength {
  if (pw.length < 8) return { score: 0, label: "Too short" };
  let score = 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12 && score < 4) score++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"] as const;
  const s = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  return { score: s, label: labels[s] };
}
