import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/client.service';
import ClientModal from '../components/clients/ClientModal';
import type { Client } from '../types/client';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{mode: 'create' | 'edit' | 'none', client: Client | null}>({mode: 'none', client: null});

  const clientsQ = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll(0, 100).then(r => r.data.content || []),
  });

  const createM = useMutation({
    mutationFn: (client: Partial<Client>) => clientService.create(client),
    onSuccess: () => { queryClient.invalidateQueries({queryKey:['clients']}); setModal({mode:'none',client:null}); }
  });
  const updateM = useMutation({
    mutationFn: (client: Partial<Client>) => clientService.update(modal.client!.id!, client),
    onSuccess: () => { queryClient.invalidateQueries({queryKey:['clients']}); setModal({mode:'none',client:null}); }
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({queryKey:['clients']})
  });

  const handleSave = (data: Partial<Client>) => {
    if (modal.mode === 'edit' && modal.client) updateM.mutate(data);
    else createM.mutate(data);
  };
  const handleCloseModal = () => setModal({mode:'none', client:null});

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button onClick={() => setModal({mode:'create', client:null})} className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded transition">
          <Plus /> Add Client
        </button>
      </div>
      {clientsQ.isLoading && <p>Loading clients...</p>}
      {clientsQ.error && <p className="text-red-500">Error loading clients</p>}
      {clientsQ.data && (
        <div className="grid gap-4">
          {clientsQ.data.map((cl: Client) => (
            <div key={cl.id} className="bg-dark-100 rounded-lg border p-4 hover:border-primary-500 transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{cl.companyName}</div>
                  <div className="text-sm text-dark-600">{cl.industry || ''} — {cl.city || ''}{cl.state ? ', '+cl.state : ''}</div>
                  <div className="text-xs text-dark-500">{cl.website}</div>
                  <div className="text-xs text-dark-500">{cl.accountManager && <>Account Manager: {cl.accountManager}</>}</div>
                  <div className="mt-1 text-xs"><b>Status:</b> {cl.status || "ACTIVE"}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn" onClick={() => setModal({mode: 'edit', client: cl})}>Edit</button>
                  <button className="btn btn-danger" onClick={() => { if(window.confirm('Delete this client?')) deleteM.mutate(cl.id!); }}>Delete</button>
                </div>
              </div>
              {cl.contacts?.length > 0 && (
                <div className="mt-2 text-xs text-dark-600">
                  <b>Contacts:</b>
                  {cl.contacts.map((c, i) => (
                    <span key={i} className="block">{c.name} ({c.title}), {c.email}, {c.phone}{c.isPrimary ? " [Primary]" : ""}</span>
                  ))}
                </div>
              )}
              {cl.notes && <div className="mt-2 text-xs text-dark-500 italic">{cl.notes}</div>}
            </div>
          ))}
        </div>
      )}
      {(modal.mode === 'create' || modal.mode === 'edit') && (
        <ClientModal
          client={modal.client}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}