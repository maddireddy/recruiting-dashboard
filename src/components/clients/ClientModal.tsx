import { useEffect, useState, type ChangeEvent } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { Client, ClientContact } from '../../types/client';
import Field from '../../components/ui/Field';
import { z } from 'zod';

interface ClientModalProps {
  client: Client | null;
  onSave: (client: Partial<Client>) => void;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function ClientModal({ client, onSave, onClose }: ClientModalProps) {
  const [form, setForm] = useState<Client>({
    companyName: '',
    industry: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    contacts: [],
    accountManager: '',
    status: 'ACTIVE',
    notes: '',
  });
  const [errors, setErrors] = useState<{ companyName?: string; contacts?: { email?: string }[] }>({});

  const schema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    industry: z.string().optional(),
    website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    accountManager: z.string().optional(),
    status: z.enum(['ACTIVE', 'PROSPECT', 'INACTIVE']).optional(),
    notes: z.string().optional(),
    contacts: z.array(
      z.object({
        name: z.string().optional(),
        title: z.string().optional(),
        email: z.string().email('Invalid email').optional().or(z.literal('')),
        phone: z.string().optional(),
        isPrimary: z.boolean().optional(),
      })
    ),
  });

  useEffect(() => {
    if (client) {
      setForm({
        ...client,
        contacts: client.contacts || [],
        status: client.status || 'ACTIVE',
      });
    }
  }, [client]);

  const updateField = (field: keyof Client) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (index: number, field: keyof ClientContact, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) => (
        i === index ? { ...contact, [field]: value } : contact
      )),
    }));
  };

  const handleAddContact = () => {
    setForm((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', title: '', email: '', phone: '', isPrimary: false }],
    }));
  };

  const handleRemoveContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: { companyName?: string; contacts?: { email?: string }[] } = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key === 'companyName') {
          nextErrors.companyName = issue.message;
        }
        if (key === 'contacts' && issue.path.length >= 3) {
          const index = issue.path[1] as number;
          const field = issue.path[2];
          nextErrors.contacts = nextErrors.contacts ?? [];
          nextErrors.contacts[index] = nextErrors.contacts[index] ?? {};
          if (field === 'email') {
            nextErrors.contacts[index].email = issue.message;
          }
        }
      });
      setErrors(nextErrors);
      return;
    }
    onSave(form as Partial<Client>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface))] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{client ? 'Edit client' : 'Add client'}</p>
            <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))]">Client profile</h2>
          </div>
          <button onClick={onClose} type="button" className="rounded-lg border border-transparent p-2 text-muted transition hover:border-[rgba(var(--app-border-subtle))]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto px-6 py-6 max-h-[calc(90vh-72px)]">
          <section className="grid gap-4 md:grid-cols-2">
            <Field label="Company name" htmlFor="companyName" error={errors.companyName}>
              <input id="companyName" value={form.companyName} onChange={updateField('companyName')} className="input" placeholder="Acme Corp" aria-invalid={!!errors.companyName} aria-describedby={errors.companyName ? 'companyName-error' : undefined} />
            </Field>
            <Field label="Industry">
              <input value={form.industry ?? ''} onChange={updateField('industry')} className="input" placeholder="Staffing" />
            </Field>
            <Field label="Website">
              <input value={form.website ?? ''} onChange={updateField('website')} className="input" placeholder="https://example.com" />
            </Field>
            <Field label="Account manager">
              <input value={form.accountManager ?? ''} onChange={updateField('accountManager')} className="input" placeholder="Assigned recruiter" />
            </Field>
            <Field label="Status">
              <select value={form.status ?? 'ACTIVE'} onChange={updateField('status')} className="input">
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <Field label="Address">
              <input value={form.address ?? ''} onChange={updateField('address')} className="input" placeholder="123 Market St" />
            </Field>
            <Field label="City">
              <input value={form.city ?? ''} onChange={updateField('city')} className="input" placeholder="San Francisco" />
            </Field>
            <Field label="State">
              <input value={form.state ?? ''} onChange={updateField('state')} className="input" placeholder="CA" />
            </Field>
            <Field label="ZIP code">
              <input value={form.zipCode ?? ''} onChange={updateField('zipCode')} className="input" placeholder="94105" />
            </Field>
            <Field label="Country">
              <input value={form.country ?? ''} onChange={updateField('country')} className="input" placeholder="United States" />
            </Field>
          </section>

          <Field label="Notes">
            <textarea value={form.notes ?? ''} onChange={updateField('notes')} className="input" rows={3} placeholder="Share context about this client, procurement details, or billing preferences." />
          </Field>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Contacts</p>
                <p className="text-sm text-muted">Add stakeholders and mark the primary decision maker.</p>
              </div>
              <button type="button" onClick={handleAddContact} className="btn-muted">
                <Plus size={16} />
                Add contact
              </button>
            </div>

            {form.contacts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-4 text-sm text-muted">
                No contacts added yet. Capture the hiring manager, procurement partner, or other stakeholders here.
              </div>
            )}

            <div className="space-y-4">
              {form.contacts.map((contact, index) => (
                <div key={index} className="rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-2">
                      <Field label="Name">
                        <input value={contact.name ?? ''} onChange={(event) => handleContactChange(index, 'name', event.target.value)} className="input" placeholder="Jane Smith" />
                      </Field>
                      <Field label="Title">
                        <input value={contact.title ?? ''} onChange={(event) => handleContactChange(index, 'title', event.target.value)} className="input" placeholder="Director of TA" />
                      </Field>
                      <Field label="Email" htmlFor={`contact-email-${index}`} error={errors.contacts?.[index]?.email}>
                        <input id={`contact-email-${index}`} value={contact.email ?? ''} onChange={(event) => handleContactChange(index, 'email', event.target.value)} className="input" placeholder="jane@example.com" aria-invalid={!!errors.contacts?.[index]?.email} aria-describedby={errors.contacts?.[index]?.email ? `contact-email-${index}-error` : undefined} />
                      </Field>
                      <Field label="Phone">
                        <input value={contact.phone ?? ''} onChange={(event) => handleContactChange(index, 'phone', event.target.value)} className="input" placeholder="(555) 123-4567" />
                      </Field>
                    </div>
                    <div className="flex flex-col gap-3 md:w-40">
                      <label className="inline-flex items-center gap-2 text-sm text-muted">
                        <input
                          type="checkbox"
                          checked={Boolean(contact.isPrimary)}
                          onChange={(event) => handleContactChange(index, 'isPrimary', event.target.checked)}
                        />
                        Primary contact
                      </label>
                      <button type="button" onClick={() => handleRemoveContact(index)} className="btn-muted text-red-400 hover:border-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-muted">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {client ? 'Update client' : 'Create client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Using shared Field component from components/ui/Field