const { 
  calculateMetricsFromEmbedded,
  analyzeSpecificChargeFromEmbedded,
  getInitialStockAnalysisFromEmbedded,
  getTopVarietiesByStockFromEmbedded,
  getChargeDataFromEmbedded,
  getDataSummaryFromEmbedded,
  getStockDistributionByMonthFromEmbedded
} = require('./src/data/costDataEmbedded.js');

async function comprehensiveExporterTest() {
  console.log('🔍 COMPREHENSIVE EXPORTER EXCLUSION TEST\n');
  
  const excludedExporters = ['Del Monte', 'VIDEXPORT', 'Videxport'];
  let foundExcluded = false;
  
  try {
    // Test 1: calculateMetricsFromEmbedded
    console.log('1. Testing calculateMetricsFromEmbedded...');
    const metrics = await calculateMetricsFromEmbedded();
    const metricsArray = Object.values(metrics);
    const exportersInMetrics = [...new Set(metricsArray.map(m => m.exporter))].filter(Boolean);
    
    console.log(`   Found exporters: ${exportersInMetrics.join(', ')}`);
    excludedExporters.forEach(excluded => {
      if (exportersInMetrics.includes(excluded)) {
        console.log(`   ❌ FOUND EXCLUDED: ${excluded} in metrics`);
        foundExcluded = true;
      }
    });
    
    // Test 2: getChargeDataFromEmbedded
    console.log('\n2. Testing getChargeDataFromEmbedded...');
    const chargeData = await getChargeDataFromEmbedded();
    const exportersInChargeData = [...new Set(chargeData.map(c => c['Exporter Clean']))].filter(Boolean);
    
    console.log(`   Found exporters: ${exportersInChargeData.join(', ')}`);
    excludedExporters.forEach(excluded => {
      if (exportersInChargeData.includes(excluded)) {
        console.log(`   ❌ FOUND EXCLUDED: ${excluded} in charge data`);
        foundExcluded = true;
      }
    });
    
    // Test 3: getInitialStockAnalysisFromEmbedded
    console.log('\n3. Testing getInitialStockAnalysisFromEmbedded...');
    const stockAnalysis = await getInitialStockAnalysisFromEmbedded();
    if (stockAnalysis.byExporter) {
      const exportersInStock = Object.keys(stockAnalysis.byExporter);
      console.log(`   Found exporters: ${exportersInStock.join(', ')}`);
      excludedExporters.forEach(excluded => {
        if (exportersInStock.includes(excluded)) {
          console.log(`   ❌ FOUND EXCLUDED: ${excluded} in stock analysis`);
          foundExcluded = true;
        }
      });
    }
    
    // Test 4: Ocean Freight Analysis
    console.log('\n4. Testing Ocean Freight Analysis...');
    const oceanFreight = await analyzeSpecificChargeFromEmbedded('OCEAN FREIGHT', 'Ocean Freight');
    if (oceanFreight.byExporter) {
      const exportersInOceanFreight = Object.keys(oceanFreight.byExporter);
      console.log(`   Found exporters: ${exportersInOceanFreight.join(', ')}`);
      excludedExporters.forEach(excluded => {
        if (exportersInOceanFreight.includes(excluded)) {
          console.log(`   ❌ FOUND EXCLUDED: ${excluded} in ocean freight`);
          foundExcluded = true;
        }
      });
    }
    
    // Test 5: Packing Materials Analysis
    console.log('\n5. Testing Packing Materials Analysis...');
    const packingMaterials = await analyzeSpecificChargeFromEmbedded('PACKING MATERIALS', 'Packing Materials');
    if (packingMaterials.byExporter) {
      const exportersInPacking = Object.keys(packingMaterials.byExporter);
      console.log(`   Found exporters: ${exportersInPacking.join(', ')}`);
      excludedExporters.forEach(excluded => {
        if (exportersInPacking.includes(excluded)) {
          console.log(`   ❌ FOUND EXCLUDED: ${excluded} in packing materials`);
          foundExcluded = true;
        }
      });
    }
    
    // Test 6: getTopVarietiesByStockFromEmbedded - Check underlying data
    console.log('\n6. Testing Top Varieties...');
    const topVarieties = await getTopVarietiesByStockFromEmbedded(10);
    console.log(`   Found ${topVarieties.length} varieties`);
    
    // Test 7: getStockDistributionByMonthFromEmbedded
    console.log('\n7. Testing Monthly Stock Distribution...');
    const monthlyStock = await getStockDistributionByMonthFromEmbedded();
    console.log(`   Found ${monthlyStock.length} months of data`);
    
    console.log('\n=================================');
    if (foundExcluded) {
      console.log('❌ EXCLUSION TEST FAILED - Found excluded exporters!');
    } else {
      console.log('✅ EXCLUSION TEST PASSED - No excluded exporters found!');
    }
    console.log('=================================');
    
  } catch (error) {
    console.error('❌ Error in comprehensive test:', error);
  }
}

comprehensiveExporterTest();
