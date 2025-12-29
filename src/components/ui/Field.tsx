import Label from './Label';

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export default function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
