import { CheckCircle2, Rocket, ArrowRight, Book, Users, Globe } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import type { OnboardingData } from '../OnboardingWizard';

interface StepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Complete({ data, onNext }: StepProps) {
  const emailDomain = data.customDomain || `${data.subdomain || 'mycompany'}.recruitpro.com`;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
          <CheckCircle2 size={40} className="text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-[rgb(var(--app-text-primary))] mb-2">
          Setup Complete!
        </h2>
        <p className="text-lg text-muted">
          Your organization is ready to start recruiting
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Organization Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted mb-1">Company Name</p>
              <p className="font-medium text-[rgb(var(--app-text-primary))]">
                {data.companyName}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted mb-1">Industry</p>
              <p className="font-medium text-[rgb(var(--app-text-primary))]">
                {data.industry}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted mb-1">Subscription Plan</p>
              <p className="font-medium text-[rgb(var(--app-text-primary))] capitalize">
                {data.subscriptionPlan}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted mb-1">Company Size</p>
              <p className="font-medium text-[rgb(var(--app-text-primary))]">
                {data.companySize}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted mb-1">Career Site URL</p>
              <a
                href={`https://${emailDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-400 hover:underline flex items-center gap-1"
              >
                {emailDomain}
                <ArrowRight size={14} />
              </a>
            </div>

            <div>
              <p className="text-sm text-muted mb-1">Email Domain</p>
              <p className="font-medium text-[rgb(var(--app-text-primary))]">
                @{emailDomain}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--app-text-primary))] mb-4">
          Recommended Next Steps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Add Team Members */}
          <Card className="hover:border-blue-500/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-blue-400" />
                </div>
                <CardTitle className="text-base">Add Team Members</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-3">
                Invite recruiters and hiring managers to your organization
              </p>
              <Button variant="subtle" size="sm" className="w-full">
                Add Users
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Customize Career Site */}
          <Card className="hover:border-blue-500/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Globe size={20} className="text-purple-400" />
                </div>
                <CardTitle className="text-base">Customize Career Site</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-3">
                Build your career website with our visual editor
              </p>
              <Button variant="subtle" size="sm" className="w-full">
                Open Website Builder
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Learn More */}
          <Card className="hover:border-blue-500/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Book size={20} className="text-green-400" />
                </div>
                <CardTitle className="text-base">Learn the Platform</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted mb-3">
                Watch video tutorials and read our documentation
              </p>
              <Button variant="subtle" size="sm" className="w-full">
                View Training
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* What's Included */}
      <Card>
        <CardHeader>
          <CardTitle>What's Included in Your Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-[rgb(var(--app-text-primary))]">
                Branded career website
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-[rgb(var(--app-text-primary))]">
                SSL certificate (HTTPS)
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-[rgb(var(--app-text-primary))]">
                Email infrastructure
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-[rgb(var(--app-text-primary))]">
                Applicant tracking system
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-[rgb(var(--app-text-primary))]">
                Interview scheduling
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-[rgb(var(--app-text-primary))]">
                Workflow automation
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-[rgb(var(--app-text-primary))]">
                Analytics & reporting
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-[rgb(var(--app-text-primary))]">
                24/7 support access
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold text-[rgb(var(--app-text-primary))] mb-1">
              Need Help Getting Started?
            </h4>
            <p className="text-sm text-muted mb-3">
              Our team is here to help! Schedule a free onboarding call or chat with us.
            </p>
            <div className="flex gap-2">
              <Button variant="subtle" size="sm">
                Schedule Call
              </Button>
              <Button variant="subtle" size="sm">
                Chat with Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          className="px-8"
        >
          <Rocket size={18} className="mr-2" />
          Launch Dashboard
        </Button>
      </div>
    </div>
  );
}
