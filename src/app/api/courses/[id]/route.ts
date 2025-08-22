import { NextResponse } from 'next/server';
import { mockDetailedCourses } from '../data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  await delay(500);

  const { id } = await params;
  const course = mockDetailedCourses[id];
  
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  return NextResponse.json(course);
}
