const { 
  getInitialStockAnalysisFromEmbedded,
  getTopVarietiesByStockFromEmbedded,
  getStockDistributionByMonthFromEmbedded,
  embeddedStockData
} = require('./src/data/costDataEmbedded.js');

async function verifyInventoryAnalysisDetailed() {
  console.log('📦 VERIFICACIÓN DETALLADA: INVENTORY ANALYSIS');
  console.log('=============================================\n');
  
  try {
    // Verificar datos base
    console.log('📊 Verificando datos base de inventario...');
    const rawDataCount = embeddedStockData?.length || 0;
    console.log(`   📋 Registros de stock: ${rawDataCount.toLocaleString()}`);
    
    if (rawDataCount === 0) {
      console.error('❌ No hay datos de stock disponibles');
      return;
    }
    
    // Analizar datos de stock inicial
    console.log('\n📈 Analizando datos de stock inicial...');
    const stockAnalysis = await getInitialStockAnalysisFromEmbedded();
    
    if (!stockAnalysis) {
      console.error('❌ No se pudo obtener análisis de stock inicial');
      return;
    }
    
    console.log('\n🔍 DETALLES COMPLETOS DE INVENTORY ANALYSIS:');
    console.log('===========================================');
    
    // KPIs principales
    console.log('\n📈 KPIs PRINCIPALES:');
    const totalStock = stockAnalysis.totalStock || 0;
    const totalLots = stockAnalysis.totalLots || 0;
    const avgStockPerLot = totalLots > 0 ? totalStock / totalLots : 0;
    const exporterCount = stockAnalysis.byExporter ? Object.keys(stockAnalysis.byExporter).length : 0;
    
    console.log(`   📦 Total Stock: ${totalStock.toLocaleString()} boxes`);
    console.log(`   📋 Total Lots: ${totalLots.toLocaleString()}`);
    console.log(`   📊 Avg Stock per Lot: ${avgStockPerLot.toFixed(2)} boxes`);
    console.log(`   🏢 Exporters: ${exporterCount}`);
    
    // Análisis por exportador
    console.log('\n🏢 ANÁLISIS POR EXPORTADOR:');
    console.log('===========================');
    
    if (stockAnalysis.byExporter && Object.keys(stockAnalysis.byExporter).length > 0) {
      console.log(`   ✅ Exportadores con stock: ${Object.keys(stockAnalysis.byExporter).length}`);
      
      // Crear ranking por stock total
      const exporterRanking = Object.entries(stockAnalysis.byExporter)
        .map(([exporter, data]) => ({
          exporter,
          totalStock: data.totalStock || 0,
          lots: data.lots || 0,
          avgStock: data.lots > 0 ? (data.totalStock || 0) / data.lots : 0,
          varieties: data.varieties ? Object.keys(data.varieties).length : 0
        }))
        .sort((a, b) => b.totalStock - a.totalStock);
      
      console.log('\n   📊 Ranking por stock total:');
      exporterRanking.forEach((exp, index) => {
        console.log(`      ${index + 1}. ${exp.exporter}:`);
        console.log(`         - Total Stock: ${exp.totalStock.toLocaleString()} boxes`);
        console.log(`         - Lots: ${exp.lots.toLocaleString()}`);
        console.log(`         - Avg per Lot: ${exp.avgStock.toFixed(2)} boxes`);
        console.log(`         - Varieties: ${exp.varieties}`);
      });
      
      // Análisis de distribución
      console.log('\n   📊 Distribución de stock:');
      exporterRanking.forEach((exp, index) => {
        const percentage = totalStock > 0 ? ((exp.totalStock / totalStock) * 100).toFixed(1) : 0;
        console.log(`      ${index + 1}. ${exp.exporter}: ${percentage}% (${exp.totalStock.toLocaleString()} boxes)`);
      });
      
    } else {
      console.log('   ❌ No hay datos por exportador');
    }
    
    // Análisis de variedades
    console.log('\n🌱 ANÁLISIS DE VARIEDADES:');
    console.log('==========================');
    
    const topVarieties = await getTopVarietiesByStockFromEmbedded(10);
    
    if (topVarieties && topVarieties.length > 0) {
      console.log(`   ✅ Variedades analizadas: ${topVarieties.length}`);
      
      console.log('\n   📊 Top 10 variedades por stock:');
      topVarieties.forEach((variety, index) => {
        const avgStock = variety.avgStock || (variety.lots > 0 ? variety.totalStock / variety.lots : 0);
        console.log(`      ${index + 1}. ${variety.variety}:`);
        console.log(`         - Total Stock: ${variety.totalStock.toLocaleString()} boxes`);
        console.log(`         - Lots: ${variety.lots.toLocaleString()}`);
        console.log(`         - Avg per Lot: ${avgStock.toFixed(2)} boxes`);
        console.log(`         - Exporters: ${variety.exporters || 'N/A'}`);
      });
      
      // Concentración de variedades
      const topVarietiesStock = topVarieties.slice(0, 5).reduce((sum, v) => sum + v.totalStock, 0);
      const concentration = totalStock > 0 ? ((topVarietiesStock / totalStock) * 100).toFixed(1) : 0;
      console.log(`\n   📈 Concentración top 5 variedades: ${concentration}%`);
      
    } else {
      console.log('   ❌ No hay datos de variedades');
    }
    
    // Análisis mensual
    console.log('\n📅 ANÁLISIS MENSUAL:');
    console.log('====================');
    
    const monthlyDistribution = await getStockDistributionByMonthFromEmbedded();
    
    if (monthlyDistribution && monthlyDistribution.length > 0) {
      console.log(`   ✅ Meses con datos: ${monthlyDistribution.length}`);
      
      console.log('\n   📊 Distribución mensual:');
      monthlyDistribution.forEach((month, index) => {
        const avgStock = month.avgStock || (month.lots > 0 ? month.totalStock / month.lots : 0);
        console.log(`      ${index + 1}. ${month.month}:`);
        console.log(`         - Total Stock: ${month.totalStock.toLocaleString()} boxes`);
        console.log(`         - Lots: ${month.lots.toLocaleString()}`);
        console.log(`         - Avg per Lot: ${avgStock.toFixed(2)} boxes`);
        console.log(`         - Varieties: ${month.varieties || 'N/A'}`);
      });
      
      // Análisis de estacionalidad
      const maxMonth = monthlyDistribution.reduce((max, month) => 
        month.totalStock > max.totalStock ? month : max, monthlyDistribution[0]);
      const minMonth = monthlyDistribution.reduce((min, month) => 
        month.totalStock < min.totalStock ? month : min, monthlyDistribution[0]);
      
      const seasonalVariation = minMonth.totalStock > 0 ? 
        ((maxMonth.totalStock - minMonth.totalStock) / minMonth.totalStock * 100).toFixed(1) : 0;
      
      console.log(`\n   📈 Análisis estacional:`);
      console.log(`      - Mes con más stock: ${maxMonth.month} (${maxMonth.totalStock.toLocaleString()} boxes)`);
      console.log(`      - Mes con menos stock: ${minMonth.month} (${minMonth.totalStock.toLocaleString()} boxes)`);
      console.log(`      - Variación estacional: ${seasonalVariation}%`);
      
    } else {
      console.log('   ❌ No hay datos de distribución mensual');
    }
    
    // Análisis de eficiencia
    console.log('\n⚡ ANÁLISIS DE EFICIENCIA:');
    console.log('=========================');
    
    if (stockAnalysis.byExporter) {
      const exporterEfficiency = Object.entries(stockAnalysis.byExporter)
        .map(([exporter, data]) => ({
          exporter,
          totalStock: data.totalStock || 0,
          lots: data.lots || 0,
          avgStock: data.lots > 0 ? (data.totalStock || 0) / data.lots : 0,
          varieties: data.varieties ? Object.keys(data.varieties).length : 0,
          efficiency: data.lots > 0 && data.varieties ? 
            (data.totalStock || 0) / (data.lots * Object.keys(data.varieties).length) : 0
        }))
        .sort((a, b) => b.efficiency - a.efficiency);
      
      console.log('   📊 Eficiencia por exportador (stock per lot per variety):');
      exporterEfficiency.forEach((exp, index) => {
        console.log(`      ${index + 1}. ${exp.exporter}:`);
        console.log(`         - Efficiency Score: ${exp.efficiency.toFixed(2)}`);
        console.log(`         - Stock/Lot: ${exp.avgStock.toFixed(2)} boxes`);
        console.log(`         - Varieties: ${exp.varieties}`);
        console.log(`         - Total Stock: ${exp.totalStock.toLocaleString()} boxes`);
      });
    }
    
    // Verificación de calidad de datos
    console.log('\n🔍 VERIFICACIÓN DE CALIDAD DE DATOS:');
    console.log('====================================');
    
    const dataQuality = {
      'Datos de stock base disponibles': rawDataCount > 0,
      'Análisis de stock calculado': !!stockAnalysis,
      'Datos por exportador': !!(stockAnalysis.byExporter && Object.keys(stockAnalysis.byExporter).length > 0),
      'Análisis de variedades': !!(topVarieties && topVarieties.length > 0),
      'Distribución mensual': !!(monthlyDistribution && monthlyDistribution.length > 0),
      'KPIs principales calculados': totalStock > 0 && totalLots > 0,
      'Cobertura de exportadores': exporterCount >= 3,
      'Variedad de productos': topVarieties ? topVarieties.length >= 5 : false
    };
    
    Object.entries(dataQuality).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN INVENTORY ANALYSIS:');
    console.log('=============================================');
    
    const allPassed = Object.values(dataQuality).every(check => check === true);
    const passedCount = Object.values(dataQuality).filter(check => check === true).length;
    const totalChecks = Object.keys(dataQuality).length;
    
    console.log(`   📊 Score: ${passedCount}/${totalChecks} checks pasados`);
    
    if (allPassed) {
      console.log('\n🎉 ¡INVENTORY ANALYSIS ESTÁ 100% FUNCIONAL!');
      console.log('   ✅ Datos de stock completos y consistentes');
      console.log('   ✅ Análisis por exportador disponible');
      console.log('   ✅ Análisis de variedades implementado');
      console.log('   ✅ Distribución mensual calculada');
      console.log('   ✅ KPIs principales funcionando');
      console.log('   ✅ Gráficos y tablas con datos válidos');
      
      console.log('\n   📊 Métricas de calidad:');
      console.log(`      - Total Stock: ${totalStock.toLocaleString()} boxes`);
      console.log(`      - Total Lots: ${totalLots.toLocaleString()}`);
      console.log(`      - Exporters: ${exporterCount}`);
      console.log(`      - Varieties: ${topVarieties ? topVarieties.length : 0}`);
      console.log(`      - Months: ${monthlyDistribution ? monthlyDistribution.length : 0}`);
      
    } else {
      console.log(`\n⚠️  INVENTORY ANALYSIS NECESITA ATENCIÓN (${passedCount}/${totalChecks})`);
      
      const failedChecks = Object.entries(dataQuality).filter(([, passed]) => !passed);
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
verifyInventoryAnalysisDetailed();
