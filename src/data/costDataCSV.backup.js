// Cost data loader from CSV file
let cachedCostData = null;
let cachedMetrics = null;

// Clear cache on import to force fresh data
cachedCostData = null;
cachedMetrics = null;

// Cache for initial stock data
let cachedInitialStockData = null;
let cachedConsolidatedInitialStock = null;

// Function to parse European number format (comma as decimal separator)
const parseEuropeanNumber = (value) => {
  if (!value || value === '') return 0;
  // Convert string to number, replacing comma with dot for decimal
  return parseFloat(value.toString().replace(',', '.')) || 0;
};

// Load cost data from CSV
export const loadCostDataFromCSV = async () => {
  if (cachedCostData) return cachedCostData;
  
  try {
    const response = await fetch('/data/Charge Summary New.csv');
    const csvText = await response.text();
    
    // Parse CSV (semicolon separated, European number format)
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(';');
    
    const data = lines.slice(1).map(line => {
      const values = line.split(';');
      const row = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        
        // Parse numeric fields appropriately
        if (header === 'Chgqnt' || header === 'Chgamt' || header === 'Initial Stock' || header === 'Cost per Box') {
          row[header] = parseEuropeanNumber(value);
        } else {
          row[header] = value || '';
        }
      });
      
      return row;
    }).filter(row => row.Lotid); // Filter out empty rows
    
    cachedCostData = data;
    console.log(`✅ Loaded ${data.length} cost records from CSV`);
    return data;
  } catch (error) {
    console.error('❌ Error loading cost data from CSV:', error);
    return [];
  }
};

// Get charge data (wrapper for compatibility)
export const getChargeDataFromCSV = async () => {
  return await loadCostDataFromCSV();
};

// Calculate metrics from CSV data
export const calculateMetricsFromCSV = async () => {
  if (cachedMetrics) return cachedMetrics;
  
  const chargeData = await loadCostDataFromCSV();
  
  if (!chargeData || chargeData.length === 0) {
    console.warn('⚠️ No charge data available for metrics calculation');
    return {};
  }
  
  const lotidTotals = {};
  
  // Excluded charge types and exporters
  const excludedCharges = ['COMMISSION', 'GROWER ADVANCES'];
  const excludedExporters = ['Videxport', 'Del Monte'];
  
  // Group charges by Lotid and calculate totals
  chargeData
    .filter(row => !excludedExporters.includes(row['Exporter Clean']))
    .filter(row => !excludedCharges.includes(row.Chargedescr))
    .forEach(row => {
      const lotid = row.Lotid;
      const amount = row.Chgamt || 0;
      const initialStock = row['Initial Stock'] || 0;
      
      if (!lotidTotals[lotid]) {
        lotidTotals[lotid] = {
          lotid,
          exporter: row['Exporter Clean'],
          totalChargeAmount: 0,
          totalBoxes: initialStock, // Solo tomar una vez por Lotid
          charges: []
        };
      }
      
      lotidTotals[lotid].totalChargeAmount += amount;
      lotidTotals[lotid].charges.push({
        description: row.Chargedescr,
        amount,
        quantity: row.Chgqnt || 0,
        date: row['Charge Date']
      });
    });
  
  // Calculate cost per box for each lotid
  Object.values(lotidTotals).forEach(lotid => {
    lotid.costPerBox = lotid.totalBoxes > 0 ? 
      lotid.totalChargeAmount / lotid.totalBoxes : 
      null; // Handle division by zero
  });
  
  cachedMetrics = lotidTotals;
  console.log(`✅ Calculated metrics for ${Object.keys(lotidTotals).length} lot IDs from CSV`);
  return lotidTotals;
};

