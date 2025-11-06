import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts';

export interface SkillDatum {
  name: string;
  count: number;
}

export default function TopSkillsChart({ data }: { data: SkillDatum[] }) {
  const top = (data || []).slice(0, 12);
  return (
    <div className="bg-dark-100 rounded-lg border border-dark-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">Top Skills</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={top} layout="vertical" margin={{ left: 20, right: 20 }}>
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={120} />
          <Tooltip />
          <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 4, 4]}>
            <LabelList dataKey="count" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
