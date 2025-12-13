import { useEffect, useMemo, useState } from 'react';
import { referralService, type Referral } from '../services/referral.service';
import { toast } from 'react-hot-toast';
import Table from '../components/common/Table';
import { useCreate, useList } from '../services/hooks';
import { z } from 'zod';

export default function Referrals() {
  const [tenantId, setTenantId] = useState('default');
  const [items, setItems] = useState<Referral[]>([]);
  const [candidateId, setCandidateId] = useState('');
  const [referredByUserId, setReferredByUserId] = useState('');
  const [bonusAmount, setBonusAmount] = useState<number | ''>('');

  const listQ = useList<Referral[]>('referrals', referralService.list, tenantId);
  useEffect(() => { if (Array.isArray(listQ.data)) setItems(listQ.data); }, [listQ.data]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const schema = useMemo(() => z.object({
    candidateId: z.string().min(2, 'Candidate ID required'),
    referredByUserId: z.string().min(2, 'Referrer user ID required'),
    bonusAmount: z.number().min(0, 'Bonus must be 0 or greater').optional(),
  }), []);

  const createMut = useCreate('referrals', referralService.create, tenantId);
  const create = async () => {
    const parsed = schema.safeParse({
      candidateId,
      referredByUserId,
      bonusAmount: typeof bonusAmount === 'number' ? bonusAmount : undefined,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await createMut.mutateAsync({ candidateId, referredByUserId, bonusAmount: typeof bonusAmount === 'number' ? bonusAmount : undefined });
    setCandidateId('');
    setReferredByUserId('');
    setBonusAmount('');
    toast.success('Referral created');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Employee Referrals</h1>

      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 mb-4">
        <label className="block">
          <span className="text-sm">Tenant</span>
          <input className="input input-bordered w-full" value={tenantId} onChange={e => setTenantId(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Candidate ID</span>
          <input className="input input-bordered w-full" value={candidateId} onChange={e => setCandidateId(e.target.value)} />
        </label>
        {errors.candidateId && <p className="mt-1 text-xs text-red-500">{errors.candidateId}</p>}
        <label className="block">
          <span className="text-sm">Referred By (User ID)</span>
          <input className="input input-bordered w-full" value={referredByUserId} onChange={e => setReferredByUserId(e.target.value)} />
        </label>
        {errors.referredByUserId && <p className="mt-1 text-xs text-red-500">{errors.referredByUserId}</p>}
        <label className="block">
          <span className="text-sm">Bonus Amount</span>
          <input className="input input-bordered w-full" type="number" value={bonusAmount} onChange={e => setBonusAmount(e.target.value ? Number(e.target.value) : '')} />
        </label>
        {errors.bonusAmount && <p className="mt-1 text-xs text-red-500">{errors.bonusAmount}</p>}
        <button className="btn btn-primary" onClick={create} disabled={createMut.isPending}>{createMut.isPending ? 'Saving…' : 'Create Referral'}</button>
      </div>
      <Table
        columns={[
          { key: 'candidateId', title: 'Candidate', sortable: true },
          { key: 'referredByUserId', title: 'Referred By' },
          { key: 'bonusAmount', title: 'Bonus' },
          { key: 'status', title: 'Status' },
        ]}
        data={items}
        loading={listQ.isLoading}
        error={listQ.error ? (listQ.error as any)?.message : undefined}
        emptyText="No referrals yet."
      />
    </div>
  );
}
