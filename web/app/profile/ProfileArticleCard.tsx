"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Pencil, Trash2, Loader2 } from "lucide-react";

type ProfileArticleCardProps = {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTimeMinutes: number;
  likeCount: number;
  onDelete?: (id: string) => Promise<void>;
  isOwnProfile?: boolean;
};

export default function ProfileArticleCard({
  id,
  title,
  excerpt,
  publishedAt,
  readTimeMinutes,
  likeCount,
  onDelete,
  isOwnProfile = false,
}: ProfileArticleCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <article className="border-b border-border py-6">
      <div className="flex flex-col gap-3">
        <Link href={`/articles/${id}`} className="block group">
          <h2 className="text-xl font-semibold text-text-1 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h2>
        </Link>
        <p className="text-sm text-text-2 line-clamp-2">{excerpt}</p>
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-text-2">
          <span>{publishedAt}</span>
          <span>{readTimeMinutes} min read</span>
          <span className={`flex items-center gap-1 ${likeCount > 0 ? "text-like" : ""}`}>
            <Heart className="w-3.5 h-3.5" strokeWidth={2} fill={likeCount > 0 ? "currentColor" : "none"} />
            {likeCount}
          </span>
          <span className="flex-1" />
          {isOwnProfile && (
            <>
              <Link
                href={`/articles/${id}/edit`}
                className="rounded border border-border px-3 py-1.5 text-sm text-text-1 hover:bg-surface transition-colors flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                Edit
              </Link>

              {showConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600">Delete?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        ...
                      </>
                    ) : (
                      "Yes"
                    )}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="rounded border border-border px-3 py-1.5 text-sm text-text-1 hover:bg-surface transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
