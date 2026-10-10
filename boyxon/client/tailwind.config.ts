import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1440px' },
      colors: {
        primary: { 50: '#FFF3E0', 100: '#FDEBD0', 500: '#E67E22', 600: '#D35400', 700: '#B85C00' },
        ink: { 900: '#1A1A1A', 700: '#2C2C2C', 500: '#5D4037', 300: '#7F8C8D', line: '#ECE5DC' },
        cream: '#FFF8F0',
        success: '#27AE60',
        danger: '#E74C3C',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: { 'card': '20px' },
    },
  },
  plugins: [],
} satisfies Config;
