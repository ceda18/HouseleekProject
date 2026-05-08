/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F2F2F7',
        surface: '#FFFFFF',
        'surface-raised': '#F8F8FC',
        border: '#E4E4EF',
        accent: {
          DEFAULT: '#00BAC7',
          hover: '#009EB0',
          press: '#0087A0',
          soft: '#E6F8FA',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#6B6B8A',
          muted: '#A0A0BB',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset, 0 -1px 0 rgba(0,0,0,0.04) inset',
        'glass-lg': '0 16px 48px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.85) inset',
        'glass-sm': '0 4px 16px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.7) inset',
      },
      backdropBlur: {
        xs: '6px',
        glass: '20px',
        'glass-lg': '40px',
      },
    },
  },
  plugins: [],
}
