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
        primary: "#9ae600",
        secondary: "#F24E6F",
        accent1: "#FDBD3F",
        accent2: "#A47EF8",
        neutral: {
          background: "#FFFFFF",
          light: "#F4F5F7",
        },
        text: {
          primary: "#0E0E2C",
          secondary: "#6B7280",
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.06)",
        subtle: "0px 2px 4px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        xl: "16px",
      },
      fontFamily: {
        rubik: ["Rubik", "sans-serif"],
        sans: ["Rubik", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
