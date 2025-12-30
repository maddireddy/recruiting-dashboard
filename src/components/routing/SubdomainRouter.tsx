import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenantStore, extractSubdomain } from '../../store/tenantStore';
import { useOrganizationStore } from '../../store/organizationStore';

/**
 * SubdomainRouter - Handles multi-tenant routing based on subdomain
 *
 * Routing Logic:
 * - app.domain.com → Public landing/login
 * - *.app.domain.com (e.g., acme.app.domain.com) → Tenant dashboard
 * - localhost → Development mode (no tenant)
 */
export function SubdomainRouter({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTenant, subdomain } = useTenantStore();
  const { organization } = useOrganizationStore();

  useEffect(() => {
    const hostname = window.location.hostname;
    const detectedSubdomain = extractSubdomain(hostname);

    // If subdomain detected and not yet set
    if (detectedSubdomain && detectedSubdomain !== subdomain) {
      setTenant(detectedSubdomain, detectedSubdomain);

      // If we have subdomain but no organization loaded, redirect to login
      if (!organization && location.pathname !== '/login') {
        navigate('/login');
      }
    }

    // If no subdomain and trying to access protected routes
    if (!detectedSubdomain && location.pathname !== '/login' && location.pathname !== '/signup') {
      // Allow localhost development without subdomain
      if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
        // In development, allow access with default tenant
        if (!subdomain) {
          setTenant('default', 'default');
        }
      } else {
        // Production: redirect to main app landing
        window.location.href = `${window.location.protocol}//app.${hostname}`;
      }
    }
  }, [subdomain, organization, location.pathname, navigate, setTenant]);

  return <>{children}</>;
}
