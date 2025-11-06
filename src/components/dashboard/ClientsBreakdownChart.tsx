import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export interface ClientDatum {
  client: string;
  submissions?: number;
  interviews?: number;
  hires?: number;
}

export default function ClientsBreakdownChart({ data }: { data: ClientDatum[] }) {
  const top = (data || []).slice(0, 10);
  return (
    <div className="bg-dark-100 rounded-lg border border-dark-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">Top Clients Breakdown</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={top} margin={{ left: 10, right: 20 }}>
          <XAxis dataKey="client" interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="submissions" stackId="a" fill="#60a5fa" name="Submissions" />
          <Bar dataKey="interviews" stackId="a" fill="#a78bfa" name="Interviews" />
          <Bar dataKey="hires" stackId="a" fill="#34d399" name="Hires" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
