/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2f7',
          100: '#d5e0ed',
          200: '#abc1db',
          300: '#80a2c9',
          400: '#5683b7',
          500: '#2c64a5',
          600: '#1e4f8a',
          700: '#163a6b',
          800: '#0e264c',
          900: '#06132d',
        },
        gold: {
          50:  '#fefaec',
          100: '#fdf3c9',
          200: '#fbe48f',
          300: '#f9d455',
          400: '#f7c421',
          500: '#c8a029',
          600: '#9f7a1e',
          700: '#775614',
          800: '#4e330a',
          900: '#261900',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
};
