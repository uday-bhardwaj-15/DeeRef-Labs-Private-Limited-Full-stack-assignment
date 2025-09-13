import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PDF from "@/models/PDF";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic"; // 🚀 Always fetch fresh, no cache
export const revalidate = 0; // 🚀 Disable ISR caching

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const pdfs = await PDF.find({ userId: decoded.userId })
      .select("uuid title filename filepath fileSize createdAt updatedAt")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { pdfs },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("List PDFs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
