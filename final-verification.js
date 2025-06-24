const { 
  calculateMetricsFromEmbedded,
  analyzeSpecificChargeFromEmbedded,
  getInitialStockAnalysisFromEmbedded,
  getTopVarietiesByStockFromEmbedded,
  getChargeDataFromEmbedded,
  clearEmbeddedDataCache
} = require('./src/data/costDataEmbedded.js');

async function finalVerification() {
  console.log('🔎 FINAL VERIFICATION - NO EXCLUDED EXPORTERS');
  console.log('===============================================\n');
  
  // Clear cache first
  clearEmbeddedDataCache();
  console.log('🧹 Cache cleared\n');
  
  const excludedExporters = ['Del Monte', 'VIDEXPORT', 'Videxport'];
  let totalChecks = 0;
  let passedChecks = 0;
  
  try {
    // Check 1: All charge types
    const chargeTypes = [
      'OCEAN FREIGHT',
      'PACKING MATERIALS',
      'COMMISSION',
      'REPACKING CHARGES',
      'HANDLING',
      'STORAGE',
      'FUMIGATION'
    ];
    
    console.log('🔍 Checking all charge types...');
    for (const chargeType of chargeTypes) {
      totalChecks++;
      const analysis = await analyzeSpecificChargeFromEmbedded(chargeType, chargeType);
      
      if (analysis.byExporter) {
        const exporters = Object.keys(analysis.byExporter);
        const hasExcluded = exporters.some(exp => excludedExporters.includes(exp));
        
        if (hasExcluded) {
          console.log(`❌ ${chargeType}: Found excluded exporters: ${exporters.filter(exp => excludedExporters.includes(exp)).join(', ')}`);
        } else {
          console.log(`✅ ${chargeType}: Clean (${exporters.length} exporters)`);
          passedChecks++;
        }
      } else {
        console.log(`⚪ ${chargeType}: No data`);
        passedChecks++; // Count as pass if no data
      }
    }
    
    // Check 2: Main metrics
    console.log('\n🔍 Checking main metrics...');
    totalChecks++;
    const metrics = await calculateMetricsFromEmbedded();
    const metricsExporters = [...new Set(Object.values(metrics).map(m => m.exporter))].filter(Boolean);
    const hasExcludedInMetrics = metricsExporters.some(exp => excludedExporters.includes(exp));
    
    if (hasExcludedInMetrics) {
      console.log(`❌ Main metrics: Found excluded exporters: ${metricsExporters.filter(exp => excludedExporters.includes(exp)).join(', ')}`);
    } else {
      console.log(`✅ Main metrics: Clean (${metricsExporters.length} exporters: ${metricsExporters.join(', ')})`);
      passedChecks++;
    }
    
    // Check 3: Stock analysis
    console.log('\n🔍 Checking stock analysis...');
    totalChecks++;
    const stockAnalysis = await getInitialStockAnalysisFromEmbedded();
    if (stockAnalysis.byExporter) {
      const stockExporters = Object.keys(stockAnalysis.byExporter);
      const hasExcludedInStock = stockExporters.some(exp => excludedExporters.includes(exp));
      
      if (hasExcludedInStock) {
        console.log(`❌ Stock analysis: Found excluded exporters: ${stockExporters.filter(exp => excludedExporters.includes(exp)).join(', ')}`);
      } else {
        console.log(`✅ Stock analysis: Clean (${stockExporters.length} exporters: ${stockExporters.join(', ')})`);
        passedChecks++;
      }
    }
    
    // Check 4: Charge data
    console.log('\n🔍 Checking raw charge data...');
    totalChecks++;
    const chargeData = await getChargeDataFromEmbedded();
    const chargeDataExporters = [...new Set(chargeData.map(c => c['Exporter Clean']))].filter(Boolean);
    const hasExcludedInChargeData = chargeDataExporters.some(exp => excludedExporters.includes(exp));
    
    if (hasExcludedInChargeData) {
      console.log(`❌ Charge data: Found excluded exporters: ${chargeDataExporters.filter(exp => excludedExporters.includes(exp)).join(', ')}`);
    } else {
      console.log(`✅ Charge data: Clean (${chargeDataExporters.length} exporters: ${chargeDataExporters.join(', ')})`);
      passedChecks++;
    }
    
    // Final result
    console.log('\n===============================================');
    console.log(`VERIFICATION COMPLETE: ${passedChecks}/${totalChecks} checks passed`);
    
    if (passedChecks === totalChecks) {
      console.log('🎉 ALL CHECKS PASSED - NO EXCLUDED EXPORTERS FOUND!');
      console.log('✅ Del Monte, VIDEXPORT, and Videxport are completely excluded');
    } else {
      console.log('❌ SOME CHECKS FAILED - Excluded exporters still present');
    }
    console.log('===============================================');
    
  } catch (error) {
    console.error('❌ Error in verification:', error);
  }
}

finalVerification();
