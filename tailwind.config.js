// Famus Unified Reports - Tailwind CSS Configuration
// Updated: 2025-06-27
// Version: 3.0 - Enhanced color system and utilities

module.exports = {
  content: [
    "./*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        famus: {
          // Primary brand colors
          orange: '#EE6C4D',
          navy: '#3D5A80',
          blue: '#98C1D9',
          cream: '#F9F6F4',
          'light-blue': '#E0FBFC',
          'dark-navy': '#293241',
          
          // Extended palette for v3.0
          success: '#4CAF50',
          warning: '#FF9800',
          error: '#F44336',
          info: '#2196F3',
          
          // Neutral grays
          'gray-50': '#F8FAFC',
          'gray-100': '#F1F5F9',
          'gray-200': '#E2E8F0',
          'gray-300': '#CBD5E1',
          'gray-500': '#64748B',
          'gray-700': '#334155',
          'gray-900': '#0F172A',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont'],
      },
      boxShadow: {
        'famus-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'famus-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        'famus-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        'famus-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
  // Enable JIT mode for better performance
  mode: 'jit',
  // Purge unused styles in production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      "./*.{js,jsx,ts,tsx}",
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
  },
};
