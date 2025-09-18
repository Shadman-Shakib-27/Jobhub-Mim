import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JobHub - Find Your Dream Job',
  description: 'Connect job seekers with employers. Find jobs, hire talent, and grow your career with JobHub.',
  keywords: 'jobs, careers, employment, hiring, job search',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'min-h-screen bg-background')}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}