import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token && token.startsWith('mock-jwt-token-')) {
    // In a real implementation, you would decode the token to get user info
    // For mock, we'll return a default user
    return NextResponse.json({
      id: '1',
      username: 'testuser',
      email: 'testuser@example.com',
    });
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
