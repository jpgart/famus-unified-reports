// Script para verificar el cálculo manual de costos totales
const fs = require('fs');
const path = require('path');

// Leer el archivo CSV
const csvPath = path.join(__dirname, 'public', 'data', 'Charge Summary New.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parsear CSV (considerando que usa punto y coma como separador y comas decimales)
const lines = csvContent.split('\n').slice(1); // Omitir header
const data = [];

lines.forEach(line => {
  if (line.trim()) {
    const fields = line.split(';');
    if (fields.length >= 9) {
      // Convertir coma decimal a punto decimal para JavaScript
      const amount = parseFloat(fields[6].replace(',', '.')) || 0;
      
      data.push({
        lotid: fields[0],
        exporter: fields[1],
        country: fields[2],
        chargeType: fields[3],
        amount: amount
      });
    }
  }
});

console.log(`Total records in CSV: ${data.length}`);

// Filtrar datos según los criterios del Profitability Report
const filteredData = data.filter(row => 
  row.exporter !== 'Videxport' && 
  row.exporter !== 'Del Monte' &&
  row.chargeType !== 'GROWER ADVANCES'
);

console.log(`Records after filtering (excluding Videxport, Del Monte, and Grower Advances): ${filteredData.length}`);

// Calcular totales
const totalCosts = filteredData.reduce((sum, row) => sum + row.amount, 0);
const commissionTotal = filteredData
  .filter(row => row.chargeType === 'COMMISSION')
  .reduce((sum, row) => sum + row.amount, 0);

console.log(`\n=== CALCULATION RESULTS ===`);
console.log(`Total costs (including Commission, excluding Grower Advances): $${totalCosts.toFixed(2)}`);
console.log(`Commission total: $${commissionTotal.toFixed(2)}`);

// Verificar exportadores únicos
const uniqueExporters = [...new Set(data.map(row => row.exporter))];
console.log(`\nUnique exporters in data: ${uniqueExporters.join(', ')}`);

// Verificar tipos de cargos únicos
const uniqueChargeTypes = [...new Set(data.map(row => row.chargeType))];
console.log(`\nUnique charge types: ${uniqueChargeTypes.join(', ')}`);

// Breakdown by exporter (excluding filtered ones)
const exporterBreakdown = {};
filteredData.forEach(row => {
  if (!exporterBreakdown[row.exporter]) {
    exporterBreakdown[row.exporter] = 0;
  }
  exporterBreakdown[row.exporter] += row.amount;
});

console.log(`\n=== BREAKDOWN BY EXPORTER ===`);
Object.entries(exporterBreakdown)
  .sort((a, b) => b[1] - a[1])
  .forEach(([exporter, total]) => {
    console.log(`${exporter}: $${total.toFixed(2)}`);
  });
