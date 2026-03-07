"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginFormProps = { redirectTo?: string };

export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim() ?? "";
    const password = (formData.get("password") as string) ?? "";

    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/auth/login", { email, password });
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <p
          className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-[13px] font-medium text-text-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="you@example.com"
          className="h-10 w-full px-3 border border-border rounded text-[15px] text-text-1 placeholder:text-text-3 bg-white focus:outline-none focus:border-primary"
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="password"
          className="text-[13px] font-medium text-text-1"
        >
          Password
        </label>
        <div className="flex h-10 w-full items-center justify-between gap-2 rounded border border-border bg-white px-3 focus-within:border-primary focus-within:outline-none focus-within:ring-1 focus-within:ring-primary">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            className="flex-1 min-w-0 bg-transparent text-[15px] text-text-1 placeholder:text-text-3 focus:outline-none"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="text-[13px] text-text-2 hover:text-text-1 shrink-0"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-full bg-primary text-white font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-text-2">
        No account?{" "}
        <Link
          href={
            redirectTo === "/"
              ? "/register"
              : `/register?redirect=${encodeURIComponent(redirectTo)}`
          }
          className="font-semibold text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
