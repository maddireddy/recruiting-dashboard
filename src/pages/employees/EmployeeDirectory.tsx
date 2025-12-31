import { useState } from 'react';
import {  Plus, Search, Filter, Download, Upload, Users, Badge, Mail } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/card';
import EmployeeCard from '../../components/employees/EmployeeCard';
import EmployeeModal from '../../components/employees/EmployeeModal';

// Mock employee data
const MOCK_EMPLOYEES = [
  {
    id: '1',
    employeeId: 'EMP-0001',
    firstName: 'John',
    lastName: 'Admin',
    email: 'john.admin@acme-corp.com',
    title: 'VP of Human Resources',
    department: 'HR',
    photo: null,
    status: 'active',
    joinDate: '2024-01-15',
    role: 'ADMIN',
  },
  {
    id: '2',
    employeeId: 'EMP-0002',
    firstName: 'Sarah',
    lastName: 'Recruiter',
    email: 'sarah.recruiter@acme-corp.com',
    title: 'Senior Recruiter',
    department: 'HR',
    photo: null,
    status: 'active',
    joinDate: '2024-02-01',
    role: 'RECRUITER',
  },
  {
    id: '3',
    employeeId: 'EMP-0003',
    firstName: 'Mike',
    lastName: 'Manager',
    email: 'mike.manager@acme-corp.com',
    title: 'Engineering Manager',
    department: 'Engineering',
    photo: null,
    status: 'active',
    joinDate: '2024-01-20',
    role: 'HIRING_MANAGER',
  },
];

const DEPARTMENTS = ['All Departments', 'HR', 'Engineering', 'Sales', 'Marketing', 'Finance'];
const STATUSES = ['All Status', 'active', 'inactive', 'on-leave'];

export default function EmployeeDirectory() {
  const [employees] = useState(MOCK_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<typeof MOCK_EMPLOYEES[0] | null>(null);

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === 'All Departments' || emp.department === selectedDepartment;

    const matchesStatus =
      selectedStatus === 'All Status' || emp.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee: typeof MOCK_EMPLOYEES[0]) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        subtitle="Manage your organization's employees, IDs, emails, and badges"
        actions={
          <div className="flex gap-2">
            <Button variant="subtle">
              <Upload size={18} />
              Import Employees
            </Button>
            <Button variant="subtle">
              <Download size={18} />
              Export
            </Button>
            <Button variant="primary" onClick={handleCreateEmployee}>
              <Plus size={18} />
              Add Employee
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Employees</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {employees.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users size={24} className="text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Active</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {employees.filter((e) => e.status === 'active').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Badge size={24} className="text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Departments</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {new Set(employees.map((e) => e.department)).size}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Filter size={24} className="text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Emails Provisioned</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {employees.filter((e) => e.email).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Mail size={24} className="text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  size={18}
                />
                <Input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[rgba(var(--app-surface-muted))] flex items-center justify-center">
                <Users size={32} className="text-muted" />
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--app-text-primary))]">
                  No employees found
                </p>
                <p className="text-sm text-muted mt-1">
                  {searchTerm || selectedDepartment !== 'All Departments' || selectedStatus !== 'All Status'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first employee'}
                </p>
              </div>
              {!searchTerm && selectedDepartment === 'All Departments' && selectedStatus === 'All Status' && (
                <Button variant="primary" size="sm" onClick={handleCreateEmployee}>
                  <Plus size={14} className="mr-1" />
                  Add Employee
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={() => handleEditEmployee(employee)}
            />
          ))}
        </div>
      )}

      {/* Employee Modal */}
      {showModal && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
