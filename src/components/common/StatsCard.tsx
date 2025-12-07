import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export default function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:border-[rgba(var(--app-primary-from),0.35)] hover:shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm text-muted">{title}</p>
          <h3 className="text-3xl font-semibold text-[rgb(var(--app-text-primary))]">{value.toLocaleString()}</h3>
        </div>
        <div className="rounded-xl bg-[rgb(var(--app-primary-from))]/15 p-3">
          <Icon size={24} className="text-[rgb(var(--app-primary-from))]" />
        </div>
      </div>
    </motion.div>
  );
}
