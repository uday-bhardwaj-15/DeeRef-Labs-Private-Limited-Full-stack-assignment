// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/mongodb';
// import PDF from '@/models/PDF';
// import { verifyToken } from '@/lib/auth';
// import { v4 as uuidv4 } from 'uuid';
// import fs from 'fs/promises';
// import path from 'path';

// const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// // Ensure uploads directory exists
// async function ensureUploadDir() {
//   try {
//     await fs.access(UPLOAD_DIR);
//   } catch {
//     await fs.mkdir(UPLOAD_DIR, { recursive: true });
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     await connectToDatabase();
//     await ensureUploadDir();

//     const token = request.cookies.get('token')?.value;
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     const formData = await request.formData();
//     const file = formData.get('file') as File;
//     const title = formData.get('title') as string;

//     if (!file || !title) {
//       return NextResponse.json(
//         { error: 'File and title are required' },
//         { status: 400 }
//       );
//     }

//     if (file.type !== 'application/pdf') {
//       return NextResponse.json(
//         { error: 'Only PDF files are allowed' },
//         { status: 400 }
//       );
//     }

//     const uuid = uuidv4();
//     const filename = `${uuid}-${file.name}`;
//     const filepath = path.join(UPLOAD_DIR, filename);

//     // Save file to filesystem
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     await fs.writeFile(filepath, buffer);

//     // Save PDF metadata to database
//     const pdf = new PDF({
//       uuid,
//       title,
//       filename,
//       filepath,
//       userId: decoded.userId,
//       fileSize: file.size,
//     });

//     await pdf.save();

//     return NextResponse.json({
//       message: 'PDF uploaded successfully',
//       pdf: {
//         uuid: pdf.uuid,
//         title: pdf.title,
//         filename: pdf.filename,
//         fileSize: pdf.fileSize,
//         createdAt: pdf.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import PDF from "@/models/PDF";
// import { verifyToken } from "@/lib/auth";
// import { v4 as uuidv4 } from "uuid";
// import { put } from "@vercel/blob";

// export async function POST(request: NextRequest) {
//   try {
//     await connectToDatabase();

//     const token = request.cookies.get("token")?.value;
//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     const formData = await request.formData();
//     const file = formData.get("file") as File;
//     const title = formData.get("title") as string;

//     if (!file || !title) {
//       return NextResponse.json(
//         { error: "File and title are required" },
//         { status: 400 }
//       );
//     }

//     if (file.type !== "application/pdf") {
//       return NextResponse.json(
//         { error: "Only PDF files are allowed" },
//         { status: 400 }
//       );
//     }

//     const uuid = uuidv4();
//     const filename = `${uuid}-${file.name}`;

//     // Upload to Vercel Blob instead of local filesystem
//     const bytes = await file.arrayBuffer();
//     const blob = await put(`pdfs/${filename}`, bytes, {
//       access: "public",
//       contentType: "application/pdf",
//     });

//     // Save PDF metadata to database with blob URL
//     const pdf = new PDF({
//       uuid,
//       title,
//       filename,
//       filepath: blob.url, // Store blob URL instead of local path
//       userId: decoded.userId,
//       fileSize: file.size,
//     });

//     await pdf.save();

//     return NextResponse.json({
//       message: "PDF uploaded successfully",
//       pdf: {
//         uuid: pdf.uuid,
//         title: pdf.title,
//         filename: pdf.filename,
//         fileSize: pdf.fileSize,
//         createdAt: pdf.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import PDF from "@/models/PDF";
// import { verifyToken } from "@/lib/auth";
// import { v4 as uuidv4 } from "uuid";
// import { put } from "@vercel/blob";

// export async function POST(request: NextRequest) {
//   try {
//     await connectToDatabase();

//     // Check content type first
//     const contentType = request.headers.get("content-type");
//     if (!contentType || !contentType.includes("multipart/form-data")) {
//       return NextResponse.json(
//         { error: "Content-Type must be multipart/form-data" },
//         { status: 400 }
//       );
//     }

//     const token = request.cookies.get("token")?.value;
//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     let formData;
//     try {
//       formData = await request.formData();
//     } catch (error) {
//       console.error("FormData parsing error:", error);
//       return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
//     }

//     const file = formData.get("file") as File;
//     const title = formData.get("title") as string;

//     if (!file || !title) {
//       return NextResponse.json(
//         { error: "File and title are required" },
//         { status: 400 }
//       );
//     }

//     if (!file.type || file.type !== "application/pdf") {
//       return NextResponse.json(
//         { error: "Only PDF files are allowed" },
//         { status: 400 }
//       );
//     }

//     if (file.size === 0) {
//       return NextResponse.json(
//         { error: "File cannot be empty" },
//         { status: 400 }
//       );
//     }

//     // Check file size limit (10MB)
//     if (file.size > 10 * 1024 * 1024) {
//       return NextResponse.json(
//         { error: "File size cannot exceed 10MB" },
//         { status: 400 }
//       );
//     }

//     const uuid = uuidv4();
//     const filename = `${uuid}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

//     // Convert file to buffer
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     // Upload to Vercel Blob
//     const blob = await put(`pdfs/${filename}`, buffer, {
//       access: "public",
//       contentType: "application/pdf",
//     });

