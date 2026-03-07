"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

const FOOTER_LINKS = [
    { label: "Help", href: "#" },
    { label: "About", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
];

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

type PopularArticle = {
    id: string;
    title: string;
    author: { id: string; name: string };
    likeCount: number;
};

type Category = {
    id: number;
    name: string;
};

export default function Sidebar() {
    const [popularArticles, setPopularArticles] = useState<PopularArticle[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingArticles, setLoadingArticles] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        async function fetchPopularArticles() {
            try {
                setLoadingArticles(true);
                const { data } = await axios.get("/api/articles", {
                    params: { sort: "popular", limit: 3 },
                });
                setPopularArticles(data.items);
            } catch (err) {
                console.error("Failed to fetch popular articles:", err);
                setPopularArticles([]);
            } finally {
                setLoadingArticles(false);
            }
        }

        async function fetchCategories() {
            try {
                setLoadingCategories(true);
                const { data } = await axios.get<{ items: Category[] }>("/api/categories");
                setCategories(data.items);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        }

        fetchPopularArticles();
        fetchCategories();
    }, []);

    return (
        <aside className="w-full lg:w-[296px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-8">
                {/* Popular Articles — dynamically sorted by like count */}
                <section>
                    <h3 className="text-[13px] font-bold text-text-1 mb-4">
                        Popular Articles
                    </h3>
                    {loadingArticles ? (
                        <div className="text-sm text-text-3">Loading...</div>
                    ) : popularArticles.length === 0 ? (
                        <div className="text-sm text-text-3">No articles yet</div>
                    ) : (
                        <ul className="flex flex-col gap-4">
                            {popularArticles.map((item) => (
                                <li key={item.id}>
                                    <Link href={`/articles/${item.id}`} className="block group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span
                                                className="w-5 h-5 rounded-full bg-primary shrink-0 flex items-center justify-center text-white text-[10px] font-medium"
                                                aria-hidden
                                            >
                                                {getInitials(item.author.name)}
                                            </span>
                                            <span className="text-xs font-medium text-text-1">
                                                {item.author.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-text-1 group-hover:text-primary transition-colors line-clamp-2">
                                            {item.title}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <div className="h-px bg-border" />

                {/* Recommended topics */}
                <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-3 mb-4">
                        Recommended topics
                    </h3>
                    {loadingCategories ? (
                        <div className="text-sm text-text-3">Loading...</div>
                    ) : categories.length === 0 ? (
                        <div className="text-sm text-text-3">No topics yet</div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/topics/${category.name.toLowerCase()}`}
                                    className="rounded-full bg-surface px-4 py-2 text-sm text-text-2 hover:bg-border hover:text-text-1 transition-colors"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <div className="h-px bg-border" />

                {/* Footer links */}
                <footer className="flex flex-wrap gap-2 text-sm text-text-3">
                    {FOOTER_LINKS.map((link, i) => (
                        <span key={link.label} className="flex items-center gap-2">
                            <Link
                                href={link.href}
                                className="hover:text-text-2 transition-colors"
                            >
                                {link.label}
                            </Link>
                            {i < FOOTER_LINKS.length - 1 && <span>·</span>}
                        </span>
                    ))}
                </footer>
            </div>
        </aside>
    );
}
