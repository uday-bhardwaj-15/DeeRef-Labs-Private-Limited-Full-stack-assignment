import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Highlight from '@/models/Highlight';
import { verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pdfUuid = searchParams.get('pdfUuid');

    if (!pdfUuid) {
      return NextResponse.json(
        { error: 'PDF UUID is required' },
        { status: 400 }
      );
    }

    const highlights = await Highlight.find({
      pdfUuid,
      userId: decoded.userId,
    }).sort({ createdAt: 1 });

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error('Get highlights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { pdfUuid, pageNumber, text, position, color, note } = await request.json();

    if (!pdfUuid || !pageNumber || !text) {
      return NextResponse.json(
        { error: 'PDF UUID, page number, and text are required' },
        { status: 400 }
      );
    }

    const highlight = new Highlight({
      uuid: uuidv4(),
      pdfUuid,
      userId: decoded.userId,
      pageNumber,
      text,
      position,
      color: color || '#ffeb3b',
      note: note || '',
    });

    await highlight.save();

    return NextResponse.json({
      message: 'Highlight created successfully',
      highlight,
    });
  } catch (error) {
    console.error('Create highlight error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}