//     // Save PDF metadata to database
//     const pdf = new PDF({
//       uuid,
//       title: title.trim(),
//       filename,
//       filepath: blob.url, // Store blob URL instead of local path
//       userId: decoded.userId,
//       fileSize: file.size,
//     });

//     await pdf.save();

//     return NextResponse.json({
//       message: "PDF uploaded successfully",
//       pdf: {
//         uuid: pdf.uuid,
//         title: pdf.title,
//         filename: pdf.filename,
//         fileSize: pdf.fileSize,
//         createdAt: pdf.createdAt,
//       },
//     });
//   } catch (error) {
//     if (error && typeof error === "object") {
//       console.error("Upload error details:", {
//         message: (error as any).message,
//         stack: (error as any).stack,
//         name: (error as any).name,
//       });
//     } else {
//       console.error("Upload error details:", error);
//     }
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // Add this configuration to handle larger files
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: "10mb",
//     },
//   },
// };
// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import PDF from "@/models/PDF";
// import { verifyToken } from "@/lib/auth";
// import { v4 as uuidv4 } from "uuid";
// import { put } from "@vercel/blob";

// export async function POST(request: NextRequest) {
//   try {
//     await connectToDatabase();

//     // Check content type first
//     const contentType = request.headers.get("content-type");
//     if (!contentType || !contentType.includes("multipart/form-data")) {
//       return NextResponse.json(
//         { error: "Content-Type must be multipart/form-data" },
//         { status: 400 }
//       );
//     }

//     const token = request.cookies.get("token")?.value;
//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     let formData;
//     try {
//       formData = await request.formData();
//     } catch (error) {
//       console.error("FormData parsing error:", error);
//       return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
//     }

//     const file = formData.get("file") as File;
//     const title = formData.get("title") as string;

//     if (!file || !title) {
//       return NextResponse.json(
//         { error: "File and title are required" },
//         { status: 400 }
//       );
//     }

//     if (!file.type || file.type !== "application/pdf") {
//       return NextResponse.json(
//         { error: "Only PDF files are allowed" },
//         { status: 400 }
//       );
//     }

//     if (file.size === 0) {
//       return NextResponse.json(
//         { error: "File cannot be empty" },
//         { status: 400 }
//       );
//     }

//     // Check file size limit (10MB)
//     if (file.size > 10 * 1024 * 1024) {
//       return NextResponse.json(
//         { error: "File size cannot exceed 10MB" },
//         { status: 400 }
//       );
//     }

//     const uuid = uuidv4();
//     const filename = `${uuid}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

//     // Convert file to buffer
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     // Upload to Vercel Blob
//     const blob = await put(`pdfs/${filename}`, buffer, {
//       access: "public",
//       contentType: "application/pdf",
//     });

//     // Save PDF metadata to database
//     const pdf = new PDF({
//       uuid,
//       title: title.trim(),
//       filename,
//       filepath: blob.url, // Store blob URL instead of local path
//       userId: decoded.userId,
//       fileSize: file.size,
//     });

//     await pdf.save();

//     return NextResponse.json({
//       message: "PDF uploaded successfully",
//       pdf: {
//         uuid: pdf.uuid,
//         title: pdf.title,
//         filename: pdf.filename,
//         fileSize: pdf.fileSize,
//         createdAt: pdf.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Upload error details:", {
//       message: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined,
//       name: error instanceof Error ? error.name : "Unknown Error",
//     });
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // Route segment config for App Router
// export const maxDuration = 30; // Maximum duration in seconds
// export const dynamic = "force-dynamic"; // Force dynamic rendering
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PDF from "@/models/PDF";
import { verifyToken } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { put } from "@vercel/blob";

// Route segment config for App Router
export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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

    // Parse form data with error handling
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error("FormData parsing error:", error);
      return NextResponse.json(
        {
          error:
            "Failed to parse form data. Please ensure you are uploading a valid file.",
        },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: "File and title are required" },
        { status: 400 }
      );
    }

    if (!file.type || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File cannot be empty" },
        { status: 400 }
      );
    }

    // Check file size limit (5MB for better Vercel compatibility)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size cannot exceed 5MB" },
        { status: 400 }
      );
    }

    const uuid = uuidv4();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${uuid}-${sanitizedFileName}`;

    // Convert file to buffer
    let buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } catch (error) {
      console.error("File processing error:", error);
      return NextResponse.json(
        { error: "Failed to process file" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    let blob;
    try {
      blob = await put(`pdfs/${filename}`, buffer, {
        access: "public",
        contentType: "application/pdf",
      });
    } catch (error) {
      console.error("Blob upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Save PDF metadata to database
    try {
      const pdf = new PDF({
        uuid,
        title: title.trim(),
        filename,
        filepath: blob.url,
        userId: decoded.userId,
        fileSize: file.size,
      });

      await pdf.save();

      return NextResponse.json({
        message: "PDF uploaded successfully",
        pdf: {
          uuid: pdf.uuid,
          title: pdf.title,
          filename: pdf.filename,
          fileSize: pdf.fileSize,
          createdAt: pdf.createdAt,
        },
      });
    } catch (error) {
      console.error("Database save error:", error);
      // Try to clean up the uploaded blob if database save fails
      try {
        const { del } = await import("@vercel/blob");
        await del(blob.url);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
      return NextResponse.json(
        { error: "Failed to save file information" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "Unknown Error",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
