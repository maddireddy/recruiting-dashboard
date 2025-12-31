import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/Button';
import { workflowService } from '../../services/workflow/workflow.service';
import type { WorkflowDefinition } from '../../types/workflow';

interface WorkflowCardProps {
  workflow: WorkflowDefinition;
  onUninstall: (workflowId: string) => void;
}

export default function WorkflowCard({ workflow, onUninstall }: WorkflowCardProps) {
  const [metrics, setMetrics] = useState({
    activeInstances: 0,
    completedInstances: 0,
    averageDuration: 0,
  });

  useEffect(() => {
    const loadMetrics = async () => {
      const workflowMetrics = await workflowService.getWorkflowMetrics(workflow.id);
      setMetrics(workflowMetrics);
    };

    loadMetrics();
  }, [workflow.id]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  workflow.entityType === 'candidate'
                    ? 'bg-blue-500/20 text-blue-400'
                    : workflow.entityType === 'job'
                    ? 'bg-purple-500/20 text-purple-400'
                    : workflow.entityType === 'timesheet'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {workflow.entityType}
              </span>
              {workflow.isActive && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  Active
                </span>
              )}
            </div>
            <CardTitle className="text-lg">{workflow.name}</CardTitle>
            <CardDescription className="mt-1">{workflow.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Workflow Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                {metrics.activeInstances}
              </p>
              <p className="text-xs text-muted">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                {metrics.completedInstances}
              </p>
              <p className="text-xs text-muted">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                {metrics.averageDuration > 0
                  ? `${metrics.averageDuration.toFixed(1)}h`
                  : '—'}
              </p>
              <p className="text-xs text-muted">Avg Time</p>
            </div>
          </div>

          {/* Workflow Details */}
          <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))]">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-muted">
                  {workflow.states.length} states • {workflow.transitions.length} transitions
                </p>
                <p className="text-xs text-muted mt-1">
                  SLA: {workflow.settings.slaDays ? `${workflow.settings.slaDays} days` : 'Not set'}
                </p>
              </div>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => {
                  if (confirm(`Are you sure you want to uninstall "${workflow.name}"?`)) {
                    onUninstall(workflow.id);
                  }
                }}
              >
                Uninstall
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
