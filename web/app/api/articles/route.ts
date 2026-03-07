import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function excerptFromContent(content: string, maxLength = 150): string {
  const plain = content.replace(/<[^>]+>/g, "").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + "…";
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE), 10)));
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { statusId: 1 },
        include: { author: { select: { id: true, name: true } }, _count: { select: { likes: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.article.count({ where: { statusId: 1 } }),
    ]);

    const items = articles.map((a) => ({
      id: a.id,
      title: a.title,
      excerpt: excerptFromContent(a.content),
      author: { id: a.author.id, name: a.author.name },
      publishedAt: a.createdAt,
      readTimeMinutes: estimateReadTime(a.content),
      likeCount: a._count?.likes ?? 0,
    }));

    return NextResponse.json({
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}