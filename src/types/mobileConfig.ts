export type MobileConfig = {
  id: string;
  appVersion: string;
  minSupportedVersion?: string;
  featureFlags: Record<string, boolean>;
  createdAt?: string;
};

export type MobileConfigCreate = Omit<MobileConfig, 'id' | 'createdAt'>;
export type MobileConfigUpdate = Partial<Omit<MobileConfig, 'id'>> & { id: string };
export interface MobileAppConfig {
  id: string;
  platform: 'ios' | 'android';
  appName: string;
  bundleId: string; // com.company.app
  version?: string;
  apiBaseUrl?: string;
  features?: Record<string, boolean>; // feature flags
  updatedAt?: string;
}
