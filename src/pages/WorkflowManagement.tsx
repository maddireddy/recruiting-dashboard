import { useState, useMemo, useEffect } from 'react';
import { Plus, Workflow, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { WORKFLOW_TEMPLATES } from '../config/workflowTemplates';
import { workflowEngine } from '../services/workflow.engine';
import type { WorkflowTemplate, WorkflowDefinition } from '../types/workflow';
import { logger } from '../lib/logger';

export default function WorkflowManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'recruiting' | 'staffing' | 'finance' | 'hr'>('all');
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowDefinition[]>([]);
  const [installedTemplates, setInstalledTemplates] = useState<Set<string>>(new Set());
  const [installing, setInstalling] = useState<string | null>(null);

  // Load installed workflows on mount
  useEffect(() => {
    loadInstalledWorkflows();
  }, []);

  // Load workflows from engine
  const loadInstalledWorkflows = () => {
    const workflows: WorkflowDefinition[] = [];
    const installed = new Set<string>();

    WORKFLOW_TEMPLATES.forEach((template) => {
      const workflowId = `workflow_${template.id}`;
      const workflow = workflowEngine.getWorkflow(workflowId);
      if (workflow) {
        workflows.push(workflow);
        installed.add(template.id);
      }
    });

    setActiveWorkflows(workflows);
    setInstalledTemplates(installed);
  };

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return WORKFLOW_TEMPLATES;
    return WORKFLOW_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  // Calculate real metrics from workflow engine
  const metrics = useMemo(() => {
    const allInstances: any[] = [];
    activeWorkflows.forEach((workflow) => {
      const workflowMetrics = workflowEngine.getMetrics(workflow.id);
      allInstances.push(workflowMetrics);
    });

    const totalInstances = allInstances.reduce((sum, m) => sum + m.activeInstances, 0);
    const completedToday = allInstances.reduce((sum, m) => sum + m.completedInstances, 0);
    const avgDurations = allInstances
      .map((m) => m.averageDuration)
      .filter((d) => d > 0);
    const avgCompletionTime = avgDurations.length > 0
      ? avgDurations.reduce((sum, d) => sum + d, 0) / avgDurations.length
      : 0;

    return {
      totalWorkflows: activeWorkflows.length,
      activeInstances: totalInstances,
      completedToday,
      avgCompletionTime,
    };
  }, [activeWorkflows]);

  const handleInstallTemplate = async (template: WorkflowTemplate) => {
    setInstalling(template.id);

    try {
      // Create workflow definition from template
      const workflowDefinition: WorkflowDefinition = {
        ...template.definition,
        id: `workflow_${template.id}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: localStorage.getItem('userId') || 'system',
      };

      // Register workflow in the engine
      workflowEngine.registerWorkflow(workflowDefinition);

      // Update state
      setActiveWorkflows((prev) => [...prev, workflowDefinition]);
      setInstalledTemplates((prev) => new Set([...prev, template.id]));

      // Log success
      logger.success(`Workflow "${template.name}" installed successfully`, {
        workflowId: workflowDefinition.id,
        templateId: template.id,
      });

      // In a real app, you would also persist this to the backend:
      // await api.post('/api/workflows', workflowDefinition);
    } catch (error) {
      logger.error('Failed to install workflow', error, {
        templateId: template.id,
        templateName: template.name,
      });
      alert(`Failed to install workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setInstalling(null);
    }
  };

  const handleUninstallWorkflow = async (workflowId: string) => {
    try {
      // Remove from active workflows
      setActiveWorkflows((prev) => prev.filter((w) => w.id !== workflowId));

      // Remove from installed templates
      const templateId = workflowId.replace('workflow_', '');
      setInstalledTemplates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });

      // Unregister from engine
      workflowEngine.unregisterWorkflow(workflowId);

      logger.success('Workflow uninstalled successfully', { workflowId, templateId });

      // In a real app, you would also call the backend:
      // await api.delete(`/api/workflows/${workflowId}`);
    } catch (error) {
      logger.error('Failed to uninstall workflow', error, { workflowId });
      alert(`Failed to uninstall workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const categories = [
    { id: 'all', label: 'All Workflows', count: WORKFLOW_TEMPLATES.length },
    { id: 'recruiting', label: 'Recruiting', count: WORKFLOW_TEMPLATES.filter((t) => t.category === 'recruiting').length },
    { id: 'staffing', label: 'Staffing', count: WORKFLOW_TEMPLATES.filter((t) => t.category === 'staffing').length },
    { id: 'finance', label: 'Finance', count: WORKFLOW_TEMPLATES.filter((t) => t.category === 'finance').length },
    { id: 'hr', label: 'HR', count: WORKFLOW_TEMPLATES.filter((t) => t.category === 'hr').length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Management"
        subtitle="Business Process Management (BPM) - Design, automate, and monitor workflows"
        actions={
          <div className="flex gap-2">
            <Button variant="subtle">
              View Analytics
            </Button>
            <Button variant="primary">
              <Plus size={18} />
              Create Custom Workflow
            </Button>
          </div>
        }
      />

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Active Workflows</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {metrics.totalWorkflows}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Workflow size={24} className="text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Running Instances</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {metrics.activeInstances}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp size={24} className="text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Completed Today</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {metrics.completedToday}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle size={24} className="text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Avg Completion</p>
                <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                  {metrics.avgCompletionTime}h
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock size={24} className="text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === category.id
                ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500'
                : 'bg-[rgba(var(--app-surface-muted))] text-muted border border-[rgba(var(--app-border-subtle))] hover:bg-[rgba(var(--app-surface-muted),0.8)]'
            }`}
          >
            {category.label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[rgba(var(--app-surface-elevated))] text-xs">
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Workflow Templates */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">
            Workflow Templates
          </h2>
          <p className="text-sm text-muted">
            Pre-built workflows ready to deploy in your organization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          template.category === 'recruiting'
                            ? 'bg-blue-500/20 text-blue-400'
                            : template.category === 'staffing'
                            ? 'bg-purple-500/20 text-purple-400'
                            : template.category === 'finance'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {template.category}
                      </span>
                      {template.isSystem && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300">
                          System
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Workflow Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                        {template.definition.states.length}
                      </p>
                      <p className="text-xs text-muted">States</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                        {template.definition.transitions.length}
                      </p>
                      <p className="text-xs text-muted">Transitions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                        {template.definition.settings.slaDays || '—'}
                      </p>
                      <p className="text-xs text-muted">SLA Days</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-[rgba(var(--app-surface-muted))] text-xs text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {template.definition.settings.trackHistory && (
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <CheckCircle size={14} className="text-green-400" />
                        History tracking enabled
                      </div>
                    )}
                    {template.definition.settings.requireComments && (
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <CheckCircle size={14} className="text-green-400" />
                        Comments required on transitions
                      </div>
                    )}
                    {template.definition.settings.notifyOnTransition && (
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <CheckCircle size={14} className="text-green-400" />
                        Auto-notifications enabled
                      </div>
                    )}
                    {template.definition.transitions.some((t) => t.automated) && (
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <TrendingUp size={14} className="text-purple-400" />
                        Contains automated transitions
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {installedTemplates.has(template.id) ? (
                      <Button
                        variant="subtle"
                        size="sm"
                        className="flex-1"
                        disabled
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Installed
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleInstallTemplate(template)}
                        disabled={installing === template.id}
                      >
                        {installing === template.id ? (
                          <>Installing...</>
                        ) : (
                          <>
                            <Plus size={14} className="mr-1" />
                            Install Workflow
                          </>
                        )}
                      </Button>
                    )}
                    <Button variant="subtle" size="sm">
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Workflows Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[rgb(var(--app-text-primary))]">
            Active Workflows
          </h2>
          <p className="text-sm text-muted">
            Currently deployed workflows in your organization ({activeWorkflows.length})
          </p>
        </div>

        {activeWorkflows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[rgba(var(--app-surface-muted))] flex items-center justify-center">
                  <Workflow size={32} className="text-muted" />
                </div>
                <div>
                  <p className="font-semibold text-[rgb(var(--app-text-primary))]">
                    No Active Workflows
                  </p>
                  <p className="text-sm text-muted mt-1">
                    Install a workflow template to get started
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Browse Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeWorkflows.map((workflow) => {
              const workflowMetrics = workflowEngine.getMetrics(workflow.id);
              return (
                <Card key={workflow.id}>
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
                            {workflowMetrics.activeInstances}
                          </p>
                          <p className="text-xs text-muted">Active</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                            {workflowMetrics.completedInstances}
                          </p>
                          <p className="text-xs text-muted">Completed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[rgb(var(--app-text-primary))]">
                            {workflowMetrics.averageDuration > 0
                              ? `${workflowMetrics.averageDuration.toFixed(1)}h`
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
                                handleUninstallWorkflow(workflow.id);
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
