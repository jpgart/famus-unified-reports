// Test inventory data specifically
const { 
  embeddedStockData,
  getInitialStockAnalysisFromEmbedded,
  getTopVarietiesByStockFromEmbedded,
  getStockDistributionByMonthFromEmbedded
} = require('./src/data/costDataEmbedded.js');

console.log('🔍 Testing Inventory Data Specifically...');

try {
  console.log('📦 Raw Stock Data Count:', embeddedStockData?.length || 0);
  
  if (embeddedStockData && embeddedStockData.length > 0) {
    console.log('📊 First 5 stock records:');
    embeddedStockData.slice(0, 5).forEach((record, index) => {
      console.log(`${index + 1}.`, record);
    });
  }
  
  // Test analysis functions
  console.log('\n🧪 Testing analysis functions...');
  
  const testFunctions = async () => {
    try {
      const analysis = await getInitialStockAnalysisFromEmbedded();
      console.log('📈 Stock Analysis Result:', analysis);
      
      const varieties = await getTopVarietiesByStockFromEmbedded(5);
      console.log('🌱 Top Varieties:', varieties);
      
      const monthly = await getStockDistributionByMonthFromEmbedded();
      console.log('📅 Monthly Distribution:', monthly);
      
    } catch (error) {
      console.error('❌ Function test error:', error);
    }
  };
  
  testFunctions();
  
} catch (error) {
  console.error('❌ Import error:', error);
}
