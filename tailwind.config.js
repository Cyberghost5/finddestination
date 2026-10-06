/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tafiya: {
          blue: {
            DEFAULT: '#0066FF',
            50: '#F0F7FF',
            100: '#E0EFFE',
            500: '#0066FF',
            600: '#0052CC',
            700: '#003D99',
          },
          orange: {
            DEFAULT: '#FF9900',
            50: '#FFF8ED',
            100: '#FFEED4',
            500: '#FF9900',
            600: '#EA580C',
            700: '#C2410C',
          },
          gold: '#FBBF24',
          dark: '#0F172A',
          slate: '#475569',
          light: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'airbnb': '0 6px 16px rgba(0,0,0,0.12)',
        'airbnb-hover': '0 12px 28px rgba(0,0,0,0.15)',
        'search': '0 3px 12px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.08)'
      }
    },
  },
  plugins: [],
}
