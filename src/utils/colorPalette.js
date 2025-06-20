/**
 * Standard Color Palette for Key Market Insights Sections
 * 
 * This palette provides consistent branding and visual hierarchy 
 * for different types of market insights across all reports.
 */

export const INSIGHTS_COLOR_PALETTE = {
  // Market Share & Leadership - Dark blue for authority/leadership
  leadership: {
    background: '#3D5A80',
    hover: '#2E4B6B',
    bullet: '#3D5A80',
    border: '#3D5A80',
    text: 'white',
    contentText: '#293241'
  },
  
  // Dependency & Risks - Medium blue-gray for caution/analysis
  risks: {
    background: '#6B8B9E',
    hover: '#5A7A8C',
    bullet: '#6B8B9E',
    border: '#6B8B9E',
    text: 'white',
    contentText: '#293241'
  },
  
  // Premium - Light blue for premium positioning
  premium: {
    background: '#98C1D9',
    hover: '#86B4D1',
    bullet: '#98C1D9',
    border: '#98C1D9',
    text: 'white',
    contentText: '#293241'
  },
  
  // Low Price/Commodity - Very light blue for commodity/volume
  commodity: {
    background: '#BEE0EB',
    hover: '#AAD8E3',
    bullet: '#BEE0EB',
    border: '#BEE0EB',
    text: '#293241',
    contentText: '#293241'
  },
  
  // Volume/Coverage - Lightest blue for broad market coverage
  coverage: {
    background: '#E0FBFC',
    hover: '#D1F4F7',
    bullet: '#E0FBFC',
    border: '#E0FBFC',
    text: '#293241',
    contentText: '#293241'
  }
};

/**
 * Get color configuration for a specific insight type
 * @param {string} type - The insight type (leadership, risks, premium, commodity, coverage)
 * @returns {object} Color configuration object
 */
export const getInsightColors = (type) => {
  return INSIGHTS_COLOR_PALETTE[type] || INSIGHTS_COLOR_PALETTE.coverage;
};

/**
 * Common CSS classes for insight sections with scrollable content
 */
export const INSIGHT_SECTION_CLASSES = {
  button: (colors) => `w-full text-left flex items-center justify-between p-3 bg-[${colors.background}] rounded-lg hover:bg-[${colors.hover}] transition-colors`,
  content: (colors) => `mt-2 p-4 bg-white rounded-lg border-2 border-[${colors.border}] max-h-60 overflow-y-auto`,
  list: 'space-y-2',
  listItem: 'flex items-start',
  bullet: (colors) => `text-[${colors.bullet}] mr-2 font-bold`,
  text: (colors) => `text-[${colors.contentText}] text-sm leading-relaxed`,
  title: (colors) => `text-lg font-bold text-[${colors.text}]`,
  arrow: (colors) => `text-[${colors.text}]`
};

export default INSIGHTS_COLOR_PALETTE;
