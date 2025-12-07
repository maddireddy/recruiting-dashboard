import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  accent: {
    header: string;
    badge: string;
  };
  count: number;
  children: ReactNode;
}

export default function KanbanColumn({ id, title, accent, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`card flex h-full flex-col p-0 transition duration-200 ${isOver ? 'border-[rgba(var(--app-primary-from),0.55)] shadow-xl' : ''}`}
    >
      <div className={`flex items-center justify-between border-b border-[rgba(var(--app-border-subtle))] px-4 py-3 ${accent.header}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide">{title}</h3>
        </div>
        <span className={`chip ${accent.badge}`}>{count}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {children}
      </div>
    </div>
  );
}
