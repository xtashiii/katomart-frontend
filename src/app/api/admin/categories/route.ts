import { NextResponse } from 'next/server';
import { adminMockData } from '../data';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  return NextResponse.json({ categories: adminMockData.categories });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  try {
    const body = await request.json();
    const { action, category } = body;

    if (action === 'add') {
      const newCategory = { id: Date.now(), name: category.name };
      adminMockData.categories.push(newCategory);
      return NextResponse.json({ success: true, category: newCategory });
    } else if (action === 'delete') {
      adminMockData.categories = adminMockData.categories.filter(
        (cat) => cat.id !== category.id
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
