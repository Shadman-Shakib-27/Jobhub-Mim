// @/lib/api/jobs.ts
import { api } from './client';

export interface JobsResponse {
  jobs: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface JobFilters {
  search?: string;
  location?: string;
  type?: string;
  category?: string;
  experienceLevel?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export const jobsApi = {
  // Get jobs with filters
  getJobs: async (filters: JobFilters = {}): Promise<JobsResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';

    return api.get(endpoint);
  },

  // Get single job by ID
  getJob: async (id: string) => {
    return api.get(`/jobs/${id}`);
  },

  // Create new job (for employers)
  createJob: async (jobData: any) => {
    return api.post('/jobs', jobData);
  },

  // Update job (for employers)
  updateJob: async (id: string, jobData: any) => {
    return api.put(`/jobs/${id}`, jobData);
  },

  // Delete job (for employers)
  deleteJob: async (id: string) => {
    return api.delete(`/jobs/${id}`);
  },

  // Apply to job (for job seekers)
  applyToJob: async (jobId: string, applicationData: any) => {
    return api.post(`/jobs/${jobId}/apply`, applicationData);
  },

  // Get job applications (for employers)
  getJobApplications: async (jobId: string) => {
    return api.get(`/jobs/${jobId}/applications`);
  },
};