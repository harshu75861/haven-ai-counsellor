export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        obsidian: "#0b0b0c",
        graphite: "#171717",
        champagne: "#f5d48a",
        gold: "#c99a2e",
        ivory: "#f8f2e7",
        smoke: "#a6a29a",
        wine: "#5f2437",
        emerald: "#1f6f5b"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245, 212, 138, 0.15), 0 24px 80px rgba(0, 0, 0, 0.42)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Georgia", "serif"]
      }
    }
  },
  plugins: []
};
