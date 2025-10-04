/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced Slate Horizon Color Palette
        'charcoal-slate': '#0F1115',
        'graphene-grey': '#1A1D23',
        'arctic-sand': '#F5F3F0',
        'burnished-bronze': '#D4A574',
        'verdant-teal': '#2DB8A3',
        'soft-carbon': '#2A2D35',
        'graphite-mist': '#8B8F96',
        'text-primary': '#F5F3F0',
        'text-secondary': '#C8CACD',
        'text-muted': '#8B8F96',
        // Additional accent colors for better visual hierarchy
        'accent-gold': '#E8B86D',
        'accent-blue': '#4A9EFF',
        'accent-green': '#22C55E',
        'surface-elevated': '#1E2128',
        'surface-hover': '#252831',
      },
      fontFamily: {
        'cognitive': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        'cognitive-title': '600',
        'cognitive-label': '500',
        'cognitive-body': '400',
      },
      letterSpacing: {
        'cognitive': '-0.01em',
        'cognitive-wide': '0.02em',
      },
      lineHeight: {
        'cognitive': '1.5',
        'cognitive-tight': '1.3',
      },
      borderRadius: {
        'cognitive': '12px',
        'cognitive-sm': '8px',
        'cognitive-lg': '16px',
      },
      spacing: {
        'cognitive-xs': '8px',
        'cognitive-sm': '16px',
        'cognitive-md': '24px',
        'cognitive-lg': '32px',
        'cognitive-xl': '48px',
      },
      animation: {
        'cognitive-pulse': 'cognitive-pulse 2s ease-in-out infinite',
        'cognitive-shimmer': 'cognitive-shimmer 0.3s ease',
        'cognitive-expand': 'cognitive-expand 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'cognitive-collapse': 'cognitive-collapse 0.15s ease-out',
        'cognitive-inertia': 'cognitive-inertia 0.1s ease-out',
        'cognitive-float': 'cognitive-float 3s ease-in-out infinite',
        'cognitive-glow': 'cognitive-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'cognitive-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'cognitive-shimmer': {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
          '100%': { opacity: '0.5' },
        },
        'cognitive-expand': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' },
        },
        'cognitive-collapse': {
          '0%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        'cognitive-inertia': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(var(--inertia-x, 0), var(--inertia-y, 0))' },
        },
        'cognitive-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'cognitive-glow': {
          '0%': { boxShadow: '0 0 8px rgba(212, 165, 116, 0.3)' },
          '100%': { boxShadow: '0 0 16px rgba(212, 165, 116, 0.5)' },
        },
      },
      boxShadow: {
        'cognitive-halo': '0 0 12px rgba(212, 165, 116, 0.2)',
        'cognitive-glow': '0 0 16px rgba(45, 184, 163, 0.2)',
        'cognitive-elevated': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'cognitive-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'cognitive': '12px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cognitive': 'linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(45, 184, 163, 0.1) 100%)',
      },
    },
  },
  plugins: [],
}

