import { NextResponse } from 'next/server';
import { adminMockData } from '../data';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  return NextResponse.json({ accounts: adminMockData.telegramAccounts });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  try {
    const body = await request.json();
    const { action, account } = body;

    if (action === 'delete') {
      adminMockData.telegramAccounts = adminMockData.telegramAccounts.filter(
        (acc) => acc.id !== account.id
      );
      return NextResponse.json({ success: true });
    } else if (action === 'add') {
      const newAccount = { ...account, id: Date.now().toString() };
      adminMockData.telegramAccounts.push(newAccount);
      return NextResponse.json({ success: true, account: newAccount });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
