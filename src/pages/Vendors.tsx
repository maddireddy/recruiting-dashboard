import { useEffect, useMemo, useState } from 'react';
import { vendorService, type Vendor } from '../services/vendor.service';
import { toast } from 'react-hot-toast';
import Table from '../components/common/Table';
import { useCreate, useList } from '../services/hooks';
import { z } from 'zod';

export default function Vendors() {
  const [tenantId, setTenantId] = useState('default');
  const [items, setItems] = useState<Vendor[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = useMemo(
    () =>
      z.object({
        companyName: z.string().min(2, 'Company name must be at least 2 characters'),
        contactEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
      }),
    []
  );

  const listQ = useList<Vendor[]>('vendors', vendorService.list, tenantId);
  useEffect(() => { if (Array.isArray(listQ.data)) setItems(listQ.data); }, [listQ.data]);

  const createMut = useCreate('vendors', vendorService.create, tenantId);
  const create = async () => {
    const parsed = schema.safeParse({ companyName, contactEmail });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await createMut.mutateAsync({ companyName, contactEmail });
    setCompanyName('');
    setContactEmail('');
    toast.success('Vendor registered');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Vendors</h1>

      <div className="flex gap-2 items-end mb-4">
        <label className="block">
          <span className="text-sm">Tenant</span>
          <input className="input input-bordered" value={tenantId} onChange={e => setTenantId(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Company Name</span>
          <input className="input input-bordered" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
        </label>
        <label className="block">
          <span className="text-sm">Contact Email</span>
          <input className="input input-bordered" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
          {errors.contactEmail && <p className="mt-1 text-xs text-red-500">{errors.contactEmail}</p>}
        </label>
        <button className="btn btn-primary" onClick={create} disabled={createMut.isPending}> {createMut.isPending ? 'Saving…' : 'Register'} </button>
      </div>

      <Table
        columns={[
          { key: 'companyName', title: 'Company', sortable: true },
          { key: 'contactEmail', title: 'Email' },
          { key: 'status', title: 'Status' },
        ]}
        data={items}
        loading={listQ.isLoading}
        error={listQ.error ? (listQ.error as any)?.message : undefined}
        emptyText="No vendors yet."
      />
    </div>
  );
}
