import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export function buildTenantHeaders(tenantId?: string) {
  const headers: Record<string, string> = {};
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  return { headers };
}

export function useList<T>(key: string, fetchFn: (tenantId?: string) => Promise<T>, tenantId?: string) {
  return useQuery({
    queryKey: [key, tenantId],
    queryFn: () => fetchFn(tenantId),
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useCreate<TInput, TOutput>(key: string, createFn: (input: TInput, tenantId?: string) => Promise<TOutput>, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TInput) => createFn(input, tenantId),
    onSuccess: () => {
      toast.success('Created successfully');
      qc.invalidateQueries({ queryKey: [key, tenantId] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || 'Create failed';

      if (status === 400) {
        // Validation error - show specific field errors if available
        const errors = error?.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          toast.error(errors.join(', '));
        } else {
          toast.error(message);
        }
      } else if (status === 401) {
        toast.error('Authentication required');
      } else if (status === 403) {
        toast.error('Access denied');
      } else if (status === 404) {
        toast.error('Resource not found');
      } else if (status === 409) {
        toast.error('Conflict - resource already exists');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useUpdate<TInput, TOutput>(key: string, updateFn: (id: string, input: TInput, tenantId?: string) => Promise<TOutput>, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TInput }) => updateFn(id, data, tenantId),
    onSuccess: () => {
      toast.success('Updated successfully');
      qc.invalidateQueries({ queryKey: [key, tenantId] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || 'Update failed';

      if (status === 400) {
        const errors = error?.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          toast.error(errors.join(', '));
        } else {
          toast.error(message);
        }
      } else if (status === 401) {
        toast.error('Authentication required');
      } else if (status === 403) {
        toast.error('Access denied');
      } else if (status === 404) {
        toast.error('Resource not found');
      } else if (status === 409) {
        toast.error('Conflict - resource already exists');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useDelete(key: string, deleteFn: (id: string, tenantId?: string) => Promise<string>, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFn(id, tenantId),
    onSuccess: () => {
      toast.success('Deleted successfully');
      qc.invalidateQueries({ queryKey: [key, tenantId] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || 'Delete failed';

      if (status === 401) {
        toast.error('Authentication required');
      } else if (status === 403) {
        toast.error('Access denied');
      } else if (status === 404) {
        toast.error('Resource not found');
      } else {
        toast.error(message);
      }
    },
  });
}
