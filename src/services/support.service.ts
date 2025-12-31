/**
 * Customer Support Service
 *
 * Integration with Intercom for customer support, live chat, and help center
 */

import { useIntercom } from 'react-use-intercom';

/**
 * Intercom configuration
 */
export const INTERCOM_APP_ID = import.meta.env.VITE_INTERCOM_APP_ID || '';

/**
 * User data for Intercom identification
 */
export interface IntercomUser {
  userId: string;
  email: string;
  name?: string;
  createdAt?: number;
  customAttributes?: Record<string, any>;
}

/**
 * Support service class for programmatic interactions
 */
class SupportService {
  private intercomLoaded = false;

  /**
   * Check if Intercom is available
   */
  isAvailable(): boolean {
    return this.intercomLoaded && !!INTERCOM_APP_ID;
  }

  /**
   * Mark Intercom as loaded
   */
  setLoaded(loaded: boolean): void {
    this.intercomLoaded = loaded;
  }

  /**
   * Show the messenger
   */
  showMessenger(): void {
    if (typeof window !== 'undefined' && (window as any).Intercom) {
      (window as any).Intercom('show');
    }
  }

  /**
   * Hide the messenger
   */
  hideMessenger(): void {
    if (typeof window !== 'undefined' && (window as any).Intercom) {
      (window as any).Intercom('hide');
    }
  }

  /**
   * Show a specific article
   */
  showArticle(articleId: string): void {
    if (typeof window !== 'undefined' && (window as any).Intercom) {
      (window as any).Intercom('showArticle', articleId);
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, metadata?: Record<string, any>): void {
    if (typeof window !== 'undefined' && (window as any).Intercom) {
      (window as any).Intercom('trackEvent', eventName, metadata);
    }
  }

  /**
   * Update user attributes
   */
  updateUser(attributes: Record<string, any>): void {
    if (typeof window !== 'undefined' && (window as any).Intercom) {
      (window as any).Intercom('update', attributes);
    }
  }

  /**
   * Start a new conversation with a pre-filled message
   */
  startConversation(message?: string): void {
    if (typeof window !== 'undefined' && (window as any).Intercom) {
      if (message) {
        (window as any).Intercom('showNewMessage', message);
      } else {
        (window as any).Intercom('showNewMessage');
      }
    }
  }

  /**
   * Show help center/knowledge base
   */
  showHelpCenter(): void {
    if (typeof window !== 'undefined' && (window as any).Intercom) {
      (window as any).Intercom('showSpace', 'help');
    }
  }
}

// Export singleton instance
export const supportService = new SupportService();

/**
 * React hook for using Intercom in components
 *
 * Usage:
 * const { show, hide, showNewMessage } = useSupport();
 */
export function useSupport() {
  const {
    boot,
    shutdown,
    show,
    hide,
    update,
    showNewMessage,
    trackEvent,
    showArticle,
  } = useIntercom();

  return {
    /**
     * Boot Intercom with user data
     */
    boot: (user: IntercomUser) => {
      boot({
        userId: user.userId,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        customAttributes: user.customAttributes,
      });
    },

    /**
     * Shutdown Intercom (on logout)
     */
    shutdown,

    /**
     * Show messenger
     */
    show,

    /**
     * Hide messenger
     */
    hide,

    /**
     * Update user information
     */
    update,

    /**
     * Show new message dialog
     */
    showNewMessage,

    /**
     * Track custom event
     */
    trackEvent,

    /**
     * Show help article
     */
    showArticle,

    /**
     * Show help center
     */
    showHelpCenter: () => {
      supportService.showHelpCenter();
    },

    /**
     * Check if Intercom is available
     */
    isAvailable: () => supportService.isAvailable(),
  };
}

/**
 * Common support actions
 */
export const SupportActions = {
  /**
   * Contact support about billing
   */
  contactBillingSupport: () => {
    supportService.startConversation('I have a question about billing...');
  },

  /**
   * Contact support about a bug
   */
  reportBug: (description?: string) => {
    const message = description
      ? `I found a bug: ${description}`
      : 'I found a bug...';
    supportService.startConversation(message);
  },

  /**
   * Request a feature
   */
  requestFeature: (description?: string) => {
    const message = description
      ? `Feature request: ${description}`
      : 'I have a feature request...';
    supportService.startConversation(message);
  },

  /**
   * Get help with workflows
   */
  getWorkflowHelp: () => {
    supportService.startConversation('I need help with workflows...');
  },

  /**
   * Get help with integrations
   */
  getIntegrationHelp: () => {
    supportService.startConversation('I need help with integrations...');
  },

  /**
   * General support
   */
  contactSupport: () => {
    supportService.showMessenger();
  },

  /**
   * Open help center
   */
  openHelpCenter: () => {
    supportService.showHelpCenter();
  },
};
