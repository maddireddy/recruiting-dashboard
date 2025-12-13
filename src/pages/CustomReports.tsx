import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { CustomReport, CustomReportResultRow } from '../types/customReport';
import { listCustomReports, createCustomReport, updateCustomReport, deleteCustomReport, runCustomReport, exportCustomReport } from '../services/customReport.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';

export default function CustomReports() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<CustomReport | null>(null);
  const [form, setForm] = useState<Partial<CustomReport>>({ filters: {} });
  const [results, setResults] = useState<CustomReportResultRow[] | null>(null);

  const { data, isLoading, refetch } = useList<CustomReport[]>('customReports', () => listCustomReports(tenantId), tenantId);
  const { mutateAsync: create } = useCreate('customReports', (payload: Partial<CustomReport>) => createCustomReport(payload as any, tenantId), tenantId);
  const { mutateAsync: update } = useUpdate('customReports', (id: string, payload: Partial<CustomReport>) => updateCustomReport({ id, ...payload }, tenantId), tenantId);
  const { mutateAsync: remove } = useDelete('customReports', (id: string) => deleteCustomReport(id, tenantId), tenantId);

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
      setForm({ filters: {} });
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

  const onRun = async (id: string) => {
    try {
      const data = await runCustomReport(id, tenantId);
      setResults(data);
      toast.success('Report ran');
    } catch (e: any) {
      toast.error(e?.message || 'Run failed');
    }
  };

  const onExport = async (id: string, format: 'csv' | 'xlsx') => {
    try {
      const blob = await exportCustomReport(id, format, tenantId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch (e: any) {
      toast.error(e?.message || 'Export failed');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Custom Reports</h1>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ filters: {} }); }}>New</button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: CustomReport) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.description}</td>
                <td className="p-2 space-x-2">
                  <button className="btn btn-sm" onClick={() => { setSelected(item); setForm(item); }}>Edit</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => onRun(item.id)}>Run</button>
                  <button className="btn btn-sm" onClick={() => onExport(item.id, 'csv')}>Export CSV</button>
                  <button className="btn btn-sm" onClick={() => onExport(item.id, 'xlsx')}>Export XLSX</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {results && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Results</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}

      {(selected !== null || Object.keys(form).length > 0) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-medium mb-3">{selected ? 'Edit' : 'Create'} Report</h2>
            <div className="space-y-3">
              <input
                className="input w-full"
                placeholder="Name"
                value={form.name || ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <textarea
                className="input w-full"
                placeholder="Description"
                value={form.description || ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn" onClick={() => { setSelected(null); setForm({ filters: {} }); }}>Cancel</button>
              <button className="btn btn-primary" onClick={onSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
