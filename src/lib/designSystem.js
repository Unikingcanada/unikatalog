/**
 * Unified Design System for Uniking
 * Enforces consistent typography, colors, and spacing across all pages
 */

export const COLORS = {
  // Primary
  navy: "#003c5b",
  navyMid: "#1A3A5C",
  navyLight: "#2A5080",
  
  // Accent
  gold: "#C9A84C",
  goldLight: "#e8c96d",
  
  // Status
  green: "#16a34a",
  greenBg: "#f0fdf4",
  red: "#dc2626",
  redBg: "#fee2e2",
  orange: "#c2410c",
  orangeBg: "#ffedd5",
  blue: "#2563eb",
  blueBg: "#eff6ff",
  
  // Neutral
  background: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  textMid: "#1e293b",
  muted: "#64748b",
  mutedLight: "#94a3b8",
  slate: "#334155",
};

export const TYPOGRAPHY = {
  // Page titles
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.2,
    color: COLORS.text,
    fontFamily: "'Inter', sans-serif",
  },
  
  // Section titles
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.2,
    color: COLORS.text,
    fontFamily: "'Inter', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  
  // Card/Product titles
  cardTitle: {
    fontSize: 13,
    fontWeight: 800,
    lineHeight: 1.3,
    color: COLORS.text,
    fontFamily: "'Inter', sans-serif",
  },
  
  // Descriptions/body text
  description: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.5,
    color: COLORS.muted,
    fontFamily: "'Inter', sans-serif",
  },
  
  // Labels/secondary text
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.mutedLight,
    fontFamily: "'Inter', sans-serif",
  },
  
  // Small text
  small: {
    fontSize: 10,
    fontWeight: 400,
    color: COLORS.muted,
    fontFamily: "'Inter', sans-serif",
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
  round: 12,
};

export const SHADOWS = {
  sm: "0 1px 3px rgba(0,60,91,0.05)",
  md: "0 2px 8px rgba(0,60,91,0.08)",
  lg: "0 4px 16px rgba(0,60,91,0.12)",
  xl: "0 6px 24px rgba(0,60,91,0.15)",
};

// Helper function to merge typography styles
export function getTypography(type, overrides = {}) {
  return { ...TYPOGRAPHY[type], ...overrides };
}