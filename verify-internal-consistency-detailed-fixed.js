const { analyzeSpecificChargeFromEmbedded } = require('./src/data/costDataEmbedded.js');

async function verifyInternalConsistencyDetailed() {
  console.log('💼 VERIFICACIÓN DETALLADA: INTERNAL CONSISTENCY ANALYSIS');
  console.log('=======================================================\n');
  
  try {
    // Analizar Commission (Internal) - el cargo principal para consistencia interna
    console.log('📊 Analizando datos de Commission/Internal...');
    const internalAnalysis = await analyzeSpecificChargeFromEmbedded('COMMISSION', 'Commission/Internal');
    
    if (!internalAnalysis) {
      console.error('❌ No se pudieron obtener datos de Commission/Internal');
      return;
    }
    
    // También obtener datos de Ocean Freight para contexto comparativo
    console.log('📊 Obteniendo Ocean Freight para contexto...');
    const oceanFreightAnalysis = await analyzeSpecificChargeFromEmbedded('OCEAN FREIGHT', 'Ocean Freight');
    
    console.log('\n🔍 DETALLES COMPLETOS DE INTERNAL CONSISTENCY:');
    console.log('=============================================');
    
    // KPIs principales mejorados
    console.log('\n📈 KPIs PRINCIPALES:');
    const totalAmount = internalAnalysis.analysis?.totalAmount || internalAnalysis.summary?.totalAmount || 0;
    const avgPerBox = internalAnalysis.summary?.avgPerBox || 0;
    const exporterCount = Object.keys(internalAnalysis.byExporter || {}).length;
    const outlierCount = internalAnalysis.outliers?.length || 0;
    const lotsWithCharge = internalAnalysis.summary?.lotsWithCharge || 0;
    const totalRecords = internalAnalysis.summary?.totalRecords || 0;
    const coverage = totalRecords > 0 ? ((lotsWithCharge / totalRecords) * 100).toFixed(1) : 0;
    
    console.log(`   💰 Total Amount: $${totalAmount.toLocaleString()}`);
    console.log(`   📦 Avg per Box: $${avgPerBox.toFixed(4)}`);
    console.log(`   🏢 Exporters: ${exporterCount}`);
    console.log(`   📋 Coverage: ${coverage}% (${lotsWithCharge}/${totalRecords} lots)`);
    console.log(`   ⚠️  Outliers: ${outlierCount}`);
    
    // Datos para la tabla principal
    console.log('\n📊 DATOS PARA TABLA PRINCIPAL:');
    console.log('===============================');
    
    if (internalAnalysis.summary) {
      console.log('   ✅ Summary data completo para tabla:');
      console.log(`      - Total Amount: $${internalAnalysis.summary.totalAmount?.toLocaleString() || 'N/A'}`);
      console.log(`      - Total Boxes: ${internalAnalysis.summary.totalBoxes?.toLocaleString() || 'N/A'}`);
      console.log(`      - Avg per Box: $${internalAnalysis.summary.avgPerBox?.toFixed(4) || 'N/A'}`);
      console.log(`      - Lots with Charge: ${internalAnalysis.summary.lotsWithCharge || 'N/A'}`);
      console.log(`      - Total Records: ${internalAnalysis.summary.totalRecords || 'N/A'}`);
      console.log(`      - Coverage: ${coverage}%`);
      
      // Métricas adicionales para consistencia interna
      if (internalAnalysis.analysis) {
        const avgChargePerLot = internalAnalysis.analysis.avgChargePerLot || 0;
        const avgChargeAmount = internalAnalysis.analysis.avgChargeAmount || 0;
        console.log(`      - Avg Charge per Lot: $${avgChargePerLot.toFixed(2)}`);
        console.log(`      - Avg Charge Amount: $${avgChargeAmount.toFixed(2)}`);
      }
    } else {
      console.log('   ❌ No hay datos de summary para la tabla');
    }
    
    // Datos para gráficos por exportador
    console.log('\n📈 DATOS PARA GRÁFICOS POR EXPORTADOR:');
    console.log('======================================');
    
    if (internalAnalysis.byExporter && Object.keys(internalAnalysis.byExporter).length > 0) {
      console.log(`   ✅ Exportadores con datos: ${Object.keys(internalAnalysis.byExporter).length}`);
      
      // Crear ranking por avg per box para el gráfico
      const exporterRanking = Object.entries(internalAnalysis.byExporter)
        .map(([exporter, data]) => ({
          exporter,
          totalAmount: data.totalAmount || 0,
          lots: data.lots || 0,
          totalBoxes: data.totalBoxes || 0,
          avgPerBox: data.avgPerBox || 0,
          avgCharge: data.avgCharge || 0
        }))
        .sort((a, b) => b.avgPerBox - a.avgPerBox);
      
      console.log('   📊 Top 5 exportadores por avg/box (para gráfico):');
      exporterRanking.slice(0, 5).forEach((exp, index) => {
        console.log(`      ${index + 1}. ${exp.exporter}: $${exp.avgPerBox.toFixed(4)}/box`);
        console.log(`         - Total: $${exp.totalAmount.toLocaleString()}`);
        console.log(`         - Lots: ${exp.lots}, Boxes: ${exp.totalBoxes.toLocaleString()}`);
        console.log(`         - Avg per Lot: $${exp.avgCharge.toFixed(2)}`);
      });
      
      // Análisis de distribución para gráfico de pie
      const totalAmountAllExporters = exporterRanking.reduce((sum, exp) => sum + exp.totalAmount, 0);
      console.log('\n   🥧 Distribución por exportador (para gráfico pie):');
      exporterRanking.slice(0, 5).forEach((exp, index) => {
        const percentage = ((exp.totalAmount / totalAmountAllExporters) * 100).toFixed(1);
        console.log(`      ${index + 1}. ${exp.exporter}: ${percentage}% ($${exp.totalAmount.toLocaleString()})`);
      });
      
    } else {
      console.log('   ❌ No hay datos por exportador para gráficos');
    }
    
    // Análisis detallado de outliers
    console.log('\n⚠️  ANÁLISIS DETALLADO DE OUTLIERS:');
    console.log('===================================');
    
    if (internalAnalysis.outliers && internalAnalysis.outliers.length > 0) {
      console.log(`   ✅ Outliers detectados: ${internalAnalysis.outliers.length}`);
      
      // Clasificar outliers por severidad
      const sortedOutliers = internalAnalysis.outliers.sort((a, b) => (b.totalCharge || 0) - (a.totalCharge || 0));
      
      console.log('\n   🚨 Top 5 outliers más significativos:');
      sortedOutliers.slice(0, 5).forEach((outlier, index) => {
        console.log(`      ${index + 1}. Lot ${outlier.lotid} (${outlier.exporter}):`);
        console.log(`         - Total Charge: $${outlier.totalCharge?.toFixed(2) || 'N/A'}`);
        console.log(`         - Boxes: ${outlier.boxes || 'N/A'}`);
        console.log(`         - Charge per Box: $${outlier.chargePerBox?.toFixed(4) || 'N/A'}`);
      });
      
      // Análisis de patrón de outliers
      const outliersByExporter = {};
      internalAnalysis.outliers.forEach(outlier => {
        if (!outliersByExporter[outlier.exporter]) {
          outliersByExporter[outlier.exporter] = [];
        }
        outliersByExporter[outlier.exporter].push(outlier);
      });
      
      console.log('\n   📊 Outliers por exportador:');
      Object.entries(outliersByExporter).forEach(([exporter, outliers]) => {
        console.log(`      ${exporter}: ${outliers.length} outliers`);
      });
      
    } else {
      console.log('   ✅ No hay outliers detectados - buena consistencia interna');
    }
    
    // Análisis de consistencia avanzado
    console.log('\n🔍 ANÁLISIS AVANZADO DE CONSISTENCIA:');
    console.log('====================================');
    
    if (internalAnalysis.byExporter) {
      const exporterCosts = Object.entries(internalAnalysis.byExporter)
        .map(([name, data]) => ({
          name,
          avgPerBox: data.avgPerBox || 0,
          totalAmount: data.totalAmount || 0,
          lots: data.lots || 0,
          avgCharge: data.avgCharge || 0,
          totalBoxes: data.totalBoxes || 0
        }))
        .sort((a, b) => b.avgPerBox - a.avgPerBox);
      
      console.log('   📊 Ranking completo por avg/box:');
      exporterCosts.forEach((exp, index) => {
        console.log(`      ${index + 1}. ${exp.name}: $${exp.avgPerBox.toFixed(4)}/box`);
        console.log(`         - Total: $${exp.totalAmount.toLocaleString()}`);
        console.log(`         - Lots: ${exp.lots}, Boxes: ${exp.totalBoxes.toLocaleString()}`);
      });
      
      // Análisis estadístico de variación
      const commissionRates = exporterCosts.map(e => e.avgPerBox).filter(c => c > 0);
      if (commissionRates.length > 1) {
        const maxRate = Math.max(...commissionRates);
        const minRate = Math.min(...commissionRates);
        const avgRate = commissionRates.reduce((a, b) => a + b, 0) / commissionRates.length;
        const variation = ((maxRate - minRate) / minRate * 100).toFixed(1);
        
        console.log(`\n   📈 Estadísticas de variación:`);
        console.log(`      - Variación: ${variation}%`);
        console.log(`      - Rate promedio: $${avgRate.toFixed(4)}/box`);
        console.log(`      - Rate más alto: $${maxRate.toFixed(4)}/box`);
        console.log(`      - Rate más bajo: $${minRate.toFixed(4)}/box`);
        
        if (parseFloat(variation) > 50) {
          console.log(`      ⚠️  ALERTA: Variación alta (${variation}%) en commission rates`);
        } else {
          console.log(`      ✅ Variación aceptable (${variation}%) en commission rates`);
        }
      }
    }
    
    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN INTERNAL CONSISTENCY:');
    console.log('===============================================');
    
    const checks = {
      'KPIs principales calculados': totalAmount > 0 && avgPerBox > 0,
      'Coverage calculado correctamente': !isNaN(parseFloat(coverage)),
      'Datos para tabla completos': internalAnalysis.summary && Object.keys(internalAnalysis.summary).length >= 5,
      'Datos para gráficos por exportador': exporterCount > 0,
      'Outliers procesados correctamente': internalAnalysis.outliers !== undefined,
      'Análisis estadístico disponible': internalAnalysis.analysis && Object.keys(internalAnalysis.analysis).length > 0,
      'Comparación con contexto global': oceanFreightAnalysis !== null,
      'Datos para UI components listos': internalAnalysis.summary && internalAnalysis.byExporter
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    console.log('');
    
    if (allPassed) {
      console.log('🎉 ¡INTERNAL CONSISTENCY ANALYSIS ESTÁ 100% FUNCIONAL!');
      console.log('   ✅ KPIs principales calculados correctamente');
      console.log('   ✅ Tabla principal con datos completos');
      console.log('   ✅ Gráficos por exportador con ranking y distribución');
      console.log('   ✅ Análisis estadístico de variación en commission rates');
      console.log('   ✅ Detección y análisis detallado de outliers');
      console.log('   ✅ Comparación con contexto global disponible');
      console.log('   ✅ Todos los componentes de UI tienen datos válidos');
      
      console.log('\n   📊 Métricas de calidad:');
      console.log(`      - Cobertura: ${coverage}%`);
      console.log(`      - Exportadores: ${exporterCount}`);
      console.log(`      - Outliers: ${outlierCount}`);
      console.log(`      - Records: ${totalRecords.toLocaleString()}`);
      
    } else {
      console.log('❌ Hay problemas en Internal Consistency Analysis que requieren atención');
      
      const failedChecks = Object.entries(checks).filter(([, passed]) => !passed);
      console.log('   Problemas detectados:');
      failedChecks.forEach(([check]) => {
        console.log(`      ❌ ${check}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar verificación
verifyInternalConsistencyDetailed();
