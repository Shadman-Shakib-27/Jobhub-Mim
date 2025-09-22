// @ts-nocheck
'use client';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/auth-context';
import { formatDistanceToNow } from 'date-fns';
import {
  Building,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Lock,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { EnhancedJobDetailsModal } from '@/components/enhanced-job-details-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { JobFilters, jobsApi } from '@/lib/api/jobs';
import {
  Briefcase,
  Calendar,
  DollarSign,
  GraduationCap,
  Loader2,
  MapPin,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Add Job Modal Component
function AddJobModal({ open, onClose, onJobAdded }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    companyId: '',
    location: '',
    type: 'full-time',
    category: 'skilled',
    experienceLevel: 'mid',
    description: '',
    requirements: [],
    benefits: [],
    salary: {
      min: '',
      max: '',
      currency: 'USD',
    },
    isRemote: false,
    trainingProvided: false,
    deferredStartMonths: '',
  });

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
  ];

  const jobCategories = [
    { value: 'skilled', label: 'Skilled' },
    { value: 'non-skilled', label: 'Non-Skilled (Training Provided)' },
    { value: 'deferred-hire', label: 'Deferred Hire' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5-10 years)' },
    { value: 'lead', label: 'Lead/Manager (10+ years)' },
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'BDT', label: 'BDT (৳)' },
    { value: 'GBP', label: 'GBP (£)' },
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (index) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (
        !formData.title ||
        !formData.company ||
        !formData.companyId ||
        !formData.location ||
        !formData.description
      ) {
        toast.error('Please fill in all required fields including Company ID');
        return;
      }

      if (
        formData.salary.min &&
        formData.salary.max &&
        formData.salary.min >= formData.salary.max
      ) {
        toast.error('Maximum salary must be greater than minimum salary');
        return;
      }

      const jobData = {
        ...formData,
        salary: {
          min: formData.salary.min || null,
          max: formData.salary.max || null,
          currency: formData.salary.currency,
        },
        deferredStartMonths: formData.deferredStartMonths || null,
      };

      const response = await jobsApi.createJob(jobData);
      toast.success('Job posted successfully!');
      onJobAdded();
      handleClose();
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      company: '',
      companyId: '',
      location: '',
      type: 'full-time',
      category: 'skilled',
      experienceLevel: 'mid',
      description: '',
      requirements: [],
      benefits: [],
      salary: {
        min: '',
        max: '',
        currency: 'USD',
      },
      isRemote: false,
      trainingProvided: false,
      deferredStartMonths: '',
    });
    setCurrentStep(1);
    setNewRequirement('');
    setNewBenefit('');
    onClose();
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (
        !formData.title ||
        !formData.company ||
        !formData.companyId ||
        !formData.location
      ) {
        toast.error(
          'Please fill in all basic information including Company ID'
        );
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Basic Information';
      case 2:
        return 'Job Details';
      case 3:
        return 'Requirements & Benefits';
      default:
        return 'Add New Job';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Briefcase className="h-6 w-6" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3 - Fill in the job details to post a new
            position
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full ${
                step <= currentStep ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange('company', e.target.value)
                    }
                    placeholder="e.g. TechCorp Inc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyId">Company ID *</Label>
                <Input
                  id="companyId"
                  value={formData.companyId}
                  onChange={(e) =>
                    handleInputChange('companyId', e.target.value)
                  }
                  placeholder="e.g. company-uuid-12345 or company ID from database"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the company ID from your system (required for job
                  posting)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange('location', e.target.value)
                      }
                      placeholder="e.g. New York, NY or Remote"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Job Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange('category', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(value) =>
                      handleInputChange('experienceLevel', value)
                    }
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
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isRemote"
                  checked={formData.isRemote}
                  onCheckedChange={(checked) =>
                    handleInputChange('isRemote', checked)
                  }
                />
                <Label htmlFor="isRemote">Remote Work Available</Label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={6}
                />
              </div>

              <div className="space-y-4">
                <Label>Salary Range</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minSalary">Minimum</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="minSalary"
                        type="number"
                        value={formData.salary.min}
                        onChange={(e) =>
                          handleInputChange(
                            'salary.min',
                            e.target.value ? Number(e.target.value) : ''
                          )
                        }
                        placeholder="50000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSalary">Maximum</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="maxSalary"
                        type="number"
                        value={formData.salary.max}
                        onChange={(e) =>
                          handleInputChange(
                            'salary.max',
                            e.target.value ? Number(e.target.value) : ''
                          )
                        }
                        placeholder="80000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.salary.currency}
                      onValueChange={(value) =>
                        handleInputChange('salary.currency', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {formData.category === 'non-skilled' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="trainingProvided"
                    checked={formData.trainingProvided}
                    onCheckedChange={(checked) =>
                      handleInputChange('trainingProvided', checked)
                    }
                  />
                  <Label
                    htmlFor="trainingProvided"
                    className="flex items-center gap-2"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Training will be provided
                  </Label>
                </div>
              )}

              {formData.category === 'deferred-hire' && (
                <div className="space-y-2">
                  <Label htmlFor="deferredStart">
                    Start Date (months from now)
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deferredStart"
                      type="number"
                      value={formData.deferredStartMonths}
                      onChange={(e) =>
                        handleInputChange(
                          'deferredStartMonths',
                          e.target.value ? Number(e.target.value) : ''
                        )
                      }
                      placeholder="3"
                      className="pl-10"
                      min="1"
                      max="24"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Job Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement..."
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addRequirement}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((req, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {req}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0.5"
                        onClick={() => removeRequirement(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Benefits & Perks</Label>
                <div className="flex gap-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Add a benefit..."
                    onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addBenefit}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {benefit}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0.5"
                        onClick={() => removeBenefit(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Card className="mt-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 text-lg">Job Preview</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Title:</strong>{' '}
                      {formData.title || 'Not specified'}
                    </p>
                    <p>
                      <strong>Company:</strong>{' '}
                      {formData.company || 'Not specified'}
                    </p>
                    <p>
                      <strong>Company ID:</strong>{' '}
                      {formData.companyId || 'Not specified'}
                    </p>
                    <p>
                      <strong>Location:</strong>{' '}
                      {formData.location || 'Not specified'}
                    </p>
                    <p>
                      <strong>Type:</strong>{' '}
                      {jobTypes.find((t) => t.value === formData.type)?.label}
                    </p>
                    <p>
                      <strong>Category:</strong>{' '}
                      {
                        jobCategories.find((c) => c.value === formData.category)
                          ?.label
                      }
                    </p>
                    {(formData.salary.min || formData.salary.max) && (
                      <p>
                        <strong>Salary:</strong>{' '}
                        {formData.salary.min && formData.salary.max
                          ? `${formData.salary.currency} ${formData.salary.min} - ${formData.salary.max}`
                          : 'Not specified'}
                      </p>
                    )}
                    <p>
                      <strong>Requirements:</strong>{' '}
                      {formData.requirements.length} items
                    </p>
                    <p>
                      <strong>Benefits:</strong> {formData.benefits.length}{' '}
                      items
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>

              {currentStep < 3 ? (
                <Button onClick={nextStep}>Next</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Job...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Job
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function JobsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
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

  useEffect(() => {
    loadJobs();
  }, []);

  const handleSearch = () => {
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sortBy: value, page: 1 };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    loadJobs(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleJobAdded = () => {
    loadJobs();
  };

  // Role-based Post Job Button Handler
  const handlePostJob = () => {
    if (!user) {
      toast.error('Please login to post a job', {
        action: {
          label: 'Login',
          onClick: () => router.push('/auth/login'),
        },
      });
      return;
    }

    if (user.role === 'seeker') {
      toast.error('Only employers can post jobs', {
        description:
          'Switch to an employer account or create a new employer account.',
        // action: {
        //   label: 'Create Employer Account',
        //   onClick: () => router.push('/auth/register'),
        // },
      });
      return;
    }

    if (user.role === 'admin') {
      toast.info('Admins cannot post jobs directly', {
        description: 'Use the admin panel to manage job postings.',
        action: {
          label: 'Admin Panel',
          onClick: () => router.push('/admin'),
        },
      });
      return;
    }

    setAddModalOpen(true);
  };

  // Get button configuration based on user role
  const getPostJobButtonConfig = () => {
    if (!user) {
      return {
        disabled: false,
        variant: 'default' as const,
        text: 'Post a Job',
        icon: Plus,
        // tooltip: 'Login required to post jobs',
        className: '',
      };
    }

    switch (user.role) {
      case 'seeker':
        return {
          disabled: false,
          variant: 'default' as const,
          text: 'Only Employers Can Post Jobs',
          icon: Lock,
          // tooltip:
          //   'Only employers can post jobs. Switch to an employer account.',
          className: 'opacity-60',
        };
      case 'admin':
        return {
          disabled: false,
          variant: 'outline' as const,
          text: 'Use Admin Panel',
          icon: Settings,
          // tooltip: 'Admins should use the admin panel to manage jobs',
          className: '',
        };
      case 'employer':
        return {
          disabled: false,
          variant: 'default' as const,
          text: 'Post a Job',
          icon: Plus,
          // tooltip: 'Create a new job posting',
          className: 'hover:scale-105',
        };
      default:
        return {
          disabled: false,
          variant: 'default' as const,
          text: 'Post a Job',
          icon: Plus,
          // tooltip: 'Post a new job',
          className: '',
        };
    }
  };

  const buttonConfig = getPostJobButtonConfig();
  const IconComponent = buttonConfig.icon;

  // Job Card Component
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

  // Pagination Component
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
          {/* Search Header with Role-Based Post Job Button */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl lg:text-3xl font-bold">
                Find Your Perfect Job
              </h1>

              {/* Role-Based Post Job Button */}
                    <Button
                      onClick={handlePostJob}
                      disabled={buttonConfig.disabled}
                      variant={buttonConfig.variant}
                      className={`flex items-center gap-2 transition-all duration-200 ${buttonConfig.className}`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {buttonConfig.text}
                      {user?.role === 'seeker' && (
                        <Lock className="h-3 w-3 ml-1 opacity-60" />
                      )}
                    </Button>
            </div>

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
      <EnhancedJobDetailsModal
        job={selectedJob}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedJob(null);
        }}
      />

      {/* Conditional Add Job Modal - Only render for employers */}
      {user?.role === 'employer' && (
        <AddJobModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onJobAdded={handleJobAdded}
        />
      )}
    </div>
  );
}
