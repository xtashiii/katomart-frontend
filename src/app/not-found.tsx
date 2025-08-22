import Link from 'next/link';

export default function NotFound() {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <h2 className="text-xl mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8 text-center">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link 
            href="/" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Home
          </Link>
        </div>
      </body>
    </html>
  );
}
