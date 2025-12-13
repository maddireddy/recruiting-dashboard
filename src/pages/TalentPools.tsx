import { useQuery } from '@tanstack/react-query';
import { talentPoolApi } from '../api/talentPoolApi';
import type { TalentPool } from '../api/talentPoolApi';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/common/Breadcrumbs';
import PageHeader from '../components/common/PageHeader';
import { CardSkeleton } from '../components/common/Skeleton';
import TalentPoolCreateModal from '../components/talent/TalentPoolCreateModal';
import { useState } from 'react';

export default function TalentPools() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery<TalentPool[]>({
    queryKey: ['talent-pools'],
    queryFn: talentPoolApi.list,
  });

  if (isLoading) return (
    <div className="p-6">
      <Breadcrumbs />
      <PageHeader title="Talent Pools" subtitle="Organize candidates by skills, location, or campaigns" />
      <CardSkeleton />
    </div>
  );

  return (
    <div className="p-6">
      <Breadcrumbs />
      <PageHeader title="Talent Pools" subtitle="Organize candidates by skills, location, or campaigns" actions={
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setOpen(true)}>New Pool</button>
      }/>
      <div className="grid gap-3">
        {data?.map((pool) => (
          <Link
            key={pool.id}
            to={`/talent-pools/${pool.id}`}
            className="border rounded p-4 hover:bg-gray-50"
          >
            <div className="font-medium">{pool.name}</div>
            <div className="text-sm text-gray-600">{pool.description}</div>
            <div className="text-xs text-gray-500 mt-1">{pool.membersCount ?? 0} members</div>
          </Link>
        ))}
      </div>
      <TalentPoolCreateModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
