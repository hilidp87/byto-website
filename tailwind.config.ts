import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0EA5E9",
          light: "#BAE6FD",
        },
        surface: "#F8FAFC",
        ink: {
          DEFAULT: "#0F172A",
          muted: "#64748B",
        },
        line: "#E2E8F0",
        sale: "#EF4444",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        fadeIn: "fadeIn 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