// Analyze specific charge type from CSV data
export const analyzeSpecificChargeFromCSV = async (chargeType, displayName) => {
  const chargeData = await loadCostDataFromCSV();
  
  const filteredData = chargeData.filter(row => 
    row.Chargedescr === chargeType && 
    row['Exporter Clean'] !== 'Videxport' && 
    row['Exporter Clean'] !== 'Del Monte'
  );

  if (filteredData.length === 0) {
    return {
      byExporter: [],
      summary: {
        totalAmount: 0,
        avgPerBox: 0,
        recordCount: 0
      },
      rawData: [],
      displayName
    };
  }

  // Primero, obtener Initial Stock único por Lotid
  const lotidStocks = {};
  filteredData.forEach(row => {
    const lotid = row.Lotid;
    if (!lotidStocks[lotid]) {
      lotidStocks[lotid] = {
        initialStock: row['Initial Stock'] || 0,
        exporter: row['Exporter Clean']
      };
    }
  });

  const exporterStats = {};
  let totalAmount = 0;
  let totalBoxesUnique = 0;
  
  // Calcular total único de boxes por exporter
  const exporterUniqueBoxes = {};
  Object.values(lotidStocks).forEach(stock => {
    const exporter = stock.exporter || 'Unknown';
    if (!exporterUniqueBoxes[exporter]) {
      exporterUniqueBoxes[exporter] = 0;
    }
    exporterUniqueBoxes[exporter] += stock.initialStock;
    totalBoxesUnique += stock.initialStock;
  });
  
  filteredData.forEach(row => {
    const exporter = row['Exporter Clean'] || 'Unknown';
    const amount = row.Chgamt || 0;
    
    totalAmount += amount;
    
    if (!exporterStats[exporter]) {
      exporterStats[exporter] = {
        exporter,
        totalAmount: 0,
        totalBoxes: exporterUniqueBoxes[exporter] || 0, // Boxes únicos por exporter
        recordCount: 0
      };
    }
    
    exporterStats[exporter].totalAmount += amount;
    exporterStats[exporter].recordCount += 1;
  });

  // Convert to array and calculate averages
  const byExporter = Object.values(exporterStats).map(stats => ({
    ...stats,
    avgPerBox: stats.totalBoxes > 0 ? stats.totalAmount / stats.totalBoxes : 0
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  const summary = {
    totalAmount,
    avgPerBox: totalBoxesUnique > 0 ? totalAmount / totalBoxesUnique : 0,
    recordCount: filteredData.length
  };

  return { 
    byExporter, 
    summary, 
    rawData: filteredData, 
    displayName 
  };
};

// Get data summary from CSV
export const getDataSummaryFromCSV = async () => {
  const chargeData = await loadCostDataFromCSV();
  
  if (!chargeData || chargeData.length === 0) {
    return {
      totalRecords: 0,
      exporters: [],
      lotids: [],
      chargeTypes: []
    };
  }
  
  return {
    totalRecords: chargeData.length,
    exporters: [...new Set(chargeData.map(item => item['Exporter Clean']))].filter(Boolean),
    lotids: [...new Set(chargeData.map(item => item.Lotid))].filter(Boolean),
    chargeTypes: [...new Set(chargeData.map(item => item.Chargedescr))].filter(Boolean)
  };
};

// Clear cache (useful for development)
export const clearCostDataCache = () => {
  cachedCostData = null;
  cachedMetrics = null;
  console.log('🗑️ Cost data cache cleared');
};

// Function to load Initial Stock from detailed CSV
export const loadInitialStockFromCSV = async () => {
  if (cachedInitialStockData) return cachedInitialStockData;
  
  try {
    const response = await fetch('/data/Initial_Stock_All.csv');
    const csvText = await response.text();
    
    // Parse CSV (comma separated)
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        
        // Parse numeric fields
        if (header === 'Initial Stock') {
          row[header] = parseFloat(value) || 0;
        } else {
          row[header] = value || '';
        }
      });
      
      return row;
    }).filter(row => row.Lotid); // Filter out empty rows
    
    cachedInitialStockData = data;
    console.log(`✅ Loaded ${data.length} initial stock records from CSV`);
    
    return data;
  } catch (error) {
    console.error('❌ Error loading initial stock CSV:', error);
    throw error;
  }
};

// Function to get consolidated initial stock (sum by Lotid)
export const getConsolidatedInitialStock = async () => {
  if (cachedConsolidatedInitialStock) return cachedConsolidatedInitialStock;
  
  const stockData = await loadInitialStockFromCSV();
  const consolidated = {};
  
  stockData.forEach(record => {
    const lotid = record.Lotid;
    const stock = record['Initial Stock'] || 0;
    const exporter = record['Exporter Clean'] || 'Unknown';
    const variety = record.Variety || 'Unknown';
    const entryDate = record['Entry Date'] || '';
    
    if (!consolidated[lotid]) {
      consolidated[lotid] = {
        lotid,
        totalStock: 0,
        exporter,
        variety,
        entryDate,
        records: []
      };
    }
    
    consolidated[lotid].totalStock += stock;
    consolidated[lotid].records.push({
      stock,
      exporter,
      variety,
      entryDate
    });
  });
  
  cachedConsolidatedInitialStock = consolidated;
  console.log(`✅ Consolidated initial stock for ${Object.keys(consolidated).length} Lotids`);
  
  return consolidated;
};

