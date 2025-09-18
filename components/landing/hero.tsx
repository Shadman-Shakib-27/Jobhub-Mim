'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Hero() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Find Your Dream Job
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with top employers, discover opportunities that match your skills, 
            and take the next step in your career journey.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-background/80 backdrop-blur border rounded-lg shadow-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Job title, company, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Location or remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" size="lg" className="md:px-8">
            Search Jobs
          </Button>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Popular searches:</span>
          <div className="flex flex-wrap gap-2">
            {['Remote Work', 'Software Developer', 'Marketing', 'Sales', 'Design'].map((term) => (
              <Link
                key={term}
                href={`/jobs?search=${encodeURIComponent(term)}`}
                className="px-3 py-1 bg-secondary/50 rounded-full hover:bg-secondary transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}