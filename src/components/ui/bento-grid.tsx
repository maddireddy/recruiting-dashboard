import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

type BentoGridProps = {
  className?: string;
  children: ReactNode;
};

type BentoCardProps = {
  className?: string;
  children: ReactNode;
};

const containerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.23, 0.72, 0, 1] as const,
    },
  },
};

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <motion.section
      className={cn('grid auto-rows-[minmax(240px,1fr)] gap-4 lg:grid-cols-2 xl:grid-cols-4', className)}
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {children}
    </motion.section>
  );
}

export function BentoCard({ className, children }: BentoCardProps) {
  return (
    <motion.article variants={itemVariants} className={cn('relative flex flex-col', className)}>
      {children}
    </motion.article>
  );
}
