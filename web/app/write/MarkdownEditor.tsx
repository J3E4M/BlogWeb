"use client";

import dynamic from "next/dynamic";

import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    { ssr: false }
);

type MarkdownEditorProps = {
    value: string;
    onChange: (value?: string) => void;
    placeholder?: string;
};

export default function MarkdownEditor({
    value,
    onChange,
    placeholder,
}: MarkdownEditorProps) {
    return (
        <div
            data-color-mode="light"
            className="[&_.w-md-editor]:min-h-[350px] [&_.w-md-editor]:border-0 [&_.w-md-editor]:rounded-none [&_.w-md-editor-toolbar]:bg-surface [&_.w-md-editor-toolbar]:border-b-border"
        >
            <MDEditor
                value={value}
                onChange={onChange}
                height={350}
                preview="live"
                visibleDragbar={false}
                textareaProps={{ placeholder }}
            />
        </div>
    );
}