import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { SkillsAssessment } from '../types/skillsAssessment';
import { skillsAssessmentService } from '../services/skillsAssessment.service';
import { useList, useCreate, useUpdate, useDelete } from '../services/hooks';

export default function SkillsAssessments() {
  const tenantId = useMemo(() => localStorage.getItem('tenantId') || undefined, []);
  const [selected, setSelected] = useState<SkillsAssessment | null>(null);
  const [form, setForm] = useState<Partial<SkillsAssessment>>({});

  const { data, isLoading, refetch } = useList<SkillsAssessment[]>('skillsAssessments', () => skillsAssessmentService.list(tenantId), tenantId);
  const { mutateAsync: create } = useCreate('skillsAssessments', (payload: Partial<SkillsAssessment>) => skillsAssessmentService.create(payload, tenantId), tenantId);
  const { mutateAsync: update } = useUpdate('skillsAssessments', (id: string, payload: Partial<SkillsAssessment>) => skillsAssessmentService.update(id, payload, tenantId), tenantId);
  const { mutateAsync: remove } = useDelete('skillsAssessments', (id: string) => skillsAssessmentService.delete(id, tenantId), tenantId);

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
      setForm({});
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Skills Assessments</h1>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({}); }}>New</button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Skill Area</th>
              <th className="p-2 text-left">Questions</th>
              <th className="p-2 text-left">Avg Score</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: SkillsAssessment) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.skillArea}</td>
                <td className="p-2">{item.totalQuestions ?? '-'}</td>
                <td className="p-2">{item.averageScore ?? '-'}</td>
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
            <h2 className="text-lg font-medium mb-3">{selected ? 'Edit' : 'Create'} Assessment</h2>
            <div className="space-y-3">
              <input
                className="input w-full"
                placeholder="Name"
                value={form.name || ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                className="input w-full"
                placeholder="Skill Area"
                value={form.skillArea || ''}
                onChange={(e) => setForm((f) => ({ ...f, skillArea: e.target.value }))}
              />
              <input
                className="input w-full"
                placeholder="Total Questions"
                type="number"
                value={form.totalQuestions ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, totalQuestions: Number(e.target.value) }))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn" onClick={() => { setSelected(null); setForm({}); }}>Cancel</button>
              <button className="btn btn-primary" onClick={onSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
