import { useState } from 'react';
import { Plus, Send, CheckCircle, AlertCircle, Clock, DollarSign, FileText } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ContractorTimesheet, ContractorTimesheetEntry, ContractorTimesheetStatus } from '../types/staffing';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// Mock data for contractors (placed candidates)
const mockTimesheets: ContractorTimesheet[] = [
  {
    id: '1',
    organizationId: 'org-1',
    candidateId: 'contractor-1',
    candidateName: 'Michael Rodriguez',
    clientId: 'client-1',
    clientName: 'Tech Corp Inc',
    placementId: 'place-1',
    weekStartDate: '2025-12-23',
    weekEndDate: '2025-12-29',
    status: 'client_review',
    entries: [
      {
        id: 'ce1',
        date: '2025-12-23',
        hoursWorked: 8,
        overtimeHours: 0,
        breakTime: 1,
        description: 'Software development - Feature implementation',
        clientApproved: false,
      },
      {
        id: 'ce2',
        date: '2025-12-24',
        hoursWorked: 8,
        overtimeHours: 2,
        breakTime: 1,
        description: 'Bug fixes and code review',
        clientApproved: false,
      },
    ],
    totalHours: 40,
    totalOvertimeHours: 4,
    hourlyRate: 75,
    overtimeRate: 112.5,
    totalAmount: 3450,
    submittedAt: '2025-12-30T17:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    organizationId: 'org-1',
    candidateId: 'contractor-2',
    candidateName: 'Lisa Anderson',
    clientId: 'client-2',
    clientName: 'HealthCare Systems',
    placementId: 'place-2',
    weekStartDate: '2025-12-30',
    weekEndDate: '2026-01-05',
    status: 'pending',
    entries: [],
    totalHours: 0,
    totalOvertimeHours: 0,
    hourlyRate: 65,
    overtimeRate: 97.5,
    totalAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ContractorTimesheetsPage() {
  const [timesheets, setTimesheets] = useState<ContractorTimesheet[]>(mockTimesheets);
  const [selectedTimesheet, setSelectedTimesheet] = useState<ContractorTimesheet>(mockTimesheets[1]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<ContractorTimesheetEntry>>({
    date: new Date().toISOString().split('T')[0],
    hoursWorked: 8,
    overtimeHours: 0,
    breakTime: 1,
    description: '',
  });

  const handleAddEntry = () => {
    if (!newEntry.description || !newEntry.hoursWorked) {
      toast.error('Please fill all required fields');
      return;
    }

    const entry: ContractorTimesheetEntry = {
      id: Date.now().toString(),
      date: newEntry.date!,
      hoursWorked: newEntry.hoursWorked!,
      overtimeHours: newEntry.overtimeHours || 0,
      breakTime: newEntry.breakTime || 0,
      description: newEntry.description!,
      clientApproved: false,
    };

    const regularHours = selectedTimesheet.totalHours + entry.hoursWorked;
    const overtimeHours = selectedTimesheet.totalOvertimeHours + entry.overtimeHours;
    const totalAmount =
      regularHours * selectedTimesheet.hourlyRate + overtimeHours * selectedTimesheet.overtimeRate;

    const updatedTimesheet = {
      ...selectedTimesheet,
      entries: [...selectedTimesheet.entries, entry],
      totalHours: regularHours,
      totalOvertimeHours: overtimeHours,
      totalAmount: totalAmount,
    };

    setSelectedTimesheet(updatedTimesheet);
    setTimesheets(timesheets.map((t) => (t.id === updatedTimesheet.id ? updatedTimesheet : t)));
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      hoursWorked: 8,
      overtimeHours: 0,
      breakTime: 1,
      description: '',
    });
    setShowAddEntry(false);
    toast.success('Hours logged successfully');
  };

  const handleSubmitTimesheet = () => {
    if (selectedTimesheet.entries.length === 0) {
      toast.error('Cannot submit empty timesheet');
      return;
    }

    const updatedTimesheet = {
      ...selectedTimesheet,
      status: 'submitted' as ContractorTimesheetStatus,
      submittedAt: new Date().toISOString(),
    };

    setSelectedTimesheet(updatedTimesheet);
    setTimesheets(timesheets.map((t) => (t.id === updatedTimesheet.id ? updatedTimesheet : t)));
    toast.success('Timesheet submitted to client for approval');
  };

  const getStatusColor = (status: ContractorTimesheetStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-500/10 text-gray-500';
      case 'submitted':
        return 'bg-blue-500/10 text-blue-500';
      case 'client_review':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'approved':
        return 'bg-green-500/10 text-green-500';
      case 'disputed':
        return 'bg-red-500/10 text-red-500';
      case 'invoiced':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusIcon = (status: ContractorTimesheetStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} />;
      case 'disputed':
        return <AlertCircle size={16} />;
      case 'client_review':
      case 'submitted':
        return <Clock size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contractor Timesheets"
        subtitle="Manage weekly timesheets for placed contractors"
        actions={
          selectedTimesheet.status === 'pending' && (
            <Button variant="primary" onClick={handleSubmitTimesheet}>
              <Send size={16} />
              <span className="ml-2">Submit to Client</span>
            </Button>
          )
        }
      />

      {/* Active Placements Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {timesheets.map((timesheet) => (
          <Card
            key={timesheet.id}
            className={clsx(
              'cursor-pointer transition',
              selectedTimesheet.id === timesheet.id && 'ring-2 ring-[rgb(var(--app-primary))]'
            )}
            onClick={() => setSelectedTimesheet(timesheet)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{timesheet.candidateName}</CardTitle>
                  <p className="text-sm text-muted mt-1">{timesheet.clientName}</p>
                </div>
                <span className={clsx('chip text-xs flex items-center gap-1', getStatusColor(timesheet.status))}>
                  {getStatusIcon(timesheet.status)}
                  {timesheet.status.replace('_', ' ')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Week Ending</span>
                  <span className="font-medium">{new Date(timesheet.weekEndDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Total Hours</span>
                  <span className="font-medium">{timesheet.totalHours}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Amount Due</span>
                  <span className="font-semibold text-green-500">${timesheet.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timesheet Details */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedTimesheet.candidateName} - Week Ending{' '}
                  {new Date(selectedTimesheet.weekEndDate).toLocaleDateString()}
                </CardTitle>
                <p className="text-sm text-muted mt-1">Client: {selectedTimesheet.clientName}</p>
              </div>
              {selectedTimesheet.status === 'pending' && (
                <Button variant="primary" size="sm" onClick={() => setShowAddEntry(true)}>
                  <Plus size={16} />
                  <span className="ml-2">Log Hours</span>
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
                <h4 className="font-semibold mb-4">Log Daily Hours</h4>
                <div className="grid gap-4 md:grid-cols-2">
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
                    <label className="block text-sm font-medium mb-1">Regular Hours *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={newEntry.hoursWorked}
                      onChange={(e) => setNewEntry({ ...newEntry, hoursWorked: parseFloat(e.target.value) })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Overtime Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="12"
                      value={newEntry.overtimeHours}
                      onChange={(e) => setNewEntry({ ...newEntry, overtimeHours: parseFloat(e.target.value) })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Break Time (hours)</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="2"
                      value={newEntry.breakTime}
                      onChange={(e) => setNewEntry({ ...newEntry, breakTime: parseFloat(e.target.value) })}
                      className="input w-full"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Work Description *</label>
                  <textarea
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    className="input w-full min-h-[80px]"
                    placeholder="Describe the work performed..."
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="primary" onClick={handleAddEntry}>
                    Add Hours
                  </Button>
                  <Button variant="subtle" onClick={() => setShowAddEntry(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Time Entries */}
            <div className="space-y-3">
              {selectedTimesheet.entries.length > 0 ? (
                selectedTimesheet.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg border border-[rgba(var(--app-border-subtle))]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{new Date(entry.date).toLocaleDateString()}</span>
                        {entry.clientApproved && (
                          <span className="chip text-xs bg-green-500/10 text-green-500 flex items-center gap-1">
                            <CheckCircle size={12} />
                            Client Approved
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{entry.hoursWorked}h</p>
                        {entry.overtimeHours > 0 && (
                          <p className="text-xs text-orange-500">+{entry.overtimeHours}h OT</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{entry.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                      <span>Break: {entry.breakTime}h</span>
                      <span>
                        Net: {entry.hoursWorked - entry.breakTime + entry.overtimeHours}h
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No hours logged yet</p>
                  <p className="text-sm mt-2">Click "Log Hours" to add your daily hours</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary & Rates */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Regular Hours</span>
                  <span className="font-medium">{selectedTimesheet.totalHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Hourly Rate</span>
                  <span className="font-medium">${selectedTimesheet.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Regular Pay</span>
                  <span className="font-medium">
                    ${(selectedTimesheet.totalHours * selectedTimesheet.hourlyRate).toLocaleString()}
                  </span>
                </div>

                {selectedTimesheet.totalOvertimeHours > 0 && (
                  <>
                    <div className="border-t border-[rgba(var(--app-border-subtle))] pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Overtime Hours</span>
                        <span className="font-medium">{selectedTimesheet.totalOvertimeHours}h</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted">Overtime Rate (1.5x)</span>
                      <span className="font-medium">${selectedTimesheet.overtimeRate}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted">Overtime Pay</span>
                      <span className="font-medium text-orange-500">
                        ${(selectedTimesheet.totalOvertimeHours * selectedTimesheet.overtimeRate).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}

                <div className="border-t border-[rgba(var(--app-border-subtle))] pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-green-500">
                      ${selectedTimesheet.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status & Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)]">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    {getStatusIcon(selectedTimesheet.status) || <FileText size={20} className="text-blue-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{selectedTimesheet.status.replace('_', ' ')}</p>
                    {selectedTimesheet.submittedAt && (
                      <p className="text-xs text-muted">
                        Submitted {new Date(selectedTimesheet.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {selectedTimesheet.invoiceId && (
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <p className="text-sm font-medium text-purple-600">Invoice Generated</p>
                    <p className="text-xs text-muted mt-1">Invoice #{selectedTimesheet.invoiceId}</p>
                  </div>
                )}

                {selectedTimesheet.notes && (
                  <div className="p-3 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)]">
                    <p className="text-xs font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted">{selectedTimesheet.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
