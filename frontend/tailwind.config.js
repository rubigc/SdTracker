/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          red: '#FF0000',
          blue: '#0000FF',
          yellow: '#FFD700',
          green: '#00FF00',
        },
      },
    },
  },
  plugins: [],
}
