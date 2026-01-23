import type { Config } from "tailwindcss";

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
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          card: "hsl(var(--background-card))",
          warm: "hsl(var(--background-warm))",
          sidebar: "hsl(var(--background-sidebar))",
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          light: "hsl(var(--primary-light))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          light: "hsl(var(--secondary-light))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          light: "hsl(var(--destructive-light))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          light: "hsl(var(--success-light))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          light: "hsl(var(--warning-light))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          light: "hsl(var(--info-light))",
          foreground: "hsl(var(--info-foreground))",
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
        // Module colors for APP
        module: {
          dashboard: "hsl(var(--module-dashboard))",
          docket: "hsl(var(--module-docket))",
          datahub: "hsl(var(--module-datahub))",
          spider: "hsl(var(--module-spider))",
          market: "hsl(var(--module-market))",
          genius: "hsl(var(--module-genius))",
          finance: "hsl(var(--module-finance))",
          crm: "hsl(var(--module-crm))",
          marketing: "hsl(var(--module-marketing))",
          help: "hsl(var(--module-help))",
        },
        // Direct module color access
        market: "hsl(var(--module-market))",
        // Backoffice colors
        backoffice: {
          dashboard: "hsl(var(--backoffice-dashboard))",
          ai: "hsl(var(--backoffice-ai))",
          tenants: "hsl(var(--backoffice-tenants))",
          billing: "hsl(var(--backoffice-billing))",
          analytics: "hsl(var(--backoffice-analytics))",
          crm: "hsl(var(--backoffice-crm))",
          marketing: "hsl(var(--backoffice-marketing))",
          calendar: "hsl(var(--backoffice-calendar))",
          docs: "hsl(var(--backoffice-docs))",
          killswitch: "hsl(var(--backoffice-killswitch))",
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

        // IP-NEXUS (P-UI-01) - design system tokens (HSL variables)
        ip: {
          bg: {
            DEFAULT: "hsl(var(--ip-bg-primary))",
            secondary: "hsl(var(--ip-bg-white))",
            card: "hsl(var(--ip-bg-card))",
          },
          sidebar: {
            from: "hsl(var(--ip-sidebar-from))",
            to: "hsl(var(--ip-sidebar-to))",
            "accent-from": "hsl(var(--ip-sidebar-accent-from))",
            "accent-to": "hsl(var(--ip-sidebar-accent-to))",
          },
          stats: {
            blue: "hsl(var(--ip-stat-blue-from))",
            emerald: "hsl(var(--ip-stat-emerald-from))",
            purple: "hsl(var(--ip-stat-purple-from))",
            orange: "hsl(var(--ip-stat-orange-from))",
          },
          action: {
            call: "hsl(var(--ip-action-call-text))",
            email: "hsl(var(--ip-action-email-text))",
            whatsapp: "hsl(var(--ip-action-whatsapp-text))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "12px",
        "2xl": "16px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
