/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appBg: '#f1f5f9',
        appSurface: '#ffffff',
        appBorder: '#e2e8f0',
        appMuted: '#64748b',
        darkBg: '#f1f5f9',
        darkCard: '#ffffff',
        accentBlue: '#0284c7',
        accentGreen: '#059669',
        accentRed: '#dc2626',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.1), 0 8px 24px rgba(15, 23, 42, 0.06)',
        'sos': '0 4px 24px rgba(220, 38, 38, 0.35), 0 0 0 8px rgba(220, 38, 38, 0.12)',
      },
    },
  },
  plugins: [],
}
