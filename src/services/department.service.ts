import api from './api';

// Types
export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  parent?: {
    _id: string;
    name: string;
    code: string;
  } | string | null;
  head?: {
    _id: string;
    personalInfo: {
      firstName: string;
      lastName: string;
    };
    employeeId: string;
  } | string | null;
  costCenter?: string;
  status: 'active' | 'inactive';
  organizationId: string;
  employeeCount?: number;
  subDepartments?: Department[];
  children?: Department[]; // For tree structure
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
  parent?: string;
  head?: string;
  costCenter?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  description?: string;
  parent?: string | null;
  head?: string | null;
  costCenter?: string;
  status?: 'active' | 'inactive';
}

export interface DepartmentHierarchy extends Department {
  children: DepartmentHierarchy[];
}

class DepartmentService {
  /**
   * Get all departments with employee counts
   * GET /api/v1/departments
   */
  async getDepartments(includeInactive = false): Promise<Department[]> {
    const response = await api.get('/v1/departments', {
      params: { includeInactive },
    });
    return response.data.data.departments;
  }

  /**
   * Get department hierarchy (tree structure)
   * GET /api/v1/departments/hierarchy
   */
  async getDepartmentHierarchy(): Promise<DepartmentHierarchy[]> {
    const response = await api.get('/v1/departments/hierarchy');
    return response.data.data.hierarchy;
  }

  /**
   * Get single department with details
   * GET /api/v1/departments/:id
   */
  async getDepartment(id: string): Promise<Department> {
    const response = await api.get(`/v1/departments/${id}`);
    return response.data.data.department;
  }

  /**
   * Create new department
   * POST /api/v1/departments
   */
  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const response = await api.post('/v1/departments', data);
    return response.data.data.department;
  }

  /**
   * Update department
   * PUT /api/v1/departments/:id
   */
  async updateDepartment(id: string, data: UpdateDepartmentData): Promise<Department> {
    const response = await api.put(`/v1/departments/${id}`, data);
    return response.data.data.department;
  }

  /**
   * Delete department (soft delete)
   * DELETE /api/v1/departments/:id
   */
  async deleteDepartment(id: string): Promise<void> {
    await api.delete(`/v1/departments/${id}`);
  }

  /**
   * Get employees in a department
   * GET /api/v1/departments/:id/employees
   */
  async getDepartmentEmployees(id: string): Promise<any[]> {
    const response = await api.get(`/v1/departments/${id}/employees`);
    return response.data.data.employees;
  }

  /**
   * Get department statistics
   * GET /api/v1/departments/stats
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    topLevel: number;
    totalEmployees: number;
    byDepartment: Array<{ name: string; employeeCount: number }>;
  }> {
    const response = await api.get('/v1/departments/stats');
    return response.data.data;
  }

  /**
   * Helper: Build flat list from hierarchy
   */
  flattenHierarchy(hierarchy: DepartmentHierarchy[]): Department[] {
    const result: Department[] = [];

    const flatten = (nodes: DepartmentHierarchy[]) => {
      nodes.forEach((node) => {
        result.push(node);
        if (node.children && node.children.length > 0) {
          flatten(node.children);
        }
      });
    };

    flatten(hierarchy);
    return result;
  }

  /**
   * Helper: Find department by ID in hierarchy
   */
  findInHierarchy(hierarchy: DepartmentHierarchy[], id: string): DepartmentHierarchy | null {
    for (const node of hierarchy) {
      if (node._id === id) return node;
      if (node.children && node.children.length > 0) {
        const found = this.findInHierarchy(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Helper: Get full path of department (e.g., "Engineering > Backend > API Team")
   */
  getDepartmentPath(departments: Department[], departmentId: string): string {
    const path: string[] = [];
    let current = departments.find((d) => d._id === departmentId);

    while (current) {
      path.unshift(current.name);
      if (typeof current.parent === 'object' && current.parent) {
        current = departments.find((d) => d._id === current.parent._id);
      } else if (typeof current.parent === 'string') {
        current = departments.find((d) => d._id === current.parent);
      } else {
        current = undefined;
      }
    }

    return path.join(' > ');
  }

  /**
   * Helper: Get all sub-departments (recursive)
   */
  getSubDepartments(departments: Department[], parentId: string): Department[] {
    const subs: Department[] = [];

    const findSubs = (pid: string) => {
      departments.forEach((dept) => {
        const parentIdStr =
          typeof dept.parent === 'object' && dept.parent ? dept.parent._id : dept.parent;
        if (parentIdStr === pid) {
          subs.push(dept);
          findSubs(dept._id);
        }
      });
    };

    findSubs(parentId);
    return subs;
  }

  /**
   * Helper: Check if department has sub-departments
   */
  hasSubDepartments(departments: Department[], departmentId: string): boolean {
    return departments.some((dept) => {
      const parentIdStr =
        typeof dept.parent === 'object' && dept.parent ? dept.parent._id : dept.parent;
      return parentIdStr === departmentId;
    });
  }

  /**
   * Helper: Get top-level departments (no parent)
   */
  getTopLevelDepartments(departments: Department[]): Department[] {
    return departments.filter((dept) => !dept.parent);
  }

  /**
   * Helper: Sort departments by name
   */
  sortByName(departments: Department[]): Department[] {
    return [...departments].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Helper: Filter departments by status
   */
  filterByStatus(departments: Department[], status: 'active' | 'inactive'): Department[] {
    return departments.filter((dept) => dept.status === status);
  }

  /**
   * Helper: Search departments by name or code
   */
  search(departments: Department[], query: string): Department[] {
    const q = query.toLowerCase().trim();
    if (!q) return departments;

    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(q) ||
        dept.code.toLowerCase().includes(q) ||
        dept.description?.toLowerCase().includes(q)
    );
  }
}

export default new DepartmentService();
