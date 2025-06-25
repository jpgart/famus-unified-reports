const { embeddedCostData } = require('./src/data/costDataEmbedded.js');

function checkChargeTypes() {
  console.log('🔍 CHECKING CHARGE TYPES IN EMBEDDED DATA');
  console.log('==========================================\n');
  
  // Get all unique charge descriptions
  const chargeTypes = [...new Set(embeddedCostData.map(row => row.Chargedescr))].filter(Boolean);
  
  console.log(`📋 Total unique charge types found: ${chargeTypes.length}`);
  console.log('\n🏷️ All charge types:');
  chargeTypes.sort().forEach((type, idx) => {
    const count = embeddedCostData.filter(row => row.Chargedescr === type).length;
    console.log(`   ${idx + 1}. "${type}" (${count} records)`);
  });
  
  // Look for freight-related charges
  console.log('\n🚢 Freight-related charges:');
  const freightCharges = chargeTypes.filter(type => 
    type.toLowerCase().includes('freight') || 
    type.toLowerCase().includes('ocean') ||
    type.toLowerCase().includes('ship')
  );
  
  if (freightCharges.length > 0) {
    freightCharges.forEach(type => {
      const count = embeddedCostData.filter(row => row.Chargedescr === type).length;
      console.log(`   ✅ "${type}" (${count} records)`);
    });
  } else {
    console.log('   ❌ No freight-related charges found');
  }
  
  // Look for packing-related charges
  console.log('\n📦 Packing-related charges:');
  const packingCharges = chargeTypes.filter(type => 
    type.toLowerCase().includes('pack') || 
    type.toLowerCase().includes('material') ||
    type.toLowerCase().includes('box')
  );
  
  if (packingCharges.length > 0) {
    packingCharges.forEach(type => {
      const count = embeddedCostData.filter(row => row.Chargedescr === type).length;
      console.log(`   ✅ "${type}" (${count} records)`);
    });
  } else {
    console.log('   ❌ No packing-related charges found');
  }
  
  // Look for internal charges
  console.log('\n🏠 Internal/Administrative charges:');
  const internalCharges = chargeTypes.filter(type => 
    type.toLowerCase().includes('internal') || 
    type.toLowerCase().includes('admin') ||
    type.toLowerCase().includes('management') ||
    type.toLowerCase().includes('commission')
  );
  
  if (internalCharges.length > 0) {
    internalCharges.forEach(type => {
      const count = embeddedCostData.filter(row => row.Chargedescr === type).length;
      console.log(`   ✅ "${type}" (${count} records)`);
    });
  } else {
    console.log('   ❌ No internal-related charges found');
  }
  
  // Sample data for debugging
  console.log('\n📋 Sample data (first 5 records):');
  embeddedCostData.slice(0, 5).forEach((row, idx) => {
    console.log(`   ${idx + 1}. Lot: ${row.Lotid}, Charge: "${row.Chargedescr}", Amount: ${row.Chgamt}`);
  });
}

checkChargeTypes();
