import { NextResponse } from 'next/server';
import { adminMockData } from '../data';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  return NextResponse.json({ backups: adminMockData.backups });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  try {
    const body = await request.json();
    const { action, backup } = body;

    if (action === 'delete') {
      adminMockData.backups = adminMockData.backups.filter(b => b.id !== backup.id);
      return NextResponse.json({ success: true });
    } else if (action === 'add') {
      const newBackup = { ...backup, id: Date.now().toString() };
      adminMockData.backups.push(newBackup);
      return NextResponse.json({ success: true, backup: newBackup });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
