const { analyzeSpecificChargeFromEmbedded } = require('./src/data/costDataEmbedded.js');

async function testAllSections() {
  console.log('🧪 TESTING ALL PROBLEMATIC SECTIONS');
  console.log('===================================\n');
  
  const sectionsToTest = [
    { chargeType: 'OCEAN FREIGHT', displayName: 'Ocean Freight', icon: '🚢' },
    { chargeType: 'PACKING MATERIALS', displayName: 'Packing Materials', icon: '📦' },
    { chargeType: 'COMMISSION', displayName: 'Internal/Commission', icon: '🏢' }
  ];
  
  for (const section of sectionsToTest) {
    console.log(`${section.icon} Testing ${section.displayName} Analysis:`);
    
    try {
      const analysis = await analyzeSpecificChargeFromEmbedded(section.chargeType, section.displayName);
      
      console.log(`   ✅ Analysis completed successfully`);
      console.log(`   📊 Summary:`, analysis.summary);
      console.log(`   🏢 Exporters found: ${Object.keys(analysis.byExporter || {}).length}`);
      
      if (analysis.byExporter && Object.keys(analysis.byExporter).length > 0) {
        console.log(`   💰 Sample costs per box:`);
        Object.entries(analysis.byExporter).slice(0, 3).forEach(([key, data]) => {
          console.log(`      - ${data.exporter}: $${data.avgPerBox?.toFixed(2) || '0.00'} per box (${data.lots} lots)`);
        });
      }
      
      // Check if data would display properly in frontend
      const hasValidData = analysis.summary && analysis.summary.avgPerBox > 0;
      const hasValidExporters = analysis.byExporter && Object.keys(analysis.byExporter).length > 0;
      
      if (hasValidData && hasValidExporters) {
        console.log(`   🎯 Status: READY FOR FRONTEND DISPLAY`);
      } else {
        console.log(`   ⚠️  Status: MIGHT SHOW AS "NO DATA"`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log(''); // blank line
  }
  
  console.log('📋 SUMMARY:');
  console.log('All three sections should now have data available.');
  console.log('If you still see "No data available" in the frontend, try:');
  console.log('1. Hard refresh the browser (Cmd+Shift+R)');
  console.log('2. Clear browser cache');
  console.log('3. Check browser console for any JavaScript errors');
}

testAllSections();
