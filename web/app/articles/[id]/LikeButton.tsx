"use client";

import { useState, useCallback } from "react";
import { Heart, Loader2 } from "lucide-react";

interface LikeButtonProps {
    articleId: string;
    initialLikeCount: number;
    initialIsLiked: boolean;
    isAuthenticated: boolean;
}

export function LikeButton({
    articleId,
    initialLikeCount,
    initialIsLiked,
    isAuthenticated,
}: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = useCallback(async () => {
        if (!isAuthenticated) {
            // Redirect to login if not authenticated
            window.location.href = `/login?redirect=/articles/${articleId}`;
            return;
        }

        if (isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/api/articles/${articleId}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to toggle like");
            }

            const data = await response.json();
            setIsLiked(data.isLiked);
            setLikeCount(data.likeCount);
        } catch (error) {
            console.error("Failed to toggle like:", error);
            alert(error instanceof Error ? error.message : "Failed to toggle like");
        } finally {
            setIsLoading(false);
        }
    }, [articleId, isAuthenticated, isLoading]);

    const hasLikes = likeCount > 0;

    return (
        <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center gap-1.5 text-[15px] transition-colors ${isLiked ? "text-like" : hasLikes ? "text-like" : "text-text-2"
                } hover:text-like disabled:opacity-50`}
            title={isAuthenticated ? (isLiked ? "Unlike" : "Like") : "Sign in to like"}
        >
            {isLoading ? (
                <Loader2 className="w-[15px] h-[15px] animate-spin" />
            ) : (
                <Heart
                    className="w-[15px] h-[15px]"
                    strokeWidth={2}
                    fill={isLiked || hasLikes ? "currentColor" : "none"}
                />
            )}
            {likeCount}
        </button>
    );
}
