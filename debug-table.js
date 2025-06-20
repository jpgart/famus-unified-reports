// Test para diagnosticar el problema específico con la tabla de variedades
const { 
  getTopVarietiesByStockFromEmbedded,
  getInitialStockAnalysisFromEmbedded
} = require('./src/data/costDataEmbedded.js');

async function debugTable() {
  console.log('🔍 Debugging table rendering issue...\n');
  
  try {
    // Simular exactamente lo que hace el componente
    console.log('1. Loading data in exact same way as component...');
    const testAnalysis = await getInitialStockAnalysisFromEmbedded();
    console.log('✅ Stock analysis test:', testAnalysis?.totalLots, 'lots');
    
    const [analysis, varieties, monthly] = await Promise.all([
      getInitialStockAnalysisFromEmbedded(),
      getTopVarietiesByStockFromEmbedded(8),
      // getStockDistributionByMonthFromEmbedded()
    ]);
    
    console.log('2. Data loaded - checking state...');
    console.log('📊 Analysis exists:', !!analysis);
    console.log('🌱 Varieties array length:', varieties?.length || 0);
    console.log('🌱 Varieties is array:', Array.isArray(varieties));
    
    // Verificar condiciones de renderizado
    console.log('\n3. Checking rendering conditions...');
    console.log('   - analysis exists:', !!analysis);
    console.log('   - varieties exists:', !!varieties);
    console.log('   - varieties length > 0:', (varieties?.length || 0) > 0);
    console.log('   - varieties is array:', Array.isArray(varieties));
    
    // Verificar si pasa las condiciones del componente
    const wouldShowTable = !!(analysis && varieties && varieties.length > 0);
    console.log('   - Would show table:', wouldShowTable);
    
    if (wouldShowTable) {
      console.log('\n4. Table should render with data:');
      varieties.forEach((variety, index) => {
        const stockPercent = variety.totalStock / analysis.totalStock;
        console.log(`   Row ${index + 1}: ${variety.variety} - Stock: ${Math.round(variety.totalStock)} - %: ${(stockPercent * 100).toFixed(2)}%`);
      });
    } else {
      console.log('\n❌ Table would NOT render due to conditions');
    }
    
    // Test specific rendering logic
    console.log('\n5. Testing specific rendering conditions...');
    console.log('   - topVarieties.map would work:', typeof varieties?.map === 'function');
    console.log('   - stockAnalysis.totalStock exists:', typeof analysis?.totalStock === 'number');
    
    if (varieties && analysis) {
      console.log('   - First variety data:');
      const firstVariety = varieties[0];
      if (firstVariety) {
        console.log('     * variety:', firstVariety.variety);
        console.log('     * totalStock:', firstVariety.totalStock);
        console.log('     * lots:', firstVariety.lots);
        console.log('     * exporterCount:', firstVariety.exporterCount);
        console.log('     * stockPercent calculation:', firstVariety.totalStock / analysis.totalStock);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in table debug:', error);
  }
}

debugTable();
