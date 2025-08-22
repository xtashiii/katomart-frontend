import { NextResponse } from 'next/server';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  try {
    const credentials: LoginCredentials = await request.json();

    const mockUsers = [
      { username: 'admin', password: 'admin123' },
      { username: 'test', password: 'test123' },
    ];

    const user = mockUsers.find(
      (u) =>
        u.username === credentials.username &&
        u.password === credentials.password
    );

    if (user) {
      const userData = {
        id: '1',
        username: user.username,
        email: `${user.username}@example.com`,
      };

      const response: AuthTokens = {
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: userData,
      };

      const response_data = NextResponse.json(response);
      response_data.headers.set('Access-Control-Allow-Origin', '*');
      response_data.headers.set(
        'Access-Control-Allow-Methods',
        'POST, OPTIONS'
      );
      response_data.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return response_data;
    } else {
      const error_response = NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
      error_response.headers.set('Access-Control-Allow-Origin', '*');
      return error_response;
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
