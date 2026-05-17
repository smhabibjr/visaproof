import type { RiskScore } from '@/types';

export const Colors = {
  // Brand
  primary: '#006A4E',       // Bangladesh green
  primaryDark: '#004D38',
  primaryLight: '#E6F4F1',

  // Risk levels
  safe: '#22C55E',
  suspicious: '#F59E0B',
  highRisk: '#F97316',
  scam: '#EF4444',

  safeBg: '#F0FDF4',
  suspiciousBg: '#FFFBEB',
  highRiskBg: '#FFF7ED',
  scamBg: '#FEF2F2',

  // UI
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  border: '#E5E7EB',
  borderFocus: '#006A4E',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  // Payment (bKash)
  bkash: '#E2136E',
  bkashDark: '#B30D57',
  bkashLight: '#FCE7F1',

  // Status
  error: '#EF4444',
  errorBg: '#FEF2F2',
  success: '#22C55E',
  successBg: '#F0FDF4',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  shimmer: '#E5E7EB',
} as const;

export type AppColor = keyof typeof Colors;

export const RiskColors: Record<RiskScore, { text: string; bg: string; border: string }> = {
  SAFE:      { text: Colors.safe,     bg: Colors.safeBg,     border: Colors.safe },
  SUSPICIOUS:{ text: Colors.suspicious, bg: Colors.suspiciousBg, border: Colors.suspicious },
  HIGH_RISK: { text: Colors.highRisk, bg: Colors.highRiskBg, border: Colors.highRisk },
  SCAM:      { text: Colors.scam,     bg: Colors.scamBg,     border: Colors.scam },
};
