import { useQuery } from '@tanstack/react-query';
import { Building2, Users, UserCheck, Mail, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import employeeService from '../../services/employee.service';
import departmentService from '../../services/department.service';
import { useMemo } from 'react';

export function OrganizationalStats() {
  // Fetch employee statistics
  const employeeStatsQuery = useQuery({
    queryKey: ['employee-stats'],
    queryFn: () => employeeService.getStats(),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch department statistics
  const departmentStatsQuery = useQuery({
    queryKey: ['department-stats'],
    queryFn: () => departmentService.getStats(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(() => {
    const empStats = employeeStatsQuery.data;
    const deptStats = departmentStatsQuery.data;

    return [
      {
        label: 'Total Employees',
        value: empStats?.total || 0,
        detail: `${empStats?.active || 0} active`,
        icon: Users,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
      },
      {
        label: 'Active Departments',
        value: deptStats?.active || 0,
        detail: `${deptStats?.topLevel || 0} top-level`,
        icon: Building2,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
      },
      {
        label: 'New Hires',
        value: empStats?.active || 0,
        detail: 'Last 30 days',
        icon: UserCheck,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
      },
      {
        label: 'Email Accounts',
        value: empStats?.total || 0,
        detail: 'Provisioned',
        icon: Mail,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
      },
    ];
  }, [employeeStatsQuery.data, departmentStatsQuery.data]);

  const topDepartments = useMemo(() => {
    const deptStats = departmentStatsQuery.data;
    if (!deptStats?.byDepartment) return [];

    return deptStats.byDepartment
      .sort((a, b) => b.employeeCount - a.employeeCount)
      .slice(0, 5);
  }, [departmentStatsQuery.data]);

  const isLoading = employeeStatsQuery.isLoading || departmentStatsQuery.isLoading;
  const hasError = employeeStatsQuery.error || departmentStatsQuery.error;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p className="text-sm">Failed to load organizational stats</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-none bg-[rgba(var(--app-surface-elevated),0.95)]">
      {/* Gradient Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(168,85,247,0.15),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(59,130,246,0.15),transparent_50%)]" />

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Organization</p>
            <CardTitle className="text-2xl mt-2">Team Overview</CardTitle>
            <CardDescription className="mt-1">
              Your company structure and employee metrics at a glance
            </CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted">
            <TrendingUp size={14} className="text-green-400" />
            <span>Growing steadily</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted),0.65)] p-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-medium text-[rgb(var(--app-text-primary))]">
                  {stat.label}
                </p>
                <p className="text-xs text-muted mt-0.5">{stat.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Top Departments */}
        {topDepartments.length > 0 && (
          <div className="rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted),0.65)] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">
                Largest Departments
              </h4>
              <span className="text-xs text-muted">By headcount</span>
            </div>
            <div className="space-y-3">
              {topDepartments.map((dept, index) => {
                const total = departmentStatsQuery.data?.totalEmployees || 1;
                const percentage = ((dept.employeeCount / total) * 100).toFixed(1);

                return (
                  <div key={dept.name} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[rgb(var(--app-text-primary))] truncate">
                          {dept.name}
                        </p>
                        <p className="text-xs text-muted">{percentage}% of workforce</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[rgb(var(--app-text-primary))]">
                        {dept.employeeCount}
                      </p>
                      <p className="text-xs text-muted">employees</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
