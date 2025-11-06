import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <div className={`flex flex-col p-5 rounded-lg bg-dark-100 border border-dark-200 min-w-[160px] ${color || ''}`}>
      <span className="text-sm text-dark-600 mb-2 flex items-center gap-2">
        {icon} {title}
      </span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}