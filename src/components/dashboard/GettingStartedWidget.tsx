import { CheckCircle, PlusCircle, Users, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export function GettingStartedWidget() {
  const navigate = useNavigate();

  const steps = [
    {
      id: 'create-job',
      title: 'Create your first Job',
      description: 'Define the role, requirements, and budget to start sourcing.',
      action: () => navigate('/jobs'),
      icon: Briefcase,
    },
    {
      id: 'add-candidate',
      title: 'Upload Candidates',
      description: 'Add talent to your bench or pipeline manually or via bulk upload.',
      action: () => navigate('/candidates'),
      icon: Users,
    },
    {
      id: 'invite-team',
      title: 'Invite your team',
      description: 'Collaborate with recruiters and hiring managers.',
      action: () => navigate('/settings/team'), // Assuming a settings route exists
      icon: PlusCircle,
    },
  ];

  return (
    <Card className="relative overflow-hidden border-none bg-[rgba(var(--app-surface-elevated),0.95)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.2),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.18),transparent_60%)]" />
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-emerald-400" size={24} />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Onboarding</p>
        </div>
        <CardTitle className="text-2xl sm:text-3xl">Let's get you started</CardTitle>
        <CardDescription className="max-w-lg">
          Your dashboard is empty right now. Complete these steps to launch your recruiting engine.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col gap-3 rounded-2xl border border-[rgba(var(--app-border-subtle))] bg-[rgba(var(--app-surface-muted),0.65)] p-5 backdrop-blur-xl transition hover:bg-[rgba(var(--app-surface-muted),0.8)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(var(--app-surface-elevated),1)] text-sm font-bold text-[rgb(var(--app-text-primary))] shadow-sm">
                  {index + 1}
                </div>
                <step.icon size={18} className="text-muted" />
              </div>
              <div>
                <h4 className="font-semibold text-[rgb(var(--app-text-primary))]">{step.title}</h4>
                <p className="text-xs text-muted mt-1">{step.description}</p>
              </div>
              <Button variant="subtle" size="sm" onClick={step.action} className="mt-auto w-fit">
                Start
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
