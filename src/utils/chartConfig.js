import zoomPlugin from 'chartjs-plugin-zoom';
import { Chart as ChartJS } from 'chart.js/auto';

// Famus color palette
export const FAMUS_COLORS = {
  orange: '#EE6C4D',
  navy: '#3D5A80',
  blue: '#98C1D9',
  cream: '#F9F6F4',
  lightBlue: '#E0FBFC',
  darkNavy: '#293241',
};

// Blue palette for charts and heatmaps
export const BLUE_PALETTE = [
  '#3D5A80', // Navy - Color Famus principal
  '#6B8B9E', // Azul gris medio
  '#98C1D9', // Blue - Color Famus
  '#BEE0EB', // Azul claro intermedio
  '#E0FBFC', // Light Blue - Color Famus
  '#2F4F6F', // Azul oscuro adicional
  '#5A7A95', // Azul medio adicional
  '#7BA3C4', // Azul medio claro adicional
  '#A5C9EA', // Azul claro adicional
  '#D0E7F0', // Azul muy claro adicional
];

// Chart color palettes
export const CHART_COLORS = [
  FAMUS_COLORS.orange,
  FAMUS_COLORS.navy,
  FAMUS_COLORS.blue,
  '#A8DADC',
  '#457B9D',
  '#F1FAEE',
  '#E63946',
  '#2A9D8F',
];

// Default chart options
export const getDefaultChartOptions = (title = '') => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: !!title,
      text: title,
      font: {
        size: 16,
        weight: 'bold',
      },
      color: FAMUS_COLORS.navy,
      padding: {
        bottom: 20,
      },
    },
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 12,
        },
        color: FAMUS_COLORS.navy,
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      backgroundColor: FAMUS_COLORS.navy,
      titleColor: FAMUS_COLORS.cream,
      bodyColor: FAMUS_COLORS.cream,
      borderColor: FAMUS_COLORS.orange,
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          let value = context.parsed.y;
          
          // Format based on label content
          if (label.toLowerCase().includes('sales amount') ||
              label.toLowerCase().includes('total sales') ||
              label.toLowerCase().includes('revenue')) {
            // For large sales amounts, use thousands separator without decimals
            return `${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
          } else if (label.toLowerCase().includes('price') || 
              label.toLowerCase().includes('cost') || 
              label.toLowerCase().includes('avg price') ||
              label.toLowerCase().includes('four star price') ||
              label.toLowerCase().includes('profit')) {
            return `${label}: $${value.toFixed(1)}`;
          } else if (label.toLowerCase().includes('quantity') || 
                     label.toLowerCase().includes('sale quantity') ||
                     label.toLowerCase().includes('boxes') ||
                     label.toLowerCase().includes('units')) {
            return `${label}: ${value.toLocaleString()}`;
          } else if (label.toLowerCase().includes('%') || 
                     label.toLowerCase().includes('margin') ||
                     label.toLowerCase().includes('percentage')) {
            return `${label}: ${value.toFixed(1)}%`;
          } else {
            // Default: check if value looks like money (> 1000 typically indicates currency)
            if (value > 100 && Number.isInteger(value * 10) === false) {
              return `${label}: $${value.toFixed(1)}`;
            } else {
              return `${label}: ${value.toLocaleString()}`;
            }
          }
        }
      }
    },
    zoom: {
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true
        },
        mode: 'xy',
      },
      pan: {
        enabled: true,
        mode: 'xy',
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(61, 90, 128, 0.1)',
      },
      ticks: {
        color: FAMUS_COLORS.navy,
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(61, 90, 128, 0.1)',
      },
      ticks: {
        color: FAMUS_COLORS.navy,
        font: {
          size: 11,
        },
      },
    },
  },
});

// Bar chart specific options
export const getBarChartOptions = (title = '') => ({
  ...getDefaultChartOptions(title),
  scales: {
    ...getDefaultChartOptions().scales,
    y: {
      ...getDefaultChartOptions().scales.y,
      beginAtZero: true,
    },
  },
});

// Line chart specific options
export const getLineChartOptions = (title = '') => ({
  ...getDefaultChartOptions(title),
  elements: {
    line: {
      tension: 0.4,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
});

// Pie chart specific options
export const getPieChartOptions = (title = '') => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: !!title,
      text: title,
      font: {
        size: 16,
        weight: 'bold',
      },
      color: FAMUS_COLORS.navy,
      padding: {
        bottom: 20,
      },
    },
    legend: {
      position: 'right',
      labels: {
        font: {
          size: 12,
        },
        color: FAMUS_COLORS.navy,
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      backgroundColor: FAMUS_COLORS.navy,
      titleColor: FAMUS_COLORS.cream,
      bodyColor: FAMUS_COLORS.cream,
      borderColor: FAMUS_COLORS.orange,
      borderWidth: 1,
      cornerRadius: 6,
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value.toLocaleString()} (${percentage}%)`;
        }
      }
    },
  },
});

