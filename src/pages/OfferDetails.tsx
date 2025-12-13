import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { offerApi } from '../api/offerApi';
import Breadcrumbs from '../components/common/Breadcrumbs';
import PageHeader from '../components/common/PageHeader';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function OfferDetails() {
  const { id } = useParams();

  const { data: offer, isLoading } = useQuery({
    queryKey: ['offers', id],
    queryFn: () => offerApi.getById(id!),
    enabled: !!id,
  });

  const update = useMutation({
    mutationFn: (payload: any) => offerApi.update(id!, payload),
    onSuccess: () => toast.success('Offer updated'),
    onError: () => toast.error('Failed to update offer'),
  });

  if (isLoading || !offer) return <div className="p-6">Loading offer...</div>;

  const [form, setForm] = useState({
    baseSalary: offer.baseSalary ?? '',
    bonus: offer.bonus ?? '',
    equity: offer.equity ?? '',
    notes: offer.notes ?? '',
  });

  const isValidNumber = (v: any) => v === '' || (!isNaN(Number(v)) && Number(v) >= 0);

  const onSave = () => {
    if (!isValidNumber(form.baseSalary) || !isValidNumber(form.bonus)) {
      toast.error('Please enter valid non-negative numbers');
      return;
    }
    update.mutate({
      baseSalary: form.baseSalary === '' ? null : Number(form.baseSalary),
      bonus: form.bonus === '' ? null : Number(form.bonus),
      equity: form.equity,
      notes: form.notes,
    });
  };

  return (
    <div className="p-6">
      <Breadcrumbs />
      <PageHeader
        title={`Offer #${offer.id}`}
        subtitle={`Candidate ${offer.candidateId} · Job ${offer.jobId}`}
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded border" onClick={() => setForm({
              baseSalary: offer.baseSalary ?? '',
              bonus: offer.bonus ?? '',
              equity: offer.equity ?? '',
              notes: offer.notes ?? '',
            })}>Cancel</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onSave} disabled={update.isPending}>Save</button>
          </div>
        }
      />

      <div className="grid gap-3 max-w-md">
        <label className="grid gap-1">
          <span className="text-sm">Base Salary</span>
          <input
            type="number"
            className="border rounded px-3 py-2"
            value={form.baseSalary}
            onChange={(e) => setForm((f) => ({ ...f, baseSalary: e.target.value }))}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Bonus</span>
          <input
            type="number"
            className="border rounded px-3 py-2"
            value={form.bonus}
            onChange={(e) => setForm((f) => ({ ...f, bonus: e.target.value }))}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Equity</span>
          <input
            className="border rounded px-3 py-2"
            value={form.equity}
            onChange={(e) => setForm((f) => ({ ...f, equity: e.target.value }))}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Notes</span>
          <textarea
            className="border rounded px-3 py-2"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </label>
      </div>
    </div>
  );
}
