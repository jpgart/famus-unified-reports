const { 
  analyzeSpecificChargeFromEmbedded,
  embeddedCostData
} = require('./src/data/costDataEmbedded.js');

async function debugSpecificCharge() {
  console.log('🔍 DEBUGGING SPECIFIC CHARGE ANALYSIS');
  console.log('====================================\n');
  
  try {
    // Test Ocean Freight specifically
    console.log('🚢 Testing OCEAN FREIGHT analysis...');
    
    // First, check raw data for OCEAN FREIGHT
    const oceanFreightRaw = embeddedCostData.filter(row => 
      row.Chargedescr === 'OCEAN FREIGHT' && row.Chgamt > 0
    );
    
    console.log(`📋 Raw OCEAN FREIGHT records: ${oceanFreightRaw.length}`);
    
    if (oceanFreightRaw.length > 0) {
      console.log('\n📊 Sample OCEAN FREIGHT records:');
      oceanFreightRaw.slice(0, 5).forEach((row, idx) => {
        console.log(`   ${idx + 1}. Lot: ${row.Lotid}, Exporter: ${row['Exporter Clean']}, Amount: ${row.Chgamt}, Cost/Box: ${row['Cost per Box']}`);
      });
      
      // Check data types
      const firstRecord = oceanFreightRaw[0];
      console.log('\n🔍 Data type analysis:');
      console.log(`   - Chgamt type: ${typeof firstRecord.Chgamt} (${firstRecord.Chgamt})`);
      console.log(`   - Cost per Box type: ${typeof firstRecord['Cost per Box']} (${firstRecord['Cost per Box']})`);
      console.log(`   - Lotid type: ${typeof firstRecord.Lotid} (${firstRecord.Lotid})`);
      console.log(`   - Exporter type: ${typeof firstRecord['Exporter Clean']} (${firstRecord['Exporter Clean']})`);
    }
    
    // Now run the analysis function
    const analysis = await analyzeSpecificChargeFromEmbedded('OCEAN FREIGHT', 'Ocean Freight');
    
    console.log('\n📈 Analysis result:');
    console.log(`   Summary:`, analysis.summary);
    console.log(`   ByExporter keys:`, Object.keys(analysis.byExporter || {}));
    
    if (analysis.byExporter) {
      console.log('\n🏢 Analysis by exporter:');
      Object.entries(analysis.byExporter).forEach(([key, data]) => {
        console.log(`   ${key}: avgPerBox=${data.avgPerBox}, totalCharge=${data.totalCharge}, lots=${data.lots}`);
      });
    }
    
    // Test the issue: why are averages zero?
    console.log('\n🔍 Debugging calculation issue...');
    
    // Group by lot manually to debug
    const chargeByLot = {};
    oceanFreightRaw.forEach(row => {
      const lotid = row.Lotid;
      if (!chargeByLot[lotid]) {
        chargeByLot[lotid] = {
          lotid,
          exporter: row['Exporter Clean'],
          totalCharge: 0,
          records: 0,
          rawAmounts: []
        };
      }
      chargeByLot[lotid].totalCharge += row.Chgamt;
      chargeByLot[lotid].records += 1;
      chargeByLot[lotid].rawAmounts.push(row.Chgamt);
    });
    
    const lots = Object.values(chargeByLot);
    console.log(`📦 Total lots with OCEAN FREIGHT: ${lots.length}`);
    
    if (lots.length > 0) {
      console.log('\n📊 First few lots:');
      lots.slice(0, 3).forEach((lot, idx) => {
        console.log(`   ${idx + 1}. Lot ${lot.lotid} (${lot.exporter}): Total=${lot.totalCharge}, Records=${lot.records}, Raw=${lot.rawAmounts.join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in specific charge debug:', error);
  }
}

debugSpecificCharge();
