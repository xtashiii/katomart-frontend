import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  const { selectedItems, downloadConfig } = await request.json();

  // Here you would typically start a long-running download process.
  // For this example, we'll just log the received data.
  console.log('Starting download with:', { selectedItems, downloadConfig });

  return NextResponse.json({ message: 'Download started' });
}
