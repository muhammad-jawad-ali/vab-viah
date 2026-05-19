/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Deep teal / emerald — used for primary CTAs, AG-Trace strip, brand
        primary: "#064e3b",
        "primary-light": "#059669",
        "primary-dark": "#022c22",
        // Saffron — premium accent for cards, score badges, special moments
        saffron: "#e9a847",
        "saffron-light": "#fde68a",
        "saffron-dark": "#b45309",
        // Metallic gold — legacy accent (kept for receipt + secondary highlights)
        secondary: "#d4af37",
        "secondary-light": "#fef08a",
        // Warm cream — page background (alabaster)
        background: "#fdfbf7",
        "background-warm": "#f9f5ec",
        surface: "#ffffff",
        // Deep rose — danger / dispute
        danger: "#9f1239",
      },
      fontFamily: {
        // Headings: Playfair Display 700 — elegant serif
        serif: ["PlayfairDisplay_700Bold", "Georgia", "serif"],
        // Body: Inter 400 — modern, legible sans
        sans: ["Inter_400Regular", "system-ui", "sans-serif"],
        "sans-bold": ["Inter_700Bold", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Typography scale per Session 5 polish brief
        display: ["32px", { lineHeight: "38px" }],
        h1: ["26px", { lineHeight: "32px" }],
        h2: ["20px", { lineHeight: "26px" }],
        body: ["15px", { lineHeight: "22px" }],
        caption: ["11px", { lineHeight: "15px" }],
      },
    },
  },
  plugins: [],
};
