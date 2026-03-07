"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RegisterFormProps = { redirectTo?: string };

export default function RegisterForm({ redirectTo = "/" }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim() ?? "";
    const username = (formData.get("username") as string)?.trim() ?? "";
    const email = (formData.get("email") as string)?.trim() ?? "";
    const password = (formData.get("password") as string) ?? "";

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/auth/register", {
        name,
        username: username || undefined,
        email,
        password,
      });
      const loginUrl =
        redirectTo === "/"
          ? "/login?registered=1"
          : `/login?registered=1&redirect=${encodeURIComponent(redirectTo)}`;
      router.push(loginUrl);
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
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-[13px] font-medium text-text-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Your name"
          className="h-10 w-full px-3 border border-border rounded text-[15px] text-text-1 placeholder:text-text-3 bg-white focus:outline-none focus:border-primary"
          autoComplete="name"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-[13px] font-medium text-text-1">
          Username <span className="text-text-3 font-normal">(optional)</span>
        </label>
        <input
          id="username"
          type="text"
          name="username"
          placeholder="johndoe"
          className="h-10 w-full px-3 border border-border rounded text-[15px] text-text-1 placeholder:text-text-3 bg-white focus:outline-none focus:border-primary"
          autoComplete="username"
        />
      </div>
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
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-[13px] font-medium text-text-1">
          Password
        </label>
        <div className="flex h-10 w-full items-center justify-between gap-2 rounded border border-border bg-white px-3 focus-within:border-primary focus-within:outline-none focus-within:ring-1 focus-within:ring-primary">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            className="flex-1 min-w-0 bg-transparent text-[15px] text-text-1 placeholder:text-text-3 focus:outline-none"
            autoComplete="new-password"
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
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-text-2">
        Already have an account?{" "}
        <Link
          href={
            redirectTo === "/"
              ? "/login"
              : `/login?redirect=${encodeURIComponent(redirectTo)}`
          }
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}