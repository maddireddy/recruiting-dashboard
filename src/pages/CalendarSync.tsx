import { useEffect, useState } from 'react';
import { calendarService } from '../services/calendar.service';
import type { CalendarSync } from '../services/calendar.service';
import { toast } from 'react-hot-toast';

export default function CalendarSyncPage() {
  const [tenantId, setTenantId] = useState('default');
  const [userId, setUserId] = useState('');
  const [items, setItems] = useState<CalendarSync[]>([]);

  const load = async () => {
    try {
      const data = await calendarService.list(tenantId);
      setItems(data);
    } catch (e: any) {
      // endpoint might not exist yet; show gentle message
      toast(e?.response?.status === 404 ? 'Calendar list not available yet' : (e?.message || 'Failed to load calendar syncs'));
    }
  };

  useEffect(() => { load(); }, []);

  const connect = async (provider: 'GOOGLE' | 'OUTLOOK') => {
    if (!userId) return toast.error('Enter a user ID');
    try {
      if (provider === 'GOOGLE') await calendarService.connectGoogle(userId, tenantId);
      if (provider === 'OUTLOOK') await calendarService.connectOutlook(userId, tenantId);
      toast.success('Connection initiated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to initiate connection');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Calendar Sync</h1>

      <div className="flex gap-2 items-end mb-4">
        <label className="block">
          <span className="text-sm">Tenant</span>
          <input className="input input-bordered" value={tenantId} onChange={e => setTenantId(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">User ID</span>
          <input className="input input-bordered" value={userId} onChange={e => setUserId(e.target.value)} />
        </label>
        <button className="btn btn-outline" onClick={() => connect('GOOGLE')}>Connect Google</button>
        <button className="btn btn-outline" onClick={() => connect('OUTLOOK')}>Connect Outlook</button>
      </div>

      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id} className="border rounded p-3">
            <div className="font-medium">{i.provider} — {i.userId}</div>
            <div className="text-xs text-gray-600">Sync ID: {i.id}</div>
          </div>
        ))}
        {!items.length && <div className="text-sm text-gray-600">No connected calendars.</div>}
      </div>
    </div>
  );
}
