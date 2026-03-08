import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function excerptFromContent(content: string, maxLength = 150): string {
    const plain = content.replace(/<[^>]+>/g, "").trim();
    if (plain.length <= maxLength) return plain;
    return plain.slice(0, maxLength).trim() + "…";
}

function estimateReadTime(content: string): number {
    const words = content.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

function formatCount(count: number): string {
    if (count >= 1000) {
        return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return String(count);
}


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: identifier } = await params;
        const session = await getSession();
        const currentUserId = session?.userId;

        // Find user by ID or Username
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: identifier },
                    { username: { equals: identifier, mode: "insensitive" } },
                    { email: { equals: identifier, mode: "insensitive" } }
                ],
                statusId: 1
            },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // NOTE: Follow feature is not implemented yet
        const followersCount = 0;
        const followingCount = 0;
        const isFollowing = false;

        // Fetch user's articles
        const articlesWhere = {
            authorId: user.id,
            OR: [
                { statusId: 1 },
                ...(currentUserId === user.id ? [{ statusId: 2 }] : []),
            ],
        };

        const articles = await prisma.article.findMany({
            where: articlesWhere,
            include: {
                _count: { select: { likes: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const articlesData = articles.map((article) => ({
            id: article.id,
            title: article.title,
            excerpt: excerptFromContent(article.content),
            publishedAt: new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }).format(article.createdAt),
            readTimeMinutes: estimateReadTime(article.content),
            likeCount: article._count.likes,
            statusId: article.statusId,
        }));

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                bio: user.bio ?? "",
                followersCount: formatCount(followersCount),
                followersCountRaw: followersCount,
                followingCount: formatCount(followingCount),
                followingCountRaw: followingCount,
                isFollowing,
                isOwnProfile: currentUserId === user.id,
            },
            articles: articlesData,
        });
    } catch (error) {
        console.error("GET /api/users/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
