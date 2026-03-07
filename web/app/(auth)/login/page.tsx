import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in – Medium",
  description: "Sign in to your Medium account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  const showRegistered = params.registered === "1";
  const rawRedirect = params.redirect ?? "/";
  const redirectTo =
    typeof rawRedirect === "string" &&
    rawRedirect.startsWith("/") &&
    !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";
  return (
    <div className="min-h-[calc(100vh-57px-4rem)] flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[400px] bg-white rounded-lg border border-border p-6 sm:p-10 sm:px-12 sm:py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-logo text-[28px] font-bold text-text-1">
            Medium
          </h1>
          <h2 className="font-logo text-[32px] font-bold text-text-1 leading-tight">
            Welcome back.
          </h2>
          <p className="text-sm text-text-2">Sign in with your email.</p>
        </div>
        <LoginForm  redirectTo={redirectTo}/>
      </div>
    </div>
  );
}
