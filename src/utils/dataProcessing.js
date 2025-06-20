// Data filtering and grouping utilities
export const getUnique = (data, key) => [...new Set(data.map(item => item[key]))];

export const filterData = (data, filters) => {
  return data.filter(row => {
    return Object.entries(filters).every(([key, value]) =>
      value === 'All' || value === '' || row[key] === value
    );
  });
};

export const groupBy = (data, keys) => {
  return data.reduce((acc, row) => {
    const groupKey = Array.isArray(keys) 
      ? keys.map(k => row[k]).join('-')
      : row[keys];
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(row);
    return acc;
  }, {});
};

export const sortData = (data, key, direction = 'asc') => {
  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    // Handle numbers
    if (!isNaN(aVal) && !isNaN(bVal)) {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    // Handle strings
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    if (direction === 'asc') {
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    } else {
      return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
    }
  });
};

export const searchData = (data, searchTerm, searchKeys) => {
  if (!searchTerm || searchTerm.trim() === '') return data;
  
  const term = searchTerm.toLowerCase().trim();
  
  return data.filter(row => {
    return searchKeys.some(key => {
      const value = String(row[key] || '').toLowerCase();
      return value.includes(term);
    });
  });
};

// Statistical calculations
export const calculateSum = (data, key) => {
  return data.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
};

export const calculateAverage = (data, key) => {
  if (data.length === 0) return 0;
  return calculateSum(data, key) / data.length;
};

export const calculateMedian = (data, key) => {
  if (data.length === 0) return 0;
  
  const values = data.map(row => Number(row[key]) || 0).sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  
  return values.length % 2 === 0
    ? (values[middle - 1] + values[middle]) / 2
    : values[middle];
};

export const calculateStandardDeviation = (data, key) => {
  if (data.length === 0) return 0;
  
  const avg = calculateAverage(data, key);
  const squaredDiffs = data.map(row => {
    const value = Number(row[key]) || 0;
    return Math.pow(value - avg, 2);
  });
  
  const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / data.length;
  return Math.sqrt(avgSquaredDiff);
};

// Data aggregation
export const aggregateByGroup = (data, groupKey, aggregateKeys) => {
  const grouped = groupBy(data, groupKey);
  
  return Object.entries(grouped).map(([group, items]) => {
    const result = { [groupKey]: group };
    
    aggregateKeys.forEach(({ key, operation }) => {
      switch (operation) {
        case 'sum':
          result[`${key}_sum`] = calculateSum(items, key);
          break;
        case 'avg':
          result[`${key}_avg`] = calculateAverage(items, key);
          break;
        case 'count':
          result[`${key}_count`] = items.length;
          break;
        case 'min':
          result[`${key}_min`] = Math.min(...items.map(item => Number(item[key]) || 0));
          break;
        case 'max':
          result[`${key}_max`] = Math.max(...items.map(item => Number(item[key]) || 0));
          break;
        default:
          result[key] = items[0][key]; // First value as default
      }
    });
    
    return result;
  });
};
