import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/articles/[id]/like
 * Toggle like on an article
 * - If user hasn't liked the article yet, create a new like
 * - If user has already liked, soft delete the like (statusId = 3)
 * - Only authenticated users can like articles
 */
export async function POST(
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

        // Find the article
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

        // Cannot like deleted articles
        if (article.statusId === 3) {
            return NextResponse.json(
                { error: "Cannot like deleted article" },
                { status: 400 }
            );
        }

        // Check if user has already liked this article
        const existingLike = await prisma.articleLike.findUnique({
            where: {
                userId_articleId: {
                    userId: session.userId,
                    articleId: id,
                },
            },
        });

        let isLiked: boolean;
        let likeCount: number;

        if (existingLike) {
            // Toggle like status
            if (existingLike.statusId === 1) {
                // Unlike: soft delete by setting statusId to 3
                await prisma.articleLike.update({
                    where: { id: existingLike.id },
                    data: { statusId: 3 },
                });
                isLiked = false;
            } else {
                // Re-like: restore by setting statusId to 1
                await prisma.articleLike.update({
                    where: { id: existingLike.id },
                    data: { statusId: 1 },
                });
                isLiked = true;
            }
        } else {
            // Create new like
            await prisma.articleLike.create({
                data: {
                    userId: session.userId,
                    articleId: id,
                    statusId: 1,
                },
            });
            isLiked = true;
        }

        // Get updated like count
        const countResult = await prisma.articleLike.count({
            where: {
                articleId: id,
                statusId: 1,
            },
        });
        likeCount = countResult;

        return NextResponse.json({
            success: true,
            isLiked,
            likeCount,
        });
    } catch (error) {
        console.error("POST /api/articles/[id]/like error:", error);
        return NextResponse.json(
            { error: "Failed to toggle like" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/articles/[id]/like
 * Get like status for current user and total like count
 */
export async function GET(
    _request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { id } = await params;
        const session = await getSession();

        // Find the article
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

        // Get total like count
        const likeCount = await prisma.articleLike.count({
            where: {
                articleId: id,
                statusId: 1,
            },
        });

        // Check if current user has liked (only if authenticated)
        let isLiked = false;
        if (session) {
            const existingLike = await prisma.articleLike.findUnique({
                where: {
                    userId_articleId: {
                        userId: session.userId,
                        articleId: id,
                    },
                },
            });
            isLiked = existingLike?.statusId === 1;
        }

        return NextResponse.json({
            isLiked,
            likeCount,
        });
    } catch (error) {
        console.error("GET /api/articles/[id]/like error:", error);
        return NextResponse.json(
            { error: "Failed to fetch like status" },
            { status: 500 }
        );
    }
}
