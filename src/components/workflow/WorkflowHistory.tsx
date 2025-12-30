import React from 'react';
import type { WorkflowInstance, WorkflowDefinition } from '../../types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock, User, MessageSquare, TrendingUp } from 'lucide-react';

interface WorkflowHistoryProps {
  instance: WorkflowInstance;
  workflow: WorkflowDefinition;
  showTimeDuration?: boolean;
}

export const WorkflowHistory = React.memo(function WorkflowHistory({
  instance,
  workflow,
  showTimeDuration = true,
}: WorkflowHistoryProps) {
  // Format duration to human readable
  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  // Get state color by ID
  const getStateColor = (stateId: string) => {
    const state = workflow.states.find((s) => s.id === stateId);
    return state?.color || '#64748b';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock size={18} />
          Workflow History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {instance.history.map((entry, index) => {
            const isFirst = index === 0;
            const isLast = index === instance.history.length - 1;
            const fromStateColor = getStateColor(entry.fromState);
            const toStateColor = getStateColor(entry.toState);

            return (
              <div key={entry.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div
                    className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gradient-to-b"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, ${toStateColor}, ${getStateColor(
                        instance.history[index + 1].toState
                      )})`,
                    }}
                  />
                )}

                {/* History Entry */}
                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: toStateColor,
                        backgroundColor: `${toStateColor}20`,
                      }}
                    >
                      {entry.automated ? (
                        <TrendingUp size={14} style={{ color: toStateColor }} />
                      ) : (
                        <User size={14} style={{ color: toStateColor }} />
                      )}
                    </div>
                  </div>

                  {/* Entry details */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Transition name */}
                        <p className="font-semibold text-[rgb(var(--app-text-primary))]">
                          {entry.transitionName}
                        </p>

                        {/* State change */}
                        <div className="flex items-center gap-2 mt-1">
                          {entry.fromState && (
                            <>
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: `${fromStateColor}20`,
                                  color: fromStateColor,
                                }}
                              >
                                {workflow.states.find((s) => s.id === entry.fromState)?.label ||
                                  entry.fromState}
                              </span>
                              <span className="text-muted text-xs">→</span>
                            </>
                          )}
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${toStateColor}20`,
                              color: toStateColor,
                            }}
                          >
                            {workflow.states.find((s) => s.id === entry.toState)?.label ||
                              entry.toState}
                          </span>
                        </div>

                        {/* Performed by */}
                        <p className="text-xs text-muted mt-2 flex items-center gap-1">
                          <User size={12} />
                          {entry.performedByName}
                          {entry.automated && (
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                              Automated
                            </span>
                          )}
                        </p>

                        {/* Comments */}
                        {entry.comments && (
                          <div className="mt-2 p-2 rounded-lg bg-[rgba(var(--app-surface-muted),0.5)] border border-[rgba(var(--app-border-subtle))]">
                            <p className="text-xs flex items-start gap-2">
                              <MessageSquare size={12} className="mt-0.5 text-muted flex-shrink-0" />
                              <span className="text-muted">{entry.comments}</span>
                            </p>
                          </div>
                        )}

                        {/* Duration in state */}
                        {showTimeDuration && entry.duration && (
                          <p className="text-xs text-muted mt-2 flex items-center gap-1">
                            <Clock size={12} />
                            Time in {workflow.states.find((s) => s.id === entry.fromState)?.label}:{' '}
                            <span className="font-medium">{formatDuration(entry.duration)}</span>
                          </p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="text-right">
                        <p className="text-xs text-muted">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Current state duration */}
          {!instance.completedAt && instance.history.length > 0 && (
            <div className="pt-4 border-t border-[rgba(var(--app-border-subtle))]">
              <p className="text-xs text-muted flex items-center gap-2">
                <Clock size={12} />
                Currently in{' '}
                <span className="font-medium">
                  {workflow.states.find((s) => s.id === instance.currentState)?.label}
                </span>{' '}
                for{' '}
                <span className="font-medium">
                  {formatDuration(
                    Date.now() - new Date(instance.history[instance.history.length - 1].timestamp).getTime()
                  )}
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default WorkflowHistory;
