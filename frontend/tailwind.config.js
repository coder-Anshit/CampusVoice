/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        cv: {
          bg: "rgb(var(--cv-bg) / <alpha-value>)",
          surface: "rgb(var(--cv-surface) / <alpha-value>)",
          "surface-soft": "rgb(var(--cv-surface-soft) / <alpha-value>)",
          "surface-muted": "rgb(var(--cv-surface-muted) / <alpha-value>)",

          text: "rgb(var(--cv-text) / <alpha-value>)",
          "text-secondary": "rgb(var(--cv-text-secondary) / <alpha-value>)",
          "text-muted": "rgb(var(--cv-text-muted) / <alpha-value>)",
          "text-subtle": "rgb(var(--cv-text-subtle) / <alpha-value>)",

          primary: "rgb(var(--cv-primary) / <alpha-value>)",
          "primary-hover": "rgb(var(--cv-primary-hover) / <alpha-value>)",
          "primary-soft": "rgb(var(--cv-primary-soft) / <alpha-value>)",
          "primary-border": "rgb(var(--cv-primary-border) / <alpha-value>)",

          border: "rgb(var(--cv-border) / <alpha-value>)",
          "border-strong": "rgb(var(--cv-border-strong) / <alpha-value>)",
          divider: "rgb(var(--cv-divider) / <alpha-value>)",

          success: "rgb(var(--cv-success) / <alpha-value>)",
          "success-soft": "rgb(var(--cv-success-soft) / <alpha-value>)",
          "success-border": "rgb(var(--cv-success) / 0.22)",
          warning: "rgb(var(--cv-warning) / <alpha-value>)",
          "warning-soft": "rgb(var(--cv-warning-soft) / <alpha-value>)",
          "warning-border": "rgb(var(--cv-warning) / 0.22)",
          danger: "rgb(var(--cv-danger) / <alpha-value>)",
          "danger-soft": "rgb(var(--cv-danger-soft) / <alpha-value>)",
          "danger-border": "rgb(var(--cv-danger) / 0.22)",
          info: "rgb(var(--cv-info) / <alpha-value>)",
          "info-soft": "rgb(var(--cv-info-soft) / <alpha-value>)",
          "info-border": "rgb(var(--cv-info) / 0.22)",

          accent: "rgb(var(--cv-accent) / <alpha-value>)",
          "accent-soft": "rgb(var(--cv-accent-soft) / <alpha-value>)",

          "category-purple": "rgb(var(--cv-category-purple) / <alpha-value>)",
          "category-purple-soft": "rgb(var(--cv-category-purple-soft) / <alpha-value>)",
          "category-green": "rgb(var(--cv-category-green) / <alpha-value>)",
          "category-green-soft": "rgb(var(--cv-category-green-soft) / <alpha-value>)",
          "category-blue": "rgb(var(--cv-category-blue) / <alpha-value>)",
          "category-blue-soft": "rgb(var(--cv-category-blue-soft) / <alpha-value>)",
          "category-pink": "rgb(var(--cv-category-pink) / <alpha-value>)",
          "category-pink-soft": "rgb(var(--cv-category-pink-soft) / <alpha-value>)",
          "category-amber": "rgb(var(--cv-category-amber) / <alpha-value>)",
          "category-amber-soft": "rgb(var(--cv-category-amber-soft) / <alpha-value>)",
        },
      },

      borderRadius: {
        "cv-sm": "var(--cv-radius-sm)",
        "cv-md": "var(--cv-radius-md)",
        "cv-lg": "var(--cv-radius-lg)",
        "cv-xl": "var(--cv-radius-xl)",
        "cv-2xl": "var(--cv-radius-2xl)",
      },

      boxShadow: {
        "cv-xs": "var(--cv-shadow-xs)",
        "cv-sm": "var(--cv-shadow-sm)",
        "cv-md": "var(--cv-shadow-md)",
        "cv-lg": "var(--cv-shadow-lg)",
        "cv-card": "var(--cv-shadow-card)",
      },

      transitionTimingFunction: {
        "cv": "var(--cv-ease)",
      },
    },
  },

  plugins: [],
};
