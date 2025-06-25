// Famus Unified Reports - PostCSS Configuration
// Updated: 2025-06-27
// Version: 3.0 - Enhanced CSS processing with optimization plugins

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
