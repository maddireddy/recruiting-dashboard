import { useState } from 'react';
import { getCompliance, type Compliance } from '../services/compliance.service';
import { toast } from 'react-hot-toast';

export default function Compliance() {
  const [tenantId, setTenantId] = useState('default');
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    try {
      setLoading(true);
      const data = await complianceService.generateOfccpReport(tenantId);
      setReport(typeof data === 'string' ? data : JSON.stringify(data));
      toast.success('Report generated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Compliance & EEO</h1>
      <div className="flex gap-2 items-end mb-4">
        <label className="block">
          <span className="text-sm">Tenant</span>
          <input className="input input-bordered" value={tenantId} onChange={e => setTenantId(e.target.value)} />
        </label>
        <button className="btn btn-primary" disabled={loading} onClick={generate}>{loading ? 'Generating…' : 'Generate OFCCP Report'}</button>
      </div>
      {report && (
        <pre className="bg-gray-900 text-gray-100 p-3 rounded max-w-3xl overflow-auto">{report}</pre>
      )}
    </div>
  );
}
