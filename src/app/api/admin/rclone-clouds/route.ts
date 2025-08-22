import { NextResponse } from 'next/server';
import { adminMockData } from '../data';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  return NextResponse.json({ clouds: adminMockData.rcloneClouds });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  try {
    const body = await request.json();
    const { action, cloud } = body;

    if (action === 'delete') {
      adminMockData.rcloneClouds = adminMockData.rcloneClouds.filter(c => c.id !== cloud.id);
      return NextResponse.json({ success: true });
    } else if (action === 'add') {
      const newCloud = { ...cloud, id: Date.now().toString() };
      adminMockData.rcloneClouds.push(newCloud);
      return NextResponse.json({ success: true, cloud: newCloud });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
