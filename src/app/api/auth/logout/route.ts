import { NextResponse } from 'next/server';

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  return NextResponse.json({ success: true });
}
