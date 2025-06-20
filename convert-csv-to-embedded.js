const fs = require('fs');
const path = require('path');

// Function to parse European number format (comma as decimal separator)
const parseEuropeanNumber = (value) => {
  if (!value || value === '') return 0;
  return parseFloat(value.toString().replace(',', '.')) || 0;
};

// Read and parse the CSV files
const costCsvPath = path.join(__dirname, 'public/data/Charge Summary New.csv');
const stockCsvPath = path.join(__dirname, 'public/data/Initial_Stock_All.csv');

console.log('Converting CSV files to embedded JavaScript data...');

// Process cost data
const costCsvContent = fs.readFileSync(costCsvPath, 'utf8');
const costLines = costCsvContent.split('\n').filter(line => line.trim());
const costHeaders = costLines[0].split(';');

const costData = costLines.slice(1).map(line => {
  const values = line.split(';');
  const row = {};
  
  costHeaders.forEach((header, index) => {
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

console.log(`Processed ${costData.length} cost records`);

// Process stock data
const stockCsvContent = fs.readFileSync(stockCsvPath, 'utf8');
const stockLines = stockCsvContent.replace(/^\uFEFF/, '').split('\n').filter(line => line.trim()); // Remove BOM
const stockHeaders = stockLines[0].split(','); // Using comma separator for stock data

console.log('Stock headers:', stockHeaders);

const stockData = stockLines.slice(1).map(line => {
  const values = line.split(',');
  const row = {};
  
  stockHeaders.forEach((header, index) => {
    const value = values[index]?.trim();
    
    // Parse numeric fields
    if (header === 'Initial Stock') {
      row[header] = parseFloat(value) || 0;
    } else {
      row[header] = value || '';
    }
  });
  
  return row;
}).filter(row => row.Lotid);

console.log(`Processed ${stockData.length} stock records`);

// Generate the embedded data file
const outputContent = `// Auto-generated embedded cost and stock data
// Generated on: ${new Date().toISOString()}
// Source: Charge Summary New.csv, Initial_Stock_All.csv

export const embeddedCostData = ${JSON.stringify(costData, null, 2)};

export const embeddedStockData = ${JSON.stringify(stockData, null, 2)};

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

// Get initial stock analysis
export const getInitialStockAnalysisFromEmbedded = async () => {
  const stockByLot = {};
  
  embeddedStockData.forEach(row => {
    const lotid = row.Lotid;
    const stock = parseEuropeanNumber(row['Initial Stock']);
    
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

// Clear cache function
export const clearEmbeddedDataCache = () => {
  cachedMetrics = null;
  console.log('🗑️ Embedded data cache cleared');
};
`;

// Write the output file
const outputPath = path.join(__dirname, 'src/data/costDataEmbedded.js');
fs.writeFileSync(outputPath, outputContent);

console.log(`✅ Generated embedded data file: ${outputPath}`);
console.log(`   - ${costData.length} cost records`);
console.log(`   - ${stockData.length} stock records`);
console.log('🎉 Conversion complete!');
