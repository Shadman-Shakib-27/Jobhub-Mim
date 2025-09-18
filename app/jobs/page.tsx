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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { JobFilters, jobsApi } from '@/lib/api/jobs';
import { formatDistanceToNow } from 'date-fns';
import {
  Briefcase,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Filter,
  GraduationCap,
  Loader2,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function JobsPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [filters, setFilters] = useState<JobFilters>({
    search: searchParams?.get('search') || '',
    location: searchParams?.get('location') || '',
    type: 'all',
    category: 'all',
    experienceLevel: 'all',
    page: 1,
    limit: 10,
    sortBy: 'newest',
  });

  const jobTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
  ];

  const jobCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'skilled', label: 'Skilled' },
    { value: 'non-skilled', label: 'Non-Skilled (Training Provided)' },
    { value: 'deferred-hire', label: 'Deferred Hire' },
  ];

  const experienceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'salary-high', label: 'Highest Salary' },
    { value: 'salary-low', label: 'Lowest Salary' },
  ];

  // Load jobs from API
  const loadJobs = async (newFilters?: JobFilters) => {
    try {
      setLoading(true);
      const filtersToUse = newFilters || filters;

      const response = await jobsApi.getJobs(filtersToUse);

      setJobs(response.jobs);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Failed to load jobs:', error);
      toast.error(error.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadJobs();
  }, []);

  // Handle search
  const handleSearch = () => {
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sortBy: value, page: 1 };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    loadJobs(newFilters);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear filters
  const clearFilters = () => {
    const newFilters = {
      search: '',
      location: '',
      type: 'all',
      category: 'all',
      experienceLevel: 'all',
      page: 1,
      limit: 10,
      sortBy: 'newest',
    };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  const formatSalary = (salary: any) => {
    if (!salary) return 'Salary not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency || 'USD',
      maximumFractionDigits: 0,
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  // Handle job click to open modal
  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  // Simple Job Details Modal Component
  const JobDetailsModal = ({ job, open, onClose }: { job: any; open: boolean; onClose: () => void }) => (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center border">
              {job?.companyLogo ? (
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
              <DialogTitle className="text-2xl font-bold mb-2">{job?.title}</DialogTitle>
              <DialogDescription className="text-lg">
                {job?.company} • {job?.location}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Job Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job?.location}
            </Badge>
            <Badge variant="outline">
              {jobTypes.find((t) => t.value === job?.type)?.label}
            </Badge>
            {job?.category === 'non-skilled' && job?.trainingProvided && (
              <Badge
                variant="outline"
                className="text-emerald-600 border-emerald-600 flex items-center gap-1"
              >
                <GraduationCap className="h-3 w-3" />
                Training Provided
              </Badge>
            )}
            {job?.category === 'deferred-hire' && job?.deferredStartMonths && (
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-600 flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                Starts in {job.deferredStartMonths} months
              </Badge>
            )}
            {job?.isRemote && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                Remote
              </Badge>
            )}
          </div>

          {/* Salary */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-lg font-semibold text-green-600">
              {formatSalary(job?.salary)}
            </span>
          </div>

          {/* Posted Date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Posted {job?.postedAt ? formatDistanceToNow(new Date(job.postedAt), { addSuffix: true }) : 'recently'}
            </span>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Job Description</h3>
            <div className="text-muted-foreground whitespace-pre-line">
              {job?.description || 'No description available.'}
            </div>
          </div>

          {/* Requirements */}
          {job?.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {job.requirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job?.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Benefits</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {job.benefits.map((benefit: string, index: number) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply Button */}
          <div className="flex gap-4 pt-4">
            <Button size="lg" className="flex-1">
              Apply Now
            </Button>
            <Button variant="outline" size="lg">
              Save Job
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const JobCard = ({ job }: { job: any }) => (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => handleJobClick(job)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border">
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

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {job.company}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(job.postedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </Badge>
              <Badge variant="outline">
                {jobTypes.find((t) => t.value === job.type)?.label}
              </Badge>
              {job.category === 'non-skilled' && job.trainingProvided && (
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-600 flex items-center gap-1"
                >
                  <GraduationCap className="h-3 w-3" />
                  Training Provided
                </Badge>
              )}
              {job.category === 'deferred-hire' && job.deferredStartMonths && (
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600 flex items-center gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  Starts in {job.deferredStartMonths} months
                </Badge>
              )}
              {job.isRemote && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  Remote
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>

            <div className="flex items-center justify-between pt-2">
              <p className="font-semibold text-green-600 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {formatSalary(job.salary)}
              </p>
              <p className="text-sm text-muted-foreground">
                {job.applicationsCount || 0} applications
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const Pagination = () => (
    <div className="flex items-center justify-between mt-8">
      <p className="text-sm text-muted-foreground">
        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
        {pagination.total} results
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
                  variant={pagination.page === pageNum ? 'default' : 'outline'}
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
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Find Your Perfect Job</h1>

            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Job title, company, or keywords..."
                    value={filters.search || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Location or remote"
                    value={filters.location || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                  className="md:px-8"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Job Type
                    </label>
                    <Select
                      value={filters.type || 'all'}
                      onValueChange={(value) =>
                        handleFilterChange('type', value)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Category
                    </label>
                    <Select
                      value={filters.category || 'all'}
                      onValueChange={(value) =>
                        handleFilterChange('category', value)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobCategories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Experience Level
                    </label>
                    <Select
                      value={filters.experienceLevel || 'all'}
                      onValueChange={(value) =>
                        handleFilterChange('experienceLevel', value)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearFilters}
                    disabled={loading}
                  >
                    Clear Filters
                  </Button>
                </div>
              </Card>
            </div>

            {/* Jobs List */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {loading ? 'Loading...' : `Showing ${pagination.total} jobs`}
                </p>
                <Select
                  value={filters.sortBy || 'newest'}
                  onValueChange={handleSortChange}
                  disabled={loading}
                >
                  <SelectTrigger className="w-48">
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
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-6">
                      <div className="animate-pulse">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}

              {!loading && jobs.length === 0 && (
                <Card className="p-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </Card>
              )}

              {!loading && jobs.length > 0 && <Pagination />}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
}