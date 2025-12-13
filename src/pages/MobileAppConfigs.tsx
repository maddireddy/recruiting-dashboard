import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { MobileAppConfig } from '../types/mobileConfig';
import { mobileConfigService } from '../services/mobileConfig.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';

export default function MobileAppConfigs() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<MobileAppConfig | null>(null);
  const [form, setForm] = useState<Partial<MobileAppConfig>>({ features: {} });

  const { data, isLoading, refetch } = useList<MobileAppConfig[]>('mobileConfigs', () => mobileConfigService.list(tenantId), tenantId);
  const { mutateAsync: create } = useCreate('mobileConfigs', (payload: Partial<MobileAppConfig>) => mobileConfigService.create(payload, tenantId), tenantId);
  const { mutateAsync: update } = useUpdate('mobileConfigs', (id: string, payload: Partial<MobileAppConfig>) => mobileConfigService.update(id, payload, tenantId), tenantId);
  const { mutateAsync: remove } = useDelete('mobileConfigs', (id: string) => mobileConfigService.delete(id, tenantId), tenantId);

  const onSubmit = async () => {
    try {
      if (selected) {
        await update({ id: selected.id, data: form });
        toast.success('Updated');
      } else {
        await create(form);
        toast.success('Created');
      }
      setSelected(null);
      setForm({ features: {} });
      refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Action failed');
    }
  };

  const onDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success('Deleted');
      refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  // Feature flags editor: comma-separated list toggled into map for simplicity
  const flagsString = Object.keys(form.features || {}).join(',');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Mobile App Configs</h1>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ features: {} }); }}>New</button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">App Version</th>
              <th className="p-2 text-left">Min Supported</th>
              <th className="p-2 text-left">Flags</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: MobileAppConfig) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.version ?? '-'}</td>
                <td className="p-2">{item.platform}</td>
                <td className="p-2">{Object.keys(item.features || {}).join(', ')}</td>
                <td className="p-2 space-x-2">
                  <button className="btn btn-sm" onClick={() => { setSelected(item); setForm(item); }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(selected !== null || Object.keys(form).length > 0) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-medium mb-3">{selected ? 'Edit' : 'Create'} Config</h2>
            <div className="space-y-3">
              <input
                className="input w-full"
                placeholder="Version"
                value={form.version || ''}
                onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
              />
              <input
                className="input w-full"
                placeholder="Platform (ios/android)"
                value={form.platform || ''}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as MobileAppConfig['platform'] }))}
              />
              <input
                className="input w-full"
                placeholder="Feature Flags (comma-separated)"
                value={flagsString}
                onChange={(e) => {
                  const keys = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  const map: Record<string, boolean> = {};
                  keys.forEach((k) => (map[k] = true));
                  setForm((f) => ({ ...f, features: map }));
                }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn" onClick={() => { setSelected(null); setForm({ features: {} }); }}>Cancel</button>
              <button className="btn btn-primary" onClick={onSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

