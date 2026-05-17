/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#064e3b", // Deep Emerald
        "primary-light": "#059669",
        "primary-dark": "#022c22",
        secondary: "#d4af37", // Metallic Gold
        "secondary-light": "#fef08a",
        background: "#fdfbf7", // Warm alabaster
        surface: "#ffffff",
        danger: "#9f1239", // Deep rose
      },
      fontFamily: {
        serif: ["Georgia", "serif"], // For elegant headings
      }
    },
  },
  plugins: [],
};
