const fs = require('fs');
const path = require('path');

console.log('🔧 Cleaning embedded data file...');

// Read the current file
const filePath = path.join(__dirname, 'src/data/costDataEmbedded.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('📁 Original file size:', content.length, 'characters');

// Clean problematic characters
let cleaned = content
  // Fix carriage return character in property names
  .replace(/"Cost per Box\\r"/g, '"Cost per Box"')
  // Ensure proper line endings
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n')
  // Clean any other potential issues
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

console.log('🧹 Cleaned file size:', cleaned.length, 'characters');

if (cleaned !== content) {
  console.log('✨ Found and cleaned problematic characters');
  
  // Write the cleaned file
  fs.writeFileSync(filePath, cleaned, 'utf8');
  console.log('✅ File cleaned and saved');
} else {
  console.log('✅ File was already clean');
}

console.log('🔍 Verifying file integrity...');

// Verify the file can be parsed
try {
  require(filePath);
  console.log('✅ File can be imported successfully');
} catch (error) {
  console.error('❌ File import error:', error.message);
}
