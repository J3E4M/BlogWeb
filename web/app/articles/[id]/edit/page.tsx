"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import TurndownService from "turndown";
import MarkdownEditor from "../../../write/MarkdownEditor";

const MARKDOWN_PLACEHOLDER = `# Write your article in Markdown

**Bold** *Italic* ~~Strikethrough~~ \`inline code\`

## Headings: # H1 ## H2 ### H3

## Lists: - bullet 1. ordered

> Blockquotes | \`\`\` Code blocks \`\`\``;

// Initialize turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
});

interface EditArticlePageProps {
    params: Promise<{ id: string }>;
}

interface Article {
    id: string;
    title: string;
    subtitle: string | null;
    content: string;
    statusId: number;
    authorId: string;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
    const router = useRouter();
    const [articleId, setArticleId] = useState<string>("");
    const [article, setArticle] = useState<Article | null>(null);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [content, setContent] = useState("");
    const [statusId, setStatusId] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Resolve params
    useEffect(() => {
        params.then((p) => setArticleId(p.id));
    }, [params]);

    // Fetch article data
    useEffect(() => {
        if (!articleId) return;

        async function fetchArticle() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/articles/${articleId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Article not found");
                    }
                    throw new Error("Failed to load article");
                }

                const data = await response.json();

                // Check if user is the owner
                const sessionRes = await fetch("/api/profile");
                if (!sessionRes.ok) {
                    router.push("/login?redirect=/articles/" + articleId + "/edit");
                    return;
                }
                const session = await sessionRes.json();

                if (data.authorId !== session.user.id) {
                    setError("You can only edit your own articles");
                    return;
                }

                setArticle(data);
                setTitle(data.title);
                setSubtitle(data.subtitle || "");
                // Convert HTML content to Markdown for the editor
                const markdownContent = turndownService.turndown(data.content);
                setContent(markdownContent);
                setStatusId(data.statusId);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load article");
            } finally {
                setIsLoading(false);
            }
        }

        fetchArticle();
    }, [articleId, router]);

    const handleSave = async (publish: boolean) => {
        if (!articleId) return;

        setError(null);
        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        if (!content.trim()) {
            setError("Content is required");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(`/api/articles/${articleId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    subtitle: subtitle.trim() || null,
                    content: content.trim(),
                    statusId: publish ? 1 : 2,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update article");
            }

            const data = await response.json();
            setArticle(data.article);
            setStatusId(data.article.statusId);

            // Redirect after successful save
            router.push(`/articles/${articleId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update article");
        } finally {
            setIsSaving(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col w-full min-h-0">
                <div className="relative z-10 flex items-center justify-between gap-4 py-3 px-4 sm:px-6 lg:px-11 border-b border-border bg-bg -mx-4 sm:-mx-6 lg:-mx-11 -mt-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/articles/${articleId}`}
                            className="flex items-center gap-1.5 text-text-2 hover:text-text-1 text-sm sm:text-[15px]"
                        >
                            <ArrowLeft className="w-4 h-4 shrink-0" />
                            Back
                        </Link>
                    </div>
                </div>
                <div className="flex justify-center w-full py-12">
                    <div className="w-full max-w-[740px] flex items-center justify-center">
                        <div className="flex items-center gap-2 text-text-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading article...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state - unauthorized or not found
    if (error || !article) {
        return (
            <div className="flex flex-col w-full min-h-0">
                <div className="relative z-10 flex items-center justify-between gap-4 py-3 px-4 sm:px-6 lg:px-11 border-b border-border bg-bg -mx-4 sm:-mx-6 lg:-mx-11 -mt-8">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-text-2 hover:text-text-1 text-sm sm:text-[15px]"
                    >
                        <ArrowLeft className="w-4 h-4 shrink-0" />
                        Back
                    </Link>
                </div>
                <div className="flex justify-center w-full py-12">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error || "Article not found"}</p>
                        <Link
                            href="/"
                            className="text-primary hover:underline font-medium"
                        >
                            Go back home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-0">
            {/* Editor Top Bar - full width, flush with navbar */}
            <div className="relative z-10 flex items-center justify-between gap-4 py-3 px-4 sm:px-6 lg:px-11 border-b border-border bg-bg flex-wrap sm:flex-nowrap -mx-4 sm:-mx-6 lg:-mx-11 -mt-8">
                <div className="flex items-center gap-4 order-1 sm:order-1 min-w-0">
                    <Link
                        href={`/articles/${articleId}`}
                        className="flex items-center gap-1.5 text-text-2 hover:text-text-1 text-sm sm:text-[15px] whitespace-nowrap"
                        aria-label="Back to article"
                    >
                        <ArrowLeft className="w-4 h-4 shrink-0" />
                        Back
                    </Link>
                    {statusId === 2 ? (
                        <span className="text-xs sm:text-[13px] text-orange-600 font-medium px-2 py-0.5 bg-orange-50 rounded-full">
                            Draft
                        </span>
                    ) : (
                        <span className="text-xs sm:text-[13px] text-green-600 font-medium px-2 py-0.5 bg-green-50 rounded-full">
                            Published
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 order-2 sm:order-2 w-full sm:w-auto justify-end">
                    {error && (
                        <span className="text-red-500 text-sm">{error}</span>
                    )}
                    <button
                        type="button"
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        className="px-4 py-2 text-text-2 hover:text-text-1 text-sm disabled:opacity-50"
                    >
                        Save draft
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                        className="rounded-full bg-primary text-white px-5 py-2.5 text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Publish"
                        )}
                    </button>
                </div>
            </div>

            {/* Editor Body */}
            <div className="flex justify-center w-full py-8 sm:py-12">
                <div className="w-full max-w-[740px] flex flex-col gap-6 px-0">
                    {/* Title */}
                    <div className="border-b border-border pb-2">
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full font-logo text-2xl sm:text-[42px] font-bold leading-tight text-text-1 placeholder:text-text-3 bg-transparent border-none outline-none focus:ring-0"
                        />
                    </div>

                    {/* Subtitle */}
                    <div className="border-b border-border pb-2">
                        <input
                            type="text"
                            placeholder="Tell your story..."
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full font-logo text-xl sm:text-2xl leading-snug text-text-1 placeholder:text-text-3 bg-transparent border-none outline-none focus:ring-0"
                        />
                    </div>

                    {/* Body (Markdown) - Rich text editor */}
                    <div className="border border-border rounded-sm min-h-[400px] flex flex-col overflow-hidden">
                        <span className="text-text-3 text-xs font-medium px-3 pt-4 pb-2">
                            Markdown
                        </span>
                        <MarkdownEditor
                            value={content}
                            onChange={(v) => setContent(v ?? "")}
                            placeholder={MARKDOWN_PLACEHOLDER}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
