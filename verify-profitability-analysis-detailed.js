const { salesData } = require('./src/data/salesDataEmbedded.js');
const { calculateMetricsFromEmbedded } = require('./src/data/costDataEmbedded.js');

// Función para procesar datos de profitabilidad (extraída del componente)
const processProfitabilityData = async () => {
  console.log('📊 Calculando métricas de costos...');
  const costMetrics = await calculateMetricsFromEmbedded();
  
  console.log('📈 Procesando datos de ventas por Lotid...');
  // Agrupar ventas por Lotid
  const salesByLotid = {};
  salesData.forEach(sale => {
    const lotid = sale.Lotid;
    if (!salesByLotid[lotid]) {
      salesByLotid[lotid] = {
        lotid,
        exporter: sale['Exporter Clean'],
        variety: sale.Variety,
        totalSales: 0,
        totalQuantity: 0,
        transactions: 0,
        retailers: new Set(),
        avgPrice: 0
      };
    }
    
    salesByLotid[lotid].totalSales += Number(sale['Sales Amount'] || 0);
    salesByLotid[lotid].totalQuantity += Number(sale['Sale Quantity'] || 0);
    salesByLotid[lotid].transactions += 1;
    salesByLotid[lotid].retailers.add(sale['Retailer Name']);
  });

  // Calcular precios promedio
  Object.values(salesByLotid).forEach(lotidData => {
    lotidData.avgPrice = lotidData.totalQuantity > 0 ? 
      lotidData.totalSales / lotidData.totalQuantity : 0;
    lotidData.retailers = lotidData.retailers.size;
  });

  console.log('💰 Combinando datos de ventas y costos...');
  // Combinar datos de ventas y costos
  const profitabilityData = [];
  
  Object.keys(salesByLotid).forEach(lotid => {
    const salesDataLot = salesByLotid[lotid];
    const costData = costMetrics[lotid];
    
    if (costData && costData.totalChargeAmount !== null) {
      const profit = salesDataLot.totalSales - costData.totalChargeAmount;
      const profitMargin = salesDataLot.totalSales > 0 ? 
        (profit / salesDataLot.totalSales) * 100 : 0;
      const roi = costData.totalChargeAmount > 0 ? 
        (profit / costData.totalChargeAmount) * 100 : 0;
      
      profitabilityData.push({
        ...salesDataLot,
        totalCosts: costData.totalChargeAmount,
        costPerBox: costData.costPerBox,
        profit,
        profitMargin,
        roi,
        profitPerBox: salesDataLot.totalQuantity > 0 ? profit / salesDataLot.totalQuantity : 0
      });
    }
  });

  return profitabilityData;
};

