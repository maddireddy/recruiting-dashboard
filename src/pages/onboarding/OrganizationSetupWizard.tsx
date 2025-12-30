import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Briefcase, Palette, UserPlus, Check, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import { useOrganizationStore, PLAN_LIMITS, PlanTier } from '../../store/organizationStore';
import { useTenantStore } from '../../store/tenantStore';

// Validation schemas
const step1Schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(20, 'Subdomain must be less than 20 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  employeeCount: z.string(),
});

const step2Schema = z.object({
  industry: z.string().min(1, 'Please select an industry'),
});

const step3Schema = z.object({
  brandColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Valid hex color required'),
  logo: z.string().optional(),
});

const step4Schema = z.object({
  adminName: z.string().min(2, 'Name is required'),
  adminEmail: z.string().email('Valid email required'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;

// Industry templates with smart defaults
const INDUSTRY_TEMPLATES = {
  tech: {
    label: 'Technology',
    pipeline: ['Screening', 'Code Test', 'Technical Interview', 'Team Interview', 'Offer'],
    description: 'Optimized for software engineering and technical roles',
  },
  healthcare: {
    label: 'Healthcare',
    pipeline: ['Credential Check', 'Initial Interview', 'Skills Assessment', 'Final Interview', 'Offer'],
    description: 'Includes credential verification and compliance checks',
  },
  retail: {
    label: 'Retail',
    pipeline: ['Application Review', 'Phone Screen', 'In-Person Interview', 'Background Check', 'Offer'],
    description: 'Streamlined for high-volume hiring',
  },
  staffing: {
    label: 'Staffing Agency',
    pipeline: ['Candidate Intake', 'Skill Verification', 'Client Submittal', 'Interview', 'Placement'],
    description: 'Built for recruitment agencies and staffing firms',
  },
  finance: {
    label: 'Finance & Banking',
    pipeline: ['Resume Review', 'Phone Screen', 'Technical Interview', 'Compliance Check', 'Offer'],
    description: 'Enhanced compliance and background verification',
  },
};

const STEPS = [
  { number: 1, title: 'Organization Profile', icon: Building2 },
  { number: 2, title: 'Business Logic', icon: Briefcase },
  { number: 3, title: 'Branding', icon: Palette },
  { number: 4, title: 'Admin Account', icon: UserPlus },
];

export default function OrganizationSetupWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data & Step4Data>>({
    brandColor: '#3498db',
  });
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const { setOrganization } = useOrganizationStore();
  const { setTenant } = useTenantStore();

  const step1Form = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const step2Form = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });
  const step3Form = useForm<Step3Data>({ resolver: zodResolver(step3Schema) });
  const step4Form = useForm<Step4Data>({ resolver: zodResolver(step4Schema) });

  // Check subdomain availability
  const checkSubdomain = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) return;

    setSubdomainChecking(true);
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get(`/api/subdomain/check?subdomain=${subdomain}`);
      // setSubdomainAvailable(response.data.available);

      // Mock check - in real implementation, call backend
      await new Promise(resolve => setTimeout(resolve, 500));
      const reserved = ['app', 'www', 'admin', 'api', 'mail'];
      setSubdomainAvailable(!reserved.includes(subdomain.toLowerCase()));
    } catch (error) {
      toast.error('Failed to check subdomain availability');
    } finally {
      setSubdomainChecking(false);
    }
  };

  const handleStep1Submit = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleStep3Submit = (data: Step3Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  const handleStep4Submit = async (data: Step4Data) => {
    const finalData = { ...formData, ...data };

    try {
      // TODO: Call backend to create organization
      // const response = await axios.post('/api/organizations/setup', finalData);

      // Mock organization creation
      const mockOrganization = {
        id: 'org-' + Math.random().toString(36).substr(2, 9),
        name: finalData.companyName!,
        subdomain: finalData.subdomain!,
        logo: finalData.logo,
        brandColor: finalData.brandColor!,
        website: finalData.website,
        industry: finalData.industry,
        employeeCount: finalData.employeeCount,
        planTier: 'freemium' as PlanTier,
        planLimits: PLAN_LIMITS.freemium,
        billingInterval: 'monthly' as const,
        createdAt: new Date().toISOString(),
        settings: {
          pipeline: INDUSTRY_TEMPLATES[finalData.industry as keyof typeof INDUSTRY_TEMPLATES]?.pipeline,
        },
      };

      setOrganization(mockOrganization);
      setTenant(mockOrganization.subdomain, mockOrganization.subdomain);

      toast.success('Organization created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create organization');
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--app-background))] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--app-text-primary))] mb-2">
            Welcome to Your Recruiting Platform
          </h1>
          <p className="text-muted">Let's set up your organization in 4 simple steps</p>
        </div>

        {/* Stepper */}
        <div className="card mb-8 p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all
                        ${isCompleted ? 'bg-[rgb(var(--app-success))] text-white' : ''}
                        ${isActive ? 'bg-[rgb(var(--app-primary))] text-white' : ''}
                        ${!isActive && !isCompleted ? 'bg-[rgb(var(--app-surface-muted))] text-muted' : ''}
                      `}
                    >
                      {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                    </div>
                    <span className={`text-xs mt-2 text-center ${isActive ? 'text-[rgb(var(--app-text-primary))] font-medium' : 'text-muted'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-[rgb(var(--app-success))]' : 'bg-[rgb(var(--app-border-subtle))]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="card p-8">
          {/* Step 1: Organization Profile */}
          {currentStep === 1 && (
            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                  Organization Profile
                </h2>
                <p className="text-muted text-sm">Tell us about your company</p>
              </div>

              <Field label="Company Name" htmlFor="companyName" error={step1Form.formState.errors.companyName?.message} required>
                <input
                  id="companyName"
                  {...step1Form.register('companyName')}
                  className="input"
                  placeholder="Acme Corp"
                />
              </Field>

              <Field label="Website" htmlFor="website" error={step1Form.formState.errors.website?.message}>
                <input
                  id="website"
                  type="url"
                  {...step1Form.register('website')}
                  className="input"
                  placeholder="https://acme.com"
                />
              </Field>

              <Field
                label="Subdomain Preference"
                htmlFor="subdomain"
                error={step1Form.formState.errors.subdomain?.message}
                hint="Your unique URL: {subdomain}.app.domain.com"
                required
              >
                <div className="relative">
                  <input
                    id="subdomain"
                    {...step1Form.register('subdomain')}
                    className="input pr-24"
                    placeholder="acme"
                    onChange={(e) => checkSubdomain(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                    .app.domain.com
                  </span>
                </div>
                {subdomainChecking && <p className="text-xs text-muted mt-1">Checking availability...</p>}
                {subdomainAvailable === true && <p className="text-xs text-[rgb(var(--app-success))] mt-1">✓ Available</p>}
                {subdomainAvailable === false && <p className="text-xs text-[rgb(var(--app-error))] mt-1">× Not available</p>}
              </Field>

              <Field label="Employee Count" htmlFor="employeeCount" required>
                <select id="employeeCount" {...step1Form.register('employeeCount')} className="input">
                  <option value="">Select range</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
              </Field>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="lg">
                  Next Step
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Business Logic */}
          {currentStep === 2 && (
            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                  Business Logic & Smart Defaults
                </h2>
                <p className="text-muted text-sm">We'll configure your ATS based on your industry</p>
              </div>

              <Field label="Industry" htmlFor="industry" error={step2Form.formState.errors.industry?.message} required>
                <select id="industry" {...step2Form.register('industry')} className="input">
                  <option value="">Select your industry</option>
                  {Object.entries(INDUSTRY_TEMPLATES).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </Field>

              {step2Form.watch('industry') && (
                <div className="card bg-[rgba(var(--app-primary),0.05)] border border-[rgba(var(--app-primary),0.2)]">
                  <h3 className="text-sm font-semibold text-[rgb(var(--app-text-primary))] mb-3">
                    Default Pipeline Preview
                  </h3>
                  <p className="text-xs text-muted mb-4">
                    {INDUSTRY_TEMPLATES[step2Form.watch('industry') as keyof typeof INDUSTRY_TEMPLATES]?.description}
                  </p>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {INDUSTRY_TEMPLATES[step2Form.watch('industry') as keyof typeof INDUSTRY_TEMPLATES]?.pipeline.map((stage, index) => (
                      <div key={index} className="flex items-center">
                        <div className="px-4 py-2 rounded-lg bg-[rgba(var(--app-primary),0.15)] text-[rgb(var(--app-primary))] text-sm font-medium whitespace-nowrap">
                          {stage}
                        </div>
                        {index < (INDUSTRY_TEMPLATES[step2Form.watch('industry') as keyof typeof INDUSTRY_TEMPLATES]?.pipeline.length || 0) - 1 && (
                          <ChevronRight size={16} className="text-muted mx-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button type="button" variant="subtle" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button type="submit" variant="primary" size="lg">
                  Next Step
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Branding */}
          {currentStep === 3 && (
            <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                  Branding & Appearance
                </h2>
                <p className="text-muted text-sm">Customize your platform's look and feel</p>
              </div>

              <Field label="Primary Brand Color" htmlFor="brandColor" error={step3Form.formState.errors.brandColor?.message} required>
                <div className="flex items-center gap-4">
                  <input
                    id="brandColor"
                    type="color"
                    {...step3Form.register('brandColor')}
                    className="w-20 h-12 rounded border border-[rgba(var(--app-border-subtle))] cursor-pointer"
                    defaultValue="#3498db"
                  />
                  <input
                    type="text"
                    {...step3Form.register('brandColor')}
                    className="input flex-1"
                    placeholder="#3498db"
                  />
                </div>
              </Field>

              {step3Form.watch('brandColor') && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-[rgb(var(--app-text-primary))] mb-3">
                    Live Preview
                  </h3>
                  <div className="p-4 rounded-lg border border-[rgba(var(--app-border-subtle))]">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: step3Form.watch('brandColor') }}
                      >
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div
                          className="h-2 w-32 rounded"
                          style={{ backgroundColor: step3Form.watch('brandColor') }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium transition"
                      style={{ backgroundColor: step3Form.watch('brandColor') }}
                    >
                      Sample Button
                    </button>
                  </div>
                </div>
              )}

              <Field label="Logo Upload" htmlFor="logo" hint="Optional - You can upload this later">
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // TODO: Upload to server and get URL
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        step3Form.setValue('logo', reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="input"
                />
              </Field>

              <div className="flex justify-between">
                <Button type="button" variant="subtle" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button type="submit" variant="primary" size="lg">
                  Next Step
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 4: Admin Account */}
          {currentStep === 4 && (
            <form onSubmit={step4Form.handleSubmit(handleStep4Submit)} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--app-text-primary))] mb-2">
                  Create Admin Account
                </h2>
                <p className="text-muted text-sm">Set up your administrator credentials</p>
              </div>

              <Field label="Full Name" htmlFor="adminName" error={step4Form.formState.errors.adminName?.message} required>
                <input
                  id="adminName"
                  {...step4Form.register('adminName')}
                  className="input"
                  placeholder="John Doe"
                />
              </Field>

              <Field label="Email Address" htmlFor="adminEmail" error={step4Form.formState.errors.adminEmail?.message} required>
                <input
                  id="adminEmail"
                  type="email"
                  {...step4Form.register('adminEmail')}
                  className="input"
                  placeholder="admin@acme.com"
                />
              </Field>

              <Field label="Password" htmlFor="adminPassword" error={step4Form.formState.errors.adminPassword?.message} required>
                <input
                  id="adminPassword"
                  type="password"
                  {...step4Form.register('adminPassword')}
                  className="input"
                  placeholder="Minimum 8 characters"
                />
              </Field>

              <Field label="Confirm Password" htmlFor="confirmPassword" error={step4Form.formState.errors.confirmPassword?.message} required>
                <input
                  id="confirmPassword"
                  type="password"
                  {...step4Form.register('confirmPassword')}
                  className="input"
                  placeholder="Re-enter password"
                />
              </Field>

              <div className="flex justify-between">
                <Button type="button" variant="subtle" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button type="submit" variant="primary" size="lg">
                  Complete Setup
                  <Check size={18} className="ml-2" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
