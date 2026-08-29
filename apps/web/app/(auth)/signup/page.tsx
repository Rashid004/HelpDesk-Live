"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { UserRole } from "@repo/shared";
import { ScreenLoader } from "../../../components/app/ScreenLoader";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Field, FieldError } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { PasswordInput } from "../../../components/ui/PasswordInput";
import { useGuestGuard } from "../../../hooks/useAuthGuard";
import { signup } from "../../../lib/api";
import { cn } from "../../../lib/cn";
import { saveSession } from "../../../lib/session";
import {
  passwordStrength,
  signupFormSchema,
  type SignupFormInput,
  type SignupFormValues,
} from "../../../lib/validation/auth";

const ROLES: { value: UserRole; label: string; blurb: string }[] = [
  { value: "customer", label: "Customer", blurb: "I need help with something" },
  { value: "agent", label: "Agent", blurb: "I resolve customer tickets" },
];

const STRENGTH_BAR = [
  "bg-danger",
  "bg-danger",
  "bg-status-open",
  "bg-brand-blue",
  "bg-status-resolved",
];

export default function SignUpPage(): React.JSX.Element {
  const router = useRouter();
  const { ready } = useGuestGuard();
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInput, unknown, SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { role: "customer" },
    mode: "onTouched",
  });

  const role = watch("role");
  const pw = watch("password") ?? "";
  const strength = passwordStrength(pw);

  if (!ready) return <ScreenLoader label="One moment…" />;

  async function onSubmit(values: SignupFormValues): Promise<void> {
    // confirmPassword is a UI-only field — the backend signupSchema doesn't have it.
    const { confirmPassword: _omit, ...payload } = values;
    setServerError(null);
    try {
      const res = await signup(payload);
      saveSession(res);
      setRedirecting(true);
      router.push("/dashboard");
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "We couldn't create your account. Please try again.",
      );
    }
  }

  if (redirecting) {
    return (
      <Card tone="yellow" className="flex flex-col gap-3 text-center">
        <span
          aria-hidden
          className="mx-auto grid size-14 place-items-center border-2 border-ink bg-paper rounded-brut text-2xl font-black shadow-brut"
        >
          ✓
        </span>
        <h1 className="font-display text-2xl font-black">Account created</h1>
        <p className="text-sm font-medium">Setting up your dashboard…</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-black">Create your account</h1>
        <p className="text-sm text-muted">
          Start tracking your support tickets in one place.
        </p>
      </header>

      {serverError && <FieldError>{serverError}</FieldError>}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Maya Fernandes"
            invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </Field>

        <Field label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          required
          error={errors.password?.message}
          hint="At least 8 characters. Mix in a number and a symbol for a stronger password."
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        {pw.length > 0 && (
          <div className="flex items-center gap-3 -mt-1">
            <div className="flex-1 h-3 border-2 border-ink rounded-brut bg-paper overflow-hidden">
              <div
                className={cn("h-full transition-all", STRENGTH_BAR[strength.score])}
                style={{ width: `${(strength.score / 4) * 100}%` }}
              />
            </div>
            <span className="label-brut shrink-0">{strength.label}</span>
          </div>
        )}

        <Field
          label="Confirm password"
          htmlFor="confirmPassword"
          required
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>

        {/* Role selector — bold segmented buttons, not a dropdown */}
        <fieldset className="flex flex-col gap-1.5">
          <legend className="label-brut mb-1.5">I'm signing up as</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const active = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setValue("role", r.value, { shouldValidate: true, shouldDirty: true })
                  }
                  className={cn(
                    "text-left border-2 border-ink rounded-brut p-3 press-brut",
                    active
                      ? "bg-brand-yellow shadow-brut"
                      : "bg-paper shadow-brut-sm",
                  )}
                >
                  <span className="font-display font-extrabold block">{r.label}</span>
                  <span className="text-xs text-muted">{r.blurb}</span>
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register("role")} />
        </fieldset>

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-center">
        Already have an account?{" "}
        <Link href="/signin" className="font-bold underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
