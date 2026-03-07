import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const emailStr = typeof email === "string" ? email.trim().toLowerCase() : "";
    const passwordStr = typeof password === "string" ? password : "";

    if (!emailStr) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!passwordStr) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: emailStr, statusId: 1 },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(passwordStr, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "Failed to sign in" },
      { status: 500 }
    );
  }
}