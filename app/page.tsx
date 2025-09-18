import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { JobStats } from '@/components/landing/job-stats';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <JobStats />
      </main>
      <Footer />
    </div>
  );
}