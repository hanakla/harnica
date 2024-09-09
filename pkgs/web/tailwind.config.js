/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        md: "0 2px 6px  rgb(0 0 0 / 0.1), 0 2px 4px  rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px  rgb(0 0 0 / 0.1), 0 2px 6px  rgb(0 0 0 / 0.1)",
      },
      // backgroundImage: {
      //   "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      //   "gradient-conic":
      //     "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      // },
    },
  },
  plugins: [],
};
