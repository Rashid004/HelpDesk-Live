"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginDTO } from "@repo/shared";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { login } from "../../../lib/api";

export default function SignInPage(): React.JSX.Element {
  const [signedIn, setSignedIn] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  async function onSubmit(values: LoginDTO): Promise<void> {
    // TODO: replace with real POST /api/auth/login — persist tokens,
    // redirect to /dashboard.
    console.log("[signin] submit", values);
    const res = await login(values);
    setSignedIn(res.user.fullName);
  }

  if (signedIn) {
    return (
      <Card tone="yellow" className="flex flex-col gap-4 text-center">
        <span
          aria-hidden
          className="mx-auto grid size-14 place-items-center border-2 border-ink bg-paper rounded-brut text-2xl font-black shadow-brut"
        >
          ✓
        </span>
        <h1 className="font-display text-2xl font-black">Signed in</h1>
        <p className="text-sm font-medium">
          Welcome back, {signedIn.split(" ")[0]}. Taking you to your tickets…
        </p>
        <p className="text-xs text-muted">
          (Demo only — dashboard routing gets wired with the real API.)
        </p>
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
          <Input
            id="password"
            type="password"
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
