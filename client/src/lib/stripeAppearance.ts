import type { Appearance } from '@stripe/stripe-js';

// Stripe can't read our CSS variables, so these are the hex versions of the index.css tokens.
const INK = '#1a1917';
const MUTED_TEXT = '#6b6963';
const BORDER = '#e5e3df';
const DANGER = '#b3342b';

export const stripeAppearance: Appearance = {
  theme: 'flat',
  variables: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fontSizeBase: '15px',
    spacingUnit: '4px',
    borderRadius: '10px',
    colorPrimary: INK,
    colorBackground: '#ffffff',
    colorText: INK,
    colorTextSecondary: MUTED_TEXT,
    colorTextPlaceholder: '#9a978f',
    colorDanger: DANGER,
  },
  rules: {
    '.Label': { fontWeight: '500', fontSize: '13px', color: MUTED_TEXT },
    '.Input': {
      border: `1px solid ${BORDER}`,
      boxShadow: 'none',
      padding: '12px',
      transition: 'border-color 150ms, box-shadow 150ms',
    },
    '.Input:focus': {
      border: `1px solid ${INK}`,
      boxShadow: '0 0 0 3px rgba(26, 25, 23, 0.12)',
    },
    '.Input--invalid': {
      border: `1px solid ${DANGER}`,
      boxShadow: 'none',
    },
    '.Error': { fontSize: '13px' },
    '.Tab': { border: `1px solid ${BORDER}`, boxShadow: 'none' },
    '.Tab:hover': { color: INK },
    '.Tab--selected': {
      backgroundColor: '#ffffff',
      border: `1px solid ${INK}`,
      boxShadow: 'none',
      color: INK,
    },
    '.TabIcon--selected': { fill: INK },
    '.TabLabel--selected': { color: INK },
  },
};
