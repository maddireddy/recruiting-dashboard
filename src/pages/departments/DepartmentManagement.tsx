import { useState, useEffect } from 'react';
import { Plus, Building2, Users, TrendingUp, Loader2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/card';
import DepartmentCard from '../../components/departments/DepartmentCard';
import DepartmentModal from '../../components/departments/DepartmentModal';
import DepartmentTree from '../../components/departments/DepartmentTree';
import departmentService, { Department } from '../../services/department.service';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'tree'>('cards');
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Fetch departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (err: any) {
      console.error('Failed to load departments:', err);
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setShowModal(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const handleModalClose = (shouldRefresh = false) => {
    setShowModal(false);
    setSelectedDepartment(null);
    if (shouldRefresh) {
      loadDepartments();
    }
  };

  // Calculate stats
  const totalDepartments = departments.length;
  const totalEmployees = departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0);
  const topLevelDepartments = departments.filter(d => !d.parent).length;

  // Get only top-level departments for cards view
  const topLevelDepts = departments.filter(d => !d.parent);

  // Convert Department type to match component props
  const mapDepartmentForComponent = (dept: Department) => ({
    id: dept._id,
    name: dept.name,
    code: dept.code,
    description: dept.description || '',
    head: dept.head && typeof dept.head === 'object' ? {
      id: dept.head._id,
      name: `${dept.head.personalInfo.firstName} ${dept.head.personalInfo.lastName}`,
      employeeId: dept.head.employeeId,
    } : null,
    employeeCount: dept.employeeCount || 0,
    parent: typeof dept.parent === 'object' && dept.parent ? dept.parent._id : (dept.parent || null),
    status: dept.status,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Department Management"
          subtitle="Organize your company structure and team hierarchy"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p className="text-lg font-semibold mb-2">Error Loading Departments</p>
              <p className="text-sm text-muted mb-4">{error}</p>
              <Button onClick={loadDepartments}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        subtitle="Organize your company structure and team hierarchy"
        actions={
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'cards' ? 'primary' : 'subtle'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Cards View
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'primary' : 'subtle'}
              size="sm"
              onClick={() => setViewMode('tree')}
            >
              Tree View
            </Button>
            <Button variant="primary" onClick={handleCreateDepartment}>
              <Plus size={18} />
              Add Department
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Departments</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {totalDepartments}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Building2 size={24} className="text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Employees</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {totalEmployees}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users size={24} className="text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Top-Level Depts</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {topLevelDepartments}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp size={24} className="text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department View */}
      {viewMode === 'cards' ? (
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))] mb-4">
            Departments
          </h3>
          {departments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Building2 size={48} className="mx-auto text-muted mb-4" />
                  <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                    No Departments Yet
                  </h3>
                  <p className="text-sm text-muted mb-4">
                    Get started by creating your first department
                  </p>
                  <Button variant="primary" onClick={handleCreateDepartment}>
                    <Plus size={18} />
                    Add Department
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topLevelDepts.map((department) => {
                const mappedDept = mapDepartmentForComponent(department);
                const subDepartments = departments
                  .filter(d => {
                    const parentId = typeof d.parent === 'object' && d.parent ? d.parent._id : d.parent;
                    return parentId === department._id;
                  })
                  .map(mapDepartmentForComponent);
                return (
                  <DepartmentCard
                    key={department._id}
                    department={mappedDept}
                    subDepartments={subDepartments}
                    onEdit={() => handleEditDepartment(department)}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <DepartmentTree
          departments={departments.map(mapDepartmentForComponent)}
          onEdit={(dept) => {
            const original = departments.find(d => d._id === dept.id);
            if (original) handleEditDepartment(original);
          }}
        />
      )}

      {/* Department Modal */}
      {showModal && (
        <DepartmentModal
          department={selectedDepartment ? mapDepartmentForComponent(selectedDepartment) : null}
          departments={departments.map(mapDepartmentForComponent)}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
