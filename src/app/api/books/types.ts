export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover?: string;
  genre?: string;
  publishedYear?: number;
}

export interface LibraryPlatform {
  id: string;
  name: string;
  needsLoginUrl: boolean;
  needsBaseUrl: boolean;
  loginUrlLabel?: string;
  baseUrlLabel?: string;
}
