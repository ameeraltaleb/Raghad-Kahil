/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#FDF7F6',
        'brand-peach': '#FDEEEB',
        'brand-pink': '#F6D2D0',
        'brand-rose': '#E29595',
        'brand-dark': '#1E1E1E',
        'brand-muted': '#71717A',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      }
    },
  },
  plugins: [],
}
