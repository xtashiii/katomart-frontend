import { NextResponse } from 'next/server';
import { scraperPlatforms } from '../data';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  return NextResponse.json({ platforms: scraperPlatforms });
}
