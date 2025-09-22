//@ts-nocheck
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { applicationsApi } from '@/lib/api/applications';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  Briefcase,
  Building,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Eye,
  GraduationCap,
  Loader2,
  MapPin,
  Send,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface EnhancedJobDetailsModalProps {
  job: any;
  open: boolean;
  onClose: () => void;
}

export function EnhancedJobDetailsModal({
  job,
  open,
  onClose,
}: EnhancedJobDetailsModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null
  );
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availableFrom: '',
  });
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  // Check application status
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (user?.role === 'seeker' && job?._id && open) {
        try {
          const response = await applicationsApi.getApplicationStatus(job._id);
          setApplicationStatus(response.status);
        } catch {
          setApplicationStatus(null);
        }
      } else {
        setApplicationStatus(null);
      }
    };
    checkApplicationStatus();
  }, [job?._id, user, open]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setShowApplicationForm(false);
      setApplicationData({
        coverLetter: '',
        expectedSalary: '',
        availableFrom: '',
      });
    }
  }, [open]);

  // Scroll button check
  useEffect(() => {
    const checkScrollable = () => {
      if (scrollRef.current) {
        const { scrollHeight, clientHeight } = scrollRef.current;
        setShowScrollButtons(scrollHeight > clientHeight);
      }
    };
    if (open) {
      const timer = setTimeout(checkScrollable, 100);
      return () => clearTimeout(timer);
    }
  }, [open, showApplicationForm]);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  if (!job) return null;

  const formatSalary = (salary: any) => {
    if (!salary) return 'Salary not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency || 'USD',
      maximumFractionDigits: 0,
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  const handleApplyClick = () => {
    if (!user) {
      toast.error('Please login to apply for jobs');
      return;
    }
    if (user.role !== 'seeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }
    if (applicationStatus) {
      toast.info('You have already applied for this job');
      return;
    }
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async () => {
    if (!applicationData.coverLetter.trim()) {
      toast.error('Please provide a cover letter');
      return;
    }
    setIsApplying(true);
    try {
      const response = await applicationsApi.applyToJob(job._id, {
        coverLetter: applicationData.coverLetter,
        expectedSalary: applicationData.expectedSalary
          ? Number(applicationData.expectedSalary)
          : undefined,
        availableFrom: applicationData.availableFrom || undefined,
      });

      toast.success('Application Submitted Successfully!');
      setApplicationStatus('pending');
      setShowApplicationForm(false);

      // router.push(`/applications`);
      // onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusBadge = () => {
    if (!applicationStatus) return null;

    const statusConfig = {
      pending: {
        label: 'Congratulations! Your application is submitted successfully.',
        color:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
        icon: AlertCircle,
      },
      reviewing: {
        label: 'Under Review',
        color:
          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        icon: Eye,
      },
      shortlisted: {
        label: 'Shortlisted',
        color:
          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        icon: CheckCircle,
      },
      rejected: {
        label: 'Not Selected',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        icon: X,
      },
      hired: {
        label: 'Hired',
        color:
          'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        icon: CheckCircle,
      },
    };

    const config = statusConfig[applicationStatus as keyof typeof statusConfig];
    if (!config) return null;
    const StatusIcon = config.icon;

    return (
      <Badge
        className={`${config.color} border-0 mb-4 flex items-center gap-2 text-xs sm:text-sm`}
      >
        <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-5xl h-[98vh] max-h-[98vh] overflow-scroll p-0 gap-0">
        <div className="flex flex-col h-full">
          {/* ---------- Header ---------- */}
          <DialogHeader className="p-4 border-b ">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border flex-shrink-0">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={`${job.company} logo`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <Building className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-lg font-bold mb-1 text-left">
                    {job.title}
                  </DialogTitle>

                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Building className="h-4 w-4" />
                    <span className="font-medium text-sm truncate">
                      {job.company}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(new Date(job.postedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{job.applicationsCount || 0} Applications</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {getStatusBadge()}
          </DialogHeader>

          {/* ---------- Content ---------- */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-6"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* Job Description */}
            <section>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Job Description
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {job.description}
              </p>
            </section>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />{' '}
                  Requirements
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {job.requirements.map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" /> Benefits
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {job.benefits.map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Salary */}
            <section>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" /> Salary
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatSalary(job.salary)}
              </p>
            </section>

            {/* Application Form */}
            {showApplicationForm && (
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" /> Submit Application
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label>Cover Letter</Label>
                    <Textarea
                      value={applicationData.coverLetter}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          coverLetter: e.target.value,
                        })
                      }
                      placeholder="Write your cover letter..."
                    />
                  </div>
                  <div>
                    <Label>Expected Salary</Label>
                    <Input
                      type="number"
                      value={applicationData.expectedSalary}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          expectedSalary: e.target.value,
                        })
                      }
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label>Available From</Label>
                    <Input
                      type="date"
                      value={applicationData.availableFrom}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          availableFrom: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitApplication}
                      disabled={isApplying}
                    >
                      {isApplying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Submit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowApplicationForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ---------- Footer ---------- */}
          {!showApplicationForm && (
            <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Applications Close:{' '}
                    {job.expiresAt
                      ? formatDistanceToNow(new Date(job.expiresAt), {
                          addSuffix: true,
                        })
                      : 'Open until filled'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  {user?.role === 'seeker' && !applicationStatus && (
                    <Button onClick={handleApplyClick}>
                      <Send className="h-4 w-4 mr-1" /> Apply Now
                    </Button>
                  )}
                  {/* {user?.role === 'seeker' && applicationStatus && (
                    <Button
                      variant="outline"
                      onClick={() => router.push('/applications')}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View Applications
                    </Button>
                  )} */}
                  {!user && (
                    <Button onClick={() => router.push('/auth/login')}>
                      <Send className="h-4 w-4 mr-1" /> Login to Apply
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scroll buttons */}
          {showScrollButtons && (
            <div className="absolute right-4 bottom-20 flex flex-col gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={scrollToTop}
                className="rounded-full"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={scrollToBottom}
                className="rounded-full"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
