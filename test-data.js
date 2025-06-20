// Test script to verify embedded data is working
const { 
  embeddedCostData, 
  embeddedStockData, 
  calculateMetricsFromEmbedded 
} = require('./src/data/costDataEmbedded.js');

console.log('🔍 Testing embedded data...');

// Test data arrays
console.log('📊 Cost data records:', embeddedCostData ? embeddedCostData.length : 'undefined');
console.log('📦 Stock data records:', embeddedStockData ? embeddedStockData.length : 'undefined');

// Test first few records
if (embeddedCostData && embeddedCostData.length > 0) {
  console.log('First cost record:', embeddedCostData[0]);
} else {
  console.log('❌ Cost data is empty or undefined');
}

if (embeddedStockData && embeddedStockData.length > 0) {
  console.log('First stock record:', embeddedStockData[0]);
} else {
  console.log('❌ Stock data is empty or undefined');
}

// Test metrics calculation
calculateMetricsFromEmbedded().then(metrics => {
  console.log('📈 Calculated metrics for', Object.keys(metrics).length, 'lots');
  console.log('Sample metric:', Object.values(metrics)[0]);
}).catch(error => {
  console.error('❌ Error calculating metrics:', error);
});
