import { NextRequest, NextResponse } from "next/server";
import { marked } from "marked";
import { getSession } from "@/lib/auth";
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
    const sort = searchParams.get("sort") ?? "newest";
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE), 10))
    );
    const skip = (page - 1) * limit;

    const session = await getSession();
    const currentUserId = session?.userId;

    const where = {
      OR: [
        { statusId: 1 },
        ...(currentUserId ? [{ statusId: 2, authorId: currentUserId }] : []),
      ],
    };

    const orderBy =
      sort === "popular"
        ? { likes: { _count: "desc" as const } }
        : { createdAt: "desc" as const };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { likes: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    const items = articles.map((a) => ({
      id: a.id,
      title: a.title,
      excerpt: excerptFromContent(a.content),
      author: { id: a.author.id, name: a.author.name },
      publishedAt: a.createdAt,
      readTimeMinutes: estimateReadTime(a.content),
      likeCount: a._count?.likes ?? 0,
      statusId: a.statusId,
    }));

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, subtitle, content, categoryId, publish } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const statusId = publish ? 1 : 2;
    const validCategoryId =
      typeof categoryId === "number" && Number.isInteger(categoryId) && categoryId > 0
        ? categoryId
        : null;

    const rawContent = content.trim();
    const htmlContent = marked.parse(rawContent, { async: false }) as string;

    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        subtitle: subtitle && typeof subtitle === "string" ? subtitle.trim() || null : null,
        content: htmlContent,
        authorId: session.userId,
        statusId,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    if (validCategoryId) {
      const maxAc = await prisma.articleCategory.findFirst({
        orderBy: { id: "desc" },
        select: { id: true },
      });
      await prisma.articleCategory.create({
        data: {
          id: (maxAc?.id ?? 0) + 1,
          articleId: article.id,
          categoryId: validCategoryId,
          statusId: 1,
        },
      });
    }

    return NextResponse.json({
      id: article.id,
      title: article.title,
      subtitle: article.subtitle,
      statusId: article.statusId,
      author: article.author,
    });
  } catch (error) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}