// Helper function to format price axes
export const getPriceAxisConfig = (title = 'Price ($)') => ({
  title: { 
    display: true, 
    text: title.includes('$') ? title : `${title} ($)`,
    color: FAMUS_COLORS.navy,
    font: { size: 12, weight: 'bold' }
  },
  ticks: {
    color: FAMUS_COLORS.navy,
    font: { size: 11 },
    callback: function(value) {
      return '$' + value.toFixed(1);
    }
  },
  grid: {
    color: 'rgba(61, 90, 128, 0.1)',
  },
  beginAtZero: true,
});

// Helper function to detect if a field should be formatted as price
export const isPriceField = (fieldName) => {
  const lowerField = fieldName.toLowerCase();
  return lowerField.includes('price') || 
         lowerField.includes('cost') || 
         lowerField.includes('sales amount') ||
         lowerField.includes('profit') ||
         lowerField.includes('four star price') ||
         lowerField.includes('avg price');
};

// Helper function to format any price value consistently
export const formatPrice = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `$${Number(value).toFixed(1)}`;
};

// Helper function to format quantity axes
export const getQuantityAxisConfig = (title = 'Quantity') => ({
  title: { 
    display: true, 
    text: title,
    color: FAMUS_COLORS.navy,
    font: { size: 12, weight: 'bold' }
  },
  ticks: {
    color: FAMUS_COLORS.navy,
    font: { size: 11 },
    callback: function(value) {
      return value.toLocaleString();
    }
  },
  grid: {
    color: 'rgba(61, 90, 128, 0.1)',
  },
  beginAtZero: true,
});

// Generate dataset with Famus colors
export const generateDataset = (label, data, type = 'bar', colorIndex = 0) => {
  const baseColor = CHART_COLORS[colorIndex % CHART_COLORS.length];
  
  const dataset = {
    label,
    data,
  };
  
  switch (type) {
    case 'bar':
      return {
        ...dataset,
        backgroundColor: baseColor + '80', // 50% opacity
        borderColor: baseColor,
        borderWidth: 2,
      };
    case 'line':
      return {
        ...dataset,
        backgroundColor: baseColor + '20', // 12% opacity for fill
        borderColor: baseColor,
        borderWidth: 3,
        fill: false,
        pointBackgroundColor: baseColor,
        pointBorderColor: FAMUS_COLORS.cream,
        pointBorderWidth: 2,
      };
    case 'pie':
    case 'doughnut':
      return {
        ...dataset,
        backgroundColor: CHART_COLORS.slice(0, data.length),
        borderColor: FAMUS_COLORS.cream,
        borderWidth: 2,
      };
    default:
      return {
        ...dataset,
        backgroundColor: baseColor,
        borderColor: baseColor,
      };
  }
};

// Register Chart.js plugins
export const registerChartPlugins = () => {
  ChartJS.register(zoomPlugin);
};
