// Script para verificar la discrepancia entre lots con ventas vs solo costos
const fs = require('fs');
const path = require('path');

// Función para simular el procesamiento de datos de profitabilidad
function loadSalesData() {
  // Simular la carga de datos de ventas (estos serían los datos reales de salesDataEmbedded.js)
  // Como no tengo acceso directo, voy a analizar los lots únicos del CSV de costos
  return [];
}

// Leer el archivo CSV de costos
const csvPath = path.join(__dirname, 'public', 'data', 'Charge Summary New.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parsear CSV de costos
const costLines = csvContent.split('\n').slice(1);
const costData = [];

costLines.forEach(line => {
  if (line.trim()) {
    const fields = line.split(';');
    if (fields.length >= 9) {
      const amount = parseFloat(fields[6].replace(',', '.')) || 0;
      
      costData.push({
        lotid: fields[0],
        exporter: fields[1],
        chargeType: fields[3],
        amount: amount
      });
    }
  }
});

// Filtrar datos de costos (excluyendo Videxport, Del Monte, y Grower Advances)
const filteredCostData = costData.filter(row => 
  row.exporter !== 'Videxport' && 
  row.exporter !== 'Del Monte' &&
  row.chargeType !== 'GROWER ADVANCES'
);

// Obtener lots únicos con costos
const lotsWithCosts = [...new Set(filteredCostData.map(row => row.lotid))];

// Calcular total de costos por lot
const costsByLot = {};
filteredCostData.forEach(row => {
  if (!costsByLot[row.lotid]) {
    costsByLot[row.lotid] = 0;
  }
  costsByLot[row.lotid] += row.amount;
});

console.log(`\n=== COST DATA ANALYSIS ===`);
console.log(`Total unique lots with cost data: ${lotsWithCosts.length}`);
console.log(`Total cost records (filtered): ${filteredCostData.length}`);

// Calcular total de todos los costos
const totalAllCosts = Object.values(costsByLot).reduce((sum, cost) => sum + cost, 0);
console.log(`Total costs for ALL lots with cost data: $${totalAllCosts.toFixed(2)}`);

// Mostrar algunos ejemplos de lots con sus costos totales
console.log(`\n=== SAMPLE LOTS WITH COSTS ===`);
const sortedLots = Object.entries(costsByLot)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

sortedLots.forEach(([lotid, totalCost]) => {
  console.log(`${lotid}: $${totalCost.toFixed(2)}`);
});

// Verificar si hay lots con costos negativos o cero
const lotsWithZeroCosts = Object.entries(costsByLot).filter(([_, cost]) => cost <= 0);
console.log(`\nLots with zero or negative costs: ${lotsWithZeroCosts.length}`);
if (lotsWithZeroCosts.length > 0) {
  lotsWithZeroCosts.forEach(([lotid, cost]) => {
    console.log(`${lotid}: $${cost.toFixed(2)}`);
  });
}
