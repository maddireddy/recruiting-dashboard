/**
 * Accessibility Utilities
 *
 * Helper functions and hooks for building accessible components
 */

import { useEffect, useRef, RefObject } from 'react';

/**
 * Generate unique ID for form field association
 */
export function useId(prefix: string = 'id'): string {
  const id = useRef<string>();

  if (!id.current) {
    id.current = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  return id.current;
}

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement>, active: boolean = true) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(container.querySelectorAll(selector));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab: Move to last element if on first
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab: Move to first element if on last
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    // Focus first element when trap activates
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, active]);
}

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  // Create live region if it doesn't exist
  let liveRegion = document.getElementById('aria-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  } else {
    liveRegion.setAttribute('aria-live', priority);
  }

  // Clear and set new message
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion!.textContent = message;
  }, 100);

  // Clear after announcement
  setTimeout(() => {
    liveRegion!.textContent = '';
  }, 1000);
}

/**
 * Hook to manage focus on mount/unmount
 */
export function useAutoFocus(elementRef: RefObject<HTMLElement>, shouldFocus: boolean = true) {
  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      elementRef.current.focus();
    }
  }, [elementRef, shouldFocus]);
}

/**
 * Hook to restore focus after component unmounts
 */
export function useRestoreFocus() {
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;

    return () => {
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, []);
}

/**
 * Create accessible button props
 */
export interface AccessibleButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

export function createButtonProps(props: AccessibleButtonProps) {
  return {
    type: 'button' as const,
    onClick: props.onClick,
    disabled: props.disabled,
    'aria-label': props.ariaLabel,
    'aria-describedby': props.ariaDescribedBy,
    'aria-expanded': props.ariaExpanded,
    'aria-controls': props.ariaControls,
    tabIndex: props.disabled ? -1 : 0,
  };
}

/**
 * Keyboard event handlers
 */
export const keyboard = {
  /**
   * Check if Enter or Space was pressed (for custom buttons)
   */
  isActivationKey: (event: React.KeyboardEvent): boolean => {
    return event.key === 'Enter' || event.key === ' ';
  },

  /**
   * Check if Escape was pressed
   */
  isEscapeKey: (event: React.KeyboardEvent | KeyboardEvent): boolean => {
    return event.key === 'Escape' || event.key === 'Esc';
  },

  /**
   * Arrow key navigation
   */
  isArrowKey: (event: React.KeyboardEvent): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
  },

  /**
   * Handle activation (Enter/Space) on custom elements
   */
  handleActivation: (event: React.KeyboardEvent, callback: () => void) => {
    if (keyboard.isActivationKey(event)) {
      event.preventDefault();
      callback();
    }
  },
};

/**
 * ARIA helpers
 */
export const aria = {
  /**
   * Create ARIA attributes for a description
   */
  describe: (id: string) => ({
    'aria-describedby': id,
  }),

  /**
   * Create ARIA attributes for a label
   */
  label: (label: string) => ({
    'aria-label': label,
  }),

  /**
   * Create ARIA attributes for required field
   */
  required: () => ({
    'aria-required': true,
  }),

  /**
   * Create ARIA attributes for invalid field
   */
  invalid: (isInvalid: boolean) => ({
    'aria-invalid': isInvalid,
  }),

  /**
   * Create ARIA attributes for loading state
   */
  busy: (isLoading: boolean) => ({
    'aria-busy': isLoading,
  }),

  /**
   * Create ARIA attributes for expanded/collapsed state
   */
  expanded: (isExpanded: boolean) => ({
    'aria-expanded': isExpanded,
  }),

  /**
   * Create ARIA attributes for hidden state
   */
  hidden: () => ({
    'aria-hidden': true,
  }),
};

/**
 * Focus utilities
 */
export const focus = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll(selector));
  },

  /**
   * Focus first focusable element
   */
  focusFirst: (container: HTMLElement) => {
    const elements = focus.getFocusableElements(container);
    if (elements.length > 0) {
      elements[0].focus();
    }
  },

  /**
   * Focus last focusable element
   */
  focusLast: (container: HTMLElement) => {
    const elements = focus.getFocusableElements(container);
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  },
};

/**
 * Visually hidden but available to screen readers
 */
export const visuallyHidden = {
  className: 'sr-only',
  style: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    borderWidth: 0,
  },
};
