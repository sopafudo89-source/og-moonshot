import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Moonshot Vote Preview',
  description: 'Dynamic X/Twitter previews for Moonshot-style token voting links.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
