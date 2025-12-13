import { useState } from 'react'
import { useCreate, useDelete, useList, useUpdate } from '../services/hooks'
import { smsService } from '../services/sms.service'
import type { SmsCommunication } from '../types/sms'

export default function SMSCommunicationsPage() {
  const tenantId = localStorage.getItem('tenantId') || undefined
  const [selected, setSelected] = useState<SmsCommunication | null>(null)

  const communicationsQ = useList<SmsCommunication[]>('sms-communications', () => smsService.listComms({}, tenantId), tenantId)
  const createM = useCreate<Partial<SmsCommunication>, SmsCommunication>('sms-communications', smsService.createComm, tenantId)
  const updateM = useUpdate<Partial<SmsCommunication>, SmsCommunication>('sms-communications', smsService.updateComm, tenantId)
  const deleteM = useDelete('sms-communications', smsService.deleteComm, tenantId)

  const handleResend = async (id: string) => {
    await smsService.resendComm(id, tenantId)
    communicationsQ.refetch()
  }

  const handleSave = async (payload: Partial<SmsCommunication>) => {
    if (selected) {
      await updateM.mutateAsync({ id: selected.id!, data: payload })
    } else {
      await createM.mutateAsync(payload)
    }
    setSelected(null)
  }

  const handleEdit = (c: SmsCommunication) => setSelected(c)
  const handleDelete = async (id: string) => {
    await deleteM.mutateAsync(id)
  }

  if (communicationsQ.isLoading) return <div className="p-4">Loading communications...</div>
  if (communicationsQ.isError) return <div className="p-4 text-red-600">Failed to load communications</div>

  const items: SmsCommunication[] = communicationsQ.data || []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">SMS Communications</h1>
        <button
          onClick={() => setSelected(null)}
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          New Communication
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">To</th>
              <th className="text-left p-2">Message</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Created</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.recipientPhone}</td>
                <td className="p-2 truncate max-w-[30ch]">{c.message}</td>
                <td className="p-2">{c.status}</td>
                <td className="p-2">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</td>
                <td className="p-2 space-x-2">
                  <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={() => handleEdit(c)}>Edit</button>
                  <button className="px-2 py-1 rounded bg-yellow-100 hover:bg-yellow-200" onClick={() => handleResend(c.id!)}>Resend</button>
                  <button className="px-2 py-1 rounded bg-red-100 hover:bg-red-200" onClick={() => handleDelete(c.id!)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditModal
        open={selected !== null}
        initial={selected || undefined}
        onClose={() => setSelected(null)}
        onSave={handleSave}
        saving={createM.isPending || updateM.isPending}
      />
    </div>
  )
}

function EditModal({ open, initial, onClose, onSave, saving }: {
  open: boolean
  initial?: Partial<SmsCommunication>
  onClose: () => void
  onSave: (payload: Partial<SmsCommunication>) => void | Promise<void>
  saving?: boolean
}) {
  const [recipientPhone, setRecipientPhone] = useState(initial?.recipientPhone || '')
  const [message, setMessage] = useState(initial?.message || '')

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded shadow-lg w-full max-w-lg">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{initial?.id ? 'Edit Communication' : 'New Communication'}</h2>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Recipient Phone</label>
            <input
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Recipient phone number"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={4}
              placeholder="Your SMS message"
            />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button className="px-3 py-2 rounded bg-gray-100" onClick={onClose}>Cancel</button>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
            onClick={() => onSave({ recipientPhone, message })}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
