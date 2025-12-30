import { useState } from 'react';
import { Plus, Calendar, Clock, Globe, Link as LinkIcon, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import type { AvailabilityLinkResponse } from '../api/schedulingApi';

// Mock data for demonstration
const mockSchedulingLinks: AvailabilityLinkResponse[] = [
  {
    id: '1',
    linkId: 'tech-screen-30min',
    publicUrl: 'https://scheduling.example.com/tech-screen-30min',
    title: 'Technical Screening Call',
    duration: 30,
    timezone: 'America/New_York',
    isActive: true,
    totalBookings: 24,
    createdAt: '2024-12-15T10:00:00Z',
  },
  {
    id: '2',
    linkId: 'cultural-fit-45min',
    publicUrl: 'https://scheduling.example.com/cultural-fit-45min',
    title: 'Culture Fit Interview',
    duration: 45,
    timezone: 'America/New_York',
    isActive: true,
    totalBookings: 18,
    createdAt: '2024-12-10T14:00:00Z',
  },
  {
    id: '3',
    linkId: 'final-round-60min',
    publicUrl: 'https://scheduling.example.com/final-round-60min',
    title: 'Final Round Interview',
    duration: 60,
    timezone: 'America/New_York',
    isActive: false,
    totalBookings: 12,
    createdAt: '2024-12-05T09:00:00Z',
  },
];

export default function SchedulingPage() {
  const [links] = useState<AvailabilityLinkResponse[]>(mockSchedulingLinks);
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<AvailabilityLinkResponse | null>(null);

  const activeLinks = links.filter(link => link.isActive).length;
  const totalBookings = links.reduce((sum, link) => sum + link.totalBookings, 0);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Scheduling link copied to clipboard!');
  };

  const handleToggleActive = (_id: string, isActive: boolean) => {
    toast.success(isActive ? 'Scheduling link activated' : 'Scheduling link deactivated');
  };

  const handleDelete = (_id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    toast.success('Scheduling link deleted successfully');
  };

  return (
    <div className="space-y-10 px-6 py-8">
      <PageHeader
        title="Interview Scheduling"
        subtitle="Create scheduling links with your availability for candidates to book interviews directly"
        actions={
          <Button variant="primary" size="md" onClick={() => { setSelectedLink(null); setShowModal(true); }}>
            <Plus size={16} />
            <span className="ml-2">Create Scheduling Link</span>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
              <LinkIcon className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Active Links</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{activeLinks}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
              <Calendar className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Bookings</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15">
              <Clock className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Links</p>
              <p className="text-2xl font-semibold text-[rgb(var(--app-text-primary))]">{links.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {links.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <Calendar size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No scheduling links yet</h3>
            <p className="max-w-sm text-sm text-muted">
              Create scheduling links to let candidates book interviews at times that work for both of you.
            </p>
          </div>
          <button onClick={() => { setSelectedLink(null); setShowModal(true); }} type="button" className="btn-primary">
            <Plus size={16} />
            Create your first scheduling link
          </button>
        </div>
      )}

      {/* Scheduling Links List */}
      {links.length > 0 && (
        <div className="grid gap-4">
          {links.map((link) => (
            <article key={link.id} className="card border-transparent transition hover:border-[rgba(var(--app-primary-from),0.45)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--app-primary-from),0.15)]">
                    <Calendar className="text-[rgb(var(--app-primary-from))]" size={24} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{link.title}</h3>
                        {link.isActive ? (
                          <span className="chip bg-[rgba(34,197,94,0.16)] text-[rgb(34,197,94)] border border-[rgba(34,197,94,0.4)] text-xs">
                            Active
                          </span>
                        ) : (
                          <span className="chip bg-[rgba(148,163,184,0.16)] text-[rgb(148,163,184)] border border-[rgba(148,163,184,0.4)] text-xs">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{link.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe size={14} />
                          <span>{link.timezone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{link.totalBookings} bookings</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] px-3 py-2 font-mono text-sm text-[rgb(var(--app-text-secondary))]">
                        {link.publicUrl}
                      </div>
                      <button
                        onClick={() => handleCopyLink(link.publicUrl)}
                        type="button"
                        className="btn-muted px-3 py-2 text-sm whitespace-nowrap"
                      >
                        <LinkIcon size={16} />
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(link.id, !link.isActive)}
                    type="button"
                    className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-elevated))] px-3 py-2 text-sm text-[rgb(var(--app-text-primary))] transition hover:border-[rgba(var(--app-primary-from),0.4)]"
                    title={link.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {link.isActive ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLink(link);
                      setShowModal(true);
                    }}
                    type="button"
                    className="btn-muted px-3 py-2 text-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(link.id, link.title)}
                    type="button"
                    className="rounded-lg border border-transparent px-3 py-2 text-sm text-red-400 transition hover:border-red-400/40 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-xl border border-[rgba(var(--app-primary-from),0.2)] bg-[rgba(var(--app-primary-from),0.05)] p-6">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 text-[rgb(var(--app-primary-from))]" />
          <div className="flex-1">
            <h3 className="font-semibold text-[rgb(var(--app-text-primary))] mb-2">How Interview Scheduling Works</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>• <strong>Create scheduling links</strong> with your available time slots and interview duration</li>
              <li>• <strong>Share links with candidates</strong> via email or job postings</li>
              <li>• <strong>Candidates book directly</strong> from your available slots without back-and-forth</li>
              <li>• <strong>Automatic calendar sync</strong> adds confirmed interviews to your calendar</li>
              <li>• <strong>Email confirmations</strong> sent to both you and the candidate</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal Placeholder */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="card w-full max-w-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {selectedLink ? 'Edit Link' : 'Create Link'}
                </p>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Scheduling Configuration</h2>
              </div>
              <button onClick={() => { setShowModal(false); setSelectedLink(null); }} type="button" className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                  Interview Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={selectedLink?.title || ''}
                  className="input w-full"
                  placeholder="e.g., Technical Screening Call"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                    Duration (minutes) <span className="text-red-400">*</span>
                  </label>
                  <select defaultValue={selectedLink?.duration || 30} className="input w-full">
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-1">
                    Timezone <span className="text-red-400">*</span>
                  </label>
                  <select defaultValue={selectedLink?.timezone || 'America/New_York'} className="input w-full">
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
              </div>

              <div className="rounded-lg border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted))] p-4">
                <p className="text-sm font-medium text-[rgb(var(--app-text-primary))] mb-3">Availability Configuration</p>
                <p className="text-sm text-muted">
                  Configure your weekly availability, date ranges, and buffer time between meetings in the full scheduling setup.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[rgba(var(--app-border-subtle))]">
              <button onClick={() => { setShowModal(false); setSelectedLink(null); }} type="button" className="btn-muted">
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={() => { toast.success(selectedLink ? 'Link updated!' : 'Link created!'); setShowModal(false); setSelectedLink(null); }}>
                {selectedLink ? 'Update Link' : 'Create Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
