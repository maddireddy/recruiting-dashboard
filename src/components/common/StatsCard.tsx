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
      className="card hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value.toLocaleString()}</h3>
        </div>
        <div className="p-3 bg-primary-500/20 rounded-lg">
          <Icon size={24} className="text-primary-500" />
        </div>
      </div>
    </motion.div>
  );
}
