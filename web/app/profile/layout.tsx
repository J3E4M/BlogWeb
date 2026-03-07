import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile — Medium",
    description: "View and manage your Medium profile",
};

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
