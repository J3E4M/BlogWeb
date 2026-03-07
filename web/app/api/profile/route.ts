import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BIO_MAX = 160;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

function slugFromUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId, statusId: 1 },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      bio: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio ?? "",
    },
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, username: rawUsername, bio } = body;

    const nameStr = typeof name === "string" ? name.trim() : "";
    const bioStr = typeof bio === "string" ? bio.trim().slice(0, BIO_MAX) : undefined;
    const username = rawUsername
      ? slugFromUsername(String(rawUsername))
      : undefined;

    if (!nameStr) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (username !== undefined) {
      if (!USERNAME_PATTERN.test(username) || username.length < 2) {
        return NextResponse.json(
          {
            error:
              "Username must be 2+ characters, letters, numbers, underscores only",
          },
          { status: 400 }
        );
      }

      const existingUsername = await prisma.user.findFirst({
        where: {
          username,
          id: { not: session.userId },
        },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    const updateData: { name: string; username?: string; bio?: string } = {
      name: nameStr,
    };
    if (username !== undefined) updateData.username = username;
    if (bioStr !== undefined) updateData.bio = bioStr;

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
      },
    });

    const newToken = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    });
    await setSessionCookie(newToken);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio ?? "",
      },
    });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}