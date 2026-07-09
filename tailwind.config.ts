import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f8f4fd",
          100: "#f0eafb",
          200: "#e1d4f7",
          300: "#c098d6",
          400: "#b07ccb",
          500: "#9d5dbc",
          600: "#8743a8",
          700: "#71348d",
          800: "#5f2d75",
          900: "#4f2861",
          950: "#2f1040",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
