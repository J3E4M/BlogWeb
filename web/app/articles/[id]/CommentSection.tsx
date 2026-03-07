"use client";

import { useState } from "react";

type Comment = {
  id: string;
  authorName: string;
  timeAgo: string;
  content: string;
};

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "1",
    authorName: "John Doe",
    timeAgo: "2 hours ago",
    content:
      "Great article! The point about co-creating systems is particularly insightful.",
  },
  {
    id: "2",
    authorName: "Alex Kim",
    timeAgo: "5 hours ago",
    content:
      "Totally agree. The Alan Kay quote really captures the essence of invisible design.",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [text, setText] = useState("");

  function handleRespond() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setComments((prev) => [
      ...prev,
      {
        id: `comment-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        authorName: "You",
        timeAgo: "Just now",
        content: trimmed,
      },
    ]);
    setText("");
  }

  return (
    <section className="pt-8 flex flex-col gap-6">
      <div className="h-px bg-border" />
      <h2 className="font-logo text-2xl font-bold text-text-1">Comments</h2>

      {/* Input area */}
      <div className="flex flex-col gap-2">
        <textarea
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg bg-surface border border-border p-4 min-h-[106px] text-[15px] text-text-1 placeholder:text-text-3 resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleRespond}
            disabled={!text.trim()}
            className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Respond
          </button>
        </div>
      </div>

      {/* Comment list */}
      <div className="flex flex-col divide-y divide-border">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-4 py-4">
            <div
              className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                c.authorName === "You" || c.id === "1" ? "bg-primary" : "bg-text-2"
              }`}
            >
              {getInitials(c.authorName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-text-1">{c.authorName}</div>
              <div className="text-xs text-text-3">{c.timeAgo}</div>
              <p className="text-[15px] leading-normal text-text-1 mt-1">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}