/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        bubble: {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 rgba(255, 0, 129, 0.5)" },
          "50%": { transform: "scale(1.2)", boxShadow: "0 4px 25px rgba(255, 0, 129, 0.7)" },
          "100%": { transform: "scale(1)", boxShadow: "0 2px 15px rgba(255, 0, 129, 0.5)" }
        }
      },
      animation: {
        bubble: "bubble 0.75s ease-in-out"
      }
    }
  },
  plugins: [],
};
