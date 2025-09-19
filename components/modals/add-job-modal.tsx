'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { 
  X, 
  Plus, 
  Loader2, 
  MapPin, 
  DollarSign, 
  Calendar,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { jobsApi } from '@/lib/api/jobs';

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
  onJobAdded?: () => void; // Callback when job is successfully added
}

interface JobFormData {
  title: string;
  company: string;
  companyId: string;
  location: string;
  type: string;
  category: string;
  experienceLevel: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary: {
    min: number | '';
    max: number | '';
    currency: string;
  };
  isRemote: boolean;
  trainingProvided: boolean;
  deferredStartMonths: number | '';
}

export function PostJobModal({ open, onClose, onJobAdded }: PostJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const [formData, setFormData] = useState<JobFormData>({
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
      currency: 'USD'
    },
    isRemote: false,
    trainingProvided: false,
    deferredStartMonths: ''
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

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Basic validation
      if (!formData.title || !formData.company || !formData.companyId || !formData.location || !formData.description) {
        toast.error('Please fill in all required fields including Company ID');
        return;
      }

      if (formData.salary.min && formData.salary.max && formData.salary.min >= formData.salary.max) {
        toast.error('Maximum salary must be greater than minimum salary');
        return;
      }

      // Prepare job data for API
      const jobData = {
        ...formData,
        salary: {
          min: formData.salary.min || null,
          max: formData.salary.max || null,
          currency: formData.salary.currency
        },
        deferredStartMonths: formData.deferredStartMonths || null,
      };

      console.log('Submitting job data:', jobData); // Debug log

      // Call API to create job
      const response = await jobsApi.createJob(jobData);
      
      console.log('Job created successfully:', response); // Debug log
      toast.success('Job posted successfully!');
      
      // Call the callback to refresh jobs list
      if (onJobAdded) {
        onJobAdded();
      }
      
      handleClose();
    } catch (error: any) {
      console.error('Failed to create job:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to create job. ';
      
      if (error.response) {
        // Server responded with error status
        console.error('Server response:', error.response);
        errorMessage += `Server error: ${error.response.status}`;
        if (error.response.data?.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        errorMessage += 'Network error. Please check your connection.';
      } else {
        // Other error
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      toast.error(errorMessage);
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
        currency: 'USD'
      },
      isRemote: false,
      trainingProvided: false,
      deferredStartMonths: ''
    });
    setCurrentStep(1);
    setNewRequirement('');
    setNewBenefit('');
    onClose();
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.company || !formData.companyId || !formData.location) {
        toast.error('Please fill in all basic information including Company ID');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Basic Information';
      case 2: return 'Job Details';
      case 3: return 'Requirements & Benefits';
      default: return 'Add New Job';
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
            Step {currentStep} of 3 - Fill in the job details to post a new position
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full ${ 
                step <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Basic Information */}
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
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g. TechCorp Inc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyId">Company ID *</Label>
                <Input
                  id="companyId"
                  value={formData.companyId}
                  onChange={(e) => handleInputChange('companyId', e.target.value)}
                  placeholder="e.g. company-uuid-12345 or company ID from database"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the company ID from your system (required for job posting)
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
                      onChange={(e) => handleInputChange('location', e.target.value)}
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
                      {jobTypes.map(type => (
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
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map(category => (
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
                    onValueChange={(value) => handleInputChange('experienceLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isRemote"
                    checked={formData.isRemote}
                    onCheckedChange={(checked) => handleInputChange('isRemote', checked)}
                  />
                  <Label htmlFor="isRemote">Remote Work Available</Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Job Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
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
                        onChange={(e) => handleInputChange('salary.min', e.target.value ? Number(e.target.value) : '')}
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
                        onChange={(e) => handleInputChange('salary.max', e.target.value ? Number(e.target.value) : '')}
                        placeholder="80000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.salary.currency}
                      onValueChange={(value) => handleInputChange('salary.currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Category-specific options */}
              {formData.category === 'non-skilled' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="trainingProvided"
                    checked={formData.trainingProvided}
                    onCheckedChange={(checked) => handleInputChange('trainingProvided', checked)}
                  />
                  <Label htmlFor="trainingProvided" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Training will be provided
                  </Label>
                </div>
              )}

              {formData.category === 'deferred-hire' && (
                <div className="space-y-2">
                  <Label htmlFor="deferredStart">Start Date (months from now)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deferredStart"
                      type="number"
                      value={formData.deferredStartMonths}
                      onChange={(e) => handleInputChange('deferredStartMonths', e.target.value ? Number(e.target.value) : '')}
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

          {/* Step 3: Requirements & Benefits */}
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

              {/* Job Preview */}
              <Card className="mt-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 text-lg">Job Preview</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {formData.title || 'Not specified'}</p>
                    <p><strong>Company:</strong> {formData.company || 'Not specified'}</p>
                    <p><strong>Company ID:</strong> {formData.companyId || 'Not specified'}</p>
                    <p><strong>Location:</strong> {formData.location || 'Not specified'}</p>
                    <p><strong>Type:</strong> {jobTypes.find(t => t.value === formData.type)?.label}</p>
                    <p><strong>Category:</strong> {jobCategories.find(c => c.value === formData.category)?.label}</p>
                    {(formData.salary.min || formData.salary.max) && (
                      <p><strong>Salary:</strong> {formData.salary.min && formData.salary.max 
                        ? `${formData.salary.currency} ${formData.salary.min} - ${formData.salary.max}` 
                        : 'Not specified'}</p>
                    )}
                    <p><strong>Requirements:</strong> {formData.requirements.length} items</p>
                    <p><strong>Benefits:</strong> {formData.benefits.length} items</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
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
                <Button onClick={nextStep}>
                  Next
                </Button>
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