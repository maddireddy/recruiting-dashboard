/**
 * Support Button Component
 *
 * Floating action button for customer support access
 */

import { useEffect } from 'react';
import { MessageCircle, HelpCircle, Mail } from 'lucide-react';
import { useSupport } from '../../services/support.service';
import { useAuthStore } from '../../store/authStore';

interface SupportButtonProps {
  variant?: 'floating' | 'inline';
}

export default function SupportButton({ variant = 'floating' }: SupportButtonProps) {
  const { boot, show, isAvailable } = useSupport();
  const { user, isAuthenticated } = useAuthStore();

  // Boot Intercom when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && isAvailable()) {
      boot({
        userId: user.id,
        email: user.email || '',
        name: user.name || '',
        createdAt: user.createdAt ? new Date(user.createdAt).getTime() / 1000 : undefined,
        customAttributes: {
          role: user.role,
          organizationId: user.organizationId,
        },
      });
    }
  }, [isAuthenticated, user, boot, isAvailable]);

  // Don't show button if Intercom is not configured
  if (!isAvailable()) {
    return null;
  }

  const handleClick = () => {
    show();
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Help & Support</span>
      </button>
    );
  }

  // Floating variant
  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Open support chat"
      title="Need help? Chat with us!"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}

/**
 * Support Menu Component
 *
 * Dropdown menu with support options
 */
interface SupportMenuProps {
  className?: string;
}

export function SupportMenu({ className = '' }: SupportMenuProps) {
  const { show, showHelpCenter, showNewMessage, isAvailable } = useSupport();

  if (!isAvailable()) {
    return null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <button
        onClick={() => show()}
        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Chat with Support</span>
      </button>

      <button
        onClick={() => showHelpCenter()}
        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Help Center</span>
      </button>

      <button
        onClick={() => showNewMessage('I have a question about...')}
        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Mail className="h-4 w-4" />
        <span>Contact Us</span>
      </button>
    </div>
  );
}
