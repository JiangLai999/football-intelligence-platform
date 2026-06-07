import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#07111f",
        panel: "#0d1b2a",
        panelAlt: "#132238",
        line: "#1f3550",
        text: "#ebf3ff",
        muted: "#89a3c2",
        accent: "#4ade80",
        warning: "#f59e0b",
        danger: "#ef4444"
      },
      boxShadow: {
        panel: "0 12px 40px rgba(0,0,0,0.22)"
      }
    }
  },
  plugins: []
};

export default config;
