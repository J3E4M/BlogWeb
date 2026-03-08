import { NextRequest, NextResponse } from "next/server";
import { marked } from "marked";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/articles/[id]
 * Get article by ID
 * - Owner can see all statuses (published, draft, deleted)
 * - Others can only see published articles
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        categories: {
          where: { statusId: 1 },
          include: { category: { select: { id: true, name: true } } },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const isOwner = session?.userId === article.authorId;

    // Non-owners can only see published articles
    if (!isOwner && article.statusId !== 1) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("GET /api/articles/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/articles/[id]
 * Update article (title, subtitle, content, statusId)
 * Only the article owner can update their own article
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const session = await getSession();

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find article and verify ownership
    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, authorId: true, statusId: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Verify the current user is the author
    if (article.authorId !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own articles" },
        { status: 403 }
      );
    }

    // Check if article is deleted
    if (article.statusId === 3) {
      return NextResponse.json(
        { error: "Cannot edit deleted article" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, subtitle, content, statusId } = body;

    // Validate required fields if provided
    if (title !== undefined && (!title || title.trim() === "")) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (content !== undefined && (!content || content.trim() === "")) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Validate statusId if provided
    if (statusId !== undefined && ![1, 2].includes(statusId)) {
      return NextResponse.json(
        { error: "Invalid status. Only 1 (published) or 2 (draft) allowed" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: {
      title?: string;
      subtitle?: string | null;
      content?: string;
      statusId?: number;
    } = {};

    if (title !== undefined) updateData.title = title.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle.trim() || null;
    if (content !== undefined) {
      // Convert Markdown to HTML before saving
      const htmlContent = marked.parse(content.trim(), { async: false }) as string;
      updateData.content = htmlContent;
    }
    if (statusId !== undefined) updateData.statusId = statusId;

    // Update article
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true } },
        categories: {
          where: { statusId: 1 },
          include: { category: { select: { id: true, name: true } } },
        },
        _count: { select: { likes: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Article updated successfully",
      article: updatedArticle,
    });
  } catch (error) {
    console.error("PATCH /api/articles/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/articles/[id]
 * Soft delete article by changing statusId from 1 (published) to 3 (deleted)
 * Only the article owner can delete their own article
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const session = await getSession();

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find article and verify ownership
    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, authorId: true, statusId: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Verify the current user is the author
    if (article.authorId !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own articles" },
        { status: 403 }
      );
    }

    // Check if article is already deleted
    if (article.statusId === 3) {
      return NextResponse.json(
        { error: "Article is already deleted" },
        { status: 400 }
      );
    }

    // Soft delete: update statusId to 3 (deleted)
    await prisma.article.update({
      where: { id },
      data: { statusId: 3 },
    });

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
      articleId: id,
    });
  } catch (error) {
    console.error("DELETE /api/articles/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
