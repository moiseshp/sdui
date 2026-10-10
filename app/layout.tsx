import type { Metadata } from 'next';
import { Outfit as Font } from 'next/font/google';
import './globals.css';

const font = Font({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KFC Perú',
  description: 'Demo SDUI — experimentación y A/B desde el backend',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={font.variable}>
      <body className="bg-neutral-900">{children}</body>
    </html>
  );
}
