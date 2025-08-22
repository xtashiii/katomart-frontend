import { NextResponse } from 'next/server';
import { LibraryPlatform } from '../types';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  const mockLibraryPlatforms: LibraryPlatform[] = [
    { id: 'z-library', name: 'Z-Library', needsLoginUrl: false, needsBaseUrl: false },
    { id: 'libgen', name: 'Library Genesis', needsLoginUrl: false, needsBaseUrl: true, baseUrlLabel: 'Mirror URL' },
    { id: 'anna-archive', name: 'Anna\'s Archive', needsLoginUrl: false, needsBaseUrl: false },
    { id: 'scribd', name: 'Scribd', needsLoginUrl: false, needsBaseUrl: false },
    { id: 'academia', name: 'Academia.edu', needsLoginUrl: false, needsBaseUrl: false },
    { id: 'jstor', name: 'JSTOR', needsLoginUrl: true, loginUrlLabel: 'Institution Login URL', needsBaseUrl: false }
  ];
  
  return NextResponse.json({ platforms: mockLibraryPlatforms });
}
