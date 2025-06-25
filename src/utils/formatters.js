/**
 * Famus Unified Reports - Formatting Utilities
 * Updated: 2025-06-27
 * Version: 3.0 - Enhanced formatting with internationalization support
 */

// Number and currency formatting utilities
export const formatNumber = (num, isMoney = false) => {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  const n = Number(num);
  return isMoney ? 
    `$${n.toFixed(1)}` : 
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatCurrency = (num) => {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  const n = Number(num);
  // For large amounts (total sales), use thousands separator and no decimals
  if (n >= 1000) {
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  // For smaller amounts, use 1 decimal
  return `$${n.toFixed(1)}`;
};

// For Total Sales amounts - always with thousands separator and no decimals
export const formatTotalSales = (num) => {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  const n = Number(num);
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// New standard: format price with $ and 1 decimal
export const formatPrice = (num) => {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  const n = Number(num);
  return `$${n.toFixed(1)}`;
};

export const formatPercentage = (num) => {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  return `${(Number(num) * 100).toFixed(2)}%`;
};

export const formatInteger = (num) => {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const formatCompactNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  const n = Number(num);
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
};

// Date formatting utilities
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Helper function to determine if a field should be formatted as price
export const isPriceField = (fieldName) => {
  if (!fieldName) return false;
  const lowerField = fieldName.toLowerCase();
  return lowerField.includes('price') || 
         lowerField.includes('cost') || 
         lowerField.includes('profit') ||
         lowerField.includes('four star price') ||
         lowerField.includes('avg price');
};

// Helper function to determine if a field should be formatted as total sales (large amounts)
export const isTotalSalesField = (fieldName) => {
  if (!fieldName) return false;
  const lowerField = fieldName.toLowerCase();
  return lowerField.includes('sales amount') ||
         lowerField.includes('total sales') ||
         lowerField.includes('revenue');
};
