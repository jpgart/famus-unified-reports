// Utility functions for filtering data across all reports
// Centralized filtering to ensure consistency

// Exporters to exclude from all analyses
const EXCLUDED_EXPORTERS = ['Del Monte', 'VIDEXPORT', 'Videxport'];

/**
 * Filter function to exclude specific exporters from data
 * @param {Array|Object} data - Data to filter
 * @param {string} exporterField - Field name that contains exporter data
 * @returns {Array|Object} Filtered data
 */
export const filterExcludedExporters = (data, exporterField = 'Exporter Clean') => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.filter(item => {
      const exporter = item[exporterField];
      return exporter && !EXCLUDED_EXPORTERS.includes(exporter);
    });
  }
  
  if (typeof data === 'object') {
    const filtered = {};
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && value[exporterField]) {
        const exporter = value[exporterField];
        if (!EXCLUDED_EXPORTERS.includes(exporter)) {
          filtered[key] = value;
        }
      } else {
        filtered[key] = value;
      }
    }
    return filtered;
  }
  
  return data;
};

/**
 * Check if an exporter should be excluded
 * @param {string} exporter - Exporter name
 * @returns {boolean} True if should be excluded
 */
export const isExporterExcluded = (exporter) => {
  return EXCLUDED_EXPORTERS.includes(exporter);
};

/**
 * Get list of excluded exporters
 * @returns {Array} Array of excluded exporter names
 */
export const getExcludedExporters = () => {
  return [...EXCLUDED_EXPORTERS];
};

/**
 * Filter unique exporters list removing excluded ones
 * @param {Array} exporters - Array of exporter names
 * @returns {Array} Filtered array of exporters
 */
export const filterExportersList = (exporters) => {
  if (!Array.isArray(exporters)) return exporters;
  return exporters.filter(exporter => !EXCLUDED_EXPORTERS.includes(exporter));
};
