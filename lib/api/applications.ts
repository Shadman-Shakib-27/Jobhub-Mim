// lib/api/applications.ts
import { api } from './client';

export interface ApplicationData {
  coverLetter?: string;
  expectedSalary?: number;
  availableFrom?: string;
}

export interface ApplicationResponse {
  message: string;
  application: {
    id: string;
    jobId: any;
    applicantId: any;
    coverLetter?: string;
    expectedSalary?: number;
    availableFrom?: string;
    status: string;
    appliedAt: string;
  };
}

export interface ApplicationsResponse {
  applications: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const applicationsApi = {
  // Apply to a job
  applyToJob: async (
    jobId: string,
    applicationData: ApplicationData
  ): Promise<ApplicationResponse> => {
    return api.post(`/jobs/${jobId}/apply`, applicationData);
  },

  // Get application status for a specific job
  getApplicationStatus: async (jobId: string) => {
    return api.get(`/jobs/${jobId}/apply`);
  },

  // Get all user applications
  getUserApplications: async (
    filters: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      sort?: string;
      _t?: number; // timestamp for cache busting
    } = {}
  ): Promise<ApplicationsResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString
      ? `/applications?${queryString}`
      : '/applications';

    return api.get(endpoint);
  },

  // Get single application by ID
  getApplicationById: async (applicationId: string): Promise<any> => {
    // Since backend doesn't have individual application endpoint,
    // get all applications and filter for the specific one
    const response = await applicationsApi.getUserApplications({});
    const foundApplication = response.applications?.find(
      (app: any) => app.id === applicationId || app._id === applicationId
    );

    if (!foundApplication) {
      throw new Error('Application not found');
    }

    return foundApplication;
  },

  // Withdraw application (if you want to add this feature)
  withdrawApplication: async (applicationId: string) => {
    return api.delete(`/applications/${applicationId}`);
  },

  // Update application status (for employers - if needed)
  updateApplicationStatus: async (
    applicationId: string,
    status: string,
    notes?: string
  ) => {
    return api.patch(`/applications/${applicationId}/status`, {
      status,
      notes,
    });
  },
};
