import { useEffect, useMemo, useState } from 'react';
import { workflowService, type Workflow } from '../services/workflow.service';
import { toast } from 'react-hot-toast';
import Table from '../components/common/Table';
import { useCreate, useList } from '../services/hooks';
import { z } from 'zod';

export default function Workflows() {
  const [tenantId, setTenantId] = useState('default');
  const [items, setItems] = useState<Workflow[]>([]);
  const [name, setName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('');
  const [actions, setActions] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        triggerEvent: z.string().min(2, 'Trigger event is required'),
        actions: z.array(z.string()).min(1, 'At least one action is required'),
      }),
    []
  );

  const listQ = useList<Workflow[]>('workflows', workflowService.list, tenantId);
  useEffect(() => { if (Array.isArray(listQ.data)) setItems(listQ.data); }, [listQ.data]);

  const createMut = useCreate('workflows', workflowService.create, tenantId);
  const create = async () => {
    const actionsArr = actions.split(',').map(a => a.trim()).filter(Boolean);
    const parsed = schema.safeParse({ name, triggerEvent, actions: actionsArr });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await createMut.mutateAsync({ name, triggerEvent, actions: actionsArr });
    setName('');
    setTriggerEvent('');
    setActions('');
    toast.success('Workflow created');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Workflow Automation</h1>

      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 mb-4">
        <label className="block">
          <span className="text-sm">Tenant</span>
          <input className="input input-bordered w-full" value={tenantId} onChange={e => setTenantId(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Name</span>
          <input className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </label>
        <label className="block">
          <span className="text-sm">Trigger Event</span>
          <input className="input input-bordered w-full" value={triggerEvent} onChange={e => setTriggerEvent(e.target.value)} placeholder="e.g. CANDIDATE_HIRED" />
          {errors.triggerEvent && <p className="mt-1 text-xs text-red-500">{errors.triggerEvent}</p>}
        </label>
        <label className="block">
          <span className="text-sm">Actions (comma-separated)</span>
          <input className="input input-bordered w-full" value={actions} onChange={e => setActions(e.target.value)} placeholder="SEND_EMAIL, CREATE_TASK" />
          {errors.actions && <p className="mt-1 text-xs text-red-500">{errors.actions}</p>}
        </label>
        <button className="btn btn-primary" onClick={create} disabled={createMut.isPending}>{createMut.isPending ? 'Saving…' : 'Create Workflow'}</button>
      </div>

      <Table
        columns={[
          { key: 'name', title: 'Name', sortable: true },
          { key: 'triggerEvent', title: 'Trigger' },
          { key: 'actions', title: 'Actions', render: (w) => (w.actions || []).join(', ') },
        ]}
        data={items}
        loading={listQ.isLoading}
        error={listQ.error ? (listQ.error as any)?.message : undefined}
        emptyText="No workflows yet."
      />
    </div>
  );
}
