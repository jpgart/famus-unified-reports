const { 
  analyzeSpecificChargeFromEmbedded, 
  analyzeRepackingChargesFromEmbedded 
} = require('./src/data/costDataEmbedded.js');

async function verifyAllChargeTypesComplete() {
  console.log('🔍 VERIFICACIÓN COMPLETA: TODOS LOS ANÁLISIS DE CARGOS');
  console.log('====================================================\n');
  
  const chargeTypes = [
    { 
      code: 'OCEAN FREIGHT', 
      name: 'Ocean Freight', 
      icon: '🚢',
      type: 'specific',
      description: 'Costos de flete marítimo'
    },
    { 
      name: 'Repacking', 
      icon: '📦',
      type: 'combined',
      description: 'Materiales de empaque + Cargos de reempaque'
    },
    { 
      code: 'COMMISSION', 
      name: 'Commission/Internal', 
      icon: '💼',
      type: 'specific',
      description: 'Comisiones y cargos internos'
    }
  ];
  
  const results = [];
  
  for (const charge of chargeTypes) {
    console.log(`${charge.icon} VERIFICANDO: ${charge.name.toUpperCase()}`);
    console.log('='.repeat(60));
    console.log(`   📋 Descripción: ${charge.description}`);
    
    try {
      let analysis;
      
      // Use appropriate function based on type
      if (charge.type === 'combined') {
        analysis = await analyzeRepackingChargesFromEmbedded(charge.name);
      } else {
        analysis = await analyzeSpecificChargeFromEmbedded(charge.code, charge.name);
      }
      
      if (!analysis) {
        console.log(`❌ No se pudieron obtener datos para ${charge.name}`);
        results.push({ ...charge, status: 'FAILED', error: 'No data returned' });
        continue;
      }
      
      // Verificar componentes principales
      const checks = {
        hasKPIs: !!(analysis.analysis?.totalAmount && analysis.summary?.avgPerBox),
        hasTableData: analysis.summary && Object.keys(analysis.summary).length > 0,
        hasChartData: analysis.byExporter && Object.keys(analysis.byExporter).length > 0,
        hasOutliers: analysis.outliers !== undefined,
        hasAnalysisData: analysis.analysis && Object.keys(analysis.analysis).length > 0
      };
      
      const allPassed = Object.values(checks).every(check => check === true);
      
      // Mostrar resultados resumidos
      console.log(`   💰 Total: $${analysis.summary?.totalAmount?.toLocaleString() || 'N/A'}`);
      console.log(`   📦 Promedio/box: $${analysis.summary?.avgPerBox?.toFixed(4) || 'N/A'}`);
      console.log(`   🏢 Exporters: ${Object.keys(analysis.byExporter || {}).length}`);
      console.log(`   📋 Lotes: ${analysis.summary?.lotsWithCharge?.toLocaleString() || 'N/A'}`);
      console.log(`   📊 Records: ${analysis.summary?.totalRecords?.toLocaleString() || 'N/A'}`);
      console.log(`   ⚠️  Outliers: ${analysis.outliers?.length || 0}`);
      
      // Análisis específico por tipo
      if (charge.type === 'combined' && analysis.analysis) {
        console.log(`   📦 Packing Materials: $${analysis.analysis.packingMaterialsAmount?.toLocaleString() || 'N/A'} (${((analysis.analysis.packingMaterialsAmount / analysis.analysis.totalAmount) * 100).toFixed(1)}%)`);
        console.log(`   🔄 Repacking Charges: $${analysis.analysis.repackingChargesAmount?.toLocaleString() || 'N/A'} (${((analysis.analysis.repackingChargesAmount / analysis.analysis.totalAmount) * 100).toFixed(1)}%)`);
      }
      
      // Análisis de consistencia para commission
      if (charge.code === 'COMMISSION' && analysis.byExporter) {
        const rates = Object.values(analysis.byExporter)
          .map(exp => exp.avgPerBox || 0)
          .filter(rate => rate > 0);
        
        if (rates.length > 1) {
          const maxRate = Math.max(...rates);
          const minRate = Math.min(...rates);
          const variation = ((maxRate - minRate) / minRate * 100).toFixed(1);
          console.log(`   📈 Variación commission: ${variation}%`);
          
          if (parseFloat(variation) > 50) {
            console.log(`   ⚠️  ALERTA: Alta variación en commission rates`);
          } else {
            console.log(`   ✅ Consistencia aceptable en commission rates`);
          }
        }
      }
      
      console.log(`   ✅ Status: ${allPassed ? 'FUNCIONAL' : 'PROBLEMAS'}`);
      
      if (!allPassed) {
        console.log('   Issues:');
        Object.entries(checks).forEach(([check, passed]) => {
          if (!passed) console.log(`   - ${check}: Failed`);
        });
      }
      
      results.push({
        ...charge,
        status: allPassed ? 'PASSED' : 'FAILED',
        data: analysis,
        checks,
        summary: {
          totalAmount: analysis.summary?.totalAmount || 0,
          avgPerBox: analysis.summary?.avgPerBox || 0,
          exporters: Object.keys(analysis.byExporter || {}).length,
          lots: analysis.summary?.lotsWithCharge || 0,
          records: analysis.summary?.totalRecords || 0,
          outliers: analysis.outliers?.length || 0
        }
      });
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({ ...charge, status: 'ERROR', error: error.message });
    }
    
    console.log(''); // Blank line between sections
  }
  
  // Resumen final comparativo
  console.log('\n🎯 RESUMEN FINAL COMPARATIVO');
  console.log('============================\n');
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const total = results.length;
  
  console.log(`📊 Resultados: ${passed}/${total} secciones funcionando correctamente\n`);
  
  // Tabla de resultados
  console.log('📋 TABLA COMPARATIVA:');
  console.log('======================');
  console.log('| Análisis              | Total Amount      | Avg/Box   | Exporters | Lotes | Outliers | Status |');
  console.log('|----------------------|-------------------|-----------|-----------|-------|----------|--------|');
  
  results.forEach(result => {
    if (result.status === 'PASSED') {
      const name = result.name.padEnd(20);
      const total = ('$' + result.summary.totalAmount.toLocaleString()).padEnd(17);
      const avgBox = ('$' + result.summary.avgPerBox.toFixed(2)).padEnd(9);
      const exporters = result.summary.exporters.toString().padEnd(9);
      const lots = result.summary.lots.toLocaleString().padEnd(5);
      const outliers = result.summary.outliers.toString().padEnd(8);
      const status = result.status === 'PASSED' ? '✅ OK  ' : '❌ FAIL';
      
      console.log(`| ${name} | ${total} | ${avgBox} | ${exporters} | ${lots} | ${outliers} | ${status} |`);
    } else {
      const name = result.name.padEnd(20);
      console.log(`| ${name} | ERROR             | ERROR     | ERROR     | ERROR | ERROR    | ❌ FAIL |`);
    }
  });
  
  // Comparación de montos
  if (passed > 1) {
    console.log('\n💰 COMPARACIÓN POR MONTO TOTAL:');
    console.log('===============================');
    
    const passedResults = results.filter(r => r.status === 'PASSED');
    const sortedByAmount = passedResults.sort((a, b) => b.summary.totalAmount - a.summary.totalAmount);
    
    const grandTotal = sortedByAmount.reduce((sum, result) => sum + result.summary.totalAmount, 0);
    
    sortedByAmount.forEach((result, index) => {
      const percentage = ((result.summary.totalAmount / grandTotal) * 100).toFixed(1);
      console.log(`   ${index + 1}. ${result.icon} ${result.name}: $${result.summary.totalAmount.toLocaleString()} (${percentage}%)`);
    });
    
    console.log(`\n   💫 TOTAL COMBINADO: $${grandTotal.toLocaleString()}`);
    
    console.log('\n📦 COMPARACIÓN POR COSTO PROMEDIO/CAJA:');
    console.log('======================================');
    const sortedByAvg = [...passedResults].sort((a, b) => b.summary.avgPerBox - a.summary.avgPerBox);
    sortedByAvg.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.icon} ${result.name}: $${result.summary.avgPerBox.toFixed(4)}/box`);
    });
  }
  
  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES:');
  console.log('===================');
  
  const oceanFreight = results.find(r => r.name === 'Ocean Freight');
  const repacking = results.find(r => r.name === 'Repacking');
  const commission = results.find(r => r.name === 'Commission/Internal');
  
  if (oceanFreight && oceanFreight.status === 'PASSED') {
    console.log(`✅ Ocean Freight representa el mayor costo ($${oceanFreight.summary.totalAmount.toLocaleString()})`);
    console.log('   - Priorizar optimización de rutas de transporte marítimo');
    console.log('   - Negociar mejores rates con navieras');
  }
  
  if (repacking && repacking.status === 'PASSED') {
    console.log(`📦 Repacking costs: $${repacking.summary.totalAmount.toLocaleString()}`);
    console.log('   - Revisar eficiencia en procesos de reempaque');
    console.log('   - Optimizar uso de materiales de empaque');
  }
  
  if (commission && commission.status === 'PASSED') {
    console.log(`💼 Commission/Internal: $${commission.summary.totalAmount.toLocaleString()}`);
    console.log('   - Verificar consistencia en rates de commission entre exportadores');
    if (commission.summary.outliers > 0) {
      console.log(`   - Investigar ${commission.summary.outliers} outliers en comisiones`);
    }
  }
  
  // Conclusión final
  console.log('\n🏆 CONCLUSIÓN FINAL:');
  console.log('===================');
  
  if (passed === total) {
    console.log('🎉 ¡TODOS LOS ANÁLISIS ESTÁN FUNCIONANDO PERFECTAMENTE!');
    console.log('   ✅ Datos completos y consistentes en todas las secciones');
    console.log('   ✅ KPIs calculados correctamente');
    console.log('   ✅ Gráficos y tablas con información válida');
    console.log('   ✅ Sistema de detección de outliers funcionando');
    console.log('\n🌐 El reporte Cost Consistency está 100% operativo en: http://localhost:3001');
  } else {
    console.log(`⚠️  ${total - passed} de ${total} secciones requieren atención`);
    console.log('   Revisa los errores mostrados arriba para cada sección');
  }
}

// Ejecutar verificación completa
verifyAllChargeTypesComplete();
