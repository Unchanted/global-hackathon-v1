import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrainWeb - Graph-Based Learning Platform',
  description: 'Transform linear course content into interactive graph-based learning experiences',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}