// Test specific functions used by Cost Consistency Report
const fs = require('fs');

console.log('🔍 Testing Cost Consistency Report functions...');

try {
  // Import the embedded data module
  const { 
    calculateMetricsFromEmbedded, 
    getDataSummaryFromEmbedded,
    getChargeDataFromEmbedded,
    getInitialStockAnalysisFromEmbedded,
    analyzeSpecificChargeFromEmbedded,
    clearEmbeddedDataCache
  } = require('./src/data/costDataEmbedded.js');
  
  console.log('✅ All imports successful');
  
  // Test each function
  const testFunctions = async () => {
    try {
      console.log('📊 Testing calculateMetricsFromEmbedded...');
      const metrics = await calculateMetricsFromEmbedded();
      console.log('✅ Metrics calculated:', Object.keys(metrics).length, 'lots');
      
      console.log('📈 Testing getDataSummaryFromEmbedded...');
      const summary = await getDataSummaryFromEmbedded();
      console.log('✅ Summary generated:', summary);
      
      console.log('📋 Testing getChargeDataFromEmbedded...');
      const chargeData = await getChargeDataFromEmbedded();
      console.log('✅ Charge data retrieved:', chargeData.length, 'records');
      
      console.log('📦 Testing getInitialStockAnalysisFromEmbedded...');
      const stockAnalysis = await getInitialStockAnalysisFromEmbedded();
      console.log('✅ Stock analysis completed:', stockAnalysis);
      
      console.log('💰 Testing analyzeSpecificChargeFromEmbedded...');
      const commissionAnalysis = await analyzeSpecificChargeFromEmbedded('COMMISSION', 'Commission Analysis');
      console.log('✅ Commission analysis completed:', commissionAnalysis);
      
      console.log('🧹 Testing clearEmbeddedDataCache...');
      clearEmbeddedDataCache();
      console.log('✅ Cache cleared');
      
      console.log('🎉 All functions working correctly!');
      
    } catch (error) {
      console.error('❌ Function test error:', error);
    }
  };
  
  testFunctions();
  
} catch (error) {
  console.error('❌ Import error:', error);
}
