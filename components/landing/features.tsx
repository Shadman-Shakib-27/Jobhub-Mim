import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  MessageSquare,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Briefcase,
    title: 'Smart Job Matching',
    description: 'Our AI-powered algorithm matches you with jobs that fit your skills and preferences perfectly.'
  },
  {
    icon: Users,
    title: 'Connect with Employers',
    description: 'Build direct relationships with hiring managers and company representatives.'
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    description: 'Track your application progress and get insights to improve your job search success.'
  },
  {
    icon: MessageSquare,
    title: 'Real-time Chat',
    description: 'Communicate directly with potential employers through our secure messaging system.'
  },
  {
    icon: GraduationCap,
    title: 'Training Opportunities',
    description: 'Find non-skilled jobs with training provided to help you start a new career path.'
  },
  {
    icon: Calendar,
    title: 'Flexible Start Dates',
    description: 'Discover deferred-hire positions that let you plan your career transition timing.'
  }
];

export function Features() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose JobHub?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're revolutionizing the job search experience with innovative features 
            designed to connect the right talent with the right opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}