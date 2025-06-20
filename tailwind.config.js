module.exports = {
  content: [
    "./*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        famus: {
          orange: '#EE6C4D',
          navy: '#3D5A80',
          blue: '#98C1D9',
          cream: '#F9F6F4',
          'light-blue': '#E0FBFC',
          'dark-navy': '#293241',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
