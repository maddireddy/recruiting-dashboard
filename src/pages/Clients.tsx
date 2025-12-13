import { useMemo, useState } from 'react';
import {
  Plus,
  Building2,
  Globe2,
  Phone,
  MapPin,
  UserCheck,
  Users,
} from 'lucide-react';
import ClientModal from '../components/clients/ClientModal';
import StatsCard from '../components/dashboard/StatsCard';
import { clientService } from '../services/client.service';
import type { Client } from '../types/client';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';

const STATUS_META: Record<string, { label: string; tone: string }> = {
  ACTIVE: { label: 'Active', tone: 'chip-active' },
  PROSPECT: { label: 'Prospect', tone: 'surface-muted' },
  INACTIVE: { label: 'Inactive', tone: 'surface-muted' },
};

const formatLocation = (client: Client) => {
  const parts = [client.city, client.state, client.country].filter(Boolean);
  return parts.join(', ');
};

export default function ClientsPage() {
  const [modal, setModal] = useState<{mode: 'create' | 'edit' | 'none', client: Client | null}>({mode: 'none', client: null});

  // Get tenant ID from localStorage
  const tenantId = localStorage.getItem('tenantId') || undefined;

  const clientsQ = useList<Client[]>('clients', (tid) => clientService.getAll(0, 100, tid), tenantId);
  const createM = useCreate('clients', clientService.create, tenantId);
  const updateM = useUpdate<Partial<Client>, Client>('clients', (id, data, tid) => clientService.update(id, data, tid), tenantId);
  const deleteM = useDelete('clients', clientService.delete, tenantId);

  const handleSave = (data: Partial<Client>) => {
    if (modal.mode === 'edit' && modal.client) {
      updateM.mutate({ id: modal.client.id!, data });
    } else {
      createM.mutate(data);
    }
  };
  const handleCloseModal = () => setModal({mode:'none', client:null});

  const clients = useMemo(() => clientsQ.data || [], [clientsQ.data]);
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => (c.status || '').toUpperCase() === 'ACTIVE').length;
  const prospectClients = clients.filter((c) => (c.status || '').toUpperCase() === 'PROSPECT').length;

  const summaryCards = useMemo(
    () => [
      {
        title: 'Total Clients',
        value: totalClients,
        icon: <Building2 size={18} className="text-primary-400" />,
      },
      {
        title: 'Active Accounts',
        value: activeClients,
        icon: <UserCheck size={18} className="text-green-400" />,
      },
      {
        title: 'Prospects',
        value: prospectClients,
        icon: <Users size={18} className="text-amber-400" />,
      },
    ],
    [activeClients, prospectClients, totalClients]
  );

  return (
    <div className="space-y-10 px-6 py-8">
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--app-border-subtle))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <Building2 size={14} />
            Account Hub
          </div>
          <h1 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">Clients</h1>
          <p className="max-w-2xl text-sm text-muted">
            Maintain client relationships, share insights with the delivery team, and keep account health transparent across the bench.
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create', client: null })}
          type="button"
          className="btn-primary"
        >
          <Plus size={18} />
          New client
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </section>

      {clientsQ.isLoading && (
        <div className="card space-y-3">
          <div className="h-4 w-48 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-[rgba(var(--app-border-subtle))]" />
        </div>
      )}

      {!clientsQ.isLoading && clientsQ.error && (
        <div className="card border-red-400/40 bg-red-500/5 text-red-300">
          Unable to load clients. Please try again shortly.
        </div>
      )}

      {!clientsQ.isLoading && !clientsQ.error && clients.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[rgba(var(--app-border-subtle))] text-muted">
            <Building2 size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No clients yet</h3>
            <p className="max-w-sm text-sm text-muted">Add your first client to start tracking opportunities, submissions, and account health.</p>
          </div>
          <button onClick={() => setModal({ mode: 'create', client: null })} type="button" className="btn-primary">
            <Plus size={16} />
            Add your first client
          </button>
        </div>
      )}

      {clients.length > 0 && (
        <section className="grid gap-4">
          {clients.map((cl: Client) => {
            const statusKey = (cl.status || 'ACTIVE').toUpperCase();
            const status = STATUS_META[statusKey] ?? STATUS_META.ACTIVE;
            return (
              <article
                key={cl.id}
                className="card flex flex-col gap-4 border-transparent transition hover:border-[rgba(var(--app-primary-from),0.45)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">{cl.companyName}</h3>
                      <span className={`chip ${status.tone}`}>{status.label}</span>
                      {cl.industry && <span className="chip surface-muted text-xs">{cl.industry}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                      {cl.website && (
                        <span className="inline-flex items-center gap-2">
                          <Globe2 size={14} />
                          <a href={cl.website} className="text-[rgb(var(--app-text-primary))] underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                            {cl.website.replace(/^https?:\/\//, '')}
                          </a>
                        </span>
                      )}
                      {formatLocation(cl) && (
                        <span className="inline-flex items-center gap-2">
                          <MapPin size={14} />
                          {formatLocation(cl)}
                        </span>
                      )}
                      {cl.accountManager && (
                        <span className="inline-flex items-center gap-2">
                          <UserCheck size={14} />
                          {cl.accountManager}
                        </span>
                      )}
                    </div>
                    {cl.notes && <p className="text-sm text-muted">{cl.notes}</p>}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      onClick={() => setModal({ mode: 'edit', client: cl })}
                      type="button"
                      className="btn-muted px-3 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this client?')) {
                          deleteM.mutate(cl.id!);
                        }
                      }}
                      type="button"
                      className="btn-muted px-3 py-2 text-sm text-red-400 hover:border-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {cl.contacts && cl.contacts.length > 0 && (
                  <div className="rounded-2xl border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Key contacts</p>
                    <div className="mt-3 grid gap-3 text-sm text-[rgb(var(--app-text-primary))] md:grid-cols-2">
                      {cl.contacts.map((contact, index) => (
                        <div key={`${contact.email}-${index}`} className="flex flex-col gap-1">
                          <span className="font-semibold">{contact.name || 'Unnamed contact'}</span>
                          <span className="text-muted">{contact.title || '—'}</span>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                            {contact.email && <span>{contact.email}</span>}
                            {contact.phone && <span className="inline-flex items-center gap-1"><Phone size={12} />{contact.phone}</span>}
                            {contact.isPrimary && <span className="chip chip-active text-xs">Primary</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {(modal.mode === 'create' || modal.mode === 'edit') && (
        <ClientModal
          client={modal.client}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}