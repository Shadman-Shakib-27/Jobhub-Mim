'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { label: 'Active Jobs', value: 12500, suffix: '+' },
  { label: 'Companies', value: 2800, suffix: '+' },
  { label: 'Job Seekers', value: 45000, suffix: '+' },
  { label: 'Success Rate', value: 87, suffix: '%' }
];

export function JobStats() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-muted-foreground">
            Join our growing community of job seekers and employers
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}