import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0E13",
        panel: "#12161D",
        panel2: "#171C25",
        line: "#232A35",
        mist: "#7C8797",
        paper: "#E7EAF0",
        bull: "#33D6A0",
        bear: "#FF6B5E",
        signal: "#F2B84B",
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset",
      },
    },
  },
  plugins: [],
};
export default config;
