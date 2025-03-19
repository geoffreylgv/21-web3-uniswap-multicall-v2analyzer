/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // theme: {
  //   extend: {},
  // },
  // plugins: [
  //   require('@tailwindcss/forms'),
  // ],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2', // Match Material UI primary color
        secondary: '#9c27b0', // Match Material UI secondary color
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
