/**
 * Tailwind reads its palette from the CSS custom properties defined in
 * src/styles/global.css. Every colour is stored as RGB channels there, so the
 * `<alpha-value>` placeholder lets `bg-primary/10` and friends work.
 */
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: token("primary"),
          soft: token("primary-soft"),
          strong: token("primary-strong"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          soft: token("secondary-soft"),
        },
        accent: token("accent"),

        // Status
        success: {
          DEFAULT: token("success"),
          soft: token("success-soft"),
        },
        warning: {
          DEFAULT: token("warning"),
          soft: token("warning-soft"),
        },
        danger: {
          DEFAULT: token("danger"),
          soft: token("danger-soft"),
        },
        info: {
          DEFAULT: token("info"),
          soft: token("info-soft"),
        },

        // Surfaces
        canvas: token("canvas"),
        surface: {
          DEFAULT: token("surface"),
          muted: token("surface-muted"),
          hover: token("surface-hover"),
        },

        // Type
        heading: token("heading"),
        body: token("body"),
        muted: token("muted"),
        faint: token("faint"),

        // Lines
        line: {
          DEFAULT: token("line"),
          strong: token("line-strong"),
        },

        // Legacy aliases — older markup still references these.
        text: token("text"),
        sideBackground: token("sideBackground"),
        darkColor: token("darkColor"),
      },

      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },

      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },

      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        ring: "var(--shadow-ring)",
        card: "var(--shadow-ring), var(--shadow-sm)",
      },

      screens: {
        xs: "480px",
      },

      animation: {
        bubble: "bubbleMove 12s ease-in-out infinite",
        "fade-in": "fadeIn 0.18s ease-out",
        "slide-up": "slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.24s cubic-bezier(0.16, 1, 0.3, 1)",
      },

      keyframes: {
        bubbleMove: {
          "0%": { transform: "translateY(100vh) translateX(0)" },
          "50%": { transform: "translateY(40vh) translateX(80px)" },
          "100%": { transform: "translateY(-20vh) translateX(-50px)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px) scale(0.985)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
    },
  },

  plugins: [],
};
