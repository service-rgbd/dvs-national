/**
 * Design tokens PNIGVS — Orange · Blanc · Vert (~20 % / ~25 % / ~55 %).
 * Les composants consomment les variables CSS définies dans design-tokens.css.
 */
export const designTokens = {
  color: {
    primary: '#008751',
    primaryDark: '#006B40',
    primaryForeground: '#FFFFFF',
    accent: '#F77F00',
    accentDark: '#D96D00',
    accentLight: '#FFF4E6',
    ink: '#1A1A1F',
    muted: '#5C5C66',
    paper: '#FBFAF7',
    cream: '#FFF8EE',
    surface: '#FFFFFF',
    border: '#D9D9D4',
    footer: '#0D3D2B',
    footerMuted: '#C8E6D4',
  },
  font: {
    sans: "'DM Sans', sans-serif",
    mono: "'Space Mono', monospace",
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
  spacing: {
    containerMax: '1240px',
    sectionY: '68px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
  },
  state: {
    success: '#008751',
    warning: '#F77F00',
    error: '#B42318',
    info: '#175CD3',
    disabled: '#A3A3A8',
  },
} as const;

export type DesignTokens = typeof designTokens;
