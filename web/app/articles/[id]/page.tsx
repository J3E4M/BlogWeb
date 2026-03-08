import { notFound } from "next/navigation";
import Link from "next/link";
import { Share2, FilePen, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CommentSection } from "./CommentSection";
import { DeleteArticleButton } from "./DeleteArticleButton";
import { LikeButton } from "./LikeButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getReadTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  const words = text.trim().split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  const currentUserId = session?.userId;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, username: true } },
      categories: {
        where: { statusId: 1 },
        include: { category: { select: { id: true, name: true } } },
      },
      _count: {
        select: {
          likes: {
            where: { statusId: 1 },
          },
        },
      },
    },
  });

  if (!article) notFound();

  const isDraft = article.statusId === 2;
  const isOwner = currentUserId === article.author.id;
  const isAuthenticated = !!session;

  // Check if current user has liked this article
  let userLike = null;
  if (currentUserId) {
    userLike = await prisma.articleLike.findUnique({
      where: {
        userId_articleId: {
          userId: currentUserId,
          articleId: id,
        },
      },
    });
  }
  const isLiked = userLike?.statusId === 1;

  // Draft articles are only accessible by the owner
  if (isDraft && !isOwner) {
    notFound();
  }

  const readTime = getReadTime(article.content);
  const initials = getInitials(article.author.name);
  const plainContent = article.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const excerpt = plainContent.slice(0, 200);
  const dateStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(article.createdAt);

  // Profile URL - use username if available
  const authorProfileUrl = article.author.username
    ? `/profile/${article.author.username}`
    : `/profile/${article.author.id}`;

  return (
    <article className={`max-w-[680px] mx-auto pt-12 pb-12 flex flex-col gap-6 ${isDraft ? "relative" : ""}`}>
      {isDraft && (
        <div className="absolute -top-2 left-0 right-0 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
            <FilePen className="w-4 h-4" />
            Draft — Only visible to you
          </span>
        </div>
      )}
      {/* Title */}
      <h1 className="font-logo text-[42px] font-bold leading-[1.2] text-text-1">
        {article.title}
      </h1>

      {/* Subtitle - from article or excerpt from content */}
      {(article.subtitle || excerpt) && (
        <p className="font-logo text-2xl font-semibold leading-[1.4] text-text-2">
          {article.subtitle ?? `${excerpt}${plainContent.length > 200 ? "…" : ""}`}
        </p>
      )}

      {/* Category chips */}
      {article.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.categories.map((ac) => (
            <span
              key={ac.category.id}
              className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-medium text-text-1 bg-surface border border-border"
            >
              {ac.category.name}
            </span>
          ))}
        </div>
      )}

      {/* Author bar */}
      <div className="flex items-center gap-3">
        <Link
          href={authorProfileUrl}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[15px] shrink-0"
        >
          {initials}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={authorProfileUrl}
            className="text-base font-semibold text-text-1 hover:text-primary transition-colors block"
          >
            {article.author.name}
          </Link>
          <p className="text-[13px] text-text-2">
            {dateStr} · {readTime} min read
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
        >
          Follow
        </button>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-5 py-3 border-y border-border">
        <LikeButton
          articleId={article.id}
          initialLikeCount={article._count.likes}
          initialIsLiked={isLiked}
          isAuthenticated={isAuthenticated}
        />
        <div className="flex-1" />
        {/* Edit & Delete buttons - only visible to article owner */}
        {isOwner && (
          <>
            <Link
              href={`/articles/${article.id}/edit`}
              className="flex items-center gap-1.5 text-text-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Link>
            <DeleteArticleButton articleId={article.id} />
          </>
        )}
        <span className="flex items-center gap-1.5 text-sm text-text-2">
          <Share2 className="size-[14px]" strokeWidth={2} />
          Share
        </span>
      </div>

      {/* Body content */}
      <div
        className="prose prose-neutral max-w-none text-text-1
          /* Headings */
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
          [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
          /* Paragraphs */
          [&_p]:text-lg [&_p]:leading-[1.8] [&_p]:mb-4
          /* Lists */
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:mb-1
          /* Code */
          [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
          [&_pre]:bg-surface [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4
          [&_pre_code]:bg-transparent [&_pre_code]:p-0
          /* Blockquotes */
          [&_blockquote]:border-l-4 [&_blockquote]:border-text-1 [&_blockquote]:pl-4 [&_blockquote]:font-logo [&_blockquote]:text-xl [&_blockquote]:font-semibold [&_blockquote]:leading-normal [&_blockquote]:not-italic [&_blockquote]:mb-4
          /* Links */
          [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80
          /* Images */
          [&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-4
          /* Horizontal rule */
          [&_hr]:my-8 [&_hr]:border-border
          /* Bold and Italic */
          [&_strong]:font-bold
          [&_em]:italic"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Bottom author card */}
      <div className="flex gap-6 pt-6">
        <Link
          href={authorProfileUrl}
          className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[28px] shrink-0"
        >
          {initials}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={authorProfileUrl}
            className="text-xl font-semibold text-text-1 hover:text-primary transition-colors block"
          >
            {article.author.name}
          </Link>
          <p className="text-[15px] text-text-2 leading-[1.6] mt-2">
            Staff writer. Writing about technology and human experience.
          </p>
          <button
            type="button"
            className="mt-2 px-4 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
          >
            Follow
          </button>
        </div>
      </div>

      <CommentSection articleId={article.id} isAuthenticated={isAuthenticated} />
    </article>
  );
}