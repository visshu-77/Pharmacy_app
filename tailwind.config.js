module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        text: "var(--color-text)",
        sideBackground: "var(--color-sideBackground)",
      },

      animation: {
        bubble: "bubbleMove 12s ease-in-out infinite",
      },

      keyframes: {
        bubbleMove: {
          "0%": {
            transform: "translateY(100vh) translateX(0)",
          },
          "50%": {
            transform: "translateY(40vh) translateX(80px)",
          },
          "100%": {
            transform: "translateY(-20vh) translateX(-50px)",
          },
        },
      },
    },
  },

  plugins: [],
};