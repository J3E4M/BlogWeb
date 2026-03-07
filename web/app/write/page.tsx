"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

import MarkdownEditor from "./MarkdownEditor";

type Category = { id: number; name: string };

const MARKDOWN_PLACEHOLDER = `# Write your article in Markdown

**Bold** *Italic* ~~Strikethrough~~ \`inline code\`

## Headings: # H1 ## H2 ### H3

## Lists: - bullet 1. ordered

> Blockquotes | \`\`\` Code blocks \`\`\``;

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<{ items: Category[] }>("/api/categories")
      .then((res) => setCategories(res.data.items))
      .catch(() => setCategories([]));
  }, []);

  async function handleSave(publish: boolean) {
    setError(null);
    if (!title.trim()) {
      setError("กรุณากรอกหัวข้อ");
      return;
    }
    if (!body.trim()) {
      setError("กรุณากรอกเนื้อหา");
      return;
    }
    setIsSubmitting(true);
    if (!publish) setDraftStatus("saving");

    try {
      const { data } = await axios.post("/api/articles", {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: body.trim(),
        categoryId: selectedCategoryId ?? undefined,
        publish,
      });

      if (publish) {
        router.push(`/articles/${data.id}`);
      } else {
        setDraftStatus("saved");
        setTimeout(() => setDraftStatus("idle"), 3000);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
      setDraftStatus("idle");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col w-full min-h-0">
      {/* Editor Top Bar - full width, flush with navbar */}
      <div
        className="relative z-10 flex items-center justify-between gap-4 py-3 px-4 sm:px-6 lg:px-11 border-b border-border bg-bg flex-wrap sm:flex-nowrap -mx-4 sm:-mx-6 lg:-mx-11 -mt-8"
      >
        <div className="flex items-center gap-4 order-1 sm:order-1 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-text-2 hover:text-text-1 text-sm sm:text-[15px] whitespace-nowrap"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Back
          </Link>
        </div>
        <div className="flex items-center gap-3 order-2 sm:order-2 w-full sm:w-auto justify-end">
          {draftStatus === "saved" && (
            <span className="text-green-600 text-sm font-medium animate-in fade-in duration-300">Draft saved</span>
          )}
          {error && (
            <span className="text-red-500 text-sm">{error}</span>
          )}
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
            className="px-4 py-2 text-text-2 hover:text-text-1 text-sm disabled:opacity-50"
          >
            {draftStatus === "saving" ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
            className="rounded-full bg-primary text-white px-5 py-2.5 text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Publish
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

          {/* Add a topic */}
          <div className="flex flex-col gap-2.5">
            <span className="text-text-2 text-[13px] font-semibold">
              Add a topic
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1">
              {categories.map((cat) => {
                const isActive = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategoryId((prev) =>
                        prev === cat.id ? null : cat.id
                      )
                    }
                    className={`
                      shrink-0 rounded-full px-3.5 py-1.5 text-[13px] border
                      transition-colors
                      ${isActive
                        ? "bg-primary text-white border-primary"
                        : "bg-surface text-text-1 border-border hover:border-text-3"
                      }
                    `}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body (Markdown) - Rich text editor */}
          <div className="border border-border rounded-sm min-h-[400px] flex flex-col overflow-hidden">
            <span className="text-text-3 text-xs font-medium px-3 pt-4 pb-2">
              Markdown
            </span>
            <MarkdownEditor
              value={body}
              onChange={(v) => setBody(v ?? "")}
              placeholder={MARKDOWN_PLACEHOLDER}
            />
          </div>
        </div>
      </div>
    </div>
  );
}