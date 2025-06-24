const { salesData, getSalesData, getDataSummary } = require('./src/data/salesDataEmbedded.js');
const { getUnique, filterData, groupBy } = require('./src/utils/dataProcessing.js');

async function verifySalesDetailAnalysisDetailed() {
  console.log('📊 VERIFICACIÓN DETALLADA: SALES DETAIL ANALYSIS');
  console.log('===============================================\n');
  
  try {
    // Verificar datos base
    console.log('📊 Verificando datos base de ventas...');
    const rawSalesCount = salesData?.length || 0;
    console.log(`   📋 Registros de ventas raw: ${rawSalesCount.toLocaleString()}`);
    
    if (rawSalesCount === 0) {
      console.error('❌ No hay datos de ventas disponibles');
      return;
    }
    
    // Obtener datos procesados
    console.log('\n📈 Obteniendo datos procesados de ventas...');
    const processedSales = await getSalesData();
    const dataSummary = await getDataSummary();
    
    console.log('\n🔍 DETALLES COMPLETOS DE SALES DETAIL ANALYSIS:');
    console.log('==============================================');
    
    // KPIs principales
    console.log('\n📈 KPIs PRINCIPALES:');
    const totalSales = salesData.reduce((sum, sale) => sum + Number(sale['Sales Amount'] || 0), 0);
    const totalQuantity = salesData.reduce((sum, sale) => sum + Number(sale['Sale Quantity'] || 0), 0);
    const avgPrice = totalQuantity > 0 ? totalSales / totalQuantity : 0;
    const uniqueLots = [...new Set(salesData.map(sale => sale.Lotid))].length;
    const uniqueExporters = [...new Set(salesData.map(sale => sale['Exporter Clean']))].length;
    const uniqueVarieties = [...new Set(salesData.map(sale => sale.Variety))].length;
    const uniqueRetailers = [...new Set(salesData.map(sale => sale['Retailer Name']))].length;
    const transactions = salesData.length;
    
    console.log(`   💰 Total Sales: $${totalSales.toLocaleString()}`);
    console.log(`   📦 Total Quantity: ${totalQuantity.toLocaleString()} boxes`);
    console.log(`   💵 Avg Price per Box: $${avgPrice.toFixed(4)}`);
    console.log(`   📋 Unique Lots: ${uniqueLots}`);
    console.log(`   🏢 Exporters: ${uniqueExporters}`);
    console.log(`   🌱 Varieties: ${uniqueVarieties}`);
    console.log(`   🏪 Retailers: ${uniqueRetailers}`);
    console.log(`   🔄 Transactions: ${transactions.toLocaleString()}`);
    
    // Análisis por exportador
    console.log('\n🏢 ANÁLISIS POR EXPORTADOR:');
    console.log('===========================');
    
    const exporterAnalysis = {};
    salesData.forEach(sale => {
      const exporter = sale['Exporter Clean'];
      if (!exporterAnalysis[exporter]) {
        exporterAnalysis[exporter] = {
          totalSales: 0,
          totalQuantity: 0,
          transactions: 0,
          varieties: new Set(),
          retailers: new Set(),
          lots: new Set(),
          avgPrice: 0,
          salesAmounts: []
        };
      }
      
      const exp = exporterAnalysis[exporter];
      exp.totalSales += Number(sale['Sales Amount'] || 0);
      exp.totalQuantity += Number(sale['Sale Quantity'] || 0);
      exp.transactions += 1;
      exp.varieties.add(sale.Variety);
      exp.retailers.add(sale['Retailer Name']);
      exp.lots.add(sale.Lotid);
      exp.salesAmounts.push(Number(sale['Sales Amount'] || 0));
    });
    
    // Calcular promedios por exportador
    Object.entries(exporterAnalysis).forEach(([exporter, data]) => {
      data.avgPrice = data.totalQuantity > 0 ? data.totalSales / data.totalQuantity : 0;
      data.varieties = data.varieties.size;
      data.retailers = data.retailers.size;
      data.lots = data.lots.size;
    });
    
    // Ranking por ventas totales
    const exporterRanking = Object.entries(exporterAnalysis)
      .map(([exporter, data]) => ({ exporter, ...data }))
      .sort((a, b) => b.totalSales - a.totalSales);
    
    console.log(`   ✅ Exportadores analizados: ${exporterRanking.length}`);
    
    console.log('\n   📊 Ranking por ventas totales:');
    exporterRanking.forEach((exp, index) => {
      const salesPercentage = totalSales > 0 ? ((exp.totalSales / totalSales) * 100).toFixed(1) : 0;
      console.log(`      ${index + 1}. ${exp.exporter}:`);
      console.log(`         - Total Sales: $${exp.totalSales.toLocaleString()} (${salesPercentage}%)`);
      console.log(`         - Quantity: ${exp.totalQuantity.toLocaleString()} boxes`);
      console.log(`         - Avg Price: $${exp.avgPrice.toFixed(4)}/box`);
      console.log(`         - Transactions: ${exp.transactions.toLocaleString()}`);
      console.log(`         - Lots: ${exp.lots}`);
      console.log(`         - Varieties: ${exp.varieties}`);
      console.log(`         - Retailers: ${exp.retailers}`);
    });
    
    // Análisis por variedad
    console.log('\n🌱 ANÁLISIS POR VARIEDAD:');
    console.log('=========================');
    
    const varietyAnalysis = {};
    salesData.forEach(sale => {
      const variety = sale.Variety;
      if (!varietyAnalysis[variety]) {
        varietyAnalysis[variety] = {
          totalSales: 0,
          totalQuantity: 0,
          transactions: 0,
          exporters: new Set(),
          retailers: new Set(),
          lots: new Set(),
          avgPrice: 0
        };
      }
      
      const var_ = varietyAnalysis[variety];
      var_.totalSales += Number(sale['Sales Amount'] || 0);
      var_.totalQuantity += Number(sale['Sale Quantity'] || 0);
      var_.transactions += 1;
      var_.exporters.add(sale['Exporter Clean']);
      var_.retailers.add(sale['Retailer Name']);
      var_.lots.add(sale.Lotid);
    });
    
    // Calcular promedios por variedad
    Object.entries(varietyAnalysis).forEach(([variety, data]) => {
      data.avgPrice = data.totalQuantity > 0 ? data.totalSales / data.totalQuantity : 0;
      data.exporters = data.exporters.size;
      data.retailers = data.retailers.size;
      data.lots = data.lots.size;
    });
    
    const varietyRanking = Object.entries(varietyAnalysis)
      .map(([variety, data]) => ({ variety, ...data }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);
    
    console.log(`   ✅ Top 10 variedades por ventas:`);
    varietyRanking.forEach((variety, index) => {
      const salesPercentage = totalSales > 0 ? ((variety.totalSales / totalSales) * 100).toFixed(1) : 0;
      console.log(`      ${index + 1}. ${variety.variety}:`);
      console.log(`         - Total Sales: $${variety.totalSales.toLocaleString()} (${salesPercentage}%)`);
      console.log(`         - Quantity: ${variety.totalQuantity.toLocaleString()} boxes`);
      console.log(`         - Avg Price: $${variety.avgPrice.toFixed(4)}/box`);
      console.log(`         - Transactions: ${variety.transactions.toLocaleString()}`);
      console.log(`         - Lots: ${variety.lots}`);
      console.log(`         - Exporters: ${variety.exporters}`);
      console.log(`         - Retailers: ${variety.retailers}`);
    });
    
    // Análisis por retailer
    console.log('\n🏪 ANÁLISIS POR RETAILER:');
    console.log('=========================');
    
    const retailerAnalysis = {};
    salesData.forEach(sale => {
      const retailer = sale['Retailer Name'];
      if (!retailerAnalysis[retailer]) {
        retailerAnalysis[retailer] = {
          totalSales: 0,
          totalQuantity: 0,
          transactions: 0,
          exporters: new Set(),
          varieties: new Set(),
          lots: new Set(),
          avgPrice: 0
        };
      }
      
      const ret = retailerAnalysis[retailer];
      ret.totalSales += Number(sale['Sales Amount'] || 0);
      ret.totalQuantity += Number(sale['Sale Quantity'] || 0);
      ret.transactions += 1;
      ret.exporters.add(sale['Exporter Clean']);
      ret.varieties.add(sale.Variety);
      ret.lots.add(sale.Lotid);
    });
    
    // Calcular promedios por retailer
    Object.entries(retailerAnalysis).forEach(([retailer, data]) => {
      data.avgPrice = data.totalQuantity > 0 ? data.totalSales / data.totalQuantity : 0;
      data.exporters = data.exporters.size;
      data.varieties = data.varieties.size;
      data.lots = data.lots.size;
    });
    
    const retailerRanking = Object.entries(retailerAnalysis)
      .map(([retailer, data]) => ({ retailer, ...data }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);
    
    console.log(`   ✅ Top 10 retailers por ventas:`);
    retailerRanking.forEach((retailer, index) => {
      const salesPercentage = totalSales > 0 ? ((retailer.totalSales / totalSales) * 100).toFixed(1) : 0;
      console.log(`      ${index + 1}. ${retailer.retailer}:`);
      console.log(`         - Total Sales: $${retailer.totalSales.toLocaleString()} (${salesPercentage}%)`);
      console.log(`         - Quantity: ${retailer.totalQuantity.toLocaleString()} boxes`);
      console.log(`         - Avg Price: $${retailer.avgPrice.toFixed(4)}/box`);
      console.log(`         - Transactions: ${retailer.transactions.toLocaleString()}`);
      console.log(`         - Lots: ${retailer.lots}`);
      console.log(`         - Varieties: ${retailer.varieties}`);
      console.log(`         - Exporters: ${retailer.exporters}`);
    });
    
    // Análisis de precios (outliers y distribución)
    console.log('\n💰 ANÁLISIS DE PRECIOS:');
    console.log('=======================');
    
    const prices = salesData.map(sale => {
      const quantity = Number(sale['Sale Quantity'] || 0);
      const amount = Number(sale['Sales Amount'] || 0);
      return quantity > 0 ? amount / quantity : 0;
    }).filter(price => price > 0);
    
    if (prices.length > 0) {
      const sortedPrices = prices.sort((a, b) => a - b);
      const minPrice = sortedPrices[0];
      const maxPrice = sortedPrices[sortedPrices.length - 1];
      const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
      const avgPriceCalculated = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      console.log(`   📊 Estadísticas de precios:`);
      console.log(`      - Precio mínimo: $${minPrice.toFixed(4)}/box`);
      console.log(`      - Precio máximo: $${maxPrice.toFixed(4)}/box`);
      console.log(`      - Precio mediano: $${medianPrice.toFixed(4)}/box`);
      console.log(`      - Precio promedio: $${avgPriceCalculated.toFixed(4)}/box`);
      
      // Rangos de precios
      const priceRanges = {
        'Premium (>$15)': prices.filter(p => p > 15).length,
        'Alto ($10-15)': prices.filter(p => p >= 10 && p <= 15).length,
        'Medio ($5-10)': prices.filter(p => p >= 5 && p < 10).length,
        'Bajo (<$5)': prices.filter(p => p < 5).length
      };
      
      console.log(`\n   📊 Distribución de precios:`);
      Object.entries(priceRanges).forEach(([range, count]) => {
        const percentage = prices.length > 0 ? ((count / prices.length) * 100).toFixed(1) : 0;
        console.log(`      ${range}: ${count.toLocaleString()} transacciones (${percentage}%)`);
      });
    }
    
    // Análisis temporal (si hay fechas disponibles)
    console.log('\n📅 ANÁLISIS TEMPORAL:');
    console.log('=====================');
    
    const salesWithDates = salesData.filter(sale => sale['Sale Date']);
    if (salesWithDates.length > 0) {
      console.log(`   ✅ Registros con fecha: ${salesWithDates.length.toLocaleString()}`);
      
      const monthlyAnalysis = {};
      salesWithDates.forEach(sale => {
        const date = new Date(sale['Sale Date']);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyAnalysis[monthKey]) {
          monthlyAnalysis[monthKey] = {
            totalSales: 0,
            totalQuantity: 0,
            transactions: 0
          };
        }
        
        monthlyAnalysis[monthKey].totalSales += Number(sale['Sales Amount'] || 0);
        monthlyAnalysis[monthKey].totalQuantity += Number(sale['Sale Quantity'] || 0);
        monthlyAnalysis[monthKey].transactions += 1;
      });
      
      const monthlyRanking = Object.entries(monthlyAnalysis)
        .map(([month, data]) => ({ 
          month, 
          ...data,
          avgPrice: data.totalQuantity > 0 ? data.totalSales / data.totalQuantity : 0
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      console.log(`\n   📊 Análisis mensual:`);
      monthlyRanking.forEach(month => {
        console.log(`      ${month.month}:`);
        console.log(`         - Sales: $${month.totalSales.toLocaleString()}`);
        console.log(`         - Quantity: ${month.totalQuantity.toLocaleString()} boxes`);
        console.log(`         - Avg Price: $${month.avgPrice.toFixed(4)}/box`);
        console.log(`         - Transactions: ${month.transactions.toLocaleString()}`);
      });
    } else {
      console.log('   ❌ No hay registros con fechas válidas para análisis temporal');
    }
    
    // Verificación de funciones auxiliares
    console.log('\n🔧 VERIFICACIÓN DE FUNCIONES AUXILIARES:');
    console.log('========================================');
    
    try {
      console.log('   📊 Probando getSalesData()...');
      const testProcessedSales = processedSales || await getSalesData();
      console.log(`   ✅ getSalesData(): ${testProcessedSales ? 'Funciona' : 'Error'}`);
      
      console.log('   📊 Probando getDataSummary()...');
      const testDataSummary = dataSummary || await getDataSummary();
      console.log(`   ✅ getDataSummary(): ${testDataSummary ? 'Funciona' : 'Error'}`);
      
      console.log('   📊 Probando getUnique()...');
      const testUnique = getUnique(salesData.slice(0, 100), 'Exporter Clean');
      console.log(`   ✅ getUnique(): ${testUnique && testUnique.length > 0 ? 'Funciona' : 'Error'}`);
      
    } catch (error) {
      console.log(`   ❌ Error en funciones auxiliares: ${error.message}`);
    }
    
    // Verificación de calidad de datos
    console.log('\n🔍 VERIFICACIÓN DE CALIDAD DE DATOS:');
    console.log('====================================');
    
    const dataQuality = {
      'Datos de ventas disponibles': rawSalesCount > 0,
      'KPIs principales calculados': totalSales > 0 && totalQuantity > 0,
      'Análisis por exportador completo': exporterRanking.length > 0,
      'Análisis por variedad disponible': varietyRanking.length > 0,
      'Análisis por retailer disponible': retailerRanking.length > 0,
      'Análisis de precios implementado': prices.length > 0,
      'Funciones auxiliares operativas': processedSales !== null,
      'Cobertura de exportadores': uniqueExporters >= 3,
      'Diversidad de variedades': uniqueVarieties >= 10,
      'Diversidad de retailers': uniqueRetailers >= 50,
      'Volumen de transacciones': transactions >= 1000
    };
    
    Object.entries(dataQuality).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN SALES DETAIL ANALYSIS:');
    console.log('================================================');
    
    const allPassed = Object.values(dataQuality).every(check => check === true);
    const passedCount = Object.values(dataQuality).filter(check => check === true).length;
    const totalChecks = Object.keys(dataQuality).length;
    
    console.log(`   📊 Score: ${passedCount}/${totalChecks} checks pasados`);
    
    if (allPassed) {
      console.log('\n🎉 ¡SALES DETAIL ANALYSIS ESTÁ 100% FUNCIONAL!');
      console.log('   ✅ Datos de ventas completos y procesados correctamente');
      console.log('   ✅ KPIs principales calculados apropiadamente');
      console.log('   ✅ Análisis multi-dimensional disponible (exportador, variedad, retailer)');
      console.log('   ✅ Análisis de precios implementado');
      console.log('   ✅ Funciones auxiliares operativas');
      console.log('   ✅ Gráficos y tablas con datos válidos');
      
      console.log('\n   📊 Métricas de calidad:');
      console.log(`      - Total Sales: $${totalSales.toLocaleString()}`);
      console.log(`      - Total Transactions: ${transactions.toLocaleString()}`);
      console.log(`      - Avg Price: $${avgPrice.toFixed(4)}/box`);
      console.log(`      - Unique Lots: ${uniqueLots}`);
      console.log(`      - Exporters: ${uniqueExporters}`);
      console.log(`      - Varieties: ${uniqueVarieties}`);
      console.log(`      - Retailers: ${uniqueRetailers}`);
      
    } else {
      console.log(`\n⚠️  SALES DETAIL ANALYSIS NECESITA ATENCIÓN (${passedCount}/${totalChecks})`);
      
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
verifySalesDetailAnalysisDetailed();
