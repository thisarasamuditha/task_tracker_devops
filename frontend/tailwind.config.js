/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#4B5DFF", // Deep Indigo
        secondary: "#89C2FF", // Sky Blue
        accent: "#A3F7BF", // Lime Mint
        success: "#A3F7BF", // Success Green
        warning: "#FFC75F", // Amber Glow
        danger: "#FF6B6B", // Coral Red
        background: "#FAFAFA", // Snow White
        surface: "#E6E8F0", // Cloud Gray
        border: "#D1D5DB", // Neutral Border
        text: "#1C1C28", // Charcoal Black
        muted: "#6B728E", // Slate Gray
        pending: "#FFC75F", // Amber Glow (Pending)
        inProgress: "#89C2FF", // Sky Blue (In Progress)
        completed: "#A3F7BF", // Lime Mint (Completed)

        // Dark theme primitives
        backgroundDark: "#0B1020",
        surfaceDark: "#111831",
        borderDark: "#233055",
        textDark: "#EEF2FF",
        mutedDark: "#A7B0D6",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.98)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out",
        "fade-out": "fade-out 140ms ease-in",
        "slide-up": "slide-up 220ms ease-out",
        "scale-in": "scale-in 160ms ease-out",
      },
    },
  },
  plugins: [],
};
