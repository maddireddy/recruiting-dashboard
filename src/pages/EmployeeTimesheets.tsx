import { useState, useMemo } from 'react';
import { Plus, Save, Send, Clock, Calendar, DollarSign, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { EmployeeTimesheet, TimesheetEntry, TimesheetStatus } from '../types/staffing';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// Mock data
const mockTimesheets: EmployeeTimesheet[] = [
  {
    id: '1',
    organizationId: 'org-1',
    employeeId: 'user-1',
    employeeName: 'Sarah Johnson',
    weekStartDate: '2025-12-23',
    weekEndDate: '2025-12-29',
    status: 'approved',
    entries: [
      {
        id: 'e1',
        timesheetId: '1',
        date: '2025-12-23',
        candidateId: 'cand-1',
        candidateName: 'John Doe',
        type: 'recruiting',
        description: 'Phone screening and interview preparation',
        hoursWorked: 3.5,
        billableHours: 3.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'e2',
        timesheetId: '1',
        date: '2025-12-24',
        type: 'administrative',
        description: 'Team meeting and planning session',
        hoursWorked: 2,
        billableHours: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    totalHours: 40,
    totalBillableHours: 35,
    submittedAt: '2025-12-29T17:00:00Z',
    approvedBy: 'manager-1',
    approvedAt: '2025-12-30T09:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    organizationId: 'org-1',
    employeeId: 'user-1',
    employeeName: 'Sarah Johnson',
    weekStartDate: '2025-12-30',
    weekEndDate: '2026-01-05',
    status: 'draft',
    entries: [],
    totalHours: 0,
    totalBillableHours: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EmployeeTimesheetsPage() {
  const [timesheets, setTimesheets] = useState<EmployeeTimesheet[]>(mockTimesheets);
  const [selectedTimesheet, setSelectedTimesheet] = useState<EmployeeTimesheet>(mockTimesheets[1]); // Current week
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<TimesheetEntry>>({
    date: new Date().toISOString().split('T')[0],
    type: 'recruiting',
    description: '',
    hoursWorked: 0,
    billableHours: 0,
  });

  const handleAddEntry = () => {
    if (!newEntry.description || !newEntry.hoursWorked) {
      toast.error('Please fill all required fields');
      return;
    }

    const entry: TimesheetEntry = {
      id: Date.now().toString(),
      timesheetId: selectedTimesheet.id,
      date: newEntry.date!,
      candidateId: newEntry.candidateId,
      candidateName: newEntry.candidateName,
      type: newEntry.type!,
      description: newEntry.description,
      hoursWorked: newEntry.hoursWorked,
      billableHours: newEntry.billableHours || newEntry.hoursWorked,
      notes: newEntry.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTimesheet = {
      ...selectedTimesheet,
      entries: [...selectedTimesheet.entries, entry],
      totalHours: selectedTimesheet.totalHours + entry.hoursWorked,
      totalBillableHours: selectedTimesheet.totalBillableHours + entry.billableHours,
    };

    setSelectedTimesheet(updatedTimesheet);
    setTimesheets(timesheets.map((t) => (t.id === updatedTimesheet.id ? updatedTimesheet : t)));
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      type: 'recruiting',
      description: '',
      hoursWorked: 0,
      billableHours: 0,
    });
    setShowAddEntry(false);
    toast.success('Entry added successfully');
  };

  const handleSubmitTimesheet = () => {
    if (selectedTimesheet.entries.length === 0) {
      toast.error('Cannot submit empty timesheet');
      return;
    }

    const updatedTimesheet = {
      ...selectedTimesheet,
      status: 'submitted' as TimesheetStatus,
      submittedAt: new Date().toISOString(),
    };

    setSelectedTimesheet(updatedTimesheet);
    setTimesheets(timesheets.map((t) => (t.id === updatedTimesheet.id ? updatedTimesheet : t)));
    toast.success('Timesheet submitted for approval');
  };

  const getStatusColor = (status: TimesheetStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/10 text-gray-500';
      case 'submitted':
        return 'bg-blue-500/10 text-blue-500';
      case 'approved':
        return 'bg-green-500/10 text-green-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      case 'paid':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusIcon = (status: TimesheetStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      case 'submitted':
        return <Clock size={16} />;
      default:
        return null;
    }
  };

  const groupEntriesByDate = useMemo(() => {
    const grouped: Record<string, TimesheetEntry[]> = {};
    selectedTimesheet.entries.forEach((entry) => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = [];
      }
      grouped[entry.date].push(entry);
    });
    return grouped;
  }, [selectedTimesheet.entries]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Timesheets"
        subtitle="Log your daily hours and track billable time"
        actions={
          <div className="flex gap-2">
            {selectedTimesheet.status === 'draft' && (
              <>
                <Button variant="subtle" onClick={() => toast.success('Timesheet saved')}>
                  <Save size={16} />
                  <span className="ml-2">Save Draft</span>
                </Button>
                <Button variant="primary" onClick={handleSubmitTimesheet}>
                  <Send size={16} />
                  <span className="ml-2">Submit for Approval</span>
                </Button>
              </>
            )}
            {selectedTimesheet.status === 'approved' && (
              <Button variant="subtle">
                <Download size={16} />
                <span className="ml-2">Download PDF</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Week Selector & Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Week of {new Date(selectedTimesheet.weekStartDate).toLocaleDateString()}</CardTitle>
                <p className="text-sm text-muted mt-1">
                  {selectedTimesheet.weekStartDate} to {selectedTimesheet.weekEndDate}
                </p>
              </div>
              <span className={clsx('chip flex items-center gap-2', getStatusColor(selectedTimesheet.status))}>
                {getStatusIcon(selectedTimesheet.status)}
                {selectedTimesheet.status.toUpperCase()}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)]">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Clock size={24} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total Hours</p>
                  <p className="text-2xl font-semibold">{selectedTimesheet.totalHours}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)]">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted">Billable Hours</p>
                  <p className="text-2xl font-semibold">{selectedTimesheet.totalBillableHours}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)]">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Calendar size={24} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted">Entries</p>
                  <p className="text-2xl font-semibold">{selectedTimesheet.entries.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Weeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timesheets.slice(0, 5).map((timesheet) => (
                <button
                  key={timesheet.id}
                  onClick={() => setSelectedTimesheet(timesheet)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg border transition',
                    selectedTimesheet.id === timesheet.id
                      ? 'border-[rgb(var(--app-primary))] bg-[rgba(var(--app-primary),0.05)]'
                      : 'border-[rgba(var(--app-border-subtle))] hover:border-[rgba(var(--app-primary),0.3)]'
                  )}
                >
                  <p className="text-sm font-medium">{new Date(timesheet.weekStartDate).toLocaleDateString()}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted">{timesheet.totalHours}h logged</p>
                    <span className={clsx('chip text-xs', getStatusColor(timesheet.status))}>
                      {timesheet.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Time Entries</CardTitle>
            {selectedTimesheet.status === 'draft' && (
              <Button variant="primary" size="sm" onClick={() => setShowAddEntry(true)}>
                <Plus size={16} />
                <span className="ml-2">Add Entry</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showAddEntry && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted),0.3)]"
            >
              <h4 className="font-semibold mb-4">New Time Entry</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="input w-full"
                    min={selectedTimesheet.weekStartDate}
                    max={selectedTimesheet.weekEndDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as any })}
                    className="input w-full"
                  >
                    <option value="recruiting">Recruiting</option>
                    <option value="administrative">Administrative</option>
                    <option value="training">Training</option>
                    <option value="meeting">Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hours Worked *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={newEntry.hoursWorked}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        hoursWorked: parseFloat(e.target.value),
                        billableHours: newEntry.type !== 'administrative' ? parseFloat(e.target.value) : 0,
                      })
                    }
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Billable Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={newEntry.hoursWorked || 24}
                    value={newEntry.billableHours}
                    onChange={(e) => setNewEntry({ ...newEntry, billableHours: parseFloat(e.target.value) })}
                    className="input w-full"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  className="input w-full min-h-[80px]"
                  placeholder="Describe what you worked on..."
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="primary" onClick={handleAddEntry}>
                  Add Entry
                </Button>
                <Button variant="subtle" onClick={() => setShowAddEntry(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Entries Table */}
          <div className="space-y-4">
            {Object.entries(groupEntriesByDate).length > 0 ? (
              Object.entries(groupEntriesByDate).map(([date, entries]) => (
                <div key={date}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                    <span className="text-sm text-muted font-normal">
                      ({entries.reduce((sum, e) => sum + e.hoursWorked, 0)}h total)
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 rounded-lg border border-[rgba(var(--app-border-subtle))] hover:border-[rgba(var(--app-primary),0.3)] transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="chip text-xs bg-blue-500/10 text-blue-500">{entry.type}</span>
                              {entry.candidateName && (
                                <span className="text-sm text-muted">→ {entry.candidateName}</span>
                              )}
                            </div>
                            <p className="text-sm">{entry.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{entry.hoursWorked}h</p>
                            <p className="text-xs text-muted">{entry.billableHours}h billable</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>No time entries yet</p>
                <p className="text-sm mt-2">Click "Add Entry" to log your hours</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
