interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover?: string;
  genre?: string;
  publishedYear?: number;
}

import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface BookCardProps {
  book: Book;
  onDownload?: (book: Book) => void;
  downloadText?: string;
  isDownloading?: boolean;
}

export default function BookCard({
  book,
  onDownload,
  downloadText,
  isDownloading = false,
}: BookCardProps) {
  const t = useTranslations();

  const handleDownload = () => {
    if (onDownload) {
      onDownload(book);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
          {book.cover ? (
            <Image
              src={book.cover}
              alt={book.title}
              width={64}
              height={80}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            t('bookCard.noCover')
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-semibold text-gray-800 truncate"
            title={book.title}
          >
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {t('bookCard.by')} {book.author}
          </p>
          <div className="flex items-center gap-2 mb-2">
            {book.genre && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {book.genre}
              </span>
            )}
            {book.publishedYear && (
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                {book.publishedYear}
              </span>
            )}
          </div>
          {book.description && (
            <p
              className="text-sm text-gray-500 line-clamp-2 mb-3"
              title={book.description}
            >
              {book.description}
            </p>
          )}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`${
              isDownloading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            } text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2`}
          >
            {isDownloading ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            )}
            {downloadText || t('scrappers.downloadBook')}
          </button>
        </div>
      </div>
    </div>
  );
}
