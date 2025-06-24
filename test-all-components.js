const { filterExportersList } = require('./src/utils/dataFiltering.js');
const { 
  calculateMetricsFromEmbedded,
  clearEmbeddedDataCache
} = require('./src/data/costDataEmbedded.js');
const { getSalesData } = require('./src/data/salesDataEmbedded.js');

async function testAllComponents() {
  console.log('🧪 TESTING ALL COMPONENTS FOR EXPORTER FILTERING');
  console.log('=================================================\n');
  
  // Clear cache first
  clearEmbeddedDataCache();
  console.log('🧹 Cache cleared\n');
  
  try {
    console.log('📊 Testing Cost Consistency Components...');
    
    // Test cost data (used by CostConsistencyReport and CostConsistencySubComponents)
    const metrics = await calculateMetricsFromEmbedded();
    const costExporters = [...new Set(Object.values(metrics).map(l => l.exporter))].filter(Boolean);
    const filteredCostExporters = filterExportersList(costExporters);
    
    console.log(`   📈 Cost Data - Original exporters: ${costExporters.length}`);
    console.log(`   📈 Cost Data - Filtered exporters: ${filteredCostExporters.length}`);
    console.log(`   📈 Cost exporters: ${filteredCostExporters.join(', ')}`);
    
    // Check for excluded exporters in cost data
    const excludedInCost = costExporters.filter(exp => !filteredCostExporters.includes(exp));
    if (excludedInCost.length > 0) {
      console.log(`   ✅ Successfully filtered out: ${excludedInCost.join(', ')}`);
    } else {
      console.log(`   ℹ️  No excluded exporters found in cost data`);
    }
    
    console.log('\n📊 Testing Sales Components...');
    
    // Test sales data (used by SalesDetailReport)
    const salesData = await getSalesData();
    const salesExporters = [...new Set(salesData.map(r => r['Exporter Clean']))].filter(Boolean);
    const filteredSalesExporters = filterExportersList(salesExporters);
    
    console.log(`   📈 Sales Data - Original exporters: ${salesExporters.length}`);
    console.log(`   📈 Sales Data - Filtered exporters: ${filteredSalesExporters.length}`);
    console.log(`   📈 Sales exporters: ${filteredSalesExporters.join(', ')}`);
    
    // Check for excluded exporters in sales data
    const excludedInSales = salesExporters.filter(exp => !filteredSalesExporters.includes(exp));
    if (excludedInSales.length > 0) {
      console.log(`   ✅ Successfully filtered out: ${excludedInSales.join(', ')}`);
    } else {
      console.log(`   ℹ️  No excluded exporters found in sales data`);
    }
    
    console.log('\n📊 Testing Profitability Components...');
    
    // Test profitability data (combines cost and sales)
    const profitabilityExporters = [...new Set([...costExporters, ...salesExporters])];
    const filteredProfitabilityExporters = filterExportersList(profitabilityExporters);
    
    console.log(`   📈 Profitability Data - Combined exporters: ${profitabilityExporters.length}`);
    console.log(`   📈 Profitability Data - Filtered exporters: ${filteredProfitabilityExporters.length}`);
    console.log(`   📈 Profitability exporters: ${filteredProfitabilityExporters.join(', ')}`);
    
    // Final summary
    console.log('\n📋 SUMMARY:');
    console.log('===========');
    
    const allOriginalExporters = [...new Set([...costExporters, ...salesExporters])];
    const allFilteredExporters = [...new Set([...filteredCostExporters, ...filteredSalesExporters])];
    const totalExcluded = allOriginalExporters.filter(exp => !allFilteredExporters.includes(exp));
    
    console.log(`🔢 Total unique exporters across all data sources: ${allOriginalExporters.length}`);
    console.log(`✅ Total exporters after filtering: ${allFilteredExporters.length}`);
    console.log(`❌ Total excluded exporters: ${totalExcluded.length}`);
    
    if (totalExcluded.length > 0) {
      console.log(`🚫 Excluded exporters: ${totalExcluded.join(', ')}`);
    }
    
    console.log(`\n📝 Final exporter list for all dropdowns: ${allFilteredExporters.sort().join(', ')}`);
    
    // Test the filtering function directly with known problematic data
    console.log('\n🔧 Direct Function Test:');
    const testData = ['Agrolatina', 'Del Monte', 'VIDEXPORT', 'Videxport', 'MDT', 'Quintay'];
    const testResult = filterExportersList(testData);
    console.log(`   Input: ${testData.join(', ')}`);
    console.log(`   Output: ${testResult.join(', ')}`);
    
    if (testResult.includes('Del Monte') || testResult.includes('VIDEXPORT') || testResult.includes('Videxport')) {
      console.log('❌ FUNCTION TEST FAILED - Excluded exporters still present!');
    } else {
      console.log('✅ FUNCTION TEST PASSED - All excluded exporters properly filtered');
    }
    
  } catch (error) {
    console.error('❌ Error in component testing:', error);
  }
}

testAllComponents();
