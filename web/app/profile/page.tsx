"use client";

import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import ProfileArticleCard from "./ProfileArticleCard";

// Mock data for UI — TODO: wire to API/auth
const MOCK_PROFILE = {
    name: "Sarah Chen",
    bio: "Staff writer. I cover technology, culture, and the messy places where they meet. Based in San Francisco. Previously at Wired.",
    followersCount: "12.4K",
    followingCount: "248",
};

const MOCK_ARTICLES = [
    {
        id: "1",
        title: "The Future of Human-Computer Interaction",
        excerpt:
            "As AI systems become more capable, our assumptions about intelligence are being challenged...",
        publishedAt: "Feb 12",
        readTimeMinutes: 5,
        likeCount: 142,
    },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<"home" | "about">("home");

    return (
        <div className="w-full max-w-[728px] mx-auto pt-12 pb-12 flex flex-col gap-8">
            <ProfileHeader
                name={MOCK_PROFILE.name}
                bio={MOCK_PROFILE.bio}
                followersCount={MOCK_PROFILE.followersCount}
                followingCount={MOCK_PROFILE.followingCount}
            />

            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "home" && (
                <div className="flex flex-col">
                    {MOCK_ARTICLES.length === 0 ? (
                        <p className="py-12 text-center text-text-2">No articles yet.</p>
                    ) : (
                        MOCK_ARTICLES.map((article) => (
                            <ProfileArticleCard
                                key={article.id}
                                id={article.id}
                                title={article.title}
                                excerpt={article.excerpt}
                                publishedAt={article.publishedAt}
                                readTimeMinutes={article.readTimeMinutes}
                                likeCount={article.likeCount}
                            />
                        ))
                    )}
                </div>
            )}

            {activeTab === "about" && (
                <div className="py-8">
                    <p className="text-text-2">
                        About content — placeholder for profile about section.
                    </p>
                </div>
            )}
        </div>
    );
}
