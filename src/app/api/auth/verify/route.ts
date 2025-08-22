import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token && token.startsWith('mock-jwt-token-')) {
    return NextResponse.json({ valid: true });
  } else {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
