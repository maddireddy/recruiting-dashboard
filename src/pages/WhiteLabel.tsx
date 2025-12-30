import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWhiteLabel, updateWhiteLabel, type WhiteLabel } from '../services/whitelabel.service';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { Palette, Globe, Image, Save } from 'lucide-react';

// Zod schema for white label configuration
const whiteLabelSchema = z.object({
  domain: z.string().min(1, 'Domain is required').regex(
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/,
    'Please enter a valid domain (e.g., example.com)'
  ),
  logoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  brandColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Please enter a valid hex color (e.g., #3b82f6)'),
});

type WhiteLabelForm = z.infer<typeof whiteLabelSchema>;

export default function WhiteLabel() {
  const [formData, setFormData] = useState<WhiteLabelForm>({
    domain: '',
    logoUrl: '',
    brandColor: '#3b82f6',
  });
  const [formErrors, setFormErrors] = useState<Partial<WhiteLabelForm>>({});
  const queryClient = useQueryClient();

  // Fetch current white label config
  const { data: configData, isLoading } = useQuery({
    queryKey: ['white-label'],
    queryFn: () => whiteLabelService.get(),
  });

  // Populate form when data loads
  useEffect(() => {
    if (configData) {
      setFormData({
        domain: configData.domain || '',
        logoUrl: configData.logoUrl || '',
        brandColor: configData.brandColor || '#3b82f6',
      });
    }
  }, [configData]);

  // Save white label config mutation
  const saveMutation = useMutation({
    mutationFn: (data: WhiteLabelConfig) => whiteLabelService.save(data),
    onSuccess: (data) => {
      toast.success('White-label configuration saved successfully');
      queryClient.invalidateQueries({ queryKey: ['white-label'] });
      // Update form with saved data
      setFormData({
        domain: data.domain,
        logoUrl: data.logoUrl || '',
        brandColor: data.brandColor || '#3b82f6',
      });
      setFormErrors({});
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save white-label configuration');
    },
  });

  const handleInputChange = (field: keyof WhiteLabelForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = () => {
    try {
      const validatedData = whiteLabelSchema.parse(formData);
      saveMutation.mutate({
        domain: validatedData.domain,
        logoUrl: validatedData.logoUrl || undefined,
        brandColor: validatedData.brandColor,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<WhiteLabelForm> = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof WhiteLabelForm;
          errors[field] = err.message;
        });
        setFormErrors(errors);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4 max-w-xl">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--app-text-primary))] flex items-center gap-2">
          <Palette size={24} />
          White Label Configuration
        </h1>
        <p className="text-muted mt-1">Customize your application's branding and domain</p>
      </div>

      <div className="bg-[rgb(var(--app-surface))] rounded-lg border p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Domain */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Globe size={16} />
              Domain
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className={`input input-bordered w-full ${formErrors.domain ? 'input-error' : ''}`}
              placeholder="e.g., yourcompany.com"
            />
            {formErrors.domain && (
              <p className="text-red-500 text-sm mt-1">{formErrors.domain}</p>
            )}
            <p className="text-xs text-muted mt-1">
              The domain where your white-labeled application will be hosted
            </p>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Image size={16} />
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => handleInputChange('logoUrl', e.target.value)}
              className={`input input-bordered w-full ${formErrors.logoUrl ? 'input-error' : ''}`}
              placeholder="https://example.com/logo.png"
            />
            {formErrors.logoUrl && (
              <p className="text-red-500 text-sm mt-1">{formErrors.logoUrl}</p>
            )}
            <p className="text-xs text-muted mt-1">
              URL to your company logo (PNG, JPG, or SVG recommended)
            </p>
          </div>

          {/* Brand Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Brand Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={formData.brandColor}
                onChange={(e) => handleInputChange('brandColor', e.target.value)}
                className="w-16 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={formData.brandColor}
                onChange={(e) => handleInputChange('brandColor', e.target.value)}
                className={`input input-bordered flex-1 ${formErrors.brandColor ? 'input-error' : ''}`}
                placeholder="#3b82f6"
              />
            </div>
            {formErrors.brandColor && (
              <p className="text-red-500 text-sm mt-1">{formErrors.brandColor}</p>
            )}
            <p className="text-xs text-muted mt-1">
              Primary brand color used throughout the application
            </p>
          </div>

          {/* Preview */}
          {(formData.logoUrl || formData.brandColor !== '#3b82f6') && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium mb-3">Preview</h3>
              <div className="flex items-center gap-4">
                {formData.logoUrl && (
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div
                  className="px-3 py-1 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: formData.brandColor }}
                >
                  Brand Color
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="btn btn-primary w-full sm:w-auto"
          >
            <Save size={16} className="mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
