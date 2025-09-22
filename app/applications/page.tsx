//@ts-nocheck
'use client';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { applicationsApi } from '@/lib/api/applications';
import {
  AlertCircle,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  FileText,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
// Using custom date formatting function instead of date-fns
const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  if (diffInDays < 30)
    return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
  if (diffInDays < 365)
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`;
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const statusOptions = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'hired', label: 'Hired' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'status', label: 'By Status' },
    { value: 'company', label: 'By Company' },
  ];

  // Load applications with improved error handling and caching
  const loadApplications = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const filters: any = {
          page: pagination.page,
          limit: pagination.limit,
          // Add timestamp to prevent caching issues
          _t: Date.now(),
        };

        if (statusFilter !== 'all') {
          filters.status = statusFilter;
        }

        // Add search term to API call if your backend supports it
        if (searchTerm) {
          filters.search = searchTerm;
        }

        // Add sort to API call if your backend supports it
        filters.sort = sortBy;

        const response = await applicationsApi.getUserApplications(filters);

        // Client-side filtering as fallback
        let filteredApplications = response.applications.map((app: any) => ({
          ...app,
          // Map jobId to job for consistency with frontend expectations
          job: app.jobId || app.job,
          // Ensure we have proper ID field (MongoDB uses _id)
          id: app._id?.toString() || app.id,
        }));
        if (searchTerm && !filters.search) {
          filteredApplications = response.applications.filter(
            (app: any) =>
              app.job?.title
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              app.job?.company?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Client-side sorting as fallback
        if (!filters.sort || filters.sort === 'newest') {
          switch (sortBy) {
            case 'oldest':
              filteredApplications.sort(
                (a: any, b: any) =>
                  new Date(a.appliedAt).getTime() -
                  new Date(b.appliedAt).getTime()
              );
              break;
            case 'status':
              filteredApplications.sort((a: any, b: any) =>
                a.status.localeCompare(b.status)
              );
              break;
            case 'company':
              filteredApplications.sort((a: any, b: any) =>
                (a.job?.company || '').localeCompare(b.job?.company || '')
              );
              break;
            default: // newest
              filteredApplications.sort(
                (a: any, b: any) =>
                  new Date(b.appliedAt).getTime() -
                  new Date(a.appliedAt).getTime()
              );
          }
        }

        setApplications(filteredApplications);
        setPagination(response.pagination);

        // Show success message only on manual refresh
        if (showRefreshing) {
          toast.success('Applications updated successfully');
        }
      } catch (error: any) {
        console.error('Failed to load applications:', error);
        toast.error(error?.message || 'Failed to load applications');
        setApplications([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pagination.page, statusFilter, searchTerm, sortBy]
  );

  // Initial load
  useEffect(() => {
    if (user?.role === 'seeker') {
      loadApplications();
    }
  }, [user, loadApplications]);

  // Reset to first page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [statusFilter, searchTerm, sortBy]);

  // Auto-refresh every 30 seconds when page is visible
  useEffect(() => {
    if (user?.role !== 'seeker') return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadApplications(true);
      }
    };

    // Auto refresh every 30 seconds
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        loadApplications(true);
      }
    }, 30000);

    // Refresh when page becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, loadApplications]);

  const handleSearch = () => {
    loadApplications();
  };

  const handleRefresh = () => {
    loadApplications(true);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Listen for storage events and custom events to detect new applications
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'newApplication' && e.newValue) {
        // New application detected, refresh the list
        loadApplications(true);
        // Clear the flag
        localStorage.removeItem('newApplication');
      }
    };

    const handleApplicationSubmitted = (e: CustomEvent) => {
      // Handle same-tab application submission
      console.log('New application submitted:', e.detail);
      loadApplications(true);
    };

    // Listen for storage events (cross-tab)
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events (same-tab)
    window.addEventListener(
      'applicationSubmitted',
      handleApplicationSubmitted as EventListener
    );

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'applicationSubmitted',
        handleApplicationSubmitted as EventListener
      );
    };
  }, [loadApplications]);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
      },
      reviewing: {
        label: 'Reviewing',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Eye,
      },
      shortlisted: {
        label: 'Shortlisted',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
      },
      rejected: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
      },
      hired: {
        label: 'Hired',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: CheckCircle,
      },
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const formatSalary = (salary: any) => {
    if (!salary) return 'Not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency || 'USD',
      maximumFractionDigits: 0,
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  const getApplicationStats = () => {
    const stats = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: applications.length,
      pending: stats.pending || 0,
      reviewing: stats.reviewing || 0,
      shortlisted: stats.shortlisted || 0,
      rejected: stats.rejected || 0,
      hired: stats.hired || 0,
    };
  };

  const stats = getApplicationStats();

  // Redirect if not a job seeker
  if (user && user.role !== 'seeker') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-4xl mx-auto px-4">
            <Card className="p-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                Only job seekers can view applications.
              </p>
              <Button onClick={() => router.push('/jobs')}>Browse Jobs</Button>
            </Card>
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
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="lg:text-3xl text-xl font-bold">
                  My Applications
                </h1>
                <p className="text-muted-foreground mt-1 text-[13px]">
                  Track and manage your job applications • Auto-updates every
                  30s
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  size="sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                  />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button onClick={() => router.push('/jobs')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Find More Jobs
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-2xl font-bold text-primary">
                  {stats.total}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.reviewing}
                </div>
                <div className="text-sm text-muted-foreground">Reviewing</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {stats.shortlisted}
                </div>
                <div className="text-sm text-muted-foreground">Shortlisted</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.hired}
                </div>
                <div className="text-sm text-muted-foreground">Hired</div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by job title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </Card>
          </div>

          {/* Applications Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Applications Found
              </h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== 'all' || searchTerm
                  ? 'Try adjusting your filters or search terms.'
                  : "You haven't applied to any jobs yet. Start exploring opportunities!"}
              </p>
              <Button onClick={() => router.push('/jobs')}>
                <Plus className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((application, index) => {
                  // Safe ID extraction
                  const applicationId =
                    application._id || application.id || `app-${index}`;
                  const statusConfig = getStatusConfig(application.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <Card
                      key={applicationId}
                      className="hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => {
                        if (application._id || application.id) {
                          router.push(`/applications/${applicationId}`);
                        } else {
                          toast.error('Unable to view application details');
                        }
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border">
                            {application.job?.companyLogo ? (
                              <img
                                src={application.job.companyLogo}
                                alt={`${application.job.company} logo`}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <Building className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                              {application.job?.title}
                            </h3>
                            <p className="text-muted-foreground flex items-center gap-1 text-sm">
                              <Building className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {application.job?.company}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge
                              className={`${statusConfig.color} border flex items-center gap-1`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">
                                {application.job?.location}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Applied{' '}
                                {formatDistanceToNow(
                                  new Date(application.appliedAt)
                                )}
                              </span>
                            </div>
                          </div>

                          {application.job?.salary && (
                            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                              <DollarSign className="h-3 w-3" />
                              <span>
                                {formatSalary(application.job.salary)}
                              </span>
                            </div>
                          )}

                          {application.coverLetter && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {application.coverLetter}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                Job posted{' '}
                                {application.job?.postedAt
                                  ? formatDistanceToNow(
                                      new Date(application.job.postedAt)
                                    )
                                  : 'recently'}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (application._id || application.id) {
                                  router.push(`/applications/${applicationId}`);
                                } else {
                                  toast.error(
                                    'Unable to view application details'
                                  );
                                }
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total} applications
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pagination.page === pageNum
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loading}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
