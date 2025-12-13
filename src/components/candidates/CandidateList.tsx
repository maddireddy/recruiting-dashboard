import React, { useState, useEffect } from 'react';
import { MultiSelectTable } from '../bulk/MultiSelectTable';
import { BulkActionBar } from '../bulk/BulkActionBar';
import { candidateService } from '../../services/candidate.service';
import type { Candidate } from '../../types';

export const CandidateList: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const resp = await candidateService.getAll(0, 50);
      setCandidates(resp || []);
    } catch (err) {
      console.error('Failed to fetch candidates', err);
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'status',
      header: 'Status',
      render: (candidate: Candidate) => (
        <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
          {candidate.status}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Candidates</h1>

      <MultiSelectTable
        data={candidates}
        columns={columns}
  keyExtractor={(c: Candidate) => c.id}
        onSelectionChange={setSelectedIds}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onActionComplete={fetchCandidates}
      />
    </div>
  );
};
