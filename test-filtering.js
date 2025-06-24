const { 
  calculateMetricsFromEmbedded,
  analyzeSpecificChargeFromEmbedded,
  getInitialStockAnalysisFromEmbedded
} = require('./src/data/costDataEmbedded.js');

async function testFiltering() {
  console.log('🔍 Testing exporter filtering...\n');
  
  try {
    // Test metrics calculation
    console.log('1. Testing calculateMetricsFromEmbedded...');
    const metrics = await calculateMetricsFromEmbedded();
    const metricsArray = Object.values(metrics);
    
    console.log(`📊 Total lots: ${metricsArray.length}`);
    
    const exporters = [...new Set(metricsArray.map(m => m.exporter))].filter(Boolean);
    console.log(`📋 Unique exporters: ${exporters.length}`);
    console.log(`🏢 Exporters: ${exporters.join(', ')}`);
    
    const hasDelMonte = exporters.includes('Del Monte');
    const hasVidexport = exporters.includes('VIDEXPORT') || exporters.includes('Videxport');
    
    console.log(`❌ Del Monte excluded: ${!hasDelMonte}`);
    console.log(`❌ Videxport excluded: ${!hasVidexport}`);
    
    // Test Ocean Freight analysis
    console.log('\n2. Testing Ocean Freight analysis...');
    const oceanFreight = await analyzeSpecificChargeFromEmbedded('OCEAN FREIGHT', 'Ocean Freight');
    console.log(`🚢 Ocean freight records: ${oceanFreight.analysis?.totalRecords || 0}`);
    console.log(`🚢 Ocean freight lots: ${oceanFreight.analysis?.lotsWithCharge || 0}`);
    
    if (oceanFreight.byExporter) {
      const freightExporters = Object.keys(oceanFreight.byExporter);
      console.log(`🚢 Ocean freight exporters: ${freightExporters.join(', ')}`);
    }
    
    // Test Packing Materials analysis
    console.log('\n3. Testing Packing Materials analysis...');
    const packingMaterials = await analyzeSpecificChargeFromEmbedded('PACKING MATERIALS', 'Packing Materials');
    console.log(`📦 Packing materials records: ${packingMaterials.analysis?.totalRecords || 0}`);
    console.log(`📦 Packing materials lots: ${packingMaterials.analysis?.lotsWithCharge || 0}`);
    
    if (packingMaterials.byExporter) {
      const packingExporters = Object.keys(packingMaterials.byExporter);
      console.log(`📦 Packing materials exporters: ${packingExporters.join(', ')}`);
    }
    
    // Test inventory analysis
    console.log('\n4. Testing inventory analysis...');
    const inventory = await getInitialStockAnalysisFromEmbedded();
    console.log(`📦 Total stock: ${inventory.totalStock}`);
    console.log(`📦 Total lots: ${inventory.totalLots}`);
    
    if (inventory.byExporter) {
      const inventoryExporters = Object.keys(inventory.byExporter);
      console.log(`📦 Inventory exporters: ${inventoryExporters.join(', ')}`);
    }
    
    console.log('\n✅ Filtering test completed!');
    
  } catch (error) {
    console.error('❌ Error in filtering test:', error);
  }
}

testFiltering();
