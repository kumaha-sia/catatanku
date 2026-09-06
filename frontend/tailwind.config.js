/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F7F4',
        surface: '#FFFFFF',
        'surface-muted': '#F1F2EE',
        'text-primary': '#171B22',
        'text-secondary': '#5C6470',
        border: '#E4E6E1',
        primary: '#0C6B58',
        'primary-soft': '#E5F2EF',
        accent: '#FFB43A',
        income: '#12B76A',
        expense: '#E5484D',
        transfer: '#2E90FA',
        warning: '#F79009',
        error: '#D92D20',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        serif: ['Plus Jakarta Sans', 'serif'], // Override serif since we want a modern look everywhere now
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
