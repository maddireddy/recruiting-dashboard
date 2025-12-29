import Button from './Button';

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="section-title">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[rgb(var(--app-text-muted))]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{actions ?? <Button variant="subtle">Action</Button>}</div>
    </div>
  );
}
