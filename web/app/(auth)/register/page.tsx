import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
    title: "Create account – Medium",
    description: "Create your Medium account.",
};

export default function RegisterPage() {
    return (
        <div className="min-h-[calc(100vh-57px-4rem)] flex flex-col items-center justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-[400px] bg-white rounded-lg border border-border p-6 sm:p-10 sm:px-12 sm:py-10 flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="font-logo text-[28px] font-bold text-text-1">Medium</h1>
                    <h2 className="font-logo text-[32px] font-bold text-text-1 leading-tight">
                        Join Medium.
                    </h2>
                    <p className="text-sm text-text-2">Create your account.</p>
                </div>
                <RegisterForm />
            </div>
        </div>
    );
}
