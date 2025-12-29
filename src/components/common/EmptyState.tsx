import type { LucideIcon } from 'lucide-react';
import Button from '../ui/Button';
import { Card } from '../ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-96">
      <Card className="w-full max-w-sm p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-app-text-primary mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-app-text-secondary mb-6">
          {description}
        </p>
        
        <div className="flex gap-3 justify-center">
          {actionLabel && onAction && (
            <Button onClick={onAction} variant="primary">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="subtle">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
