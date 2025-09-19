'use client';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { jobsApi } from '@/lib/api/jobs';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  GraduationCap,
  Heart,
  Loader2,
  MapPin,
  Share2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load job details
  const loadJobDetails = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const jobData = await jobsApi.getJobById(jobId);
      setJob(jobData);
    } catch (error: any) {
      console.error('Failed to load job details:', error);
      toast.error(error.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  // Handle job application
  const handleApply = async () => {
    try {
      setApplying(true);
      // Replace with your actual apply API call
      await jobsApi.applyToJob(jobId);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  // Handle save job
  const handleSaveJob = async () => {
    try {
      // Replace with your actual save job API call
      if (saved) {
        await jobsApi.unsaveJob(jobId);
        setSaved(false);
        toast.success('Job removed from saved jobs');
      } else {
        await jobsApi.saveJob(jobId);
        setSaved(true);
        toast.success('Job saved successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save job');
    }
  };

  // Handle share job
  const handleShare = async () => {
    try {
      await navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${job?.company}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
  };

  const formatSalary = (salary: any) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  const getJobTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      contract: 'Contract',
      internship: 'Internship',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading job details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Job not found</h2>
            <p className="text-muted-foreground mb-4">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/jobs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center border">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={`${job.company} logo`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <Building className="h-8 w-8 text-primary" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                      <p className="text-lg text-muted-foreground flex items-center gap-2 mb-4">
                        <Building className="h-5 w-5" />
                        {job.company}
                        {job.companyWebsite && (
                          <a
                            href={job.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Visit Website
                          </a>
                        )}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </Badge>
                        <Badge variant="outline">
                          {getJobTypeLabel(job.type)}
                        </Badge>
                        {job.isRemote && (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            Remote
                          </Badge>
                        )}
                        {job.category === 'non-skilled' &&
                          job.trainingProvided && (
                            <Badge
                              variant="outline"
                              className="text-emerald-600 border-emerald-600 flex items-center gap-1"
                            >
                              <GraduationCap className="h-3 w-3" />
                              Training Provided
                            </Badge>
                          )}
                        {job.category === 'deferred-hire' &&
                          job.deferredStartMonths && (
                            <Badge
                              variant="outline"
                              className="text-blue-600 border-blue-600 flex items-center gap-1"
                            >
                              <Calendar className="h-3 w-3" />
                              Starts in {job.deferredStartMonths} months
                            </Badge>
                          )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Posted{' '}
                          {formatDistanceToNow(new Date(job.postedAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applicationsCount || 0} applications
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {job.description ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: job.description }}
                      />
                    ) : (
                      <p>No description available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {job.requirements.map(
                        (requirement: string, index: number) => (
                          <li key={index} className="text-sm">
                            {requirement}
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {job.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="text-sm">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Company Info */}
              {job.companyDescription && (
                <Card>
                  <CardHeader>
                    <CardTitle>About {job.company}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{job.companyDescription}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Apply Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                          <DollarSign className="h-6 w-6" />
                          {formatSalary(job.salary)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          per year
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleApply}
                          disabled={applying}
                        >
                          {applying ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            'Apply Now'
                          )}
                        </Button>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleSaveJob}
                          >
                            <Heart
                              className={`h-4 w-4 mr-2 ${saved ? 'fill-current' : ''}`}
                            />
                            {saved ? 'Saved' : 'Save'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleShare}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Job Type
                      </span>
                      <span className="text-sm font-medium">
                        {getJobTypeLabel(job.type)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Experience Level
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {job.experienceLevel || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Category
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {job.category}
                      </span>
                    </div>
                    {job.deadline && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Deadline
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(job.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Similar Jobs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Similar Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* This would be populated with similar jobs from your API */}
                      <p className="text-sm text-muted-foreground">
                        Loading similar jobs...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
