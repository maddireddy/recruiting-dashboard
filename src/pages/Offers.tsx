import { useQuery } from '@tanstack/react-query';
import { offerApi } from '../api/offerApi';
import type { Offer } from '../api/offerApi';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/common/Breadcrumbs';
import PageHeader from '../components/common/PageHeader';
import { CardSkeleton } from '../components/common/Skeleton';

export default function Offers() {
  const { data, isLoading } = useQuery<Offer[]>({
    queryKey: ['offers'],
    queryFn: offerApi.list,
  });

  if (isLoading) return (
    <div className="p-6">
      <Breadcrumbs />
      <PageHeader title="Offers" subtitle="Track and manage candidate offers" />
      <CardSkeleton />
    </div>
  );

  return (
    <div className="p-6">
      <Breadcrumbs />
      <PageHeader title="Offers" subtitle="Track and manage candidate offers" actions={
        <button className="bg-blue-600 text-white px-4 py-2 rounded">New Offer</button>
      }/>
      <div className="grid gap-3">
        {data?.map((offer) => (
          <Link
            key={offer.id}
            to={`/offers/${offer.id}`}
            className="border rounded p-4 hover:bg-gray-50"
          >
            <div className="font-medium">Offer for Candidate {offer.candidateId}</div>
            <div className="text-sm text-gray-600">Job {offer.jobId}</div>
            <div className="text-xs text-gray-500 mt-1">Status: {offer.status}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
