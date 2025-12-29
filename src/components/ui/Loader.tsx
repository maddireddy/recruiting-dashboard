import Spinner from './Spinner';

export default function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 p-6 text-muted">
      <Spinner size={18} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
