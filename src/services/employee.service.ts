import api from './api';

// Types
export interface Employee {
  _id: string;
  employeeId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    photo?: {
      url: string;
      filename: string;
    };
  };
  employment: {
    title: string;
    department?: {
      _id: string;
      name: string;
      code: string;
    };
    status: 'active' | 'inactive' | 'on-leave' | 'terminated';
    joinDate: string;
    terminationDate?: string;
  };
  access: {
    role: 'ADMIN' | 'RECRUITER' | 'HIRING_MANAGER' | 'INTERVIEWER';
    permissions: string[];
    lastLogin?: string;
  };
  provisioning?: {
    emailProvisioned: boolean;
    provisionedEmail?: string;
    badgeGenerated: boolean;
  };
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title: string;
  department?: string;
  role?: string;
  autoGenerateId?: boolean;
  provisionEmail?: boolean;
  emailFormat?: 'firstname.lastname' | 'firstinitial.lastname' | 'firstname_lastname';
  photo?: File;
}

export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  status?: string;
  role?: string;
  photo?: File;
}

export interface EmployeeBadge {
  employeeId: string;
  fullName: string;
  title: string;
  photo?: string;
  companyLogo?: string;
  qrCode: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}

export interface EmployeeListResponse {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class EmployeeService {
  /**
   * Get all employees with optional filters and pagination
   * GET /api/v1/employees
   */
  async getEmployees(params?: PaginationParams): Promise<EmployeeListResponse> {
    const response = await api.get('/v1/employees', { params });
    return response.data.data;
  }

  /**
   * Get single employee by ID
   * GET /api/v1/employees/:id
   */
  async getEmployee(id: string): Promise<Employee> {
    const response = await api.get(`/v1/employees/${id}`);
    return response.data.data.employee;
  }

  /**
   * Create new employee
   * POST /api/v1/employees
   */
  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    const formData = new FormData();

    // Personal info
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);

    // Employment info
    formData.append('title', data.title);
    if (data.department) formData.append('department', data.department);

    // Access info
    if (data.role) formData.append('role', data.role);

    // Provisioning options
    if (data.autoGenerateId !== undefined) {
      formData.append('autoGenerateId', String(data.autoGenerateId));
    }
    if (data.provisionEmail !== undefined) {
      formData.append('provisionEmail', String(data.provisionEmail));
    }
    if (data.emailFormat) {
      formData.append('emailFormat', data.emailFormat);
    }

    // Photo upload
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await api.post('/v1/employees', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.employee;
  }

  /**
   * Update employee
   * PUT /api/v1/employees/:id
   */
  async updateEmployee(id: string, data: UpdateEmployeeData): Promise<Employee> {
    const formData = new FormData();

    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName) formData.append('lastName', data.lastName);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.title) formData.append('title', data.title);
    if (data.department) formData.append('department', data.department);
    if (data.status) formData.append('status', data.status);
    if (data.role) formData.append('role', data.role);
    if (data.photo) formData.append('photo', data.photo);

    const response = await api.put(`/v1/employees/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.employee;
  }

  /**
   * Delete employee (soft delete)
   * DELETE /api/v1/employees/:id
   */
  async deleteEmployee(id: string): Promise<void> {
    await api.delete(`/v1/employees/${id}`);
  }

  /**
   * Get next available employee ID
   * GET /api/v1/employees/next-id
   */
  async getNextEmployeeId(): Promise<string> {
    const response = await api.get('/v1/employees/next-id');
    return response.data.data.nextEmployeeId;
  }

  /**
   * Provision email for employee
   * POST /api/v1/employees/:id/provision-email
   */
  async provisionEmail(
    id: string,
    emailFormat: 'firstname.lastname' | 'firstinitial.lastname' | 'firstname_lastname'
  ): Promise<{ email: string; password: string }> {
    const response = await api.post(`/v1/employees/${id}/provision-email`, { emailFormat });
    return response.data.data.credentials;
  }

  /**
   * Generate employee badge
   * GET /api/v1/employees/:id/badge
   */
  async generateBadge(
    id: string,
    format: 'pdf' | 'png' = 'pdf',
    template: 'standard' | 'minimal' | 'horizontal' = 'standard'
  ): Promise<Blob> {
    const response = await api.get(`/v1/employees/${id}/badge`, {
      params: { format, template },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Download badge as file
   */
  async downloadBadge(id: string, employeeName: string, format: 'pdf' | 'png' = 'pdf'): Promise<void> {
    const blob = await this.generateBadge(id, format);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${employeeName.replace(/\s+/g, '_')}_badge.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Reset employee password
   * POST /api/v1/employees/:id/reset-password
   */
  async resetPassword(id: string): Promise<{ tempPassword: string }> {
    const response = await api.post(`/v1/employees/${id}/reset-password`);
    return response.data.data;
  }

  /**
   * Bulk import employees
   * POST /api/v1/employees/bulk-import
   */
  async bulkImport(file: File): Promise<{ imported: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/v1/employees/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  /**
   * Export employees to CSV
   * GET /api/v1/employees/export
   */
  async exportEmployees(params?: { department?: string; status?: string }): Promise<Blob> {
    const response = await api.get('/v1/employees/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get employee statistics
   * GET /api/v1/employees/stats
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    byDepartment: Array<{ department: string; count: number }>;
    byRole: Array<{ role: string; count: number }>;
  }> {
    const response = await api.get('/v1/employees/stats');
    return response.data.data;
  }

  /**
   * Preview employee email based on format
   */
  previewEmail(
    firstName: string,
    lastName: string,
    format: 'firstname.lastname' | 'firstinitial.lastname' | 'firstname_lastname',
    domain: string
  ): string {
    const fn = firstName.toLowerCase();
    const ln = lastName.toLowerCase();

    switch (format) {
      case 'firstname.lastname':
        return `${fn}.${ln}@${domain}`;
      case 'firstinitial.lastname':
        return `${fn[0]}.${ln}@${domain}`;
      case 'firstname_lastname':
        return `${fn}_${ln}@${domain}`;
      default:
        return `${fn}.${ln}@${domain}`;
    }
  }
}

export default new EmployeeService();
