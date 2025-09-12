// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import PDF from "@/models/PDF";
// import { verifyToken } from "@/lib/auth";
// import fs from "fs/promises";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { uuid: string } }
// ) {
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

//     const pdf = await PDF.findOne({
//       uuid: params.uuid,
//       userId: decoded.userId,
//     });

//     if (!pdf) {
//       return NextResponse.json({ error: "PDF not found" }, { status: 404 });
//     }

//     const fileBuffer = await fs.readFile(pdf.filepath);
//     const fileUint8Array = new Uint8Array(fileBuffer);

//     return new NextResponse(fileUint8Array, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Length": fileUint8Array.length.toString(),
//       },
//     });
//   } catch (error) {
//     console.error("Get PDF error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { uuid: string } }
// ) {
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

//     const { title } = await request.json();

//     const pdf = await PDF.findOneAndUpdate(
//       { uuid: params.uuid, userId: decoded.userId },
//       { title },
//       { new: true }
//     );

//     if (!pdf) {
//       return NextResponse.json({ error: "PDF not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       message: "PDF updated successfully",
//       pdf: {
//         uuid: pdf.uuid,
//         title: pdf.title,
//         filename: pdf.filename,
//         fileSize: pdf.fileSize,
//         createdAt: pdf.createdAt,
//         updatedAt: pdf.updatedAt,
//       },
//     });
//   } catch (error) {
//     console.error("Update PDF error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { uuid: string } }
// ) {
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

//     const pdf = await PDF.findOne({
//       uuid: params.uuid,
//       userId: decoded.userId,
//     });

//     if (!pdf) {
//       return NextResponse.json({ error: "PDF not found" }, { status: 404 });
//     }

//     // Delete file from filesystem
//     try {
//       await fs.unlink(pdf.filepath);
//     } catch (error) {
//       console.error("Error deleting file:", error);
//     }

//     // Delete PDF record from database
//     await PDF.findByIdAndDelete(pdf._id);

//     return NextResponse.json({ message: "PDF deleted successfully" });
//   } catch (error) {
//     console.error("Delete PDF error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PDF from "@/models/PDF";
import { verifyToken } from "@/lib/auth";
import { del } from "@vercel/blob";

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

    // Since filepath now contains blob URL, fetch the file from Vercel Blob
    const response = await fetch(pdf.filepath);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileUint8Array = new Uint8Array(arrayBuffer);

    return new NextResponse(fileUint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": fileUint8Array.length.toString(),
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Get PDF error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { title } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Valid title is required" },
        { status: 400 }
      );
    }

    const pdf = await PDF.findOneAndUpdate(
      { uuid: params.uuid, userId: decoded.userId },
      { title: title.trim(), updatedAt: new Date() },
      { new: true }
    );

    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "PDF updated successfully",
      pdf: {
        uuid: pdf.uuid,
        title: pdf.title,
        filename: pdf.filename,
        fileSize: pdf.fileSize,
        createdAt: pdf.createdAt,
        updatedAt: pdf.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update PDF error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete file from Vercel Blob storage
    try {
      await del(pdf.filepath);
    } catch (error) {
      console.error("Error deleting blob file:", error);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete PDF record from database
    await PDF.findByIdAndDelete(pdf._id);

    return NextResponse.json({ message: "PDF deleted successfully" });
  } catch (error) {
    console.error("Delete PDF error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
