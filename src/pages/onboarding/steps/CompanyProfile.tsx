import { Building2, Globe, MapPin, Hash } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import type { OnboardingData } from '../OnboardingWizard';

interface StepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const INDUSTRIES = [
  'Information Technology',
  'Healthcare',
  'Finance & Banking',
  'Consulting',
  'Manufacturing',
  'Retail',
  'Education',
  'Real Estate',
  'Staffing & Recruiting',
  'Other',
];

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

export default function CompanyProfile({ data, onUpdate, onNext }: StepProps) {
  const isValid =
    data.companyName &&
    data.industry &&
    data.companySize &&
    data.headquarters.city &&
    data.headquarters.country;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
            Company Name *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <Input
              type="text"
              placeholder="Acme Corporation"
              value={data.companyName}
              onChange={(e) => onUpdate({ companyName: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
            Industry *
          </label>
          <select
            value={data.industry}
            onChange={(e) => onUpdate({ industry: e.target.value })}
            className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select an industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
            Company Size *
          </label>
          <select
            value={data.companySize}
            onChange={(e) => onUpdate({ companySize: e.target.value })}
            className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select company size</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Headquarters */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
            Headquarters Location *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <Input
                type="text"
                placeholder="City"
                value={data.headquarters.city}
                onChange={(e) =>
                  onUpdate({
                    headquarters: { ...data.headquarters, city: e.target.value },
                  })
                }
                className="pl-10"
                required
              />
            </div>
            <Input
              type="text"
              placeholder="State/Province"
              value={data.headquarters.state}
              onChange={(e) =>
                onUpdate({
                  headquarters: { ...data.headquarters, state: e.target.value },
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              type="text"
              placeholder="Zip/Postal Code"
              value={data.headquarters.zip}
              onChange={(e) =>
                onUpdate({
                  headquarters: { ...data.headquarters, zip: e.target.value },
                })
              }
            />
            <select
              value={data.headquarters.country}
              onChange={(e) =>
                onUpdate({
                  headquarters: { ...data.headquarters, country: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="India">India</option>
              <option value="Australia">Australia</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Tax ID / Business Registration */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
            Tax ID / Business Registration Number
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <Input
              type="text"
              placeholder="EIN, VAT, GST, or Tax ID"
              value={data.taxId}
              onChange={(e) => onUpdate({ taxId: e.target.value })}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted mt-1">
            For billing and compliance purposes (optional)
          </p>
        </div>

        {/* Website (Optional) */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
            Existing Website (Optional)
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <Input
              type="url"
              placeholder="https://www.yourcompany.com"
              value={data.website || ''}
              onChange={(e) => onUpdate({ website: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" disabled={!isValid}>
          Continue to Subscription
        </Button>
      </div>
    </form>
  );
}
