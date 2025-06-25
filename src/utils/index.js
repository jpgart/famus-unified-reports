/**
 * Famus Unified Reports - Utils Index
 * Updated: 2025-06-27
 * Version: 3.0 - Centralized exports for all utilities
 */

// Centralized exports for all utilities
export * from './formatters.js';
export * from './dataProcessing.js';
export * from './chartConfig.js';
export * from './colorPalette.js';
export * from './dataFiltering.js';

// Re-export commonly used items with aliases for convenience
export { 
  formatCurrency as currency,
  formatNumber as number,
  formatPercentage as percentage,
  formatPrice as price
} from './formatters.js';

export {
  BRAND_COLORS as colors,
  STATUS_COLORS as statusColors,
  INSIGHTS_COLOR_PALETTE as insightColors,
  colorUtils
} from './colorPalette.js';
