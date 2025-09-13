import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PDF from "@/models/PDF";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
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

    const pdf = await PDF.findOne({
      uuid: params.uuid,
      userId: decoded.userId,
    });

    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    // Return the PDF details including filePath for Vercel Blob
    return NextResponse.json({
      pdf: {
        uuid: pdf.uuid,
        title: pdf.title,
        filename: pdf.filename,
        filePath: pdf.filepath, // ✅ This is the blob URL
        fileSize: pdf.fileSize,
        createdAt: pdf.createdAt,
        updatedAt: pdf.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching PDF details:", error);
    return NextResponse.json(
      { error: "Failed to fetch PDF details" },
      { status: 500 }
    );
  }
}
