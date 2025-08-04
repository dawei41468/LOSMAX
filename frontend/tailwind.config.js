const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    'text-family', 'text-work', 'text-personal', 'text-health',
    'border-family', 'border-work', 'border-personal', 'border-health',
    'bg-status-warning', 'text-status-warning',
    'bg-status-success', 'text-status-success',
    'bg-status-secondary', 'text-status-secondary',
    'bg-status-destructive', 'text-status-destructive',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          hover: 'var(--accent-hover)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
        family: '#8b5cf6', // Light theme purple
        work: '#3b82f6', // Light theme blue
        personal: '#f59e0b', // Light theme orange
        health: '#10b981', // Light theme green
        status: {
          warning: '#f59e0b',
          success: '#10b981',
          secondary: '#f5f5f5',
          destructive: '#ef4444',
        },
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        family: '#8b5cf6',
        work: '#3b82f6',
        personal: '#f59e0b',
        health: '#10b981',
        status: {
          warning: '#f59e0b',
          success: '#10b981',
          secondary: '#f5f5f5',
          destructive: '#ef4444',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}