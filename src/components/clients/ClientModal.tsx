import { useState, useEffect } from 'react';
import type { Client } from '../../types/client';
import { X, Plus } from 'lucide-react';

interface ClientModalProps {
  client: Client | null;
  onSave: (client: Partial<Client>) => void;
  onClose: () => void;
}

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

  useEffect(() => {
    if (client) setForm({ ...client, contacts: client.contacts || [] });
  }, [client]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(v => ({ ...v, [e.target.name]: e.target.value }));

  const handleContactChange = (idx: number, field: string, value: string | boolean) => {
    setForm(v => ({
      ...v,
      contacts: v.contacts.map((c, i) => i === idx ? { ...c, [field]: value } : c),
    }));
  };

  const handleAddContact = () => setForm(v => ({ ...v, contacts: [...v.contacts, { name: '', title: '', email: '', phone: '', isPrimary: false }] }));
  const handleRemoveContact = (idx: number) =>
    setForm(v => ({ ...v, contacts: v.contacts.filter((_, i) => i !== idx) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form as Partial<Client>);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-lg p-6 max-w-2xl w-full max-h-[95vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{client ? 'Edit Client' : 'Add Client'}</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="companyName" value={form.companyName} onChange={handleInput} required placeholder="Company Name" className="input w-full" />
          <input name="industry" value={form.industry} onChange={handleInput} placeholder="Industry" className="input w-full" />
          <input name="website" value={form.website} onChange={handleInput} placeholder="Website" className="input w-full" />
          <input name="accountManager" value={form.accountManager} onChange={handleInput} placeholder="Account Manager" className="input w-full" />
          <div className="grid grid-cols-2 gap-3">
            <input name="address" value={form.address} onChange={handleInput} placeholder="Address" className="input" />
            <input name="city" value={form.city} onChange={handleInput} placeholder="City" className="input" />
            <input name="state" value={form.state} onChange={handleInput} placeholder="State" className="input" />
            <input name="zipCode" value={form.zipCode} onChange={handleInput} placeholder="ZIP Code" className="input" />
            <input name="country" value={form.country} onChange={handleInput} placeholder="Country" className="input" />
          </div>
          <textarea name="notes" value={form.notes} onChange={handleInput} placeholder="Notes" className="input w-full" rows={2} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Contacts</span>
              <button type="button" onClick={handleAddContact} className="text-primary-500 flex items-center"><Plus size={16}/> Add Contact</button>
            </div>
            {form.contacts.map((ct, idx) => (
              <div key={idx} className="flex gap-2 items-end mb-2">
                <input value={ct.name} onChange={e => handleContactChange(idx, 'name', e.target.value)} placeholder="Name" className="input flex-1" />
                <input value={ct.title} onChange={e => handleContactChange(idx, 'title', e.target.value)} placeholder="Title" className="input flex-1" />
                <input value={ct.email} onChange={e => handleContactChange(idx, 'email', e.target.value)} placeholder="Email" className="input flex-1" />
                <input value={ct.phone} onChange={e => handleContactChange(idx, 'phone', e.target.value)} placeholder="Phone" className="input flex-1" />
                <label className="flex items-center text-xs gap-1">
                  <input type="checkbox" checked={!!ct.isPrimary} onChange={e => handleContactChange(idx, 'isPrimary', e.target.checked)} />
                  Primary
                </label>
                <button type="button" className="text-red-600" onClick={() => handleRemoveContact(idx)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="btn">Cancel</button>
            <button type="submit" className="btn btn-primary">{client ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}