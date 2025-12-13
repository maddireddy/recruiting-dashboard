import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysService, type ApiKey } from '../services/apikeys.service';
import { toast } from 'react-hot-toast';
import Table from '../components/common/Table';
import { z } from 'zod';
import { Key, Plus, Trash2 } from 'lucide-react';

// Zod schema for API key creation
const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  scopes: z.string().min(1, 'At least one scope is required'),
});

type CreateApiKeyForm = z.infer<typeof createApiKeySchema>;

export default function ApiKeys() {
  const [formData, setFormData] = useState<CreateApiKeyForm>({
    name: '',
    scopes: 'read,write',
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateApiKeyForm>>({});
  const queryClient = useQueryClient();

  // Fetch API keys
  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysService.list(),
  });

  // Create API key mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; scopes: string[] }) => apiKeysService.create(data),
    onSuccess: () => {
      toast.success('API key created successfully');
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setFormData({ name: '', scopes: 'read,write' });
      setFormErrors({});
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create API key');
    },
  });

  // Revoke API key mutation
  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiKeysService.revoke(id),
    onSuccess: () => {
      toast.success('API key revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to revoke API key');
    },
  });

  const handleInputChange = (field: keyof CreateApiKeyForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreate = () => {
    try {
      const validatedData = createApiKeySchema.parse(formData);
      const scopesArray = validatedData.scopes.split(',').map(s => s.trim()).filter(Boolean);
      createMutation.mutate({
        name: validatedData.name,
        scopes: scopesArray,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<CreateApiKeyForm> = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof CreateApiKeyForm;
          errors[field] = err.message;
        });
        setFormErrors(errors);
      }
    }
  };

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      revokeMutation.mutate(id);
    }
  };

  const formatScopes = (scopes: string[]) => {
    return scopes.join(', ');
  };

  const maskApiKey = (key?: string) => {
    if (!key) return '(hidden)';
    return `${key.slice(0, 8)}...${key.slice(-4)}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--app-text-primary))] flex items-center gap-2">
          <Key size={24} />
          API Keys
        </h1>
        <p className="text-muted mt-1">Manage API keys for programmatic access to your data</p>
      </div>

      {/* Create API Key Form */}
      <div className="bg-[rgb(var(--app-surface))] rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} />
          Create New API Key
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Key Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`input input-bordered w-full ${formErrors.name ? 'input-error' : ''}`}
              placeholder="e.g., Production API Key"
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Scopes (comma-separated)</label>
            <input
              type="text"
              value={formData.scopes}
              onChange={(e) => handleInputChange('scopes', e.target.value)}
              className={`input input-bordered w-full ${formErrors.scopes ? 'input-error' : ''}`}
              placeholder="e.g., read,write,delete"
            />
            {formErrors.scopes && (
              <p className="text-red-500 text-sm mt-1">{formErrors.scopes}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="btn btn-primary mt-4"
        >
          {createMutation.isPending ? 'Creating...' : 'Create API Key'}
        </button>
      </div>

      {/* API Keys Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Active API Keys</h2>
        <Table
          columns={[
            {
              key: 'name',
              title: 'Name',
              render: (apiKey: ApiKey) => apiKey.name || 'Unnamed Key',
            },
            {
              key: 'key',
              title: 'API Key',
              render: (apiKey: ApiKey) => (
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {maskApiKey(apiKey.key)}
                </code>
              ),
            },
            {
              key: 'scopes',
              title: 'Scopes',
              render: (apiKey: ApiKey) => formatScopes(apiKey.scopes),
            },
            {
              key: 'isActive',
              title: 'Status',
              render: (apiKey: ApiKey) => (
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  apiKey.isActive !== false
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {apiKey.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              key: 'actions',
              title: 'Actions',
              render: (apiKey: ApiKey) => (
                <button
                  onClick={() => apiKey.id && handleRevoke(apiKey.id)}
                  disabled={revokeMutation.isPending}
                  className="btn btn-outline btn-error btn-sm"
                >
                  <Trash2 size={14} />
                  Revoke
                </button>
              ),
            },
          ]}
          data={apiKeys}
          loading={isLoading}
          emptyText="No API keys found. Create your first API key above."
        />
      </div>
    </div>
  );
}
