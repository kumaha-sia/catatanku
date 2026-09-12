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
      fontSize: {
        xs: ['clamp(0.65rem, 0.6rem + 0.25vw, 0.75rem)', { lineHeight: '1rem' }],      // 10.4px - 12px
        sm: ['clamp(0.75rem, 0.65rem + 0.5vw, 0.875rem)', { lineHeight: '1.25rem' }],  // 12px - 14px
        base: ['clamp(0.875rem, 0.775rem + 0.5vw, 1rem)', { lineHeight: '1.5rem' }],   // 14px - 16px
        lg: ['clamp(1rem, 0.9rem + 0.5vw, 1.125rem)', { lineHeight: '1.75rem' }],      // 16px - 18px
        xl: ['clamp(1.125rem, 1.025rem + 0.5vw, 1.25rem)', { lineHeight: '1.75rem' }], // 18px - 20px
        '2xl': ['clamp(1.25rem, 1.05rem + 1vw, 1.5rem)', { lineHeight: '2rem' }],      // 20px - 24px
        '3xl': ['clamp(1.5rem, 1.2rem + 1.5vw, 1.875rem)', { lineHeight: '2.25rem' }], // 24px - 30px
        '4xl': ['clamp(1.75rem, 1.35rem + 2vw, 2.25rem)', { lineHeight: '2.5rem' }],   // 28px - 36px
        '5xl': ['clamp(2rem, 1.2rem + 4vw, 3rem)', { lineHeight: '1.1' }],             // 32px - 48px
        '6xl': ['clamp(2.5rem, 1.5rem + 5vw, 3.75rem)', { lineHeight: '1.1' }],        // 40px - 60px
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
