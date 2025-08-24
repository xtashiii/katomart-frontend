import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'course') {
      // Simulate course import processing
      return NextResponse.json({
        success: true,
        message: 'Course import started',
        courseId: 'imported-' + Date.now(),
      });
    } else if (type === 'telegram') {
      // Simulate telegram import processing
      return NextResponse.json({
        success: true,
        message: 'Telegram import started',
        importId: 'telegram-' + Date.now(),
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid import type' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
