import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface FunnelData {
  status: string;
  count: number;
}

export function SubmissionFunnelChart({ data }: { data: FunnelData[] }) {
  return (
    <div className="bg-dark-100 rounded-lg border border-dark-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">Submissions Pipeline</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="status" />
          <YAxis allowDecimals={false}/>
          <Tooltip />
          <Bar dataKey="count" fill="#22c55e" radius={[5, 5, 0, 0]}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SubmissionFunnelChart;