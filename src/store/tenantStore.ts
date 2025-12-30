import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TenantState {
  tenantId: string | null;
  subdomain: string | null;
  setTenant: (tenantId: string, subdomain: string) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenantId: null,
      subdomain: null,
      setTenant: (tenantId, subdomain) => set({ tenantId, subdomain }),
      clearTenant: () => set({ tenantId: null, subdomain: null }),
    }),
    {
      name: 'tenant-storage',
    }
  )
);

// Helper to extract subdomain from hostname
export function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];

  // Split by dots
  const parts = host.split('.');

  // If localhost or IP, no subdomain
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null;
  }

  // If only domain.com or app.domain.com, no tenant
  if (parts.length <= 2 || parts[0] === 'app') {
    return null;
  }

  // Return first part as subdomain (e.g., "acme" from "acme.app.domain.com")
  return parts[0];
}
