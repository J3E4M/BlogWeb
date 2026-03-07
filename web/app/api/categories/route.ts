import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { statusId: 1 },
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      items: categories.map((c) => ({ id: c.id, name: c.name })),
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}