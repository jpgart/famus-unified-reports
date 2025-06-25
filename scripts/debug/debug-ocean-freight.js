const { analyzeSpecificChargeFromEmbedded } = require('./src/data/costDataEmbedded.js');

async function debugOceanFreight() {
  console.log('🔍 DEBUGGING OCEAN FREIGHT ANALYSIS');
  console.log('===================================\n');
  
  try {
    console.log('📊 Analyzing Ocean Freight data...');
    const data = await analyzeSpecificChargeFromEmbedded('OCEAN FREIGHT', 'Ocean Freight');
    
    console.log('📋 Ocean Freight Analysis Result:');
    console.log('- Summary:', data.summary);
    console.log('- Has byExporter data:', !!data.byExporter);
    console.log('- ByExporter type:', typeof data.byExporter);
    console.log('- ByExporter length/keys:', Array.isArray(data.byExporter) ? data.byExporter.length : Object.keys(data.byExporter || {}).length);
    
    if (data.byExporter) {
      console.log('\n🏢 Exporters found:');
      if (Array.isArray(data.byExporter)) {
        data.byExporter.forEach((exp, idx) => {
          console.log(`   ${idx + 1}. ${exp.exporter || 'Unknown'} - Avg: $${exp.avgPerBox || 0}`);
        });
      } else {
        Object.entries(data.byExporter).forEach(([key, exp], idx) => {
          console.log(`   ${idx + 1}. ${exp.exporter || key} - Avg: $${exp.avgPerBox || 0}`);
        });
      }
    }
    
    // Test other charge types
    console.log('\n🔍 Testing other charge types...');
    
    const packingData = await analyzeSpecificChargeFromEmbedded('PACKING MATERIALS', 'Packing Materials');
    console.log('📦 Packing Materials - Has data:', !!packingData.byExporter);
    console.log('📦 Packing Materials - Exporters:', packingData.byExporter ? Object.keys(packingData.byExporter).length : 0);
    
    const internalData = await analyzeSpecificChargeFromEmbedded('INTERNAL', 'Internal');
    console.log('🏠 Internal - Has data:', !!internalData.byExporter);
    console.log('🏠 Internal - Exporters:', internalData.byExporter ? Object.keys(internalData.byExporter).length : 0);
    
    // Let's check what charge types are actually available
    console.log('\n🔍 Checking available charge types...');
    const { getChargeDataFromEmbedded } = require('./src/data/costDataEmbedded.js');
    const allCharges = await getChargeDataFromEmbedded();
    
    if (allCharges && allCharges.length > 0) {
      const chargeTypes = [...new Set(allCharges.map(c => c.charge_type))].filter(Boolean);
      console.log('📋 Available charge types:', chargeTypes);
      
      // Find similar charge types
      const oceanTypes = chargeTypes.filter(type => 
        type.toLowerCase().includes('ocean') || 
        type.toLowerCase().includes('freight') ||
        type.toLowerCase().includes('ship')
      );
      console.log('🚢 Ocean/Freight related charges:', oceanTypes);
      
      const packingTypes = chargeTypes.filter(type => 
        type.toLowerCase().includes('pack') || 
        type.toLowerCase().includes('material')
      );
      console.log('📦 Packing related charges:', packingTypes);
      
      const internalTypes = chargeTypes.filter(type => 
        type.toLowerCase().includes('internal') ||
        type.toLowerCase().includes('admin')
      );
      console.log('🏠 Internal related charges:', internalTypes);
    }
    
  } catch (error) {
    console.error('❌ Error in Ocean Freight debug:', error);
  }
}

debugOceanFreight();
