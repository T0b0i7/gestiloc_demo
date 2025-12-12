import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          deep: "hsl(var(--primary-deep))",
          light: "hsl(var(--primary-light))",
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
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
            opacity: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          to: {
            height: "0",
            opacity: "0",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-up": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "float": {
          from: {
            transform: "translateY(0px)",
          },
          to: {
            transform: "translateY(-10px)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
      },
      fontSize: {
        "h1-mobile": ["2.125rem", { lineHeight: "2.625rem", letterSpacing: "0px" }],
        "h1": ["2.75rem", { lineHeight: "3.19rem", letterSpacing: "-0.04125rem" }],
        "h2-mobile": ["2rem", { lineHeight: "2.5rem", letterSpacing: "0px" }],
        "h2": ["2.5rem", { lineHeight: "2.9rem", letterSpacing: "-0.0125rem" }],
        "h3-mobile": ["2rem", { lineHeight: "2.5rem", letterSpacing: "0.005rem" }],
        "h3": ["2.15rem", { lineHeight: "2.61rem", letterSpacing: "0px" }],
        "h4-mobile": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "0rem" }],
        "h4": ["2rem", { lineHeight: "2.32rem", letterSpacing: "-0.02rem" }],
        "h5-mobile": ["1.5rem", { lineHeight: "1.875rem", letterSpacing: "0rem" }],
        "h5": ["1.5rem", { lineHeight: "1.74rem", letterSpacing: "-0.015rem" }],
        "h6-mobile": ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "0px" }],
        "h6": ["1.125rem", { lineHeight: "1.35rem", letterSpacing: "0.00169rem" }],
        "body": ["1rem", { lineHeight: "1.6" }],
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
