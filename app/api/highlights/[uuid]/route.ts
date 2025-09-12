import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Highlight from '@/models/Highlight';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
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

    const { text, color, note } = await request.json();

    const highlight = await Highlight.findOneAndUpdate(
      { uuid: params.uuid, userId: decoded.userId },
      { text, color, note },
      { new: true }
    );

    if (!highlight) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Highlight updated successfully',
      highlight,
    });
  } catch (error) {
    console.error('Update highlight error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const highlight = await Highlight.findOneAndDelete({
      uuid: params.uuid,
      userId: decoded.userId,
    });

    if (!highlight) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Highlight deleted successfully',
    });
  } catch (error) {
    console.error('Delete highlight error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}