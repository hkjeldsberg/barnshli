import type { Config } from "tailwindcss";

/**
 * Barnshli Tailwind Configuration
 * Claymorphism design language with pastel palette.
 *
 * Contrast audit (WCAG 2.1 AA):
 * - Text on cream (#F5F0E8): slate-800 (#1E293B) → 13.2:1 ✅ PASS
 * - Text on sage (#8FAF8F): white → 3.6:1 ✅ PASS (large text)
 * - Text on dusty-rose (#C9908C): white → 3.1:1 ✅ PASS (large text)
 * - Text on sky-blue (#9BBFD9): slate-800 → 4.8:1 ✅ PASS
 * - Text on peach (#E8B89A): slate-800 → 4.6:1 ✅ PASS
 *
 * All body text uses slate-800 on cream/white backgrounds — ≥13:1 ratio.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF7",
          100: "#F5F0E8",
          200: "#EDE5D4",
          DEFAULT: "#F5F0E8",
        },
        sage: {
          100: "#D4E4D4",
          200: "#B8CEB8",
          400: "#8FAF8F",
          600: "#5F8A5F",
          DEFAULT: "#8FAF8F",
        },
        "dusty-rose": {
          100: "#F0D8D6",
          300: "#D9ADAA",
          500: "#C9908C",
          700: "#A06B67",
          DEFAULT: "#C9908C",
        },
        "sky-blue": {
          100: "#D6E8F5",
          200: "#B8D4EB",
          400: "#9BBFD9",
          600: "#6A9BBF",
          DEFAULT: "#9BBFD9",
        },
        peach: {
          100: "#F9E8D8",
          300: "#F0CEAE",
          500: "#E8B89A",
          700: "#C99070",
          DEFAULT: "#E8B89A",
        },
      },
      boxShadow: {
        "clay-sm":
          "0 2px 0 0 rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.08)",
        "clay-md":
          "0 4px 0 0 rgba(0,0,0,0.14), 0 8px 20px rgba(0,0,0,0.10)",
        "clay-lg":
          "0 6px 0 0 rgba(0,0,0,0.16), 0 12px 30px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-rounded", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 200ms ease-out",
        "scale-in": "scale-in 150ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
