import Link from "next/link";
import { Heart, Bookmark } from "lucide-react";

type ArticleCardProps = {
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: Date;
  readTimeMinutes?: number;
  categoryName?: string;
  likeCount?: number;
  isLoggedIn?: boolean;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ArticleCard({
  id, title, excerpt, authorName, publishedAt,
  readTimeMinutes = 5, categoryName, likeCount = 0, isLoggedIn = false,
}: ArticleCardProps) {
  return (
    <article className="border border-border rounded-lg py-6 px-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary shrink-0 flex items-center justify-center text-white text-[10px] font-medium" aria-hidden>
            {getInitials(authorName)}
          </span>
          <span className="text-[13px] font-medium text-text-1">{authorName}</span>
        </div>
        <Link href={`/articles/${id}`} className="block group">
          <h2 className="text-xl font-semibold text-text-1 group-hover:text-primary transition-colors line-clamp-2">{title}</h2>
        </Link>
        <p className="text-sm text-text-2 line-clamp-2">{excerpt}</p>
        <div className="flex items-center gap-3 text-[13px] text-text-2">
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-text-1">{categoryName ?? "Technology"}</span>
          <span>{readTimeMinutes} min read</span>
          <span className={`flex items-center gap-1 ${likeCount > 0 ? "text-like" : ""}`}>
            <Heart className="w-3.5 h-3.5" strokeWidth={2} fill={likeCount > 0 ? "currentColor" : "none"} />
            {likeCount}
          </span>
          <button type="button" disabled={!isLoggedIn} className={`ml-auto p-0.5 ${!isLoggedIn ? "cursor-not-allowed opacity-50" : "hover:opacity-80"}`} aria-label={isLoggedIn ? "Bookmark" : "Login to bookmark"}>
            <Bookmark className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
}