import React, { useMemo } from 'react';
import type { WorkflowDefinition, WorkflowInstance, WorkflowTransition } from '../../types/workflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/Button';
import { CheckCircle, Circle, ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface WorkflowVisualizationProps {
  workflow: WorkflowDefinition;
  instance?: WorkflowInstance;
  availableTransitions?: WorkflowTransition[];
  onTransition?: (transitionId: string) => void;
  compact?: boolean;
}

export const WorkflowVisualization = React.memo(function WorkflowVisualization({
  workflow,
  instance,
  availableTransitions = [],
  onTransition,
  compact = false,
}: WorkflowVisualizationProps) {
  // Group states by type
  const stateGroups = useMemo(() => {
    const initial = workflow.states.filter((s) => s.type === 'initial');
    const intermediate = workflow.states.filter((s) => s.type === 'intermediate');
    const final = workflow.states.filter((s) => s.type === 'final');
    const error = workflow.states.filter((s) => s.type === 'error');

    return { initial, intermediate, final, error };
  }, [workflow.states]);

  // Get transitions for current state
  const currentStateTransitions = useMemo(() => {
    if (!instance) return [];
    return workflow.transitions.filter((t) => t.fromState === instance.currentState);
  }, [workflow.transitions, instance]);

  // Check if state is current
  const isCurrentState = (stateId: string) => instance?.currentState === stateId;

  // Check if state was visited
  const wasVisited = (stateId: string) => {
    if (!instance) return false;
    return instance.history.some((h) => h.toState === stateId);
  };

  // Get state icon
  const getStateIcon = (stateId: string) => {
    if (isCurrentState(stateId)) {
      return <Circle className="fill-current" size={16} />;
    }
    if (wasVisited(stateId)) {
      return <CheckCircle size={16} />;
    }
    return <Circle size={16} />;
  };

  // Get state style
  const getStateStyle = (state: any) => {
    const baseStyle = 'px-4 py-3 rounded-xl border-2 transition-all duration-200';
    const isActive = isCurrentState(state.id);
    const visited = wasVisited(state.id);

    if (isActive) {
      return `${baseStyle} border-[${state.color}] bg-[${state.color}]/20 shadow-lg scale-105`;
    }
    if (visited) {
      return `${baseStyle} border-[${state.color}]/40 bg-[${state.color}]/10`;
    }
    return `${baseStyle} border-gray-600 bg-gray-800/50 opacity-60`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {workflow.states.map((state, index) => (
          <React.Fragment key={state.id}>
            <div
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                isCurrentState(state.id)
                  ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-300'
                  : wasVisited(state.id)
                  ? 'bg-gray-700 border border-gray-600 text-gray-300'
                  : 'bg-gray-800 border border-gray-700 text-gray-500'
              }`}
            >
              {getStateIcon(state.id)}
              <span>{state.label}</span>
            </div>
            {index < workflow.states.length - 1 && (
              <ArrowRight size={14} className="text-gray-600" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{workflow.name}</CardTitle>
            <CardDescription>{workflow.description}</CardDescription>
          </div>
          {instance && (
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-muted" />
              <span className="text-muted">
                Started {new Date(instance.startedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Initial States */}
        {stateGroups.initial.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Initial State
            </p>
            <div className="flex gap-3">
              {stateGroups.initial.map((state) => (
                <div
                  key={state.id}
                  className={getStateStyle(state)}
                  style={{
                    borderColor: isCurrentState(state.id) ? state.color : undefined,
                    backgroundColor: isCurrentState(state.id)
                      ? `${state.color}20`
                      : wasVisited(state.id)
                      ? `${state.color}10`
                      : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getStateIcon(state.id)}
                    <span className="font-medium">{state.label}</span>
                  </div>
                  {state.description && (
                    <p className="text-xs text-muted mt-1">{state.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intermediate States */}
        {stateGroups.intermediate.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Progress States
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stateGroups.intermediate.map((state) => (
                <div
                  key={state.id}
                  className={getStateStyle(state)}
                  style={{
                    borderColor: isCurrentState(state.id) ? state.color : undefined,
                    backgroundColor: isCurrentState(state.id)
                      ? `${state.color}20`
                      : wasVisited(state.id)
                      ? `${state.color}10`
                      : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getStateIcon(state.id)}
                    <span className="font-medium">{state.label}</span>
                  </div>
                  {state.description && (
                    <p className="text-xs text-muted mt-1">{state.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final States */}
        {stateGroups.final.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Final States
            </p>
            <div className="flex gap-3 flex-wrap">
              {stateGroups.final.map((state) => (
                <div
                  key={state.id}
                  className={getStateStyle(state)}
                  style={{
                    borderColor: isCurrentState(state.id) ? state.color : undefined,
                    backgroundColor: isCurrentState(state.id)
                      ? `${state.color}20`
                      : wasVisited(state.id)
                      ? `${state.color}10`
                      : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getStateIcon(state.id)}
                    <span className="font-medium">{state.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Transitions */}
        {instance && availableTransitions.length > 0 && onTransition && (
          <div className="border-t border-[rgba(var(--app-border-subtle))] pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Available Actions
            </p>
            <div className="flex gap-2 flex-wrap">
              {availableTransitions.map((transition) => {
                const toState = workflow.states.find((s) => s.id === transition.toState);
                return (
                  <Button
                    key={transition.id}
                    variant="subtle"
                    size="sm"
                    onClick={() => onTransition(transition.id)}
                    className="flex items-center gap-2"
                  >
                    {transition.label}
                    {toState && (
                      <ArrowRight
                        size={14}
                        style={{ color: toState.color }}
                      />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* SLA Warning */}
        {instance?.isOverdue && (
          <div className="border-t border-[rgba(var(--app-border-subtle))] pt-4">
            <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-lg p-3">
              <AlertCircle size={18} />
              <div>
                <p className="font-semibold text-sm">SLA Overdue</p>
                <p className="text-xs text-muted">
                  This workflow exceeded the expected completion time
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default WorkflowVisualization;
