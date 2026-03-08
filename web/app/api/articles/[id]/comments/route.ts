import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/articles/[id]/comments
 * Get all comments for an article
 */
export async function GET(
    _request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { id } = await params;

        const article = await prisma.article.findUnique({
            where: { id },
            select: { id: true, statusId: true },
        });

        if (!article || article.statusId === 3) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            );
        }

        const comments = await prisma.comment.findMany({
            where: { articleId: id, statusId: 1 },
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const formattedComments = comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            authorName: comment.user.name,
            authorId: comment.user.id,
            createdAt: comment.createdAt.toISOString(),
        }));

        return NextResponse.json({
            comments: formattedComments,
            count: formattedComments.length,
        });
    } catch (error) {
        console.error("GET /api/articles/[id]/comments error:", error);
        return NextResponse.json(
            { error: "Failed to fetch comments" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/articles/[id]/comments
 * Create a new comment on an article
 */
export async function POST(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { id } = await params;
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const article = await prisma.article.findUnique({
            where: { id },
            select: { id: true, statusId: true },
        });

        if (!article) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            );
        }

        if (article.statusId === 3) {
            return NextResponse.json(
                { error: "Cannot comment on deleted article" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { content } = body;

        if (!content || typeof content !== "string" || content.trim() === "") {
            return NextResponse.json(
                { error: "Comment content is required" },
                { status: 400 }
            );
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                userId: session.userId,
                articleId: id,
                statusId: 1,
            },
            include: {
                user: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({
            success: true,
            comment: {
                id: comment.id,
                content: comment.content,
                authorName: comment.user.name,
                authorId: comment.user.id,
                createdAt: comment.createdAt.toISOString(),
            },
        });
    } catch (error) {
        console.error("POST /api/articles/[id]/comments error:", error);
        return NextResponse.json(
            { error: "Failed to create comment" },
            { status: 500 }
        );
    }
}
