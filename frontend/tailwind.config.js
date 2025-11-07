/** @type {import('tailwindcss').Config} */
export default {
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
      },
    },
  },
  plugins: [],
};
