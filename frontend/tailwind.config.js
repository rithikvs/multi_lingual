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
        darkBg: '#0f172a', // Deep slate/blue-black background
        darkCard: 'rgba(30, 41, 59, 0.7)', // Semi-transparent card color for glassmorphism
        accentBlue: '#38bdf8', // Neon blue glow
        accentGreen: '#10b981', // Emerald green highlights
        accentRed: '#ef4444', // SOS red glow
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(56, 189, 248, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.6)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
