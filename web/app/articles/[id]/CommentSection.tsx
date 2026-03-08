"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, MessageCircle } from "lucide-react";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  authorId: string;
  createdAt: string;
};

type CommentSectionProps = {
  articleId: string;
  isAuthenticated: boolean;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
}

export function CommentSection({ articleId, isAuthenticated }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/articles/${articleId}/comments`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleRespond() {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/articles/${articleId}`;
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post comment");
      }

      const data = await response.json();
      setComments((prev) => [data.comment, ...prev]);
      setText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="pt-8 flex flex-col gap-6">
      <div className="h-px bg-border" />

      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-text-2" />
        <h2 className="font-logo text-2xl font-bold text-text-1">
          Comments ({comments.length})
        </h2>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <textarea
          placeholder={isAuthenticated ? "Write a comment..." : "Sign in to comment..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting || !isAuthenticated}
          className="w-full rounded-lg bg-surface border border-border p-4 min-h-[106px] text-[15px] text-text-1 placeholder:text-text-3 resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleRespond}
            disabled={!text.trim() || isSubmitting || !isAuthenticated}
            className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Respond"
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-text-3" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-3 text-[15px]">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 py-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
                {getInitials(comment.authorName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm text-text-1">{comment.authorName}</div>
                  <div className="text-xs text-text-3">{formatTimeAgo(comment.createdAt)}</div>
                </div>
                <p className="text-[15px] leading-normal text-text-1 mt-1 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}