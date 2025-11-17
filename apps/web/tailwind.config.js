/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#111827',
          accent: '#6366F1',
        },
        surface: {
          DEFAULT: '#F3F4F6',
          dark: '#1F2937',
        },
      },
    },
  },
  plugins: [],
};

