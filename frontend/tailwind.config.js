/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: "#0f172a",
          card: "#1e293b",
          border: "#334155",
          accent: "#38bdf8",
        },
        brand: {
          primary: "#0ea5e9",
          secondary: "#8b5cf6",
        },
      },
    },
  },
  plugins: [],
};