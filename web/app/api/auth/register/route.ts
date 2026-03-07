import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const MIN_PASSWORD_LENGTH = 8;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

function slugFromUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, username: rawUsername } = body;

    const nameStr = typeof name === "string" ? name.trim() : "";
    const emailStr = typeof email === "string" ? email.trim().toLowerCase() : "";
    const passwordStr = typeof password === "string" ? password : "";
    let username = rawUsername
      ? slugFromUsername(String(rawUsername))
      : slugFromUsername(emailStr.split("@")[0] || "user");
    if (!username) username = "user" + Date.now().toString(36);

    if (!nameStr) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!emailStr) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!passwordStr || passwordStr.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!USERNAME_PATTERN.test(username) || username.length < 2) {
      return NextResponse.json(
        { error: "Username must be 2+ characters, letters, numbers, underscores only" },
        { status: 400 }
      );
    }

    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: emailStr } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(passwordStr, 10);

    const user = await prisma.user.create({
      data: {
        name: nameStr,
        email: emailStr,
        username,
        password: hashedPassword,
        statusId: 1,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
