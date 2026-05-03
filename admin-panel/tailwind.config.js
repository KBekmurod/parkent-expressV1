/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff3ed',
          100: '#ffe4cc',
          200: '#ffc499',
          300: '#ff9a5c',
          400: '#ff6a1a',
          500: '#E62B00',
          600: '#cc2500',
          700: '#a81d00',
          800: '#861800',
          900: '#6b1300',
        },
        navy: {
          DEFAULT: '#0C1E3E',
          light:   '#1a3460',
          dark:    '#060f1f',
        },
        brand: {
          start: '#E62B00',
          end:   '#FF8C00',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #E62B00 0%, #FF8C00 100%)',
      },
      boxShadow: {
        'brand': '0 4px 14px rgba(230,43,0,0.32)',
      },
    },
  },
  plugins: [],
}
