/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          pressed: "hsl(var(--primary))",
          deep: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#bbb8b1",
          foreground: "#787671",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Notion Specific Colors
        onPrimary: "#ffffff",
        brand: {
          navy: "#0a1530",
          navyDeep: "#070f24",
          navyMid: "#1a2a52",
          orange: "#dd5b00",
          orangeDeep: "#793400",
          pink: "#ff64c8",
          pinkDeep: "#a02e6d",
          teal: "#2a9d99",
          green: "#1aae39",
          yellow: "#f5d75e",
          brown: "#523410",
        },
        link: {
          DEFAULT: "#0075de",
          pressed: "#005bab",
        },
        cardTint: {
          peach: "#ffe8d4",
          rose: "#fde0ec",
          mint: "#d9f3e1",
          sky: "#dcecfa",
          yellow: "#fef7d6",
          yellowBold: "#f9e79f",
          cream: "#f8f5e8",
          gray: "#f0eeec",
        },
        canvas: "#ffffff",
        surface: {
          DEFAULT: "#f6f5f4",
          soft: "#fafaf9",
        },
        hairline: {
          DEFAULT: "#e5e3df",
          soft: "#ede9e4",
          strong: "#c8c4be",
        },
        ink: {
          DEFAULT: "#1a1a1a",
          deep: "#000000",
        },
        charcoal: "#37352f",
        slate: "#5d5b54",
        steel: "#787671",
        stone: "#a4a097",
        onDark: {
          DEFAULT: "#ffffff",
          muted: "#a4a097",
        },
        semantic: {
          success: "#1aae39",
          warning: "#dd5b00",
          error: "#e03131",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
        xs: "4px",
        xl: "16px",
        xxl: "20px",
        xxxl: "24px",
        full: "9999px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        xxl: "32px",
        xxxl: "40px",
        "section-sm": "48px",
        section: "64px",
        "section-lg": "96px",
        hero: "120px",
      },
    },
  },
  plugins: [],
}
