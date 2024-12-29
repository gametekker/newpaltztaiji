/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#485f82',
        'custom-blue-2' : '#1f2937',
        'beige' : '#e9e8d1',
        'accent' : '#bcbbad',
      },
  },
  },
  plugins: [],
}