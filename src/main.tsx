import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { initializeDefaultOrganization } from './store/organizationStore'

// Initialize MSW in development behind a feature flag to mock new endpoints
// Set VITE_USE_MOCKS=true in your env to enable mocks in dev.
async function bootstrap() {
  // Initialize default organization for testing/development
  initializeDefaultOrganization();

  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true') {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({ onUnhandledRequest: 'bypass' });
    } catch {
      // proceed without mocks
    }
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
}

bootstrap();
