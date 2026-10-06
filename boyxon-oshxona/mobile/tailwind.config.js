/** @type {import('tailwindcss').Config} */
// DESIGN.md ranglari — Boyxon Oshxonasi (Expo / NativeWind v4)
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        surface: '#FFF8F1',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F9F3EB',
        'surface-container': '#F4EDE5',
        'surface-container-high': '#EEE7DF',
        'surface-container-highest': '#E8E1DA',
        'on-surface': '#1E1B17',
        'on-surface-variant': '#5C403F',
        outline: '#906F6E',
        'outline-variant': '#E5BDBB',
        primary: '#9E001F',
        'primary-container': '#C8102E',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#FFDAD8',
        'primary-fixed': '#FFDAD8',
        secondary: '#825500',
        'secondary-container': '#FDAB12',
        'secondary-fixed': '#FFDDB3',
        'on-secondary-fixed': '#291800',
        error: '#BA1A1A',
        'error-container': '#FFDAD6',
        success: '#1B7A3D',
        'success-container': '#D6F5DF',
      },
      fontFamily: {
        headline: ['Epilogue'],
        body: ['Inter'],
      },
      borderRadius: {
        DEFAULT: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        full: 9999,
      },
    },
  },
  plugins: [],
};
