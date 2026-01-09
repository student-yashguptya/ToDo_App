/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // 🌤 Warm primary palette
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // main
          600: '#4f46e5',
          700: '#4338ca',
        },

        // 🌞 Accent / success
        accent: {
          500: '#22c55e',
          600: '#16a34a',
        },

        // 🔥 Warning / active
        warm: {
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
        },

        surface: '#ffffff',
        muted: '#6b7280',
      },

      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },

      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },

      // Android + iOS friendly shadows
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        medium: '0 4px 14px rgba(0,0,0,0.12)',
      },
    },
  },

  plugins: [],
}
