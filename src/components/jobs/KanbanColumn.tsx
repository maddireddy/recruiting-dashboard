import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}

export default function KanbanColumn({ id, title, color, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-dark-100 rounded-lg border ${
        isOver ? 'border-primary-500 bg-primary-500/5' : 'border-dark-200'
      } transition-colors`}
    >
      <div className={`px-4 py-3 border-b border-dark-200 rounded-t-lg ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <span className="px-2 py-1 bg-dark-300 text-xs rounded-full">{count}</span>
        </div>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
