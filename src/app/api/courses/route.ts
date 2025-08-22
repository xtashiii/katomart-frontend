import { NextResponse } from 'next/server';
import { mockCourses } from './data';
import { CoursesParams, CoursesResponse } from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  await delay(800);

  const { searchParams } = new URL(request.url);
  const params: CoursesParams = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '6'),
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    platform: searchParams.get('platform') || 'all',
    durationRange: searchParams.get('durationRange') || 'all'
  };

  let filteredCourses = mockCourses;

  if (params.category && params.category !== 'all') {
    filteredCourses = filteredCourses.filter(course => course.category === params.category);
  }

  if (params.platform && params.platform !== 'all') {
    filteredCourses = filteredCourses.filter(course => course.platform === params.platform);
  }

  if (params.durationRange && params.durationRange !== 'all') {
    filteredCourses = filteredCourses.filter(course => {
      const duration = course.duration;
      switch (params.durationRange) {
        case '0-20':
          return duration <= 20;
        case '20-40':
          return duration > 20 && duration <= 40;
        case '40+':
          return duration > 40;
        default:
          return true;
      }
    });
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredCourses = filteredCourses.filter(course =>
      course.title.toLowerCase().includes(searchLower) ||
      course.description.toLowerCase().includes(searchLower) ||
      course.category.toLowerCase().includes(searchLower) ||
      course.platform.toLowerCase().includes(searchLower)
    );
  }

  const total = filteredCourses.length;
  const totalPages = Math.ceil(total / params.limit!);
  const startIndex = (params.page! - 1) * params.limit!;
  const endIndex = startIndex + params.limit!;
  const courses = filteredCourses.slice(startIndex, endIndex);

  const response: CoursesResponse = {
    courses,
    total,
    page: params.page!,
    totalPages,
    hasMore: params.page! < totalPages
  };

  return NextResponse.json(response);
}
