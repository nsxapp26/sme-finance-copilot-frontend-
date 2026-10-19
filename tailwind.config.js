/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens: values come from CSS variables in index.css (light on :root, dark on html.dark)
        ivory: 'rgb(var(--c-ivory) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          muted: 'rgb(var(--c-ink-muted) / <alpha-value>)',
          light: 'rgb(var(--c-ink-light) / <alpha-value>)',
        },
        navy: {
          deep: '#0A1230',
          surface: '#121C3E',
          card: '#18244D',
          border: '#233266',
        },
        brand: {
          DEFAULT: '#6C4CF1',
          glow: '#9B82FF',
          dark: '#5436D6',
          light: 'rgb(var(--c-brand-light) / <alpha-value>)',
        },
        resource: {
          DEFAULT: '#16C1B0',
          dark: '#0FA293',
          light: 'rgb(var(--c-resource-light) / <alpha-value>)',
          glow: '#4FE7D8',
        },
        attention: {
          DEFAULT: '#F59A23',
          dark: '#D97E0E',
          light: 'rgb(var(--c-attention-light) / <alpha-value>)',
        },
        danger: {
          DEFAULT: '#E5484D',
          dark: '#C73338',
          light: 'rgb(var(--c-danger-light) / <alpha-value>)',
        },
        borderLine: 'rgb(var(--c-border) / <alpha-value>)',
      },
      borderRadius: {
        'card': '20px',
        'btn': '14px',
        'chip': '999px',
      },
      boxShadow: {
        'soft-sm': '0 1px 2px rgb(var(--c-shadow) / 0.05)',
        'soft-md': '0 8px 24px -8px rgb(var(--c-shadow) / 0.12)',
        'soft-lg': '0 24px 60px -20px rgb(var(--c-shadow) / 0.18)',
        'glow-primary': '0 0 25px -4px rgba(108, 76, 241, 0.45)',
        'glow-resource': '0 0 25px -4px rgba(22, 193, 176, 0.45)',
        'glow-danger': '0 0 25px -4px rgba(229, 72, 77, 0.45)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', '"Noto Sans Thai"', 'Prompt', 'sans-serif'],
        display: ['Prompt', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
