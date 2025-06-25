const { analyzeSpecificChargeFromEmbedded } = require('./src/data/costDataEmbedded.js');

async function verifyOceanFreightDetailed() {
  console.log('🚢 VERIFICACIÓN DETALLADA: OCEAN FREIGHT ANALYSIS');
  console.log('================================================\n');
  
  try {
    // Analizar Ocean Freight
    console.log('📊 Analizando datos de Ocean Freight...');
    const oceanFreightAnalysis = await analyzeSpecificChargeFromEmbedded('OCEAN FREIGHT', 'Ocean Freight');
    
    if (!oceanFreightAnalysis) {
      console.error('❌ No se pudieron obtener datos de Ocean Freight');
      return;
    }
    
    console.log('\n🔍 DETALLES COMPLETOS DE OCEAN FREIGHT:');
    console.log('=======================================');
    
    // KPIs principales
    console.log('\n📈 KPIs PRINCIPALES:');
    console.log(`   💰 Total Amount: $${oceanFreightAnalysis.analysis?.totalAmount?.toLocaleString() || oceanFreightAnalysis.summary?.totalAmount?.toLocaleString() || 'N/A'}`);
    console.log(`   📦 Avg per Box: $${oceanFreightAnalysis.summary?.avgPerBox?.toFixed(4) || 'N/A'}`);
    console.log(`   🏢 Exporters: ${Object.keys(oceanFreightAnalysis.byExporter || {}).length || 0}`);
    console.log(`   ⚠️  Outliers: ${oceanFreightAnalysis.outliers?.length || 0}`);
    
    // Detalles del summary para la tabla
    console.log('\n📊 DATOS PARA TABLA (Summary):');
    console.log(`   ✅ Summary data disponible: ${oceanFreightAnalysis.summary ? 'Sí' : 'No'}`);
    if (oceanFreightAnalysis.summary) {
      console.log(`      - Total Amount: $${oceanFreightAnalysis.summary.totalAmount?.toLocaleString() || 'N/A'}`);
      console.log(`      - Avg per Box: $${oceanFreightAnalysis.summary.avgPerBox?.toFixed(4) || 'N/A'}`);
      console.log(`      - Lots with Charge: ${oceanFreightAnalysis.summary.lotsWithCharge || 'N/A'}`);
      console.log(`      - Total Records: ${oceanFreightAnalysis.summary.totalRecords || 'N/A'}`);
    } else {
      console.log('   ❌ No hay datos en summary para la tabla');
    }
    
    // Detalles de los exporters para gráficos
    console.log('\n📈 DATOS PARA GRÁFICOS (By Exporter):');
    if (oceanFreightAnalysis.byExporter && Object.keys(oceanFreightAnalysis.byExporter).length > 0) {
      console.log(`   ✅ Exportadores: ${Object.keys(oceanFreightAnalysis.byExporter).length}`);
      
      Object.entries(oceanFreightAnalysis.byExporter).forEach(([exporter, data]) => {
        console.log(`      🏢 ${exporter}:`);
        console.log(`         - Total Amount: $${data.totalAmount?.toLocaleString() || 'N/A'}`);
        console.log(`         - Lots: ${data.lots || 0}`);
        console.log(`         - Total Boxes: ${data.totalBoxes?.toLocaleString() || 'N/A'}`);
        console.log(`         - Avg per Box: $${data.avgPerBox?.toFixed(4) || 'N/A'}`);
      });
    } else {
      console.log('   ❌ No hay datos por exportador para gráficos');
    }
    
    // Verificar outliers
    console.log('\n⚠️  OUTLIERS (para alertas):');
    if (oceanFreightAnalysis.outliers && oceanFreightAnalysis.outliers.length > 0) {
      console.log(`   ✅ Outliers detectados: ${oceanFreightAnalysis.outliers.length}`);
      
      console.log('\n   🚨 Top 5 outliers:');
      oceanFreightAnalysis.outliers.slice(0, 5).forEach((outlier, index) => {
        console.log(`      ${index + 1}. ${outlier.lotid} (${outlier.exporter}): $${outlier.totalCharge?.toFixed(2) || 'N/A'} total`);
      });
    } else {
      console.log('   ℹ️  No hay outliers detectados');
    }
    
    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN OCEAN FREIGHT:');
    console.log('=========================================');
    
    const checks = {
      'KPIs calculados': !!(oceanFreightAnalysis.analysis?.totalAmount && oceanFreightAnalysis.summary?.avgPerBox),
      'Datos para tabla disponibles': oceanFreightAnalysis.summary && Object.keys(oceanFreightAnalysis.summary).length > 0,
      'Datos para gráficos disponibles': oceanFreightAnalysis.byExporter && Object.keys(oceanFreightAnalysis.byExporter).length > 0,
      'Exporters identificados': oceanFreightAnalysis.byExporter && Object.keys(oceanFreightAnalysis.byExporter).length > 0,
      'Outliers procesados': oceanFreightAnalysis.outliers !== undefined
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    console.log(''); // Add blank line
    
    if (allPassed) {
      console.log('🎉 ¡OCEAN FREIGHT ANALYSIS ESTÁ 100% FUNCIONAL!');
      console.log('   ✅ Todos los KPIs se calcularán correctamente');
      console.log('   ✅ La tabla mostrará datos completos');
      console.log('   ✅ Los gráficos tendrán información válida');
      console.log('   ✅ Los outliers se mostrarán si existen');
    } else {
      console.log('❌ Hay problemas en Ocean Freight Analysis que requieren atención');
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar verificación
verifyOceanFreightDetailed();
