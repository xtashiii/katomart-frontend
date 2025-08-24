import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Katomart',
  description: 'Katomart - Seu aplicativo para aprendizado digital',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
