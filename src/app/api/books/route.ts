import { NextResponse } from 'next/server';
import { platformBooks } from './data';

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const platform = searchParams.get('platform') || '';
  
  // Get books for the specific platform, or all books if no platform specified
  const booksToSearch = platform && platformBooks[platform] 
    ? platformBooks[platform] 
    : Object.values(platformBooks).flat();
  
  const filteredBooks = booksToSearch.filter(book => 
    book.title.toLowerCase().includes(search) || 
    book.author.toLowerCase().includes(search) ||
    book.genre?.toLowerCase().includes(search)
  );
  
  return NextResponse.json({ books: filteredBooks });
}
