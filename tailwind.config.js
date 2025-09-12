/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
      // Custom Design System Colors
      colors: {
        // Primary Colors
        'primary-50': 'var(--primary-50)',
        'primary-100': 'var(--primary-100)',
        'primary-200': 'var(--primary-200)',
        'primary-300': 'var(--primary-300)',
        'primary-400': 'var(--primary-400)',
        'primary-500': 'var(--primary-500)',
        'primary-600': 'var(--primary-600)',
        'primary-700': 'var(--primary-700)',
        'primary-800': 'var(--primary-800)',
        'primary-900': 'var(--primary-900)',
        'primary-950': 'var(--primary-950)',

        // Accent Colors
        'accent-50': 'var(--accent-50)',
        'accent-100': 'var(--accent-100)',
        'accent-200': 'var(--accent-200)',
        'accent-300': 'var(--accent-300)',
        'accent-400': 'var(--accent-400)',
        'accent-500': 'var(--accent-500)',
        'accent-600': 'var(--accent-600)',
        'accent-700': 'var(--accent-700)',
        'accent-800': 'var(--accent-800)',
        'accent-900': 'var(--accent-900)',

        // Secondary Accent Colors
        'secondary-accent-50': 'var(--secondary-accent-50)',
        'secondary-accent-100': 'var(--secondary-accent-100)',
        'secondary-accent-200': 'var(--secondary-accent-200)',
        'secondary-accent-300': 'var(--secondary-accent-300)',
        'secondary-accent-400': 'var(--secondary-accent-400)',
        'secondary-accent-500': 'var(--secondary-accent-500)',
        'secondary-accent-600': 'var(--secondary-accent-600)',
        'secondary-accent-700': 'var(--secondary-accent-700)',
        'secondary-accent-800': 'var(--secondary-accent-800)',
        'secondary-accent-900': 'var(--secondary-accent-900)',

        // Tertiary Accent Colors
        'tertiary-accent-50': 'var(--tertiary-accent-50)',
        'tertiary-accent-100': 'var(--tertiary-accent-100)',
        'tertiary-accent-200': 'var(--tertiary-accent-200)',
        'tertiary-accent-300': 'var(--tertiary-accent-300)',
        'tertiary-accent-400': 'var(--tertiary-accent-400)',
        'tertiary-accent-500': 'var(--tertiary-accent-500)',
        'tertiary-accent-600': 'var(--tertiary-accent-600)',
        'tertiary-accent-700': 'var(--tertiary-accent-700)',
        'tertiary-accent-800': 'var(--tertiary-accent-800)',
        'tertiary-accent-900': 'var(--tertiary-accent-900)',

        // Success Colors
        'success-50': 'var(--success-50)',
        'success-100': 'var(--success-100)',
        'success-200': 'var(--success-200)',
        'success-300': 'var(--success-300)',
        'success-400': 'var(--success-400)',
        'success-500': 'var(--success-500)',
        'success-600': 'var(--success-600)',
        'success-700': 'var(--success-700)',
        'success-800': 'var(--success-800)',
        'success-900': 'var(--success-900)',

        // Warning Colors
        'warning-50': 'var(--warning-50)',
        'warning-100': 'var(--warning-100)',
        'warning-200': 'var(--warning-200)',
        'warning-300': 'var(--warning-300)',
        'warning-400': 'var(--warning-400)',
        'warning-500': 'var(--warning-500)',
        'warning-600': 'var(--warning-600)',
        'warning-700': 'var(--warning-700)',
        'warning-800': 'var(--warning-800)',
        'warning-900': 'var(--warning-900)',

        // Error Colors
        'error-50': 'var(--error-50)',
        'error-100': 'var(--error-100)',
        'error-200': 'var(--error-200)',
        'error-300': 'var(--error-300)',
        'error-400': 'var(--error-400)',
        'error-500': 'var(--error-500)',
        'error-600': 'var(--error-600)',
        'error-700': 'var(--error-700)',
        'error-800': 'var(--error-800)',
        'error-900': 'var(--error-900)',

        // Info Colors
        'info-50': 'var(--info-50)',
        'info-100': 'var(--info-100)',
        'info-200': 'var(--info-200)',
        'info-300': 'var(--info-300)',
        'info-400': 'var(--info-400)',
        'info-500': 'var(--info-500)',
        'info-600': 'var(--info-600)',
        'info-700': 'var(--info-700)',
        'info-800': 'var(--info-800)',
        'info-900': 'var(--info-900)',

        // Legacy colors for compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
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
      },

      // Custom Font Families
      fontFamily: {
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-jetbrains-mono)', 'monospace'],
      },

      // Custom Font Sizes
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
        '6xl': 'var(--text-6xl)',
        '7xl': 'var(--text-7xl)',
        '8xl': 'var(--text-8xl)',
        '9xl': 'var(--text-9xl)',
        'display-xs': 'var(--text-display-xs)',
        'display-sm': 'var(--text-display-sm)',
        'display-md': 'var(--text-display-md)',
        'display-lg': 'var(--text-display-lg)',
        'display-xl': 'var(--text-display-xl)',
        'display-2xl': 'var(--text-display-2xl)',
        'heading-xs': 'var(--text-heading-xs)',
        'heading-sm': 'var(--text-heading-sm)',
        'heading-md': 'var(--text-heading-md)',
        'heading-lg': 'var(--text-heading-lg)',
        'heading-xl': 'var(--text-heading-xl)',
        'body-xs': 'var(--text-body-xs)',
        'body-sm': 'var(--text-body-sm)',
        'body-md': 'var(--text-body-md)',
        'body-lg': 'var(--text-body-lg)',
        'body-xl': 'var(--text-body-xl)',
        'label-xs': 'var(--text-label-xs)',
        'label-sm': 'var(--text-label-sm)',
        'label-md': 'var(--text-label-md)',
        'label-lg': 'var(--text-label-lg)',
        'caption': 'var(--text-caption)',
        'code': 'var(--text-code)',
      },

      // Custom Spacing
      spacing: {
        'px': 'var(--space-px)',
        '0.5': 'var(--space-0-5)',
        '1': 'var(--space-1)',
        '1.5': 'var(--space-1-5)',
        '2': 'var(--space-2)',
        '2.5': 'var(--space-2-5)',
        '3': 'var(--space-3)',
        '3.5': 'var(--space-3-5)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '7': 'var(--space-7)',
        '8': 'var(--space-8)',
        '9': 'var(--space-9)',
        '10': 'var(--space-10)',
        '11': 'var(--space-11)',
        '12': 'var(--space-12)',
        '14': 'var(--space-14)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '28': 'var(--space-28)',
        '32': 'var(--space-32)',
        '36': 'var(--space-36)',
        '40': 'var(--space-40)',
        '44': 'var(--space-44)',
        '48': 'var(--space-48)',
        '52': 'var(--space-52)',
        '56': 'var(--space-56)',
        '60': 'var(--space-60)',
        '64': 'var(--space-64)',
        '72': 'var(--space-72)',
        '80': 'var(--space-80)',
        '96': 'var(--space-96)',
      },

      // Custom Border Radius
      borderRadius: {
        'none': '0',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        'full': 'var(--radius-full)',
      },

      // Custom Box Shadows
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'medium': 'var(--shadow-medium)',
        'large': 'var(--shadow-large)',
        'colored': 'var(--shadow-colored)',
      },

      // Custom Animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fadeInUp": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fadeIn": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slideInLeft": {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slideInRight": {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "bounce": {
          "0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
          "40%, 43%": { transform: "translate3d(0, -30px, 0)" },
          "70%": { transform: "translate3d(0, -15px, 0)" },
          "90%": { transform: "translate3d(0, -4px, 0)" },
        },
        "wiggle": {
          "0%, 7%": { transform: "rotateZ(0)" },
          "15%": { transform: "rotateZ(-15deg)" },
          "20%": { transform: "rotateZ(10deg)" },
          "25%": { transform: "rotateZ(-10deg)" },
          "30%": { transform: "rotateZ(6deg)" },
          "35%": { transform: "rotateZ(-4deg)" },
          "40%, 100%": { transform: "rotateZ(0)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.6s ease-out",
        "slide-in-right": "slideInRight 0.6s ease-out",
        "pulse": "pulse 2s infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "bounce": "bounce 1s infinite",
        "wiggle": "wiggle 1s ease-in-out",
        "gradient": "gradient-shift 3s ease infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom plugin to add our design system utilities
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        // Text utilities
        '.text-gradient-primary': {
          background: 'var(--gradient-primary)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-accent': {
          background: 'var(--gradient-accent)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-secondary': {
          background: 'var(--gradient-secondary)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-tertiary': {
          background: 'var(--gradient-tertiary)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        // Background utilities
        '.bg-gradient-primary': {
          background: 'var(--gradient-primary)',
        },
        '.bg-gradient-accent': {
          background: 'var(--gradient-accent)',
        },
        '.bg-gradient-secondary': {
          background: 'var(--gradient-secondary)',
        },
        '.bg-gradient-tertiary': {
          background: 'var(--gradient-tertiary)',
        },
        '.bg-gradient-glass': {
          background: 'var(--gradient-glass)',
        },
        '.bg-gradient-dark': {
          background: 'var(--gradient-dark)',
        },

        // Spacing utilities
        '.section-padding-sm': {
          padding: 'var(--section-padding-sm)',
        },
        '.section-padding-md': {
          padding: 'var(--section-padding-md)',
        },
        '.section-padding-lg': {
          padding: 'var(--section-padding-lg)',
        },
        '.section-padding-xl': {
          padding: 'var(--section-padding-xl)',
        },
        '.section-padding-2xl': {
          padding: 'var(--section-padding-2xl)',
        },
        '.container-padding': {
          padding: 'var(--container-padding)',
        },
        '.card-padding-sm': {
          padding: 'var(--card-padding-sm)',
        },
        '.card-padding-md': {
          padding: 'var(--card-padding-md)',
        },
        '.card-padding-lg': {
          padding: 'var(--card-padding-lg)',
        },
        '.card-padding-xl': {
          padding: 'var(--card-padding-xl)',
        },

        // Hover effects
        '.hover-lift': {
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          },
        },
        '.hover-scale': {
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
        '.hover-glow': {
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
          },
        },

        // Glassmorphism
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },

        // Interactive states
        '.interactive': {
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },

        // Focus states
        '.focus-ring': {
          transition: 'box-shadow 0.2s ease',
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
          },
        },
      };

      addUtilities(newUtilities);
    },
  ],
}
