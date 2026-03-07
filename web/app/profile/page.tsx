"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import ProfileArticleCard from "./ProfileArticleCard";
import { FilePen } from "lucide-react";

type Article = {
    id: string;
    title: string;
    excerpt: string;
    publishedAt: string;
    readTimeMinutes: number;
    likeCount: number;
    statusId: number;
};

type ProfileData = {
    user: {
        id: string;
        name: string;
        username: string | null;
        bio: string;
        followersCount: string;
        followingCount: string;
        isOwnProfile: boolean;
    };
    articles: Article[];
};

export default function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"home" | "about">("home");
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                setIsLoading(true);
                // First, get current user session
                const sessionRes = await axios.get("/api/profile");
                const userId = sessionRes.data.user.id;

                // Then, fetch public profile data
                const profileRes = await axios.get<ProfileData>(`/api/users/${userId}`);
                setProfile(profileRes.data);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    router.push("/login?redirect=/profile");
                    return;
                }
                setError("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfile();
    }, [router]);

    if (isLoading) {
        return (
            <div className="w-full max-w-[728px] mx-auto pt-12 pb-12">
                <p className="text-text-2">Loading profile…</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="w-full max-w-[728px] mx-auto pt-12 pb-12">
                <p className="text-red-600">{error || "Failed to load profile"}</p>
            </div>
        );
    }

    const { user, articles } = profile;

    return (
        <div className="w-full max-w-[728px] mx-auto pt-12 pb-12 flex flex-col gap-8">
            <ProfileHeader
                name={user.name}
                bio={user.bio}
                followersCount={user.followersCount}
                followingCount={user.followingCount}
            />

            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "home" && (
                <div className="flex flex-col">
                    {articles.length === 0 ? (
                        <p className="py-12 text-center text-text-2">No articles yet.</p>
                    ) : (
                        articles.map((article) => (
                            <div key={article.id} className="relative">
                                {article.statusId === 2 && (
                                    <div className="absolute -top-2 left-0">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                                            <FilePen className="w-3 h-3" />
                                            Draft
                                        </span>
                                    </div>
                                )}
                                <div className={article.statusId === 2 ? "pt-4" : ""}>
                                    <ProfileArticleCard
                                        id={article.id}
                                        title={article.title}
                                        excerpt={article.excerpt}
                                        publishedAt={article.publishedAt}
                                        readTimeMinutes={article.readTimeMinutes}
                                        likeCount={article.likeCount}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === "about" && (
                <div className="py-8">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-text-1">About</h2>
                        <p className="text-text-2">
                            {user.bio || "No bio yet."}
                        </p>
                        {user.username && (
                            <p className="text-text-2">
                                <span className="font-medium">Username:</span> @{user.username}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
