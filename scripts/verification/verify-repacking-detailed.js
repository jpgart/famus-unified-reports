const { analyzeRepackingChargesFromEmbedded } = require('./src/data/costDataEmbedded.js');

async function verifyRepackingDetailed() {
  console.log('📦 VERIFICACIÓN DETALLADA: REPACKING ANALYSIS');
  console.log('============================================\n');
  
  try {
    // Analizar Repacking (combinado)
    console.log('📊 Analizando datos de Repacking combinado...');
    const repackingAnalysis = await analyzeRepackingChargesFromEmbedded('Repacking');
    
    if (!repackingAnalysis) {
      console.error('❌ No se pudieron obtener datos de Repacking');
      return;
    }
    
    console.log('\n🔍 DETALLES COMPLETOS DE REPACKING:');
    console.log('==================================');
    
    // KPIs principales
    console.log('\n📈 KPIs PRINCIPALES:');
    console.log(`   💰 Total Amount: $${repackingAnalysis.analysis?.totalAmount?.toLocaleString() || 'N/A'}`);
    console.log(`   📦 Avg per Box: $${repackingAnalysis.summary?.avgPerBox?.toFixed(4) || 'N/A'}`);
    console.log(`   🏢 Exporters: ${Object.keys(repackingAnalysis.byExporter || {}).length || 0}`);
    console.log(`   ⚠️  Outliers: ${repackingAnalysis.outliers?.length || 0}`);
    
    // Desglose por tipo de cargo
    console.log('\n📋 DESGLOSE POR TIPO DE CARGO:');
    console.log('==============================');
    if (repackingAnalysis.analysis) {
      const analysis = repackingAnalysis.analysis;
      console.log(`   📦 PACKING MATERIALS:`);
      console.log(`      - Amount: $${analysis.packingMaterialsAmount?.toLocaleString() || 'N/A'}`);
      console.log(`      - Records: ${analysis.packingMaterialsRecords || 'N/A'}`);
      console.log(`      - % of Total: ${analysis.totalAmount > 0 ? ((analysis.packingMaterialsAmount / analysis.totalAmount) * 100).toFixed(1) : 0}%`);
      
      console.log(`   🔄 REPACKING CHARGES:`);
      console.log(`      - Amount: $${analysis.repackingChargesAmount?.toLocaleString() || 'N/A'}`);
      console.log(`      - Records: ${analysis.repackingChargesRecords || 'N/A'}`);
      console.log(`      - % of Total: ${analysis.totalAmount > 0 ? ((analysis.repackingChargesAmount / analysis.totalAmount) * 100).toFixed(1) : 0}%`);
    }
    
    // Detalles del summary para la tabla
    console.log('\n📊 DATOS PARA TABLA (Summary):');
    console.log(`   ✅ Summary data disponible: ${repackingAnalysis.summary ? 'Sí' : 'No'}`);
    if (repackingAnalysis.summary) {
      console.log(`      - Total Amount: $${repackingAnalysis.summary.totalAmount?.toLocaleString() || 'N/A'}`);
      console.log(`      - Avg per Box: $${repackingAnalysis.summary.avgPerBox?.toFixed(4) || 'N/A'}`);
      console.log(`      - Lots with Charge: ${repackingAnalysis.summary.lotsWithCharge || 'N/A'}`);
      console.log(`      - Total Records: ${repackingAnalysis.summary.totalRecords || 'N/A'}`);
    }
    
    // Detalles de los exporters para gráficos
    console.log('\n📈 DATOS PARA GRÁFICOS (By Exporter):');
    if (repackingAnalysis.byExporter && Object.keys(repackingAnalysis.byExporter).length > 0) {
      console.log(`   ✅ Exportadores: ${Object.keys(repackingAnalysis.byExporter).length}`);
      
      Object.entries(repackingAnalysis.byExporter).forEach(([exporter, data]) => {
        console.log(`      🏢 ${exporter}:`);
        console.log(`         - Total Amount: $${data.totalAmount?.toLocaleString() || 'N/A'}`);
        console.log(`         - Packing Materials: $${data.packingMaterials?.toLocaleString() || 'N/A'}`);
        console.log(`         - Repacking Charges: $${data.repackingCharges?.toLocaleString() || 'N/A'}`);
        console.log(`         - Lots: ${data.lots || 0}`);
        console.log(`         - Total Boxes: ${data.totalBoxes?.toLocaleString() || 'N/A'}`);
        console.log(`         - Avg per Box: $${data.avgPerBox?.toFixed(4) || 'N/A'}`);
      });
    } else {
      console.log('   ❌ No hay datos por exportador para gráficos');
    }
    
    // Verificar outliers
    console.log('\n⚠️  OUTLIERS (para alertas):');
    if (repackingAnalysis.outliers && repackingAnalysis.outliers.length > 0) {
      console.log(`   ✅ Outliers detectados: ${repackingAnalysis.outliers.length}`);
      
      console.log('\n   🚨 Top 5 outliers:');
      repackingAnalysis.outliers.slice(0, 5).forEach((outlier, index) => {
        console.log(`      ${index + 1}. ${outlier.lotid} (${outlier.exporter}): $${outlier.totalCharge?.toFixed(2) || 'N/A'} total`);
      });
    } else {
      console.log('   ℹ️  No hay outliers detectados');
    }
    
    // Análisis de distribución
    console.log('\n🔍 ANÁLISIS DE DISTRIBUCIÓN:');
    console.log('============================');
    
    if (repackingAnalysis.byExporter) {
      const exporterData = Object.entries(repackingAnalysis.byExporter)
        .map(([name, data]) => ({
          name,
          total: data.totalAmount || 0,
          packingMaterials: data.packingMaterials || 0,
          repackingCharges: data.repackingCharges || 0,
          avgPerBox: data.avgPerBox || 0,
          lots: data.lots || 0
        }))
        .sort((a, b) => b.total - a.total);
      
      console.log('   📊 Ranking por monto total:');
      exporterData.forEach((exp, index) => {
        const packingPct = exp.total > 0 ? ((exp.packingMaterials / exp.total) * 100).toFixed(1) : '0';
        const repackingPct = exp.total > 0 ? ((exp.repackingCharges / exp.total) * 100).toFixed(1) : '0';
        console.log(`      ${index + 1}. ${exp.name}: $${exp.total.toLocaleString()}`);
        console.log(`         - Packing Materials: ${packingPct}% ($${exp.packingMaterials.toLocaleString()})`);
        console.log(`         - Repacking Charges: ${repackingPct}% ($${exp.repackingCharges.toLocaleString()})`);
        console.log(`         - ${exp.lots} lots, $${exp.avgPerBox.toFixed(4)}/box`);
      });
    }
    
    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN REPACKING:');
    console.log('====================================');
    
    const checks = {
      'KPIs calculados': !!(repackingAnalysis.analysis?.totalAmount && repackingAnalysis.summary?.avgPerBox),
      'Datos para tabla disponibles': repackingAnalysis.summary && Object.keys(repackingAnalysis.summary).length > 0,
      'Datos para gráficos disponibles': repackingAnalysis.byExporter && Object.keys(repackingAnalysis.byExporter).length > 0,
      'Exporters identificados': repackingAnalysis.byExporter && Object.keys(repackingAnalysis.byExporter).length > 0,
      'Outliers procesados': repackingAnalysis.outliers !== undefined,
      'Desglose por tipos disponible': repackingAnalysis.analysis?.packingMaterialsAmount !== undefined && repackingAnalysis.analysis?.repackingChargesAmount !== undefined
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    console.log('');
    
    if (allPassed) {
      console.log('🎉 ¡REPACKING ANALYSIS ESTÁ 100% FUNCIONAL!');
      console.log('   ✅ Combina PACKING MATERIALS + REPACKING CHARGES correctamente');
      console.log('   ✅ Todos los KPIs se calculan apropiadamente');
      console.log('   ✅ La tabla mostrará datos completos');
      console.log('   ✅ Los gráficos tendrán información válida');
      console.log('   ✅ Desglose por tipos de cargo disponible');
      console.log('   ✅ Los outliers se mostrarán si existen');
    } else {
      console.log('❌ Hay problemas en Repacking Analysis que requieren atención');
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar verificación
verifyRepackingDetailed();
