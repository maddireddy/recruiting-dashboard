import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

type Point = Record<string, any> & {
  period?: string;
  month?: string;
  submissions?: number;
  interviews?: number;
  offers?: number;
  hires?: number;
};

export default function TrendLineChart({ data }: { data: Point[] }) {
  // Ensure data is always an array for Recharts
  const safeData = Array.isArray(data) ? data : [];
  const xKey = safeData.length > 0 ? (safeData[0].month !== undefined ? 'month' : 'period') : 'period';
  return (
    <div className="bg-dark-100 rounded-lg border border-dark-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">Monthly Pipeline Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={safeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="submissions" stroke="#60a5fa" name="Submissions" dot={false} />
          <Line type="monotone" dataKey="interviews" stroke="#a78bfa" name="Interviews" dot={false} />
          <Line type="monotone" dataKey="offers" stroke="#34d399" name="Offers" dot={false} />
          <Line type="monotone" dataKey="hires" stroke="#f59e0b" name="Hires" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
