/* eslint-env node */
/** @type {import('tailwindcss').Config} */
// tailwind.config.cjs / tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Myriad Pro"', "system-ui", "sans-serif"],
        serif: ['"Minion Pro"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
