/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        government: {
          navy: '#00205B', // Deep navy blue
          white: '#FFFFFF',
          lightgray: '#F3F4F6', // Tailwind gray-100
          blue: '#0052A3', // Brighter blue for interactive elements
          darkgray: '#374151'
        }
      }
    },
  },
  plugins: [],
}
