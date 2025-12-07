import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/useTheme';

interface ThemeToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
}

export function ThemeToggle({ className, size = 'md', ...props }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const baseSize = size === 'sm' ? 'h-10 w-10' : 'h-11 w-11';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl border border-[rgba(var(--app-border-subtle))] bg-[rgb(var(--app-surface-muted))] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--app-primary-from),0.4)] focus-visible:ring-offset-2',
        baseSize,
        className
      )}
      aria-label="Toggle color scheme"
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.span
            key="dark"
            initial={{ opacity: 0, rotate: -20, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
            exit={{ opacity: 0, rotate: 20, scale: 0.8, y: -8 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="text-sky-300"
          >
            <Sun size={18} />
          </motion.span>
        ) : (
          <motion.span
            key="light"
            initial={{ opacity: 0, rotate: 20, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
            exit={{ opacity: 0, rotate: -20, scale: 0.8, y: 8 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="text-amber-300"
          >
            <Moon size={18} />
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-[rgba(var(--app-primary-from),0.08)] via-transparent to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </button>
  );
}
