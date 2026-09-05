"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginDTO } from "@repo/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ScreenLoader } from "../../../components/app/ScreenLoader";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Field, FieldError } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { PasswordInput } from "../../../components/ui/PasswordInput";
import { homeFor, useGuestGuard } from "../../../hooks/useAuthGuard";
import { login } from "../../../lib/api";
import { applyApiFieldErrors } from "../../../lib/formErrors";
import { saveSession } from "../../../lib/session";

export default function SignInPage(): React.JSX.Element {
  const router = useRouter();
  const { ready } = useGuestGuard();
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  if (!ready) return <ScreenLoader label="One moment…" />;

  async function onSubmit(values: LoginDTO): Promise<void> {
    setServerError(null);
    try {
      const res = await login(values);
      saveSession(res);
      setRedirecting(true);
      router.push(homeFor(res.user.role));
    } catch (err) {
      // Wrong email vs. wrong password never gets field-level treatment —
      // auth.service.ts's loginUser deliberately returns the same message
      // for both ("Invalid email or password") so a failed attempt can't be
      // used to enumerate registered emails. Only real validation errors
      // (malformed email, empty password) are field-specific.
      if (applyApiFieldErrors(err, setError)) return;
      setServerError(
        err instanceof Error
          ? err.message
          : "We couldn't sign you in. Please try again.",
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
        <h1 className="font-display text-2xl font-black">Signed in</h1>
        <p className="text-sm font-medium">Taking you to your tickets…</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-black">Sign in</h1>
        <p className="text-sm text-muted">
          Pick up your support conversations where you left off.
        </p>
      </header>

      {serverError && <FieldError>{serverError}</FieldError>}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

        <Field label="Password" htmlFor="password" required error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        <div className="flex justify-end -mt-1">
          <Link
            href="/forgot-password"
            className="text-xs font-bold underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-sm text-center">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}
