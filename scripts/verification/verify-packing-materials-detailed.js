const { analyzeSpecificChargeFromEmbedded } = require('./src/data/costDataEmbedded.js');

async function verifyPackingMaterialsDetailed() {
  console.log('📦 VERIFICACIÓN DETALLADA: PACKING MATERIALS ANALYSIS');
  console.log('===================================================\n');
  
  try {
    // Analizar Packing Materials
    console.log('📊 Analizando datos de Packing Materials...');
    const packingMaterialsAnalysis = await analyzeSpecificChargeFromEmbedded('PACKING MATERIALS', 'Packing Materials');
    
    if (!packingMaterialsAnalysis) {
      console.error('❌ No se pudieron obtener datos de Packing Materials');
      return;
    }
    
    console.log('\n🔍 DETALLES COMPLETOS DE PACKING MATERIALS:');
    console.log('==========================================');
    
    // KPIs principales
    console.log('\n📈 KPIs PRINCIPALES:');
    console.log(`   💰 Total Amount: $${packingMaterialsAnalysis.analysis?.totalAmount?.toLocaleString() || packingMaterialsAnalysis.summary?.totalAmount?.toLocaleString() || 'N/A'}`);
    console.log(`   📦 Avg per Box: $${packingMaterialsAnalysis.summary?.avgPerBox?.toFixed(4) || 'N/A'}`);
    console.log(`   🏢 Exporters: ${Object.keys(packingMaterialsAnalysis.byExporter || {}).length || 0}`);
    console.log(`   ⚠️  Outliers: ${packingMaterialsAnalysis.outliers?.length || 0}`);
    
    // Detalles del summary para la tabla
    console.log('\n📊 DATOS PARA TABLA (Summary):');
    console.log(`   ✅ Summary data disponible: ${packingMaterialsAnalysis.summary ? 'Sí' : 'No'}`);
    if (packingMaterialsAnalysis.summary) {
      console.log(`      - Total Amount: $${packingMaterialsAnalysis.summary.totalAmount?.toLocaleString() || 'N/A'}`);
      console.log(`      - Avg per Box: $${packingMaterialsAnalysis.summary.avgPerBox?.toFixed(4) || 'N/A'}`);
      console.log(`      - Lots with Charge: ${packingMaterialsAnalysis.summary.lotsWithCharge || 'N/A'}`);
      console.log(`      - Total Records: ${packingMaterialsAnalysis.summary.totalRecords || 'N/A'}`);
    } else {
      console.log('   ❌ No hay datos en summary para la tabla');
    }
    
    // Detalles de los exporters para gráficos
    console.log('\n📈 DATOS PARA GRÁFICOS (By Exporter):');
    if (packingMaterialsAnalysis.byExporter && Object.keys(packingMaterialsAnalysis.byExporter).length > 0) {
      console.log(`   ✅ Exportadores: ${Object.keys(packingMaterialsAnalysis.byExporter).length}`);
      
      Object.entries(packingMaterialsAnalysis.byExporter).forEach(([exporter, data]) => {
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
    if (packingMaterialsAnalysis.outliers && packingMaterialsAnalysis.outliers.length > 0) {
      console.log(`   ✅ Outliers detectados: ${packingMaterialsAnalysis.outliers.length}`);
      
      console.log('\n   🚨 Top 5 outliers:');
      packingMaterialsAnalysis.outliers.slice(0, 5).forEach((outlier, index) => {
        console.log(`      ${index + 1}. ${outlier.lotid} (${outlier.exporter}): $${outlier.totalCharge?.toFixed(2) || 'N/A'} total`);
      });
    } else {
      console.log('   ℹ️  No hay outliers detectados');
    }
    
    // Análisis específico de materiales de empaque
    console.log('\n📋 ANÁLISIS ESPECÍFICO DE PACKING MATERIALS:');
    console.log('============================================');
    
    if (packingMaterialsAnalysis.analysis) {
      const analysis = packingMaterialsAnalysis.analysis;
      console.log(`   📊 Registros totales: ${analysis.totalRecords || 'N/A'}`);
      console.log(`   📦 Lotes con cargo: ${analysis.lotsWithCharge || 'N/A'}`);
      console.log(`   💵 Promedio por lote: $${analysis.avgChargePerLot?.toFixed(2) || 'N/A'}`);
      console.log(`   💰 Promedio por cargo: $${analysis.avgChargeAmount?.toFixed(2) || 'N/A'}`);
      
      // Calcular porcentaje de lotes con packing materials
      if (analysis.lotsWithCharge && analysis.totalRecords) {
        const percentage = (analysis.lotsWithCharge / analysis.totalRecords * 100).toFixed(1);
        console.log(`   📈 Cobertura: ${percentage}% de los registros tienen cargos de packing materials`);
      }
    }
    
    // Comparación con promedios
    console.log('\n🔍 ANÁLISIS DE COSTOS:');
    console.log('=====================');
    
    if (packingMaterialsAnalysis.byExporter) {
      const exporterCosts = Object.entries(packingMaterialsAnalysis.byExporter)
        .map(([name, data]) => ({
          name,
          avgPerBox: data.avgPerBox || 0,
          totalAmount: data.totalAmount || 0,
          lots: data.lots || 0
        }))
        .sort((a, b) => b.avgPerBox - a.avgPerBox);
      
      console.log('   📊 Ranking por costo promedio por caja:');
      exporterCosts.forEach((exp, index) => {
        console.log(`      ${index + 1}. ${exp.name}: $${exp.avgPerBox.toFixed(4)}/box (${exp.lots} lots, $${exp.totalAmount.toLocaleString()} total)`);
      });
      
      // Identificar variación en costos
      const costs = exporterCosts.map(e => e.avgPerBox).filter(c => c > 0);
      if (costs.length > 1) {
        const maxCost = Math.max(...costs);
        const minCost = Math.min(...costs);
        const variation = ((maxCost - minCost) / minCost * 100).toFixed(1);
        console.log(`\n   📈 Variación de costos: ${variation}% entre el más alto y más bajo`);
        console.log(`      - Máximo: $${maxCost.toFixed(4)}/box`);
        console.log(`      - Mínimo: $${minCost.toFixed(4)}/box`);
      }
    }
    
    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN PACKING MATERIALS:');
    console.log('============================================');
    
    const checks = {
      'KPIs calculados': !!(packingMaterialsAnalysis.analysis?.totalAmount && packingMaterialsAnalysis.summary?.avgPerBox),
      'Datos para tabla disponibles': packingMaterialsAnalysis.summary && Object.keys(packingMaterialsAnalysis.summary).length > 0,
      'Datos para gráficos disponibles': packingMaterialsAnalysis.byExporter && Object.keys(packingMaterialsAnalysis.byExporter).length > 0,
      'Exporters identificados': packingMaterialsAnalysis.byExporter && Object.keys(packingMaterialsAnalysis.byExporter).length > 0,
      'Outliers procesados': packingMaterialsAnalysis.outliers !== undefined,
      'Análisis detallado disponible': packingMaterialsAnalysis.analysis && Object.keys(packingMaterialsAnalysis.analysis).length > 0
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    console.log(''); // Add blank line
    
    if (allPassed) {
      console.log('🎉 ¡PACKING MATERIALS ANALYSIS ESTÁ 100% FUNCIONAL!');
      console.log('   ✅ Todos los KPIs se calcularán correctamente');
      console.log('   ✅ La tabla mostrará datos completos');
      console.log('   ✅ Los gráficos tendrán información válida');
      console.log('   ✅ Los outliers se mostrarán si existen');
      console.log('   ✅ Análisis específico de materiales disponible');
    } else {
      console.log('❌ Hay problemas en Packing Materials Analysis que requieren atención');
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar verificación
verifyPackingMaterialsDetailed();
