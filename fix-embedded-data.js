const fs = require('fs');
const path = require('path');

// Read the original embedded file to extract just the data
const originalFile = fs.readFileSync(path.join(__dirname, 'src/data/costDataEmbedded.js'), 'utf8');

// Find the start and end of the data arrays
const costDataStart = originalFile.indexOf('export const embeddedCostData = [');
const stockDataStart = originalFile.indexOf('export const embeddedStockData = [');
const stockDataEnd = originalFile.indexOf('];', stockDataStart) + 2;

// Extract the data sections
const costDataSection = originalFile.substring(costDataStart, stockDataStart).trim();
const stockDataSection = originalFile.substring(stockDataStart, stockDataEnd).trim();

console.log('Reorganizing embedded data file with correct order...');

// Generate the new file with data first, then functions
const newContent = `// Auto-generated embedded cost and stock data
// Generated on: ${new Date().toISOString()}
// Source: Charge Summary New.csv, Initial_Stock_All.csv

${costDataSection}

${stockDataSection}

// Cache for processed metrics
let cachedMetrics = null;

// Function to parse European number format (comma as decimal separator)
const parseEuropeanNumber = (value) => {
  if (!value || value === '') return 0;
  return parseFloat(value.toString().replace(',', '.')) || 0;
};

// Calculate metrics from embedded data
export const calculateMetricsFromEmbedded = async () => {
  if (cachedMetrics) return cachedMetrics;
  
  console.log('📊 Calculating metrics from embedded data...');
  
  const metrics = {};
  
  embeddedCostData.forEach(row => {
    const lotid = row.Lotid;
    const charge = parseEuropeanNumber(row.Chgamt);
    const chargeDescription = row.Chargedescr;
    const initialStock = parseEuropeanNumber(row['Initial Stock']);
    const exporter = row['Exporter Clean'];
    
    if (!metrics[lotid]) {
      metrics[lotid] = {
        lotid,
        exporter,
        totalChargeAmount: 0,
        totalBoxes: initialStock,
        costPerBox: 0,
        charges: {}
      };
    }
    
    // Add charge to total (excluding Grower Advances)
    if (chargeDescription !== 'GROWER ADVANCES') {
      metrics[lotid].totalChargeAmount += charge;
    }
    
    // Track individual charges
    if (!metrics[lotid].charges[chargeDescription]) {
      metrics[lotid].charges[chargeDescription] = 0;
    }
    metrics[lotid].charges[chargeDescription] += charge;
  });
  
  // Calculate cost per box
  Object.values(metrics).forEach(metric => {
    if (metric.totalBoxes > 0) {
      metric.costPerBox = metric.totalChargeAmount / metric.totalBoxes;
    }
  });
  
  cachedMetrics = metrics;
  console.log(\`✅ Calculated metrics for \${Object.keys(metrics).length} lots\`);
  return metrics;
};

// Get charge data (for compatibility)
export const getChargeDataFromEmbedded = async () => {
  return embeddedCostData;
};

// Get data summary
export const getDataSummaryFromEmbedded = async () => {
  const metrics = await calculateMetricsFromEmbedded();
  
  const totalLots = Object.keys(metrics).length;
  const validCosts = Object.values(metrics).filter(m => m.costPerBox > 0);
  const avgCostPerBox = validCosts.length > 0 ? 
    validCosts.reduce((sum, m) => sum + m.costPerBox, 0) / validCosts.length : 0;
  const totalCharges = Object.values(metrics).reduce((sum, m) => sum + m.totalChargeAmount, 0);
  
  return {
    totalLots,
    avgCostPerBox,
    totalCharges,
    validCosts: validCosts.length
  };
};

// Analyze specific charge type
export const analyzeSpecificChargeFromEmbedded = async (chargeType, displayName) => {
  console.log(\`📊 Analyzing \${displayName} charges from embedded data...\`);
  
  const chargeData = embeddedCostData.filter(row => 
    row.Chargedescr === chargeType && row.Chgamt > 0
  );
  
  if (chargeData.length === 0) {
    return {
      analysis: {
        totalAmount: 0,
        totalRecords: 0,
        avgChargePerLot: 0,
        lotsWithCharge: 0,
        avgChargeAmount: 0
      },
      outliers: [],
      byExporter: {}
    };
  }
  
  // Group by lot
  const chargeByLot = {};
  chargeData.forEach(row => {
    const lotid = row.Lotid;
    if (!chargeByLot[lotid]) {
      chargeByLot[lotid] = {
        lotid,
        exporter: row['Exporter Clean'],
        totalCharge: 0,
        records: 0
      };
    }
    chargeByLot[lotid].totalCharge += row.Chgamt;
    chargeByLot[lotid].records += 1;
  });
  
  const lots = Object.values(chargeByLot);
  const totalAmount = lots.reduce((sum, lot) => sum + lot.totalCharge, 0);
  const avgChargePerLot = lots.length > 0 ? totalAmount / lots.length : 0;
  
  // Find outliers (charges > 2 standard deviations from mean)
  const charges = lots.map(lot => lot.totalCharge);
  const mean = avgChargePerLot;
  const stdDev = Math.sqrt(charges.reduce((sum, charge) => sum + Math.pow(charge - mean, 2), 0) / charges.length);
  const outliers = lots.filter(lot => Math.abs(lot.totalCharge - mean) > 2 * stdDev);
  
  // Group by exporter
  const byExporter = {};
  lots.forEach(lot => {
    const exporter = lot.exporter;
    if (!byExporter[exporter]) {
      byExporter[exporter] = {
        exporter,
        totalAmount: 0,
        lots: 0,
        avgCharge: 0
      };
    }
    byExporter[exporter].totalAmount += lot.totalCharge;
    byExporter[exporter].lots += 1;
  });
  
  // Calculate averages
  Object.values(byExporter).forEach(exp => {
    exp.avgCharge = exp.lots > 0 ? exp.totalAmount / exp.lots : 0;
  });
  
  return {
    analysis: {
      totalAmount,
      totalRecords: chargeData.length,
      avgChargePerLot,
      lotsWithCharge: lots.length,
      avgChargeAmount: chargeData.reduce((sum, row) => sum + row.Chgamt, 0) / chargeData.length
    },
    outliers,
    byExporter
  };
};

// Get initial stock analysis
export const getInitialStockAnalysisFromEmbedded = async () => {
  const stockByLot = {};
  
  embeddedStockData.forEach(row => {
    const lotid = row.Lotid;
    const stock = parseFloat(row['Initial Stock']) || 0;
    
    if (!stockByLot[lotid]) {
      stockByLot[lotid] = {
        lotid,
        exporter: row['Exporter Clean'],
        totalStock: 0
      };
    }
    
    stockByLot[lotid].totalStock += stock;
  });
  
  const lots = Object.values(stockByLot);
  const totalStock = lots.reduce((sum, lot) => sum + lot.totalStock, 0);
  const avgStockPerLot = lots.length > 0 ? totalStock / lots.length : 0;
  
  return {
    totalLots: lots.length,
    totalStock,
    avgStockPerLot,
    lots
  };
};

// Get top varieties by stock
export const getTopVarietiesByStockFromEmbedded = async (limit = 8) => {
  const varietyStock = {};
  
  embeddedStockData.forEach(row => {
    const variety = row.Variety;
    const stock = parseFloat(row['Initial Stock']) || 0;
    
    if (!varietyStock[variety]) {
      varietyStock[variety] = {
        variety,
        totalStock: 0,
        lots: 0
      };
    }
    
    varietyStock[variety].totalStock += stock;
    varietyStock[variety].lots += 1;
  });
  
  return Object.values(varietyStock)
    .sort((a, b) => b.totalStock - a.totalStock)
    .slice(0, limit);
};

// Get stock distribution by month
export const getStockDistributionByMonthFromEmbedded = async () => {
  const monthlyStock = {};
  
  embeddedStockData.forEach(row => {
    const date = new Date(row['Entry Date']);
    const monthKey = \`\${date.getFullYear()}-\${(date.getMonth() + 1).toString().padStart(2, '0')}\`;
    const stock = parseFloat(row['Initial Stock']) || 0;
    
    if (!monthlyStock[monthKey]) {
      monthlyStock[monthKey] = {
        month: monthKey,
        totalStock: 0,
        lots: 0
      };
    }
    
    monthlyStock[monthKey].totalStock += stock;
    monthlyStock[monthKey].lots += 1;
  });
  
  return Object.values(monthlyStock).sort((a, b) => a.month.localeCompare(b.month));
};

// Clear cache function
export const clearEmbeddedDataCache = () => {
  cachedMetrics = null;
  console.log('🗑️ Embedded data cache cleared');
};
`;

// Write the reorganized file
const outputPath = path.join(__dirname, 'src/data/costDataEmbedded.js');
fs.writeFileSync(outputPath, newContent);

console.log('✅ Reorganized embedded data file with correct structure');
console.log('   - Data arrays defined first');
console.log('   - Functions defined after data');
console.log('   - All references should work correctly now');
