/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976D2',
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#1976D2',
          600: '#1565C0',
          700: '#0D47A1',
          800: '#0A3D8F',
          900: '#072F6B',
        },
        success: '#28C76F',
        warning: '#FF9F43',
        error: '#EA5455',
        info: '#00CFE8',
      },
    },
  },
  plugins: [],
};
