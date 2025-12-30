import { useQuery } from '@tanstack/react-query';
import { offerApi } from '../api/offerApi';
import type { Offer } from '../api/offerApi';
import { Link, useNavigate } from 'react-router-dom';
import { FileCheck, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/card';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/ui/Loader';

export default function Offers() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery<Offer[]>({
    queryKey: ['offers'],
    queryFn: offerApi.list,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader />
      </div>
    );
  }

  const offers = data || [];
  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-500/10 text-slate-300',
    PENDING: 'bg-amber-500/10 text-amber-300',
    ACCEPTED: 'bg-emerald-500/10 text-emerald-300',
    REJECTED: 'bg-red-500/10 text-red-300',
    EXPIRED: 'bg-gray-500/10 text-gray-300',
  };

  return (
    <div className="space-y-8 px-6 pb-16 pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-app-text-primary">Offers</h1>
          <p className="text-sm text-app-text-secondary">
            Track and manage candidate offers throughout the hiring lifecycle
          </p>
        </div>
        <Button onClick={() => navigate('/offers/new')} variant="primary" className="gap-2">
          <Plus size={18} />
          New offer
        </Button>
      </div>

      {offers.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No offers yet"
          description="Create offer letters for qualified candidates and track acceptance/rejection status."
          actionLabel="Create offer"
          onAction={() => navigate('/offers/new')}
          secondaryActionLabel="Back to candidates"
          onSecondaryAction={() => navigate('/candidates')}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => {
            const status = (offer.status || 'DRAFT').toUpperCase();
            const statusColor = statusColors[status] || statusColors.DRAFT;

            return (
              <Link
                key={offer.id}
                to={`/offers/${offer.id}`}
                className="group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-app-border-focus">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-app-text-primary truncate">
                          Candidate {offer.candidateId}
                        </h3>
                        <p className="text-sm text-app-text-secondary truncate">
                          Job {offer.jobId}
                        </p>
                      </div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColor}`}>
                        {status}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      {offer.compStartDate && (
                        <div className="flex justify-between text-app-text-secondary">
                          <span>Start Date:</span>
                          <span className="text-app-text-primary font-medium">
                            {new Date(offer.compStartDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {offer.compEndDate && (
                        <div className="flex justify-between text-app-text-secondary">
                          <span>End Date:</span>
                          <span className="text-app-text-primary font-medium">
                            {new Date(offer.compEndDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-app-border-subtle text-xs text-app-text-secondary">
                      Click to view details
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
