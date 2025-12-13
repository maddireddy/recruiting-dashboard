import { useMemo, useState } from 'react';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';
import { smsService } from '../services/sms.service';
import type { SmsCampaign } from '../types/sms';
import { Plus, Calendar, Send, Trash2 } from 'lucide-react';

export default function SMSCampaignsPage() {
  const [selected, setSelected] = useState<SmsCampaign | null>(null);
  const [showModal, setShowModal] = useState(false);
  const tenantId = localStorage.getItem('tenantId') || undefined;

  const campaignsQ = useList<SmsCampaign[]>(
    'sms-campaigns',
    (tid) => smsService.listCampaigns({}, tid),
    tenantId
  );
  const createM = useCreate<Partial<SmsCampaign>, SmsCampaign>('sms-campaigns', (data, tid) => smsService.createCampaign(data, tid), tenantId);
  const updateM = useUpdate<Partial<SmsCampaign>, SmsCampaign>('sms-campaigns', (id, data, tid) => smsService.updateCampaign(id, data, tid), tenantId);
  const deleteM = useDelete('sms-campaigns', (id, tid) => smsService.deleteCampaign(id, tid), tenantId);

  const campaigns = useMemo(() => campaignsQ.data || [], [campaignsQ.data]);

  const handleSave = async (data: Partial<SmsCampaign>) => {
    try {
      if (selected) {
        await updateM.mutateAsync({ id: selected.id, data });
      } else {
        await createM.mutateAsync(data);
      }
      setShowModal(false);
      setSelected(null);
    } catch (e) {
      console.error('Failed to save campaign', e);
    }
  };

  return (
    <div className="space-y-8 px-6 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">SMS Campaigns</h1>
          <p className="text-muted">Bulk messaging with delivery analytics</p>
        </div>
        <button className="btn-primary" type="button" onClick={() => { setSelected(null); setShowModal(true); }}>
          <Plus size={16} />
          New Campaign
        </button>
      </header>

      {campaignsQ.isLoading && <div className="card">Loading campaigns…</div>}
      {campaignsQ.error && <div className="card text-red-400">Failed to load campaigns</div>}

      {campaigns.length > 0 && (
        <section className="grid gap-4">
          {campaigns.map((c) => (
            <article key={c.id} className="card flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="text-sm text-muted">Status: {c.status} • Recipients: {c.totalRecipients ?? 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-muted" type="button" onClick={() => setSelected(c)}>
                  Edit
                </button>
                <button className="btn-muted" type="button" onClick={async () => {
                  try {
                    await smsService.scheduleCampaign(c.id, new Date().toISOString(), tenantId);
                  } catch (e) { console.error(e); }
                }}>
                  <Calendar size={16} />
                  Schedule
                </button>
                <button className="btn-muted" type="button" onClick={async () => {
                  try {
                    await smsService.sendCampaign(c.id, { sent: 0, delivered: 0, failed: 0 }, tenantId);
                  } catch (e) { console.error(e); }
                }}>
                  <Send size={16} />
                  Mark Sent
                </button>
                <button className="btn-muted text-red-400 hover:text-red-300" type="button" onClick={async () => {
                  if (confirm('Delete this campaign?')) {
                    try { await deleteM.mutateAsync(c.id); } catch (e) { console.error(e); }
                  }
                }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {showModal && (
        <div className="card p-4 space-y-3">
          <p className="text-sm text-muted">Simple inline modal placeholder. Replace with full builder later.</p>
          <div className="flex gap-2">
            <button className="btn-primary" type="button" onClick={() => handleSave({ name: selected?.name || 'New', message: selected?.message || 'Hello', status: selected?.status || 'draft' } as Partial<SmsCampaign>)}>Save</button>
            <button className="btn-muted" type="button" onClick={() => { setShowModal(false); setSelected(null); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
 