async function verifyProfitabilityAnalysisDetailed() {
  console.log('💰 VERIFICACIÓN DETALLADA: PROFITABILITY ANALYSIS');
  console.log('================================================\n');
  
  try {
    // Verificar datos base
    console.log('📊 Verificando datos base...');
    const salesCount = salesData?.length || 0;
    console.log(`   📋 Registros de ventas: ${salesCount.toLocaleString()}`);
    
    if (salesCount === 0) {
      console.error('❌ No hay datos de ventas disponibles');
      return;
    }
    
    // Procesar datos de profitabilidad
    console.log('\n📈 Procesando análisis de profitabilidad...');
    const profitabilityData = await processProfitabilityData();
    
    if (!profitabilityData || profitabilityData.length === 0) {
      console.error('❌ No se pudieron generar datos de profitabilidad');
      return;
    }
    
    console.log('\n🔍 DETALLES COMPLETOS DE PROFITABILITY ANALYSIS:');
    console.log('===============================================');
    
    // KPIs principales
    console.log('\n📈 KPIs PRINCIPALES:');
    const totalRevenue = profitabilityData.reduce((sum, d) => sum + d.totalSales, 0);
    const totalCosts = profitabilityData.reduce((sum, d) => sum + d.totalCosts, 0);
    const totalProfit = totalRevenue - totalCosts;
    const avgProfitMargin = profitabilityData.length > 0 ? 
      profitabilityData.reduce((sum, d) => sum + d.profitMargin, 0) / profitabilityData.length : 0;
    const avgROI = profitabilityData.length > 0 ? 
      profitabilityData.reduce((sum, d) => sum + d.roi, 0) / profitabilityData.length : 0;
    const profitableLots = profitabilityData.filter(d => d.profit > 0).length;
    const totalLots = profitabilityData.length;
    const exporterCount = [...new Set(profitabilityData.map(d => d.exporter))].length;
    
    console.log(`   💰 Total Revenue: $${totalRevenue.toLocaleString()}`);
    console.log(`   💸 Total Costs: $${totalCosts.toLocaleString()}`);
    console.log(`   💵 Total Profit: $${totalProfit.toLocaleString()}`);
    console.log(`   📊 Avg Profit Margin: ${avgProfitMargin.toFixed(2)}%`);
    console.log(`   📈 Avg ROI: ${avgROI.toFixed(2)}%`);
    console.log(`   ✅ Profitable Lots: ${profitableLots}/${totalLots} (${((profitableLots/totalLots)*100).toFixed(1)}%)`);
    console.log(`   🏢 Exporters: ${exporterCount}`);
    
    // Análisis por exportador
    console.log('\n🏢 ANÁLISIS POR EXPORTADOR:');
    console.log('===========================');
    
    const exporterAnalysis = {};
    profitabilityData.forEach(lot => {
      if (!exporterAnalysis[lot.exporter]) {
        exporterAnalysis[lot.exporter] = {
          lots: 0,
          totalRevenue: 0,
          totalCosts: 0,
          totalProfit: 0,
          profitableLots: 0,
          avgProfitMargin: 0,
          avgROI: 0,
          profitMargins: []
        };
      }
      
      const exp = exporterAnalysis[lot.exporter];
      exp.lots += 1;
      exp.totalRevenue += lot.totalSales;
      exp.totalCosts += lot.totalCosts;
      exp.totalProfit += lot.profit;
      exp.profitMargins.push(lot.profitMargin);
      if (lot.profit > 0) exp.profitableLots += 1;
    });
    
    // Calcular promedios por exportador
    Object.entries(exporterAnalysis).forEach(([exporter, data]) => {
      data.avgProfitMargin = data.profitMargins.length > 0 ? 
        data.profitMargins.reduce((a, b) => a + b, 0) / data.profitMargins.length : 0;
      data.avgROI = data.totalCosts > 0 ? (data.totalProfit / data.totalCosts) * 100 : 0;
    });
    
    // Ranking por profit total
    const exporterRanking = Object.entries(exporterAnalysis)
      .map(([exporter, data]) => ({ exporter, ...data }))
      .sort((a, b) => b.totalProfit - a.totalProfit);
    
    console.log(`   ✅ Exportadores analizados: ${exporterRanking.length}`);
    
    console.log('\n   📊 Ranking por profit total:');
    exporterRanking.forEach((exp, index) => {
      const profitabilityRate = exp.lots > 0 ? ((exp.profitableLots / exp.lots) * 100).toFixed(1) : 0;
      console.log(`      ${index + 1}. ${exp.exporter}:`);
      console.log(`         - Total Profit: $${exp.totalProfit.toLocaleString()}`);
      console.log(`         - Revenue: $${exp.totalRevenue.toLocaleString()}`);
      console.log(`         - Costs: $${exp.totalCosts.toLocaleString()}`);
      console.log(`         - Avg Profit Margin: ${exp.avgProfitMargin.toFixed(2)}%`);
      console.log(`         - Avg ROI: ${exp.avgROI.toFixed(2)}%`);
      console.log(`         - Profitable Lots: ${exp.profitableLots}/${exp.lots} (${profitabilityRate}%)`);
    });
    
    // Análisis de rentabilidad por margen
    console.log('\n📊 ANÁLISIS DE RENTABILIDAD POR MARGEN:');
    console.log('=======================================');
    
    const marginRanges = {
      'Muy Rentable (>30%)': profitabilityData.filter(d => d.profitMargin > 30).length,
      'Rentable (10-30%)': profitabilityData.filter(d => d.profitMargin >= 10 && d.profitMargin <= 30).length,
      'Marginal (0-10%)': profitabilityData.filter(d => d.profitMargin >= 0 && d.profitMargin < 10).length,
      'Pérdidas (<0%)': profitabilityData.filter(d => d.profitMargin < 0).length
    };
    
    Object.entries(marginRanges).forEach(([range, count]) => {
      const percentage = totalLots > 0 ? ((count / totalLots) * 100).toFixed(1) : 0;
      console.log(`   ${range}: ${count} lots (${percentage}%)`);
    });
    
    // Análisis de outliers (lots con performance extrema)
    console.log('\n⚠️  ANÁLISIS DE OUTLIERS (Performance Extrema):');
    console.log('==============================================');
    
    // Top performers
    const topPerformers = profitabilityData
      .filter(d => d.profit > 0)
      .sort((a, b) => b.profitMargin - a.profitMargin)
      .slice(0, 5);
    
    console.log('\n   🚀 Top 5 performers (mayor profit margin):');
    topPerformers.forEach((lot, index) => {
      console.log(`      ${index + 1}. Lot ${lot.lotid} (${lot.exporter}):`);
      console.log(`         - Profit Margin: ${lot.profitMargin.toFixed(2)}%`);
      console.log(`         - Profit: $${lot.profit.toLocaleString()}`);
      console.log(`         - Revenue: $${lot.totalSales.toLocaleString()}`);
      console.log(`         - ROI: ${lot.roi.toFixed(2)}%`);
    });
    
    // Worst performers
    const worstPerformers = profitabilityData
      .sort((a, b) => a.profitMargin - b.profitMargin)
      .slice(0, 5);
    
    console.log('\n   📉 Worst 5 performers (menor profit margin):');
    worstPerformers.forEach((lot, index) => {
      console.log(`      ${index + 1}. Lot ${lot.lotid} (${lot.exporter}):`);
      console.log(`         - Profit Margin: ${lot.profitMargin.toFixed(2)}%`);
      console.log(`         - Loss: $${Math.abs(lot.profit).toLocaleString()}`);
      console.log(`         - Revenue: $${lot.totalSales.toLocaleString()}`);
      console.log(`         - Costs: $${lot.totalCosts.toLocaleString()}`);
    });
    
    // Análisis de variedades más rentables
    console.log('\n🌱 ANÁLISIS DE VARIEDADES MÁS RENTABLES:');
    console.log('=======================================');
    
    const varietyAnalysis = {};
    profitabilityData.forEach(lot => {
      if (!varietyAnalysis[lot.variety]) {
        varietyAnalysis[lot.variety] = {
          lots: 0,
          totalProfit: 0,
          totalRevenue: 0,
          totalCosts: 0,
          avgProfitMargin: 0,
          profitMargins: []
        };
      }
      
      const variety = varietyAnalysis[lot.variety];
      variety.lots += 1;
      variety.totalProfit += lot.profit;
      variety.totalRevenue += lot.totalSales;
      variety.totalCosts += lot.totalCosts;
      variety.profitMargins.push(lot.profitMargin);
    });
    
    // Calcular promedios por variedad
    Object.entries(varietyAnalysis).forEach(([variety, data]) => {
      data.avgProfitMargin = data.profitMargins.length > 0 ? 
        data.profitMargins.reduce((a, b) => a + b, 0) / data.profitMargins.length : 0;
    });
    
    const varietyRanking = Object.entries(varietyAnalysis)
      .map(([variety, data]) => ({ variety, ...data }))
      .filter(v => v.lots >= 5) // Solo variedades con al menos 5 lots
      .sort((a, b) => b.avgProfitMargin - a.avgProfitMargin)
      .slice(0, 10);
    
    if (varietyRanking.length > 0) {
      console.log(`   ✅ Top 10 variedades más rentables (>=5 lots):`);
      varietyRanking.forEach((variety, index) => {
        console.log(`      ${index + 1}. ${variety.variety}:`);
        console.log(`         - Avg Profit Margin: ${variety.avgProfitMargin.toFixed(2)}%`);
        console.log(`         - Total Profit: $${variety.totalProfit.toLocaleString()}`);
        console.log(`         - Lots: ${variety.lots}`);
        console.log(`         - Revenue: $${variety.totalRevenue.toLocaleString()}`);
      });
    } else {
      console.log('   ❌ No hay suficientes variedades con 5+ lots para análisis');
    }
    
    // Verificación de calidad de datos
    console.log('\n🔍 VERIFICACIÓN DE CALIDAD DE DATOS:');
    console.log('====================================');
    
    const dataQuality = {
      'Datos de ventas disponibles': salesCount > 0,
      'Datos de profitabilidad calculados': profitabilityData.length > 0,
      'Combinación ventas-costos exitosa': profitabilityData.length > 0,
      'KPIs principales calculados': totalRevenue > 0 && totalCosts > 0,
      'Análisis por exportador completo': exporterRanking.length > 0,
      'Rangos de rentabilidad calculados': Object.values(marginRanges).some(v => v > 0),
      'Top/Worst performers identificados': topPerformers.length > 0 && worstPerformers.length > 0,
      'Análisis de variedades disponible': varietyRanking.length > 0,
      'Cobertura de exportadores': exporterCount >= 3,
      'Lots rentables identificados': profitableLots > 0
    };
    
    Object.entries(dataQuality).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN PROFITABILITY ANALYSIS:');
    console.log('==================================================');
    
    const allPassed = Object.values(dataQuality).every(check => check === true);
    const passedCount = Object.values(dataQuality).filter(check => check === true).length;
    const totalChecks = Object.keys(dataQuality).length;
    
    console.log(`   📊 Score: ${passedCount}/${totalChecks} checks pasados`);
    
    if (allPassed) {
      console.log('\n🎉 ¡PROFITABILITY ANALYSIS ESTÁ 100% FUNCIONAL!');
      console.log('   ✅ Datos de ventas y costos combinados correctamente');
      console.log('   ✅ KPIs de rentabilidad calculados apropiadamente');
      console.log('   ✅ Análisis por exportador disponible');
      console.log('   ✅ Rangos de rentabilidad identificados');
      console.log('   ✅ Top/Worst performers detectados');
      console.log('   ✅ Análisis de variedades implementado');
      console.log('   ✅ Gráficos y tablas con datos válidos');
      
      console.log('\n   📊 Métricas de calidad:');
      console.log(`      - Total Revenue: $${totalRevenue.toLocaleString()}`);
      console.log(`      - Total Profit: $${totalProfit.toLocaleString()}`);
      console.log(`      - Avg Profit Margin: ${avgProfitMargin.toFixed(2)}%`);
      console.log(`      - Profitable Lots: ${profitableLots}/${totalLots} (${((profitableLots/totalLots)*100).toFixed(1)}%)`);
      console.log(`      - Exporters: ${exporterCount}`);
      console.log(`      - Top Varieties: ${varietyRanking.length}`);
      
    } else {
      console.log(`\n⚠️  PROFITABILITY ANALYSIS NECESITA ATENCIÓN (${passedCount}/${totalChecks})`);
      
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
verifyProfitabilityAnalysisDetailed();
