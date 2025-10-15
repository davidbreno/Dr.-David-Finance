/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        display: ["'Poppins'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
      },
      boxShadow: {
        card: "0 20px 35px -20px rgba(64, 64, 104, 0.35)",
      },
    },
  },
  plugins: [],
};
