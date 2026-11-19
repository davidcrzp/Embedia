/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000', background: '#0a0a0a', surface: '#111111',
        elevated: '#171717', foreground: '#ededed', muted: '#8a8a8a',
        border: '#262626', 'border-strong': '#3d3d3d',
        primary: { DEFAULT: '#ff6b1a', foreground: '#0a0a0a' },
        'primary-soft': '#ff8a4a',
        destructive: '#e5484d', success: '#46a758',
      },
      borderRadius: { none: '0', sm: '2px', DEFAULT: '3px', md: '4px', lg: '6px' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'ui-monospace', 'monospace'] },
      fontSize: {
        'display': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'heading': ['1.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'label': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.12em' }],
      },
      keyframes: {
        pulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.4' } },
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      animation: { 'pulse-soft': 'pulse 1.6s ease-in-out infinite', spin: 'spin .7s linear infinite' },
    },
  },
  plugins: [],
};
