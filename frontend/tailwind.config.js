export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#151833',
        surface: '#F4F5FA',
        brand: {
          50: '#EEF0FE',
          100: '#DDE1FD',
          300: '#8B93F2',
          500: '#3E4DE0',
          600: '#3140C9',
          700: '#2632A3',
          900: '#1B2170',
        },
        coral: {
          100: '#FFE4D9',
          400: '#FF8F66',
          500: '#FF6B3D',
          600: '#EA542A',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(21,24,51,0.04), 0 8px 24px -12px rgba(21,24,51,0.12)',
        cardHover: '0 4px 8px rgba(21,24,51,0.06), 0 16px 32px -12px rgba(21,24,51,0.18)',
      },
      keyframes: {
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,61,0.45)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255,107,61,0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
