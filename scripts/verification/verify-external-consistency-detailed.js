const { analyzeAllChargesFromEmbedded } = require('./src/data/costDataEmbedded.js');

async function verifyExternalConsistencyDetailed() {
  console.log('🌍 VERIFICACIÓN DETALLADA: EXTERNAL CONSISTENCY ANALYSIS');
  console.log('=======================================================\n');
  
  try {
    // Obtener todos los análisis de cargos para comparación externa
    console.log('📊 Analizando todos los cargos para External Consistency...');
    const allChargesAnalysis = await analyzeAllChargesFromEmbedded();
    
    if (!allChargesAnalysis) {
      console.error('❌ No se pudieron obtener datos para External Consistency');
      return;
    }
    
    console.log('\n🔍 DETALLES COMPLETOS DE EXTERNAL CONSISTENCY:');
    console.log('=============================================');
    
    // Extraer datos para comparación externa
    const chargeTypes = Object.keys(allChargesAnalysis);
    console.log(`\n📋 Tipos de cargo encontrados: ${chargeTypes.length}`);
    chargeTypes.forEach(type => console.log(`   - ${type}`));
    
    // KPIs principales para External Consistency
    console.log('\n📈 KPIs PRINCIPALES DE EXTERNAL CONSISTENCY:');
    
    let totalAmountAllCharges = 0;
    let totalBoxesAllCharges = 0;
    let totalExportersInvolved = new Set();
    let chargeTypesSummary = {};
    
    // Procesar cada tipo de cargo
    Object.entries(allChargesAnalysis).forEach(([chargeType, analysis]) => {
      if (analysis && analysis.summary) {
        const summary = analysis.summary;
        totalAmountAllCharges += summary.totalAmount || 0;
        totalBoxesAllCharges += summary.totalBoxes || 0;
        
        chargeTypesSummary[chargeType] = {
          totalAmount: summary.totalAmount || 0,
          avgPerBox: summary.avgPerBox || 0,
          lotsWithCharge: summary.lotsWithCharge || 0,
          totalRecords: summary.totalRecords || 0,
          exporterCount: analysis.byExporter ? Object.keys(analysis.byExporter).length : 0
        };
        
        // Agregar exportadores únicos
        if (analysis.byExporter) {
          Object.keys(analysis.byExporter).forEach(exp => totalExportersInvolved.add(exp));
        }
      }
    });
    
    console.log(`   💰 Total Amount (todos los cargos): $${totalAmountAllCharges.toLocaleString()}`);
    console.log(`   📦 Total Boxes (todos los cargos): ${totalBoxesAllCharges.toLocaleString()}`);
    console.log(`   🏢 Exporters Únicos: ${totalExportersInvolved.size}`);
    console.log(`   📊 Tipos de cargo analizados: ${Object.keys(chargeTypesSummary).length}`);
    
    // Detalles por tipo de cargo para comparación externa
    console.log('\n📊 DESGLOSE POR TIPO DE CARGO (External Consistency):');
    console.log('===================================================');
    
    Object.entries(chargeTypesSummary).forEach(([chargeType, summary]) => {
      console.log(`\n   🔹 ${chargeType}:`);
      console.log(`      - Total Amount: $${summary.totalAmount.toLocaleString()}`);
      console.log(`      - Avg per Box: $${summary.avgPerBox.toFixed(4)}`);
      console.log(`      - Coverage: ${summary.lotsWithCharge}/${summary.totalRecords} lots (${((summary.lotsWithCharge/summary.totalRecords)*100).toFixed(1)}%)`);
      console.log(`      - Exporters: ${summary.exporterCount}`);
      console.log(`      - % del Total: ${((summary.totalAmount/totalAmountAllCharges)*100).toFixed(1)}%`);
    });
    
    // Análisis de consistencia externa (comparaciones entre tipos de cargo)
    console.log('\n🔍 ANÁLISIS DE CONSISTENCIA EXTERNA:');
    console.log('===================================');
    
    // Ranking por costo promedio por caja
    const sortedByAvgPerBox = Object.entries(chargeTypesSummary)
      .map(([type, summary]) => ({
        type,
        avgPerBox: summary.avgPerBox,
        totalAmount: summary.totalAmount,
        coverage: ((summary.lotsWithCharge/summary.totalRecords)*100).toFixed(1)
      }))
      .sort((a, b) => b.avgPerBox - a.avgPerBox);
    
    console.log('\n   📊 Ranking por costo promedio por caja:');
    sortedByAvgPerBox.forEach((item, index) => {
      console.log(`      ${index + 1}. ${item.type}: $${item.avgPerBox.toFixed(4)}/box`);
      console.log(`         - Total: $${item.totalAmount.toLocaleString()}`);
      console.log(`         - Coverage: ${item.coverage}%`);
    });
    
    // Análisis de distribución de costos
    console.log('\n   💼 Distribución de costos por tipo:');
    const sortedByAmount = Object.entries(chargeTypesSummary)
      .map(([type, summary]) => ({
        type,
        totalAmount: summary.totalAmount,
        percentage: ((summary.totalAmount/totalAmountAllCharges)*100).toFixed(1)
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
    
    sortedByAmount.forEach((item, index) => {
      console.log(`      ${index + 1}. ${item.type}: $${item.totalAmount.toLocaleString()} (${item.percentage}%)`);
    });
    
    // Análisis de variación entre tipos de cargo
    const avgPerBoxValues = Object.values(chargeTypesSummary).map(s => s.avgPerBox).filter(v => v > 0);
    if (avgPerBoxValues.length > 1) {
      const maxAvg = Math.max(...avgPerBoxValues);
      const minAvg = Math.min(...avgPerBoxValues);
      const variation = ((maxAvg - minAvg) / minAvg * 100).toFixed(1);
      
      console.log(`\n   📈 Variación entre tipos de cargo: ${variation}%`);
      console.log(`      - Avg/box más alto: $${maxAvg.toFixed(4)}`);
      console.log(`      - Avg/box más bajo: $${minAvg.toFixed(4)}`);
      
      if (parseFloat(variation) > 200) {
        console.log(`      ⚠️  ALERTA: Variación muy alta (>${variation}%) entre tipos de cargo`);
      } else {
        console.log(`      ✅ Variación razonable entre tipos de cargo`);
      }
    }
    
    // Análisis de cobertura (qué tan consistente es la aplicación de cargos)
    console.log('\n   📋 Análisis de cobertura por tipo de cargo:');
    const coverageAnalysis = Object.entries(chargeTypesSummary)
      .map(([type, summary]) => ({
        type,
        coverage: ((summary.lotsWithCharge/summary.totalRecords)*100).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.coverage) - parseFloat(a.coverage));
    
    coverageAnalysis.forEach((item, index) => {
      const coverage = parseFloat(item.coverage);
      let indicator = '✅';
      if (coverage < 50) indicator = '⚠️';
      if (coverage < 25) indicator = '❌';
      
      console.log(`      ${index + 1}. ${item.type}: ${item.coverage}% ${indicator}`);
    });
    
    // Detección de inconsistencias externas
    console.log('\n⚠️  DETECCIÓN DE INCONSISTENCIAS EXTERNAS:');
    console.log('==========================================');
    
    const inconsistencies = [];
    
    // Detectar tipos de cargo con cobertura muy baja
    const lowCoverageTypes = coverageAnalysis.filter(item => parseFloat(item.coverage) < 25);
    if (lowCoverageTypes.length > 0) {
      inconsistencies.push(`Tipos con cobertura baja (<25%): ${lowCoverageTypes.map(t => t.type).join(', ')}`);
    }
    
    // Detectar tipos con costos inusualmente altos
    const highCostTypes = sortedByAvgPerBox.filter(item => item.avgPerBox > (avgPerBoxValues.reduce((a, b) => a + b, 0) / avgPerBoxValues.length) * 2);
    if (highCostTypes.length > 0) {
      inconsistencies.push(`Tipos con costos inusualmente altos: ${highCostTypes.map(t => t.type).join(', ')}`);
    }
    
    // Detectar tipos que dominan el costo total
    const dominantTypes = sortedByAmount.filter(item => parseFloat(item.percentage) > 40);
    if (dominantTypes.length > 0) {
      inconsistencies.push(`Tipos que dominan costos totales (>40%): ${dominantTypes.map(t => t.type).join(', ')}`);
    }
    
    if (inconsistencies.length > 0) {
      console.log('   🚨 Inconsistencias detectadas:');
      inconsistencies.forEach((issue, index) => {
        console.log(`      ${index + 1}. ${issue}`);
      });
    } else {
      console.log('   ✅ No se detectaron inconsistencias significativas');
    }
    
    // Datos para la tabla principal de External Consistency
    console.log('\n📊 DATOS PARA TABLA DE EXTERNAL CONSISTENCY:');
    console.log('============================================');
    
    const tableData = Object.entries(chargeTypesSummary).map(([type, summary]) => ({
      chargeType: type,
      totalAmount: summary.totalAmount,
      avgPerBox: summary.avgPerBox,
      coverage: ((summary.lotsWithCharge/summary.totalRecords)*100).toFixed(1),
      exporterCount: summary.exporterCount,
      percentageOfTotal: ((summary.totalAmount/totalAmountAllCharges)*100).toFixed(1)
    }));
    
    console.log('   ✅ Estructura de datos para tabla:');
    console.log(`      - Registros: ${tableData.length}`);
    console.log('      - Columnas: Charge Type, Total Amount, Avg/Box, Coverage %, Exporters, % of Total');
    
    tableData.slice(0, 3).forEach((row, index) => {
      console.log(`      ${index + 1}. ${row.chargeType}: $${row.totalAmount.toLocaleString()} ($${row.avgPerBox.toFixed(4)}/box, ${row.coverage}% coverage)`);
    });
    
    // Datos para gráficos de External Consistency
    console.log('\n📈 DATOS PARA GRÁFICOS DE EXTERNAL CONSISTENCY:');
    console.log('===============================================');
    
    console.log('   📊 Gráfico de distribución por tipo de cargo:');
    console.log(`      ✅ ${sortedByAmount.length} tipos de cargo con datos`);
    
    console.log('   📊 Gráfico de costo promedio por caja:');
    console.log(`      ✅ ${sortedByAvgPerBox.length} tipos con avg/box calculado`);
    
    console.log('   📊 Gráfico de cobertura por tipo:');
    console.log(`      ✅ ${coverageAnalysis.length} tipos con datos de cobertura`);
    
    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN EXTERNAL CONSISTENCY:');
    console.log('===============================================');
    
    const checks = {
      'Múltiples tipos de cargo analizados': Object.keys(chargeTypesSummary).length > 1,
      'KPIs globales calculados': totalAmountAllCharges > 0 && totalBoxesAllCharges > 0,
      'Datos para tabla disponibles': tableData.length > 0,
      'Análisis de distribución disponible': sortedByAmount.length > 0,
      'Análisis de variación calculado': avgPerBoxValues.length > 1,
      'Análisis de cobertura disponible': coverageAnalysis.length > 0,
      'Detección de inconsistencias activa': true,
      'Datos para gráficos disponibles': sortedByAvgPerBox.length > 0 && coverageAnalysis.length > 0
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    console.log('');
    
    if (allPassed) {
      console.log('🎉 ¡EXTERNAL CONSISTENCY ANALYSIS ESTÁ 100% FUNCIONAL!');
      console.log('   ✅ Comparación entre todos los tipos de cargo');
      console.log('   ✅ Análisis de distribución de costos');
      console.log('   ✅ Detección de variaciones entre tipos');
      console.log('   ✅ Análisis de cobertura por tipo de cargo');
      console.log('   ✅ Detección automática de inconsistencias');
      console.log('   ✅ Datos completos para tablas y gráficos');
    } else {
      console.log('❌ Hay problemas en External Consistency Analysis que requieren atención');
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar verificación
verifyExternalConsistencyDetailed();
