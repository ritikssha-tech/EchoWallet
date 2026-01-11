import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Echo-Wallet - No-Login Shared Expense Tracker',
  description: 'Track group expenses instantly. No sign-up required. Share a link and start splitting bills.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
