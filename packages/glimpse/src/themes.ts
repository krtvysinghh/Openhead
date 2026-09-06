import { ThemeDefinition } from './types';

export const defaultDark: ThemeDefinition = {
  id: 'defaultDark',
  name: 'Openhead Dark',
  backgroundColor: '#0F172A',
  primaryColor: '#6366F1',
  secondaryColor: '#38BDF8',
  accentColor: '#EC4899',
  textColor: '#F8FAFC',
  headingFont: 'Inter',
  bodyFont: 'Inter',
};

export const executiveLight: ThemeDefinition = {
  id: 'executiveLight',
  name: 'Executive Light',
  backgroundColor: '#FFFFFF',
  primaryColor: '#1E3A8A',
  secondaryColor: '#2563EB',
  accentColor: '#D97706',
  textColor: '#0F172A',
  headingFont: 'Inter',
  bodyFont: 'Inter',
};

export const emeraldModern: ThemeDefinition = {
  id: 'emeraldModern',
  name: 'Emerald Modern',
  backgroundColor: '#022C22',
  primaryColor: '#10B981',
  secondaryColor: '#34D399',
  accentColor: '#F59E0B',
  textColor: '#ECFDF5',
  headingFont: 'Inter',
  bodyFont: 'Inter',
};

export const sunsetMinimal: ThemeDefinition = {
  id: 'sunsetMinimal',
  name: 'Sunset Minimal',
  backgroundColor: '#18181B',
  primaryColor: '#F97316',
  secondaryColor: '#FB923C',
  accentColor: '#F43F5E',
  textColor: '#FAFAFA',
  headingFont: 'Georgia',
  bodyFont: 'Inter',
};

export const DEFAULT_THEMES: Record<string, ThemeDefinition> = {
  defaultDark,
  executiveLight,
  emeraldModern,
  sunsetMinimal,
};