// Function to get initial stock analysis by various dimensions
export const getInitialStockAnalysis = async () => {
  const stockData = await loadInitialStockFromCSV();
  
  const analysis = {
    totalStock: 0,
    totalLotids: new Set(),
    totalRecords: stockData.length,
    byExporter: {},
    byVariety: {},
    byMonth: {},
    dateRange: { earliest: null, latest: null }
  };
  
  stockData.forEach(record => {
    const lotid = record.Lotid;
    const stock = record['Initial Stock'] || 0;
    const exporter = record['Exporter Clean'] || 'Unknown';
    const variety = record.Variety || 'Unknown';
    const entryDate = record['Entry Date'] || '';
    
    analysis.totalStock += stock;
    analysis.totalLotids.add(lotid);
    
    // Parse date for date range and monthly analysis
    let date = null;
    if (entryDate) {
      // Handle MM/DD/YYYY format
      const [month, day, year] = entryDate.split('/');
      if (month && day && year) {
        date = new Date(year, month - 1, day);
        
        // Track date range
        if (!analysis.dateRange.earliest || date < analysis.dateRange.earliest) {
          analysis.dateRange.earliest = date;
        }
        if (!analysis.dateRange.latest || date > analysis.dateRange.latest) {
          analysis.dateRange.latest = date;
        }
      }
    }
    
    // By exporter
    if (!analysis.byExporter[exporter]) {
      analysis.byExporter[exporter] = { 
        totalStock: 0, 
        lotids: new Set(), 
        varieties: new Set(),
        records: 0,
        avgStockPerLotid: 0
      };
    }
    analysis.byExporter[exporter].totalStock += stock;
    analysis.byExporter[exporter].lotids.add(lotid);
    analysis.byExporter[exporter].varieties.add(variety);
    analysis.byExporter[exporter].records += 1;
    
    // By variety
    if (!analysis.byVariety[variety]) {
      analysis.byVariety[variety] = { 
        totalStock: 0, 
        lotids: new Set(), 
        exporters: new Set(),
        records: 0,
        avgStockPerLotid: 0
      };
    }
    analysis.byVariety[variety].totalStock += stock;
    analysis.byVariety[variety].lotids.add(lotid);
    analysis.byVariety[variety].exporters.add(exporter);
    analysis.byVariety[variety].records += 1;
    
    // By month (if date is valid)
    if (date) {
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      if (!analysis.byMonth[monthKey]) {
        analysis.byMonth[monthKey] = { 
          totalStock: 0, 
          lotids: new Set(), 
          exporters: new Set(),
          varieties: new Set(),
          records: 0
        };
      }
      analysis.byMonth[monthKey].totalStock += stock;
      analysis.byMonth[monthKey].lotids.add(lotid);
      analysis.byMonth[monthKey].exporters.add(exporter);
      analysis.byMonth[monthKey].varieties.add(variety);
      analysis.byMonth[monthKey].records += 1;
    }
  });
  
  // Convert sets to counts/arrays and calculate averages
  Object.values(analysis.byExporter).forEach(data => {
    data.lotidCount = data.lotids.size;
    data.varietyCount = data.varieties.size;
    data.varieties = Array.from(data.varieties);
    data.avgStockPerLotid = data.lotidCount > 0 ? Math.round(data.totalStock / data.lotidCount) : 0;
  });
  
  Object.values(analysis.byVariety).forEach(data => {
    data.lotidCount = data.lotids.size;
    data.exporterCount = data.exporters.size;
    data.exporters = Array.from(data.exporters);
    data.avgStockPerLotid = data.lotidCount > 0 ? Math.round(data.totalStock / data.lotidCount) : 0;
  });
  
  Object.values(analysis.byMonth).forEach(data => {
    data.lotidCount = data.lotids.size;
    data.exporterCount = data.exporters.size;
    data.varietyCount = data.varieties.size;
    data.exporters = Array.from(data.exporters);
    data.varieties = Array.from(data.varieties);
  });
  
  analysis.totalLotids = analysis.totalLotids.size;
  
  return analysis;
};

// Function to get detailed initial stock info for a specific Lotid
export const getInitialStockDetails = async (lotid) => {
  const consolidated = await getConsolidatedInitialStock();
  return consolidated[lotid] || null;
};

// Function to validate initial stock totals by exporter
export const validateInitialStockByExporter = async () => {
  const analysis = await getInitialStockAnalysis();
  
  console.log('📊 Initial Stock by Exporter Validation:');
  Object.entries(analysis.byExporter)
    .sort(([,a], [,b]) => b.totalStock - a.totalStock)
    .forEach(([exporter, data]) => {
      console.log(`  ${exporter}: ${data.totalStock.toLocaleString()} boxes (${data.lotidCount} Lotids, ${data.varietyCount} varieties)`);
    });
  
  return analysis.byExporter;
};

// Clear all caches to force fresh data reload
export const clearAllCaches = () => {
  cachedCostData = null;
  cachedMetrics = null;
  cachedInitialStockData = null;
  cachedConsolidatedInitialStock = null;
  console.log('🔄 All caches cleared - fresh data will be loaded');
};
