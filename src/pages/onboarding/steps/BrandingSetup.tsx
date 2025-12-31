import { useState } from 'react';
import { Upload, Image, Palette, Type, Eye } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import type { OnboardingData } from '../OnboardingWizard';

interface StepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Source Sans Pro',
];

const PRESET_COLORS = [
  { name: 'Blue', primary: '#3B82F6', secondary: '#8B5CF6', accent: '#10B981' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B' },
  { name: 'Green', primary: '#10B981', secondary: '#3B82F6', accent: '#F59E0B' },
  { name: 'Orange', primary: '#F59E0B', secondary: '#EF4444', accent: '#8B5CF6' },
  { name: 'Teal', primary: '#14B8A6', secondary: '#06B6D4', accent: '#10B981' },
];

export default function BrandingSetup({ data, onUpdate, onNext }: StepProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate({ logo: file });
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate({ favicon: file });
      const reader = new FileReader();
      reader.onload = (e) => setFaviconPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleColorPreset = (preset: typeof PRESET_COLORS[0]) => {
    onUpdate({
      colors: {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
          Company Logo
        </label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label className="block w-full cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-[rgba(var(--app-border))] rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                {logoPreview ? (
                  <div className="flex flex-col items-center">
                    <img src={logoPreview} alt="Logo preview" className="h-20 mb-2" />
                    <p className="text-sm text-muted">Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={32} className="text-muted mb-2" />
                    <p className="text-sm font-medium text-[rgb(var(--app-text-primary))]">
                      Upload your logo
                    </p>
                    <p className="text-xs text-muted mt-1">
                      PNG, JPG, or SVG (recommended: 200x60px)
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Favicon Upload */}
          <div className="w-32">
            <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
              Favicon
            </label>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/png,image/x-icon"
                onChange={handleFaviconUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-[rgba(var(--app-border))] rounded-lg p-4 text-center hover:border-blue-500 transition-colors h-32 flex items-center justify-center">
                {faviconPreview ? (
                  <img src={faviconPreview} alt="Favicon" className="w-8 h-8" />
                ) : (
                  <Image size={24} className="text-muted" />
                )}
              </div>
            </label>
            <p className="text-xs text-muted mt-1 text-center">32x32px</p>
          </div>
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
          <Palette size={16} className="inline mr-1" />
          Color Scheme
        </label>

        {/* Preset Colors */}
        <div className="mb-4">
          <p className="text-sm text-muted mb-3">Quick presets:</p>
          <div className="flex gap-3">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleColorPreset(preset)}
                className="group relative"
                title={preset.name}
              >
                <div className="flex gap-1 p-2 rounded-lg border-2 border-transparent group-hover:border-blue-500 transition-colors">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="text-xs text-muted text-center mt-1">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.colors.primary}
                onChange={(e) =>
                  onUpdate({
                    colors: { ...data.colors, primary: e.target.value },
                  })
                }
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={data.colors.primary}
                onChange={(e) =>
                  onUpdate({
                    colors: { ...data.colors, primary: e.target.value },
                  })
                }
                className="flex-1 px-3 py-2 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-2">
              Secondary Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.colors.secondary}
                onChange={(e) =>
                  onUpdate({
                    colors: { ...data.colors, secondary: e.target.value },
                  })
                }
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={data.colors.secondary}
                onChange={(e) =>
                  onUpdate({
                    colors: { ...data.colors, secondary: e.target.value },
                  })
                }
                className="flex-1 px-3 py-2 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.colors.accent}
                onChange={(e) =>
                  onUpdate({
                    colors: { ...data.colors, accent: e.target.value },
                  })
                }
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={data.colors.accent}
                onChange={(e) =>
                  onUpdate({
                    colors: { ...data.colors, accent: e.target.value },
                  })
                }
                className="flex-1 px-3 py-2 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--app-text-primary))] mb-2">
          <Type size={16} className="inline mr-1" />
          Typography
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-2">
              Heading Font
            </label>
            <select
              value={data.fonts.heading}
              onChange={(e) =>
                onUpdate({
                  fonts: { ...data.fonts, heading: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-2">
              Body Font
            </label>
            <select
              value={data.fonts.body}
              onChange={(e) =>
                onUpdate({
                  fonts: { ...data.fonts, body: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 bg-[rgba(var(--app-surface))] border border-[rgba(var(--app-border))] rounded-lg text-[rgb(var(--app-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye size={16} />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-8 rounded-lg"
            style={{ backgroundColor: data.colors.primary + '10' }}
          >
            <div className="bg-white rounded-lg p-6 shadow-lg">
              {logoPreview && (
                <img src={logoPreview} alt="Logo" className="h-12 mb-4" />
              )}
              <h1
                className="text-3xl font-bold mb-2"
                style={{
                  color: data.colors.primary,
                  fontFamily: data.fonts.heading,
                }}
              >
                {data.companyName || 'Your Company'}
              </h1>
              <p
                className="text-gray-600 mb-4"
                style={{ fontFamily: data.fonts.body }}
              >
                Join our team and make an impact. We're looking for talented individuals to help us grow.
              </p>
              <button
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{
                  backgroundColor: data.colors.primary,
                  fontFamily: data.fonts.body,
                }}
              >
                View Open Positions
              </button>
              <button
                className="ml-3 px-6 py-2 rounded-lg text-white font-medium"
                style={{
                  backgroundColor: data.colors.accent,
                  fontFamily: data.fonts.body,
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <p className="text-sm text-muted">
        <strong>Note:</strong> You can customize these settings further after setup is complete.
      </p>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary">
          Continue to Email Setup
        </Button>
      </div>
    </form>
  );
}
