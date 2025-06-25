// Simple test script to verify CSV loading
const fs = require('fs');
const path = require('path');

// Read and parse the CSV file
const csvPath = path.join(__dirname, 'public/data/Initial_Stock_All.csv');

console.log('🧪 Testing CSV File Loading...');
console.log('📁 File path:', csvPath);

// Check if file exists
if (!fs.existsSync(csvPath)) {
  console.error('❌ CSV file does not exist!');
  process.exit(1);
}

// Read file
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Remove BOM if present
const cleanCsvContent = csvContent.replace(/^\uFEFF/, '');

const lines = cleanCsvContent.split('\n').filter(line => line.trim());

console.log('✅ File exists and loaded');
console.log('📊 Total lines:', lines.length);
console.log('📋 Headers:', lines[0]);
console.log('📝 First 5 data lines:');
lines.slice(1, 6).forEach((line, index) => {
  console.log(`  ${index + 1}: ${line}`);
});

// Parse and analyze data
const headers = lines[0].split(',').map(h => h.trim());
const data = lines.slice(1).map(line => {
  const values = line.split(',');
  const row = {};
  headers.forEach((header, index) => {
    const value = values[index]?.trim();
    if (header === 'Initial Stock') {
      row[header] = parseFloat(value) || 0;
    } else {
      row[header] = value || '';
    }
  });
  return row;
}).filter(row => row.Lotid);

console.log('\n📈 Data Analysis:');
console.log('📦 Total records:', data.length);
console.log('🏭 Unique exporters:', [...new Set(data.map(r => r['Exporter Clean']))].length);
console.log('📋 Unique Lotids:', [...new Set(data.map(r => r.Lotid))].length);
console.log('🌱 Unique varieties:', [...new Set(data.map(r => r.Variety))].length);

// Calculate total stock
const totalStock = data.reduce((sum, record) => sum + (record['Initial Stock'] || 0), 0);
console.log('📊 Total Initial Stock:', totalStock.toLocaleString(), 'boxes');

// Group by exporter
const byExporter = {};
data.forEach(record => {
  const exporter = record['Exporter Clean'] || 'Unknown';
  if (!byExporter[exporter]) {
    byExporter[exporter] = { 
      stock: 0, 
      records: 0, 
      lotids: new Set(),
      varieties: new Set()
    };
  }
  byExporter[exporter].stock += record['Initial Stock'] || 0;
  byExporter[exporter].records += 1;
  byExporter[exporter].lotids.add(record.Lotid);
  byExporter[exporter].varieties.add(record.Variety);
});

console.log('\n🏭 Stock by Exporter:');
Object.entries(byExporter)
  .sort(([,a], [,b]) => b.stock - a.stock)
  .forEach(([exporter, data]) => {
    console.log(`  ${exporter}: ${data.stock.toLocaleString()} boxes (${data.lotids.size} Lotids, ${data.varieties.size} varieties)`);
  });

console.log('\n✅ CSV test completed successfully!');
