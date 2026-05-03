/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand gradient ranglar
        brand: {
          start: '#E62B00',
          end:   '#FF8C00',
        },
        // Primary - asosiy qizil-olov
        primary: {
          50:  '#fff3ed',
          100: '#ffe4cc',
          200: '#ffc499',
          300: '#ff9a5c',
          400: '#ff6a1a',
          500: '#E62B00',   // asosiy brand rang
          600: '#cc2500',
          700: '#a81d00',
          800: '#861800',
          900: '#6b1300',
        },
        // Navy - ikkilamchi rang
        navy: {
          DEFAULT: '#0C1E3E',
          light:   '#1a3460',
          dark:    '#060f1f',
        },
        // Fon ranglari
        surface: {
          DEFAULT: '#F5F7FA',
          card:    '#FFFFFF',
        },
        // Matn ranglari
        content: {
          heading: '#0C1E3E',
          body:    '#4A5568',
          muted:   '#A0AEC0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'btn': '12px',
        'btn-lg': '16px',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #E62B00 0%, #FF8C00 100%)',
        'brand-gradient-v': 'linear-gradient(180deg, #E62B00 0%, #FF8C00 100%)',
      },
      boxShadow: {
        'card': '0px 4px 12px rgba(0,0,0,0.05)',
        'card-hover': '0px 8px 24px rgba(0,0,0,0.10)',
        'btn': '0px 4px 14px rgba(230,43,0,0.35)',
      },
    },
  },
  plugins: [],
};
