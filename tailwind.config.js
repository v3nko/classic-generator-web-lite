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
        surface: {
          base: 'var(--surface-base)',
          card: 'var(--surface-card)',
          cardMuted: 'var(--surface-card-muted)',
          cardBorder: 'var(--surface-card-border)',
          inner: 'var(--surface-inner)',
          innerBorder: 'var(--surface-inner-border)',
          pillHover: 'var(--surface-pill-hover)',
          subPill: 'var(--surface-sub-pill)',
          subPillBorder: 'var(--surface-sub-pill-border)',
          subPillActive: 'var(--surface-sub-pill-active)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          subdued: 'var(--text-subdued)',
        },
        brand: {
          accent: '#ffffff',
          dim: '#8f939d',
          highlight: '#38bdf8',
          success: '#22c55e',
          successMuted: 'rgba(34, 197, 94, 0.15)',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card-glow': 'var(--card-shadow)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
