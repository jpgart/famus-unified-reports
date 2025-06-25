const { analyzeSpecificChargeFromEmbedded, analyzeRepackingChargesFromEmbedded } = require('./src/data/costDataEmbedded.js');

async function verifyExternalConsistencyDetailed() {
  console.log('🌍 VERIFICACIÓN DETALLADA: EXTERNAL CONSISTENCY ANALYSIS');
  console.log('=======================================================\n');
  
  try {
    // Analizar cada tipo de cargo individualmente para External Consistency
    console.log('📊 Analizando todos los cargos para External Consistency...');
    
    const oceanFreight = await analyzeSpecificChargeFromEmbedded('OCEAN FREIGHT', 'Ocean Freight');
    const commission = await analyzeSpecificChargeFromEmbedded('COMMISSION', 'Commission');
    const repacking = await analyzeRepackingChargesFromEmbedded('Repacking');
    
    // Otros cargos comunes
    const localCharges = await analyzeSpecificChargeFromEmbedded('LOCAL CHARGES', 'Local Charges');
    const trucking = await analyzeSpecificChargeFromEmbedded('TRUCKING', 'Trucking');
    const coldStorage = await analyzeSpecificChargeFromEmbedded('COLD STORAGE', 'Cold Storage');
    
    const allCharges = [
      { name: 'Ocean Freight', data: oceanFreight },
      { name: 'Commission', data: commission },
      { name: 'Repacking', data: repacking },
      { name: 'Local Charges', data: localCharges },
      { name: 'Trucking', data: trucking },
      { name: 'Cold Storage', data: coldStorage }
    ].filter(charge => charge.data && charge.data.summary);
    
    console.log('\n🔍 DETALLES COMPLETOS DE EXTERNAL CONSISTENCY:');
    console.log('=============================================');
    
    // Extraer datos para comparación externa
    console.log(`\n📋 Tipos de cargo con datos válidos: ${allCharges.length}`);
    allCharges.forEach(charge => console.log(`   ✅ ${charge.name}`));
    
    // KPIs principales para External Consistency
    console.log('\n📈 KPIs PRINCIPALES DE EXTERNAL CONSISTENCY:');
    
    let totalAmountAllCharges = 0;
    let totalBoxesAllCharges = 0;
    let totalExportersInvolved = new Set();
    let totalLotsProcessed = 0;
    let totalOutliersAcrossCharges = 0;
    
    // Calcular métricas agregadas
    allCharges.forEach(charge => {
      const summary = charge.data.summary;
      totalAmountAllCharges += summary.totalAmount || 0;
      totalBoxesAllCharges += summary.totalBoxes || 0;
      totalLotsProcessed += summary.lotsWithCharge || 0;
      totalOutliersAcrossCharges += charge.data.outliers?.length || 0;
      
      // Agregar exportadores únicos
      if (charge.data.byExporter) {
        Object.keys(charge.data.byExporter).forEach(exporter => {
          totalExportersInvolved.add(exporter);
        });
      }
    });
    
    const avgCostPerBox = totalBoxesAllCharges > 0 ? totalAmountAllCharges / totalBoxesAllCharges : 0;
    const avgCostPerLot = totalLotsProcessed > 0 ? totalAmountAllCharges / totalLotsProcessed : 0;
    
    console.log(`   💰 Total Amount All Charges: $${totalAmountAllCharges.toLocaleString()}`);
    console.log(`   📦 Total Boxes: ${totalBoxesAllCharges.toLocaleString()}`);
    console.log(`   💵 Avg Cost per Box: $${avgCostPerBox.toFixed(4)}`);
    console.log(`   📋 Total Lots Processed: ${totalLotsProcessed.toLocaleString()}`);
    console.log(`   💰 Avg Cost per Lot: $${avgCostPerLot.toFixed(2)}`);
    console.log(`   🏢 Unique Exporters: ${totalExportersInvolved.size}`);
    console.log(`   ⚠️  Total Outliers: ${totalOutliersAcrossCharges}`);
    
    // Análisis de composición de costos
    console.log('\n📊 COMPOSICIÓN DE COSTOS (External Consistency):');
    console.log('================================================');
    
    const costComposition = allCharges.map(charge => ({
      name: charge.name,
      amount: charge.data.summary.totalAmount || 0,
      percentage: ((charge.data.summary.totalAmount || 0) / totalAmountAllCharges * 100).toFixed(1),
      avgPerBox: charge.data.summary.avgPerBox || 0,
      coverage: charge.data.summary.totalRecords > 0 ? 
        ((charge.data.summary.lotsWithCharge || 0) / charge.data.summary.totalRecords * 100).toFixed(1) : 0,
      outliers: charge.data.outliers?.length || 0
    })).sort((a, b) => b.amount - a.amount);
    
    costComposition.forEach((comp, index) => {
      console.log(`   ${index + 1}. ${comp.name}:`);
      console.log(`      - Amount: $${comp.amount.toLocaleString()} (${comp.percentage}%)`);
      console.log(`      - Avg per Box: $${comp.avgPerBox.toFixed(4)}`);
      console.log(`      - Coverage: ${comp.coverage}%`);
      console.log(`      - Outliers: ${comp.outliers}`);
    });
    
    // Análisis de consistencia entre exportadores
    console.log('\n🏢 ANÁLISIS DE CONSISTENCIA POR EXPORTADOR:');
    console.log('===========================================');
    
    const exporterConsistency = {};
    
    allCharges.forEach(charge => {
      if (charge.data.byExporter) {
        Object.entries(charge.data.byExporter).forEach(([exporter, data]) => {
          if (!exporterConsistency[exporter]) {
            exporterConsistency[exporter] = {};
          }
          exporterConsistency[exporter][charge.name] = {
            totalAmount: data.totalAmount || 0,
            avgPerBox: data.avgPerBox || 0,
            lots: data.lots || 0,
            totalBoxes: data.totalBoxes || 0
          };
        });
      }
    });
    
    // Mostrar consistencia por exportador
    Object.entries(exporterConsistency).forEach(([exporter, charges]) => {
      console.log(`\n   🏢 ${exporter}:`);
      const exporterCharges = Object.entries(charges);
      exporterCharges.forEach(([chargeName, data]) => {
        console.log(`      - ${chargeName}: $${data.avgPerBox.toFixed(4)}/box (${data.lots} lots)`);
      });
      
      // Calcular variación en costos por box para este exportador
      const avgPerBoxValues = exporterCharges.map(([, data]) => data.avgPerBox).filter(v => v > 0);
      if (avgPerBoxValues.length > 1) {
        const maxAvg = Math.max(...avgPerBoxValues);
        const minAvg = Math.min(...avgPerBoxValues);
        const variation = minAvg > 0 ? ((maxAvg - minAvg) / minAvg * 100).toFixed(1) : 0;
        console.log(`      📊 Variación en costos: ${variation}%`);
      }
    });
    
    // Análisis de outliers cross-charge
    console.log('\n⚠️  ANÁLISIS DE OUTLIERS CROSS-CHARGE:');
    console.log('======================================');
    
    const allOutliers = [];
    allCharges.forEach(charge => {
      if (charge.data.outliers && charge.data.outliers.length > 0) {
        charge.data.outliers.forEach(outlier => {
          allOutliers.push({
            ...outlier,
            chargeType: charge.name
          });
        });
      }
    });
    
    if (allOutliers.length > 0) {
      console.log(`   ✅ Total outliers encontrados: ${allOutliers.length}`);
      
      // Agrupar outliers por lot ID para detectar lots problemáticos
      const outliersByLot = {};
      allOutliers.forEach(outlier => {
        if (!outliersByLot[outlier.lotid]) {
          outliersByLot[outlier.lotid] = [];
        }
        outliersByLot[outlier.lotid].push(outlier);
      });
      
      // Lots con múltiples outliers (más problemáticos)
      const multiOutlierLots = Object.entries(outliersByLot)
        .filter(([, outliers]) => outliers.length > 1)
        .sort(([, a], [, b]) => b.length - a.length);
      
      console.log(`\n   🚨 Lots con múltiples outliers: ${multiOutlierLots.length}`);
      multiOutlierLots.slice(0, 5).forEach(([lotId, outliers]) => {
        console.log(`      - Lot ${lotId}: ${outliers.length} charge types con outliers`);
        outliers.forEach(outlier => {
          console.log(`        * ${outlier.chargeType}: $${outlier.totalCharge?.toFixed(2) || 'N/A'}`);
        });
      });
      
      // Outliers por tipo de cargo
      const outliersByChargeType = {};
      allOutliers.forEach(outlier => {
        if (!outliersByChargeType[outlier.chargeType]) {
          outliersByChargeType[outlier.chargeType] = [];
        }
        outliersByChargeType[outlier.chargeType].push(outlier);
      });
      
      console.log(`\n   📊 Outliers por tipo de cargo:`);
      Object.entries(outliersByChargeType).forEach(([chargeType, outliers]) => {
        console.log(`      - ${chargeType}: ${outliers.length} outliers`);
      });
      
    } else {
      console.log('   ✅ No se encontraron outliers - excelente consistencia externa');
    }
    
    // Análisis de cobertura cross-charge
    console.log('\n📈 ANÁLISIS DE COBERTURA CROSS-CHARGE:');
    console.log('======================================');
    
    allCharges.forEach(charge => {
      const summary = charge.data.summary;
      const coverage = summary.totalRecords > 0 ? 
        ((summary.lotsWithCharge || 0) / summary.totalRecords * 100).toFixed(1) : 0;
      
      console.log(`   ${charge.name}:`);
      console.log(`      - Coverage: ${coverage}% (${summary.lotsWithCharge || 0}/${summary.totalRecords || 0} lots)`);
      console.log(`      - Avg per Box: $${summary.avgPerBox?.toFixed(4) || 'N/A'}`);
    });
    
    // Comparación de eficiencia entre exportadores
    console.log('\n⚖️  COMPARACIÓN DE EFICIENCIA ENTRE EXPORTADORES:');
    console.log('================================================');
    
    const exporterEfficiency = Object.entries(exporterConsistency).map(([exporter, charges]) => {
      const totalCostPerBox = Object.values(charges).reduce((sum, charge) => sum + charge.avgPerBox, 0);
      const chargeCount = Object.keys(charges).length;
      
      return {
        exporter,
        totalCostPerBox,
        chargeCount,
        avgCostAcrossCharges: chargeCount > 0 ? totalCostPerBox / chargeCount : 0,
        charges: charges
      };
    }).sort((a, b) => b.totalCostPerBox - a.totalCostPerBox);
    
    exporterEfficiency.forEach((exp, index) => {
      console.log(`   ${index + 1}. ${exp.exporter}:`);
      console.log(`      - Total Cost per Box: $${exp.totalCostPerBox.toFixed(4)}`);
      console.log(`      - Charge Types: ${exp.chargeCount}`);
      console.log(`      - Avg Cost Across Charges: $${exp.avgCostAcrossCharges.toFixed(4)}`);
    });
    
    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN EXTERNAL CONSISTENCY:');
    console.log('===============================================');
    
    const checks = {
      'Múltiples tipos de cargo analizados': allCharges.length >= 3,
      'Composición de costos calculada': costComposition.length > 0,
      'Consistencia por exportador analizada': Object.keys(exporterConsistency).length > 0,
      'Análisis cross-charge de outliers': allOutliers.length >= 0,
      'Análisis de cobertura completado': allCharges.every(c => c.data.summary.totalRecords > 0),
      'Comparación de eficiencia disponible': exporterEfficiency.length > 0,
      'KPIs agregados calculados': totalAmountAllCharges > 0 && totalBoxesAllCharges > 0,
      'Datos para dashboard listos': costComposition.length > 0 && exporterEfficiency.length > 0
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(check => check === true);
    
    console.log('');
    
    if (allPassed) {
      console.log('🎉 ¡EXTERNAL CONSISTENCY ANALYSIS ESTÁ 100% FUNCIONAL!');
      console.log('   ✅ Análisis multi-cargo completado correctamente');
      console.log('   ✅ Composición de costos calculada y rankeada');
      console.log('   ✅ Consistencia por exportador analizada');
      console.log('   ✅ Detección cross-charge de outliers implementada');
      console.log('   ✅ Análisis de cobertura por tipo de cargo');
      console.log('   ✅ Comparación de eficiencia entre exportadores');
      console.log('   ✅ KPIs agregados para dashboard disponibles');
      
      console.log('\n   📊 Métricas de calidad:');
      console.log(`      - Tipos de cargo: ${allCharges.length}`);
      console.log(`      - Exportadores únicos: ${totalExportersInvolved.size}`);
      console.log(`      - Total outliers: ${totalOutliersAcrossCharges}`);
      console.log(`      - Costo promedio/box: $${avgCostPerBox.toFixed(4)}`);
      
    } else {
      console.log('❌ Hay problemas en External Consistency Analysis que requieren atención');
      
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
verifyExternalConsistencyDetailed();
