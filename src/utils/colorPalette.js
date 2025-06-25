/**
 * Famus Unified Reports - Color Palette System
 * Updated: 2025-06-27
 * Version: 3.0 - Enhanced color system with accessibility and modern design
 * 
 * This palette provides consistent branding and visual hierarchy 
 * for different types of market insights across all reports.
 */

// Base brand colors
export const BRAND_COLORS = {
  primary: '#EE6C4D',    // Famus Orange
  secondary: '#3D5A80',   // Famus Navy
  accent: '#98C1D9',      // Famus Blue
  background: '#F9F6F4',  // Famus Cream
  surface: '#E0FBFC',     // Famus Light Blue
  dark: '#293241',        // Famus Dark Navy
};

// Status colors
export const STATUS_COLORS = {
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

// Gray scale
export const GRAY_COLORS = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  500: '#64748B',
  700: '#334155',
  900: '#0F172A',
};

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

/**
 * Utility functions for color manipulation and accessibility
 */
export const colorUtils = {
  /**
   * Convert hex color to RGB
   */
  hexToRgb: (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * Get contrasting text color (black or white) for a given background color
   */
  getContrastingTextColor: (backgroundColor) => {
    const rgb = colorUtils.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';
    
    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  },

  /**
   * Create a semi-transparent version of a color
   */
  withOpacity: (color, opacity) => {
    const rgb = colorUtils.hexToRgb(color);
    if (!rgb) return color;
    
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  },

  /**
   * Generate a color palette for charts
   */
  generateChartPalette: (baseColors = Object.values(BRAND_COLORS), count = 8) => {
    const palette = [...baseColors];
    
    // If we need more colors, generate variations
    while (palette.length < count) {
      baseColors.forEach(color => {
        if (palette.length < count) {
          palette.push(colorUtils.withOpacity(color, 0.7));
        }
      });
    }
    
    return palette.slice(0, count);
  }
};

export default INSIGHTS_COLOR_PALETTE;
