const { 
  getTopVarietiesByStockFromEmbedded,
  getInitialStockAnalysisFromEmbedded
} = require('./src/data/costDataEmbedded.js');

async function debugVarieties() {
  console.log('🔍 Debugging Top Varieties Details...\n');
  
  try {
    // Test stock analysis
    console.log('1. Testing stock analysis...');
    const stockAnalysis = await getInitialStockAnalysisFromEmbedded();
    console.log('📊 Stock Analysis:', {
      totalStock: stockAnalysis.totalStock,
      totalLots: stockAnalysis.totalLots
    });
    
    // Test top varieties function
    console.log('\n2. Testing top varieties function...');
    const topVarieties = await getTopVarietiesByStockFromEmbedded(8);
    
    console.log(`📋 Found ${topVarieties.length} varieties:`);
    topVarieties.forEach((variety, index) => {
      const stockPercent = variety.totalStock / stockAnalysis.totalStock;
      console.log(`${index + 1}. ${variety.variety}:`);
      console.log(`   - Total Stock: ${Math.round(variety.totalStock)}`);
      console.log(`   - Lots: ${variety.lots}`);
      console.log(`   - Exporters: ${variety.exporterCount}`);
      console.log(`   - Stock %: ${(stockPercent * 100).toFixed(2)}%`);
      console.log('');
    });
    
    // Test if varieties have required fields
    console.log('3. Validating variety data structure...');
    const requiredFields = ['variety', 'totalStock', 'lots', 'exporterCount'];
    topVarieties.forEach((variety, index) => {
      const missing = requiredFields.filter(field => variety[field] === undefined);
      if (missing.length > 0) {
        console.error(`❌ Variety ${index + 1} missing fields:`, missing);
      } else {
        console.log(`✅ Variety ${index + 1} (${variety.variety}) has all required fields`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugVarieties();
