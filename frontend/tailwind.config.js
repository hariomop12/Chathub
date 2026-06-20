/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          light: "#6366f1",
          dark: "#3730a3",
          bg: "#eef2ff",
          glow: "rgba(79, 70, 229, 0.2)",
        },
        bg: {
          DEFAULT: "#f8fafc",
          card: "#ffffff",
          sidebar: "#ffffff",
          hover: "#f1f5f9",
          active: "#eef2ff",
        },
        text: {
          DEFAULT: "#0f172a",
          secondary: "#64748b",
          muted: "#94a3b8",
        },
        border: {
          DEFAULT: "#e2e8f0",
          light: "#f1f5f9",
        },
        call: {
          green: "#22c55e",
          red: "#ef4444",
          blue: "#3b82f6",
        },
        msg: {
          own: "#4f46e5",
          other: "#f1f5f9",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        full: "9999px",
      },
      fontFamily: {
        sans: ['Inter', 'Nunito Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "audio-bounce": {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        "typing-bounce": {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0.3" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 15s ease infinite",
        "audio-bounce": "audio-bounce 0.8s ease-in-out infinite",
        "typing-bounce": "typing-bounce 1.4s infinite ease-in-out both",
      },
    },
  },
  plugins: [],
};
