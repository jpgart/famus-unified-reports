const { 
  calculateMetricsFromEmbedded,
  clearEmbeddedDataCache
} = require('./src/data/costDataEmbedded.js');

async function debugDashboard() {
  console.log('🔍 DEBUGGING COST CONSISTENCY OVERVIEW DASHBOARD');
  console.log('================================================\n');
  
  // Clear cache first
  clearEmbeddedDataCache();
  console.log('🧹 Cache cleared\n');
  
  try {
    // Get the exact data that the dashboard receives
    console.log('📊 Getting metrics data for dashboard...');
    const metrics = await calculateMetricsFromEmbedded();
    
    console.log(`📋 Total metrics objects: ${Object.keys(metrics).length}`);
    
    // Extract all exporters exactly as the dashboard would
    const allExporters = Object.values(metrics).map(l => l.exporter);
    const uniqueExporters = [...new Set(allExporters)].filter(Boolean);
    
    console.log('\n🏢 ALL EXPORTERS FOUND IN METRICS:');
    uniqueExporters.forEach((exporter, index) => {
      const count = allExporters.filter(e => e === exporter).length;
      console.log(`   ${index + 1}. ${exporter} (${count} lots)`);
    });
    
    // Check for any null or undefined exporters
    const nullExporters = allExporters.filter(e => !e);
    if (nullExporters.length > 0) {
      console.log(`\n⚠️  Found ${nullExporters.length} lots with null/undefined exporters`);
    }
    
    // Check specifically for the excluded ones
    const excludedFound = [];
    const excludedExporters = ['Del Monte', 'VIDEXPORT', 'Videxport'];
    
    excludedExporters.forEach(excluded => {
      if (uniqueExporters.includes(excluded)) {
        const count = allExporters.filter(e => e === excluded).length;
        excludedFound.push({ exporter: excluded, count });
        console.log(`❌ FOUND EXCLUDED: ${excluded} (${count} lots)`);
      }
    });
    
    if (excludedFound.length === 0) {
      console.log('\n✅ NO EXCLUDED EXPORTERS FOUND IN METRICS');
    } else {
      console.log(`\n❌ FOUND ${excludedFound.length} EXCLUDED EXPORTERS!`);
      
      // Show sample data for each excluded exporter
      excludedFound.forEach(({ exporter, count }) => {
        console.log(`\n🔍 Sample data for ${exporter}:`);
        const sampleLots = Object.values(metrics)
          .filter(lot => lot.exporter === exporter)
          .slice(0, 3);
        
        sampleLots.forEach((lot, index) => {
          console.log(`   ${index + 1}. Lot ${lot.lotid}: Cost/Box=${lot.costPerBox}, Total=${lot.totalChargeAmount}`);
        });
      });
    }
    
    // Check the filtering function directly
    console.log('\n🔧 Testing filtering function...');
    const { filterExcludedExporters } = require('./src/utils/dataFiltering.js');
    
    // Test with sample data
    const sampleData = [
      { 'Exporter Clean': 'Agrolatina', value: 1 },
      { 'Exporter Clean': 'Del Monte', value: 2 },
      { 'Exporter Clean': 'VIDEXPORT', value: 3 },
      { 'Exporter Clean': 'MDT', value: 4 }
    ];
    
    const filtered = filterExcludedExporters(sampleData);
    console.log('Original sample:', sampleData.map(d => d['Exporter Clean']));
    console.log('Filtered sample:', filtered.map(d => d['Exporter Clean']));
    
    if (filtered.some(d => excludedExporters.includes(d['Exporter Clean']))) {
      console.log('❌ FILTERING FUNCTION NOT WORKING!');
    } else {
      console.log('✅ Filtering function working correctly');
    }
    
  } catch (error) {
    console.error('❌ Error in dashboard debug:', error);
  }
}

debugDashboard();
