const { embeddedCostData } = require('./src/data/costDataEmbedded.js');

async function debugChargeTypes() {
  console.log('🔍 DEPURANDO TIPOS DE CARGOS');
  console.log('===========================\n');
  
  // Get unique charge descriptions
  const chargeTypes = new Set();
  const chargeExamples = {};
  
  embeddedCostData.forEach(row => {
    if (row.Chargedescr) {
      chargeTypes.add(row.Chargedescr);
      
      if (!chargeExamples[row.Chargedescr]) {
        chargeExamples[row.Chargedescr] = {
          count: 0,
          totalAmount: 0,
          examples: []
        };
      }
      
      chargeExamples[row.Chargedescr].count++;
      chargeExamples[row.Chargedescr].totalAmount += (row.Chgamt || 0);
      
      if (chargeExamples[row.Chargedescr].examples.length < 3) {
        chargeExamples[row.Chargedescr].examples.push({
          lotid: row.Lotid,
          amount: row.Chgamt,
          exporter: row['Exporter Clean']
        });
      }
    }
  });
  
  console.log(`📊 Total tipos de cargos encontrados: ${chargeTypes.size}`);
  console.log(`📊 Total registros en datos: ${embeddedCostData.length}\n`);
  
  // Sort by total amount
  const sortedCharges = Object.entries(chargeExamples)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount);
  
  console.log('🔝 TOP TIPOS DE CARGOS (por monto total):');
  console.log('========================================');
  
  sortedCharges.forEach(([chargeType, data], index) => {
    console.log(`${index + 1}. "${chargeType}"`);
    console.log(`   - Registros: ${data.count.toLocaleString()}`);
    console.log(`   - Monto total: $${data.totalAmount.toLocaleString()}`);
    console.log(`   - Promedio: $${(data.totalAmount / data.count).toFixed(2)}`);
    console.log(`   - Ejemplos:`);
    data.examples.forEach(ex => {
      console.log(`     • ${ex.lotid} (${ex.exporter}): $${ex.amount}`);
    });
    console.log('');
  });
  
  // Look specifically for Ocean Freight variations
  console.log('\n🚢 BÚSQUEDA ESPECÍFICA DE OCEAN FREIGHT:');
  console.log('======================================');
  
  const oceanVariations = Array.from(chargeTypes).filter(type => 
    type.toLowerCase().includes('ocean') || 
    type.toLowerCase().includes('freight') ||
    type.toLowerCase().includes('flete')
  );
  
  if (oceanVariations.length > 0) {
    console.log(`✅ Encontradas ${oceanVariations.length} variaciones de Ocean Freight:`);
    oceanVariations.forEach(variation => {
      const data = chargeExamples[variation];
      console.log(`   - "${variation}": ${data.count} registros, $${data.totalAmount.toLocaleString()}`);
    });
  } else {
    console.log('❌ No se encontraron variaciones de Ocean Freight');
    console.log('\n🔍 Tipos que podrían ser relacionados:');
    Array.from(chargeTypes).forEach(type => {
      console.log(`   - "${type}"`);
    });
  }
}

debugChargeTypes();
