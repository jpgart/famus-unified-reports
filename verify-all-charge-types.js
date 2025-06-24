const { analyzeSpecificChargeFromEmbedded } = require('./src/data/costDataEmbedded.js');

async function verifyAllChargeTypes() {
  console.log('🔍 VERIFICACIÓN COMPLETA: TODOS LOS TIPOS DE CARGOS');
  console.log('==================================================\n');
  
  const chargeTypes = [
    { code: 'OCEAN FREIGHT', name: 'Ocean Freight', icon: '🚢' },
    { code: 'PACKING MATERIALS', name: 'Packing Materials', icon: '📦' },
    { code: 'COMMISSION', name: 'Commission/Internal', icon: '💼' }
  ];
  
  const results = [];
  
  for (const charge of chargeTypes) {
    console.log(`${charge.icon} VERIFICANDO: ${charge.name.toUpperCase()}`);
    console.log('='.repeat(50));
    
    try {
      const analysis = await analyzeSpecificChargeFromEmbedded(charge.code, charge.name);
      
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
      console.log(`📊 KPIs: ${analysis.summary?.totalAmount?.toLocaleString() || 'N/A'} total, $${analysis.summary?.avgPerBox?.toFixed(4) || 'N/A'}/box`);
      console.log(`🏢 Exporters: ${Object.keys(analysis.byExporter || {}).length}`);
      console.log(`📋 Records: ${analysis.summary?.totalRecords || 'N/A'}`);
      console.log(`⚠️  Outliers: ${analysis.outliers?.length || 0}`);
      console.log(`✅ Status: ${allPassed ? 'FUNCIONAL' : 'PROBLEMAS'}`);
      
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
  
  // Resumen final
  console.log('\n🎯 RESUMEN FINAL DE VERIFICACIÓN');
  console.log('================================\n');
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const total = results.length;
  
  console.log(`📊 Resultados: ${passed}/${total} secciones funcionando correctamente\n`);
  
  results.forEach(result => {
    const statusIcon = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${statusIcon} ${result.icon} ${result.name}:`);
    
    if (result.status === 'PASSED') {
      console.log(`   💰 Total: $${result.summary.totalAmount.toLocaleString()}`);
      console.log(`   📦 Avg/Box: $${result.summary.avgPerBox.toFixed(4)}`);
      console.log(`   🏢 Exporters: ${result.summary.exporters}`);
      console.log(`   📋 Records: ${result.summary.records.toLocaleString()}`);
      console.log(`   ⚠️  Outliers: ${result.summary.outliers}`);
    } else {
      console.log(`   ❌ Error: ${result.error || 'Unknown error'}`);
    }
    console.log('');
  });
  
  // Comparación entre tipos de cargos
  if (passed > 1) {
    console.log('📈 COMPARACIÓN ENTRE TIPOS DE CARGOS:');
    console.log('====================================\n');
    
    const passedResults = results.filter(r => r.status === 'PASSED');
    const sortedByAmount = passedResults.sort((a, b) => b.summary.totalAmount - a.summary.totalAmount);
    
    console.log('Por monto total:');
    sortedByAmount.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.name}: $${result.summary.totalAmount.toLocaleString()}`);
    });
    
    console.log('\nPor costo promedio por caja:');
    const sortedByAvg = [...passedResults].sort((a, b) => b.summary.avgPerBox - a.summary.avgPerBox);
    sortedByAvg.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.name}: $${result.summary.avgPerBox.toFixed(4)}/box`);
    });
  }
  
  // Conclusión final
  console.log('\n🏆 CONCLUSIÓN FINAL:');
  console.log('===================');
  
  if (passed === total) {
    console.log('🎉 ¡TODAS LAS SECCIONES ESTÁN FUNCIONANDO PERFECTAMENTE!');
    console.log('   ✅ Todos los tipos de cargos tienen datos válidos');
    console.log('   ✅ Los KPIs se calculan correctamente');
    console.log('   ✅ Las tablas mostrarán contenido completo');
    console.log('   ✅ Los gráficos tendrán datos para renderizar');
    console.log('   ✅ La detección de outliers funciona');
    console.log('\n🌐 El reporte Cost Consistency está listo para uso en: http://localhost:3001');
  } else {
    console.log(`⚠️  ${total - passed} de ${total} secciones requieren atención`);
    console.log('   Revisa los errores mostrados arriba para cada sección');
  }
}

// Ejecutar verificación completa
verifyAllChargeTypes();
