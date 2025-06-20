// Script para analizar la diferencia entre lots con ventas vs lots con solo costos
const fs = require('fs');

// Simular la lectura de datos de ventas (necesito hacer esto de forma manual)
// Voy a leer el archivo de ventas JavaScript para obtener los datos

const salesDataContent = fs.readFileSync('./src/data/salesDataEmbedded.js', 'utf-8');

// Extraer todos los Lotid del archivo de ventas usando regex
const lotidMatches = salesDataContent.match(/"Lotid":\s*"([^"]+)"/g);
const salesLotids = [];

if (lotidMatches) {
  lotidMatches.forEach(match => {
    const lotid = match.match(/"Lotid":\s*"([^"]+)"/)[1];
    salesLotids.push(lotid);
  });
}

const uniqueSalesLotids = [...new Set(salesLotids)];

console.log(`Total sales records: ${salesLotids.length}`);
console.log(`Unique lots with sales data: ${uniqueSalesLotids.length}`);

// Leer datos de costos
const csvContent = fs.readFileSync('./public/data/Charge Summary New.csv', 'utf-8');
const costLines = csvContent.split('\n').slice(1);
const costLotids = [];

costLines.forEach(line => {
  if (line.trim()) {
    const fields = line.split(';');
    if (fields.length >= 9) {
      const exporter = fields[1];
      const chargeType = fields[3];
      
      // Aplicar los mismos filtros que el código de producción
      if (exporter !== 'Videxport' && 
          exporter !== 'Del Monte' && 
          chargeType !== 'GROWER ADVANCES') {
        costLotids.push(fields[0]);
      }
    }
  }
});

const uniqueCostLotids = [...new Set(costLotids)];

console.log(`Unique lots with cost data (filtered): ${uniqueCostLotids.length}`);

// Encontrar intersección (lots que tienen tanto ventas como costos)
const lotsWithBothData = uniqueSalesLotids.filter(lotid => 
  uniqueCostLotids.includes(lotid)
);

console.log(`Lots with BOTH sales and cost data: ${lotsWithBothData.length}`);

// Lots que solo tienen costos (sin ventas)
const lotsWithOnlyCosts = uniqueCostLotids.filter(lotid => 
  !uniqueSalesLotids.includes(lotid)
);

console.log(`Lots with ONLY cost data (no sales): ${lotsWithOnlyCosts.length}`);

// Lots que solo tienen ventas (sin costos)
const lotsWithOnlySales = uniqueSalesLotids.filter(lotid => 
  !uniqueCostLotids.includes(lotid)
);

console.log(`Lots with ONLY sales data (no costs): ${lotsWithOnlySales.length}`);

// Calcular costos totales para lots que tienen ambos datos vs todos los lots
const allCostData = [];
costLines.forEach(line => {
  if (line.trim()) {
    const fields = line.split(';');
    if (fields.length >= 9) {
      const amount = parseFloat(fields[6].replace(',', '.')) || 0;
      const exporter = fields[1];
      const chargeType = fields[3];
      
      if (exporter !== 'Videxport' && 
          exporter !== 'Del Monte' && 
          chargeType !== 'GROWER ADVANCES') {
        allCostData.push({
          lotid: fields[0],
          amount: amount
        });
      }
    }
  }
});

// Calcular costos totales solo para lots que tienen ventas
const costsForLotsWithSales = allCostData
  .filter(row => uniqueSalesLotids.includes(row.lotid))
  .reduce((sum, row) => sum + row.amount, 0);

// Calcular costos totales para todos los lots
const costsForAllLots = allCostData
  .reduce((sum, row) => sum + row.amount, 0);

console.log(`\n=== COST TOTALS ===`);
console.log(`Costs for lots that HAVE SALES data: $${costsForLotsWithSales.toFixed(2)}`);
console.log(`Costs for ALL lots: $${costsForAllLots.toFixed(2)}`);
console.log(`Difference: $${(costsForAllLots - costsForLotsWithSales).toFixed(2)}`);

// Mostrar algunos ejemplos de lots que solo tienen costos
console.log(`\n=== SAMPLE LOTS WITH ONLY COSTS (NO SALES) ===`);
const costsOnlyBreakdown = {};
allCostData
  .filter(row => lotsWithOnlyCosts.includes(row.lotid))
  .forEach(row => {
    if (!costsOnlyBreakdown[row.lotid]) {
      costsOnlyBreakdown[row.lotid] = 0;
    }
    costsOnlyBreakdown[row.lotid] += row.amount;
  });

const sortedCostsOnly = Object.entries(costsOnlyBreakdown)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

sortedCostsOnly.forEach(([lotid, cost]) => {
  console.log(`${lotid}: $${cost.toFixed(2)}`);
});
