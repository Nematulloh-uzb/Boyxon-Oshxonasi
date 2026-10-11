import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1440px' },
      colors: {
        primary: { 50: '#FFF3E0', 100: '#FDEBD0', 500: '#E67E22', 600: '#D35400', 700: '#B85C00' },
        // ── New semantic tokens ──
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--surface-raised) / <alpha-value>)',
        'surface-overlay': 'rgb(var(--surface-overlay) / <alpha-value>)',
        'input-bg': 'rgb(var(--input) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        'line-strong': 'rgb(var(--line-strong) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--fg-muted) / <alpha-value>)',
        'fg-subtle': 'rgb(var(--fg-subtle) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          press: 'rgb(var(--accent-press) / <alpha-value>)',
          text: 'rgb(var(--accent-text) / <alpha-value>)',
          soft: 'var(--accent-soft)',
        },
        placeholder: 'rgb(var(--placeholder-bg) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        // ── Legacy aliases (mavjud komponentlar uchun) ──
        cream: 'rgb(var(--bg) / <alpha-value>)',
        muted: 'rgb(var(--placeholder-bg) / <alpha-value>)',
        'muted-2': 'rgb(var(--surface-raised) / <alpha-value>)',
        ink: {
          900: 'rgb(var(--fg) / <alpha-value>)',
          700: 'rgb(var(--fg) / <alpha-value>)',
          500: 'rgb(var(--fg-muted) / <alpha-value>)',
          300: 'rgb(var(--fg-subtle) / <alpha-value>)',
          line: 'rgb(var(--line) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Epilogue', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        overlay: 'var(--shadow-overlay)',
        glow: '0 8px 20px rgba(230,126,34,0.35)',
      },
      borderRadius: { 'card': '20px' },
    },
  },
  plugins: [],
} satisfies Config;
