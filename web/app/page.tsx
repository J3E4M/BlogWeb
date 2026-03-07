"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ArticleCard from "./components/ArticleCard";
import Sidebar from "./components/Sidebar";

const PAGE_SIZE = 10;

type ArticleItem = {
  id: string;
  title: string;
  excerpt: string;
  author: { id: string; name: string };
  publishedAt: string;
  readTimeMinutes: number;
  likeCount?: number;
  statusId: number;
};

type ApiResponse = {
  items: ArticleItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default function HomePage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [pagination, setPagination] = useState<ApiResponse["pagination"] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch current user session
        const sessionRes = await axios.get("/api/profile").catch(() => null);
        if (sessionRes?.data?.user) {
          setCurrentUserId(sessionRes.data.user.id);
        }

        // Fetch articles
        const { data } = await axios.get<ApiResponse>("/api/articles", { params: { page: 1, limit: PAGE_SIZE } });
        setArticles(data.items);
        setPagination(data.pagination);
      } catch (err) {
        setError("Failed to load articles");
        console.error("Fetch articles error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 min-w-0 lg:max-w-[728px]">
          <div className="py-12 text-center text-text-2">Loading...</div>
        </div>
        <Sidebar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 min-w-0 lg:max-w-[728px]">
          <div className="py-12 text-center text-text-2">{error}</div>
        </div>
        <Sidebar />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      <div className="flex-1 min-w-0 lg:max-w-[728px]">
        <div className="flex flex-col gap-4">
          {articles.length === 0 ? (
            <div className="py-12 text-center text-text-2"><p>No articles yet. Check back soon!</p></div>
          ) : (
            articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                excerpt={article.excerpt}
                authorName={article.author.name}
                authorId={article.author.id}
                currentUserId={currentUserId}
                publishedAt={new Date(article.publishedAt)}
                readTimeMinutes={article.readTimeMinutes}
                likeCount={article.likeCount ?? 0}
                isLoggedIn={!!currentUserId}
                statusId={article.statusId}
              />
            ))
          )}
        </div>
        {pagination && pagination.totalPages > 1 && (
          <nav className="flex justify-center gap-2 mt-8 pt-8 border-t border-border" aria-label="Pagination">
            <span className="text-sm text-text-3">Page {pagination.page} of {pagination.totalPages}</span>
          </nav>
        )}
      </div>
      <Sidebar />
    </div>
  );
}