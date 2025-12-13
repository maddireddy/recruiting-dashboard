import React, { useEffect, useState } from 'react';
import { emailService } from '../../services/email.service';

interface EmailTemplateOption {
  id: string;
  name: string;
  subject?: string;
  body?: string;
}

interface BulkEmailModalProps {
  onClose: () => void;
  onSend: (subject: string, body: string, options?: { sendIndividually?: boolean; templateId?: string }) => void;
}

export const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ onClose, onSend }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templates, setTemplates] = useState<EmailTemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [sendIndividually, setSendIndividually] = useState<boolean>(true);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [variableMenuOpen, setVariableMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await emailService.getAllTemplates();
        setTemplates(data.map((t: any) => ({ id: t.id, name: t.name, subject: t.subject, body: t.body })));
      } catch (err) {
        console.error('Failed to fetch templates', err);
      }
    };
    loadTemplates();
  }, []);

  // Keep memoized selection for future extension (e.g., preview sidebar)
  // const selectedTemplate = useMemo(() => templates.find(t => t.id === selectedTemplateId), [templates, selectedTemplateId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) {
      alert('Please fill in all fields');
      return;
    }
    onSend(subject, body, { sendIndividually, templateId: selectedTemplateId || undefined });
  };

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">Send Bulk Email</h2>

        {/* Template picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Template</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedTemplateId(id);
              const tmpl = templates.find(t => t.id === id);
              if (tmpl) {
                setSubject(tmpl.subject || '');
                setBody(tmpl.body || '');
              }
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— No template —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Email subject..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Message</label>
            {/* Minimal rich text editor using contenteditable */}
            <div
              contentEditable
              onInput={(e) => setBody((e.target as HTMLElement).innerHTML)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[180px] prose max-w-none"
              dangerouslySetInnerHTML={{ __html: body }}
            />
            {/* Variable insertion helper */}
            <div className="mt-2 relative inline-block">
              <button
                type="button"
                onClick={() => setVariableMenuOpen((v) => !v)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Insert variable ▾
              </button>
              {variableMenuOpen && (
                <div className="absolute z-10 mt-1 bg-white border rounded shadow text-sm">
                  {['name','email','phone','jobTitle','company','date'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        // Insert handlebars-like variable into current body
                        setBody((prev) => `${prev} {{${v}}}`);
                        setVariableMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sendIndividually}
                onChange={(e) => setSendIndividually(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Send individually (allows per-recipient personalization and improves deliverability)
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Preview
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Send Email
            </button>
          </div>
        </form>
      </div>
  </div>
  {previewOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setPreviewOpen(false)}>
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-semibold mb-4">Preview</h3>
          <div className="mb-2 text-sm text-gray-600">Subject</div>
          <div className="p-3 border rounded mb-4">{subject}</div>
          <div className="mb-2 text-sm text-gray-600">Body</div>
          <div className="p-3 border rounded prose max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
          <div className="text-right mt-4">
            <button className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition" onClick={() => setPreviewOpen(false)}>Close</button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
