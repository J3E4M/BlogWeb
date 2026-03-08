"use client";

import Link from "next/link";
import { Pencil, UserPlus } from "lucide-react";

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

type ProfileHeaderProps = {
    name: string;
    bio: string;
    followersCount: string;
    followingCount: string;
    isOwnProfile?: boolean;
    username?: string | null;
};

export default function ProfileHeader({
    name,
    bio,
    followersCount,
    followingCount,
    isOwnProfile = false,
    username,
}: ProfileHeaderProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div
                    className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[28px] shrink-0"
                    aria-hidden
                >
                    {getInitials(name)}
                </div>
                <div className="flex flex-col gap-4 min-w-0 flex-1">
                    <h1 className="font-logo text-3xl sm:text-[32px] font-bold text-text-1">
                        {name}
                    </h1>
                    {username && (
                        <p className="text-sm text-text-3">@{username}</p>
                    )}
                    <p className="text-base text-text-2 max-w-[728px]">{bio || "No bio yet."}</p>
                    <div className="flex items-center gap-6 text-sm text-text-1">
                        <span>{followersCount} Followers</span>
                        <span>{followingCount} Following</span>
                    </div>
                    {isOwnProfile ? (
                        <Link
                            href="/profile/edit"
                            className="self-start rounded-full border border-border bg-white px-4 py-2 text-sm font-normal text-text-1 hover:bg-surface transition-colors flex items-center gap-2"
                        >
                            <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                            Edit profile
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className="self-start rounded-full border border-primary text-primary px-4 py-2 text-sm font-medium hover:bg-primary/5 transition-colors flex items-center gap-2"
                        >
                            <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                            Follow
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
