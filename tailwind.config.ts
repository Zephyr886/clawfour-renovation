import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          100: '#EDE9FE',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        success: {
          DEFAULT: '#10B981',
          100: '#D1FAE5',
          500: '#10B981',
          700: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          100: '#FEF3C7',
          500: '#F59E0B',
          700: '#B45309',
        },
        error: {
          DEFAULT: '#EF4444',
          100: '#FEE2E2',
          500: '#EF4444',
          700: '#B91C1C',
        },
        surface: '#F9FAFB',
      },
    },
  },
  plugins: [],
}
export default config
