/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'farm-green': '#2E8B57',
        'farm-light-green': '#90EE90',
        'farm-dark-green': '#013220',
        'farm-yellow': '#FFD700',
        'farm-orange': '#FFA500',
        'farm-brown': '#8B4513',
        'farm-soil': '#8B7355'
      },
    },
  },
  plugins: [],
}