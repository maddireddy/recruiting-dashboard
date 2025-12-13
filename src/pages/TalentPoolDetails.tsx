import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { talentPoolApi } from '../api/talentPoolApi';
import { useState } from 'react';

export default function TalentPoolDetails() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [tagFilter, setTagFilter] = useState('');

  const { data: pool, isLoading } = useQuery({
    queryKey: ['talent-pools', id],
    queryFn: () => talentPoolApi.getById(id!),
    enabled: !!id,
  });

  const { data: members } = useQuery({
    queryKey: ['talent-pools', id, 'members'],
    queryFn: () => talentPoolApi.listMembers(id!),
    enabled: !!id,
  });

  const addMember = useMutation({
    mutationFn: (candidateId: string) => talentPoolApi.addMember(id!, candidateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['talent-pools', id, 'members'] }),
  });

  const removeMember = useMutation({
    mutationFn: (memberId: string) => talentPoolApi.removeMember(id!, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['talent-pools', id, 'members'] }),
  });

  if (isLoading || !pool) return <div className="p-6">Loading pool...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-1">{pool.name}</h1>
      {pool.description && <p className="text-gray-600 mb-4">{pool.description}</p>}

      <div className="flex gap-2 mb-4">
        <input id="candidateId" className="border rounded px-3 py-2" placeholder="Candidate ID" />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => {
            const input = document.getElementById('candidateId') as HTMLInputElement;
            if (input?.value) addMember.mutate(input.value);
          }}
        >
          Add Member
        </button>
      </div>

      <h2 className="font-medium mb-2">Members</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border rounded px-3 py-2"
          placeholder="Filter by tag"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        />
      </div>
      <ul className="divide-y">
        {(members || [])
          .filter((m: any) => !tagFilter || (m.tags || []).some((t: string) => t.toLowerCase().includes(tagFilter.toLowerCase())))
          .map((m: any) => (
          <li key={m.id} className="py-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{m.fullName}</div>
              <div className="text-sm text-gray-600">{m.email}</div>
              {Array.isArray(m.tags) && m.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {m.tags.map((t: string) => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded bg-gray-100 border">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <button
              className="text-red-600 hover:underline"
              onClick={() => removeMember.mutate(m.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
