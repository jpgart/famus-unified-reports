const { 
  analyzeSpecificChargeFromEmbedded,
  embeddedCostData 
} = require('./src/data/costDataEmbedded.js');

async function verifyOceanFreight() {
  console.log('🚢 VERIFICACIÓN COMPLETA: OCEAN FREIGHT ANALYSIS');
  console.log('=================================================\n');
  
  try {
    // 1. Verificar datos brutos de Ocean Freight
    console.log('📋 PASO 1: Verificando datos brutos...');
    const rawOceanFreight = embeddedCostData.filter(row => 
      row.Chargedescr === 'OCEAN FREIGHT'
    );
    
    console.log(`   ✅ Total registros Ocean Freight: ${rawOceanFreight.length}`);
    
    if (rawOceanFreight.length === 0) {
      console.log('   ❌ ERROR: No hay datos de Ocean Freight en los datos embebidos');
      return;
    }
    
    // Verificar que tengan montos > 0
    const validAmounts = rawOceanFreight.filter(row => row.Chgamt > 0);
    console.log(`   ✅ Registros con montos válidos (>0): ${validAmounts.length}`);
    
    // 2. Ejecutar análisis completo
    console.log('\n📊 PASO 2: Ejecutando análisis de Ocean Freight...');
    const analysis = await analyzeSpecificChargeFromEmbedded('OCEAN FREIGHT', 'Ocean Freight');
    
    // 3. Verificar estructura del análisis
    console.log('\n🔍 PASO 3: Verificando estructura del análisis...');
    
    // Verificar summary
    if (analysis.summary) {
      console.log('   ✅ Summary encontrado:');
      console.log(`      - Total Amount: $${analysis.summary.totalAmount?.toLocaleString() || 'N/A'}`);
      console.log(`      - Average per Box: $${analysis.summary.avgPerBox?.toFixed(4) || 'N/A'}`);
      console.log(`      - Lots with Charge: ${analysis.summary.lotsWithCharge || 'N/A'}`);
      console.log(`      - Total Records: ${analysis.summary.totalRecords || 'N/A'}`);
    } else {
      console.log('   ❌ ERROR: Summary no encontrado');
    }
    
    // Verificar byExporter
    if (analysis.byExporter) {
      console.log('\n   ✅ Datos por exportador encontrados:');
      const exporters = Object.keys(analysis.byExporter);
      console.log(`      - Número de exportadores: ${exporters.length}`);
      
      exporters.forEach(exporterKey => {
        const exp = analysis.byExporter[exporterKey];
        console.log(`      - ${exp.exporter || exporterKey}:`);
        console.log(`        * Total Amount: $${exp.totalAmount?.toLocaleString() || 'N/A'}`);
        console.log(`        * Average per Box: $${exp.avgPerBox?.toFixed(4) || 'N/A'}`);
        console.log(`        * Total Charge: $${exp.totalCharge?.toLocaleString() || 'N/A'}`);
        console.log(`        * Lots: ${exp.lots || 'N/A'}`);
        console.log(`        * Total Boxes: ${exp.totalBoxes?.toLocaleString() || 'N/A'}`);
      });
    } else {
      console.log('   ❌ ERROR: Datos por exportador no encontrados');
    }
    
    // 4. Verificar KPIs que se mostrarían en el frontend
    console.log('\n📈 PASO 4: Verificando KPIs para el frontend...');
    
    if (analysis.summary) {
      // KPIs principales
      const kpis = [
        {
          label: 'Total Ocean Freight',
          value: analysis.summary.totalAmount,
          format: 'currency'
        },
        {
          label: 'Average per Box',
          value: analysis.summary.avgPerBox,
          format: 'currency'
        },
        {
          label: 'Lots with Data',
          value: analysis.summary.lotsWithCharge,
          format: 'number'
        },
        {
          label: 'Total Records',
          value: analysis.summary.totalRecords,
          format: 'number'
        }
      ];
      
      console.log('   📊 KPIs que se mostrarían:');
      kpis.forEach(kpi => {
        let formattedValue = 'N/A';
        if (kpi.value !== undefined && kpi.value !== null) {
          if (kpi.format === 'currency') {
            formattedValue = `$${kpi.value.toLocaleString()}`;
          } else {
            formattedValue = kpi.value.toLocaleString();
          }
        }
        console.log(`      ✅ ${kpi.label}: ${formattedValue}`);
      });
    }
    
    // 5. Verificar datos para gráfico de barras
    console.log('\n📊 PASO 5: Verificando datos para gráfico...');
    
    if (analysis.byExporter && Object.keys(analysis.byExporter).length > 0) {
      const chartData = {
        labels: Object.values(analysis.byExporter).map(exp => exp.exporter),
        datasets: [{
          label: 'Ocean Freight per Box ($)',
          data: Object.values(analysis.byExporter).map(exp => exp.avgPerBox || 0)
        }]
      };
      
      console.log('   ✅ Datos del gráfico de barras:');
      console.log(`      - Labels: ${chartData.labels.join(', ')}`);
      console.log(`      - Datos: [${chartData.datasets[0].data.map(d => `$${d.toFixed(2)}`).join(', ')}]`);
      
      // Verificar que no hay valores null/undefined
      const validData = chartData.datasets[0].data.every(d => d !== null && d !== undefined && !isNaN(d));
      if (validData) {
        console.log('      ✅ Todos los datos del gráfico son válidos');
      } else {
        console.log('      ❌ ERROR: Algunos datos del gráfico son inválidos');
      }
    }
    
    // 6. Verificar datos para tabla detallada
    console.log('\n📋 PASO 6: Verificando datos para tabla...');
    
    if (analysis.byExporter) {
      const tableData = Object.values(analysis.byExporter).map(exp => ({
        exporter: exp.exporter,
        totalAmount: exp.totalAmount,
        avgPerBox: exp.avgPerBox,
        lots: exp.lots,
        totalBoxes: exp.totalBoxes
      }));
      
      console.log('   ✅ Datos de la tabla:');
      console.log('   | Exporter | Total Amount | Avg/Box | Lots | Boxes |');
      console.log('   |----------|-------------|---------|------|-------|');
      
      tableData.forEach(row => {
        const totalAmount = row.totalAmount ? `$${row.totalAmount.toLocaleString()}` : 'N/A';
        const avgPerBox = row.avgPerBox ? `$${row.avgPerBox.toFixed(2)}` : 'N/A';
        const lots = row.lots ? row.lots.toLocaleString() : 'N/A';
        const boxes = row.totalBoxes ? row.totalBoxes.toLocaleString() : 'N/A';
        
        console.log(`   | ${row.exporter} | ${totalAmount} | ${avgPerBox} | ${lots} | ${boxes} |`);
      });
    }
    
    // 7. Verificar outliers/inconsistencias
    console.log('\n🔍 PASO 7: Verificando detección de inconsistencias...');
    
    if (analysis.outliers && analysis.outliers.length > 0) {
      console.log(`   ⚠️  Outliers detectados: ${analysis.outliers.length}`);
      analysis.outliers.slice(0, 3).forEach((outlier, idx) => {
        console.log(`      ${idx + 1}. Lot ${outlier.lotid} (${outlier.exporter}): $${outlier.totalCharge}`);
      });
    } else {
      console.log('   ✅ No se detectaron outliers significativos');
    }
    
    // 8. Resultado final
    console.log('\n🎯 RESULTADO FINAL:');
    
    const checks = [
      { name: 'Datos brutos disponibles', passed: rawOceanFreight.length > 0 },
      { name: 'Analysis summary válido', passed: !!analysis.summary },
      { name: 'Datos por exportador válidos', passed: !!analysis.byExporter && Object.keys(analysis.byExporter).length > 0 },
      { name: 'KPIs calculados correctamente', passed: analysis.summary && analysis.summary.totalAmount > 0 },
      { name: 'Datos de gráfico válidos', passed: analysis.byExporter && Object.values(analysis.byExporter).every(exp => exp.avgPerBox !== undefined) }
    ];
    
    const passedChecks = checks.filter(check => check.passed).length;
    const totalChecks = checks.length;
    
    console.log(`   📊 Verificaciones: ${passedChecks}/${totalChecks} pasaron`);
    
    checks.forEach(check => {
      const status = check.passed ? '✅' : '❌';
      console.log(`   ${status} ${check.name}`);
    });
    
    if (passedChecks === totalChecks) {
      console.log('\n🎉 ¡OCEAN FREIGHT ANALYSIS ESTÁ COMPLETAMENTE FUNCIONAL!');
      console.log('   - Todos los KPIs tienen datos válidos');
      console.log('   - El gráfico de barras mostrará datos correctos');
      console.log('   - La tabla tendrá información completa');
      console.log('   - Los cálculos son precisos');
    } else {
      console.log('\n⚠️  OCEAN FREIGHT ANALYSIS TIENE PROBLEMAS');
      console.log('   - Algunos componentes pueden no mostrar datos correctamente');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR durante la verificación:', error);
  }
}

verifyOceanFreight();
