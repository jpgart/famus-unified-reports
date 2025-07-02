// Famus Unified Reports - PostCSS Configuration
// Updated: 2025-07-02 - FINAL PRODUCTION VERSION
// Version: 3.0.0-FINAL-PRODUCTION - Optimized for Cost Consistency Report

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Add CSS optimization for production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: false,
        }],
      },
    }),
  },
};
