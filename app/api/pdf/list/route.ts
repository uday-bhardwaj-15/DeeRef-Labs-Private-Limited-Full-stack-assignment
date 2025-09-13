// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/mongodb';
// import PDF from '@/models/PDF';
// import { verifyToken } from '@/lib/auth';

// export async function GET(request: NextRequest) {
//   try {
//     await connectToDatabase();

//     const token = request.cookies.get('token')?.value;
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     const pdfs = await PDF.find({ userId: decoded.userId })
//       .select('uuid title filename fileSize createdAt updatedAt')
//       .sort({ createdAt: -1 });

//     return NextResponse.json({ pdfs });
//   } catch (error) {
//     console.error('List PDFs error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PDF from "@/models/PDF";
import { verifyToken } from "@/lib/auth";

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
      .select("uuid title filename fileSize createdAt updatedAt filepath") // 👈 add filepath
      .sort({ createdAt: -1 });

    return NextResponse.json({ pdfs });
  } catch (error) {
    console.error("List PDFs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
