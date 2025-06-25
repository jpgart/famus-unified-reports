#!/usr/bin/env node

/**
 * FAMUS UNIFIED REPORTS - NAVIGATION TEST SCRIPT
 * =============================================
 * 
 * Este script verifica que la navegación por submenús funcione correctamente
 * en todos los reportes. Ayuda a prevenir regresiones en la funcionalidad.
 * 
 * Usage: node scripts/tests/test-navigation.js
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../../src/components/reports');
const NAVIGATION_FILE = path.join(__dirname, '../../src/components/common/Navigation.jsx');

console.log('🔍 TESTING NAVIGATION SYSTEM');
console.log('============================\n');

// Expected navigation sections from Navigation.jsx
const expectedSections = {
  sales: ['KPIs', 'Key Insights', 'Exporter Comparator', 'Sales by Variety', 'Sales Timeline', 'Price History Retailer', 'Price History Exporter', 'Heatmap Retailer vs Variety', 'Heatmap Exporter vs Retailer', 'Exporter-Retailer Analysis', 'Ranking Retailers', 'Ranking Exporters', 'Sales by Retailer/Exporter/Variety/Size', 'Price Alerts by Variety'],
  cost: ['KPIs', 'Key Insights', 'Exporter Comparator', 'Outlier Analysis', 'Grower Advances', 'Ocean Freight', 'Packing Materials', 'Internal Consistency', 'External Consistency', 'Final Tables', 'Summary Table'],
  profitability: ['KPIs', 'Top Performers', 'Variety Analysis', 'Exporter Analysis'],
  inventory: ['Initial Stock', 'Variety Details', 'Exporter Analysis', 'Monthly Distribution']
};

// Report files to check
const reportFiles = {
  sales: 'SalesDetailReport.jsx',
  cost: 'CostConsistencyReport.jsx', 
  profitability: 'ProfitabilityReport.jsx',
  inventory: 'InventoryReport.jsx'
};

let totalErrors = 0;

function checkReportNavigation(reportName, fileName) {
  console.log(`📋 Checking ${reportName} report...`);
  
  const filePath = path.join(REPORTS_DIR, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${fileName}`);
    totalErrors++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const expectedSectionsForReport = expectedSections[reportName];
  
  // Check 1: Component accepts onRefsUpdate prop
  const hasOnRefsUpdateProp = content.includes('({ onRefsUpdate })') || content.includes('{ onRefsUpdate }');
  if (!hasOnRefsUpdateProp) {
    console.log(`❌ ${reportName}: Missing onRefsUpdate prop`);
    totalErrors++;
  } else {
    console.log(`✅ ${reportName}: Has onRefsUpdate prop`);
  }
  
  // Check 2: Has useRef import
  const hasUseRefImport = content.includes('useRef');
  if (!hasUseRefImport) {
    console.log(`❌ ${reportName}: Missing useRef import`);
    totalErrors++;
  } else {
    console.log(`✅ ${reportName}: Has useRef import`);
  }
  
  // Check 3: Has sectionRefs definition
  const hasSectionRefs = content.includes('sectionRefs');
  if (!hasSectionRefs) {
    console.log(`❌ ${reportName}: Missing sectionRefs definition`);
    totalErrors++;
  } else {
    console.log(`✅ ${reportName}: Has sectionRefs definition`);
  }
  
  // Check 4: Calls onRefsUpdate
  const callsOnRefsUpdate = content.includes('onRefsUpdate(');
  if (!callsOnRefsUpdate) {
    console.log(`❌ ${reportName}: Doesn't call onRefsUpdate`);
    totalErrors++;
  } else {
    console.log(`✅ ${reportName}: Calls onRefsUpdate`);
  }
  
  // Check 5: Has refs attached to DOM elements
  let refsInDom = 0;
  expectedSectionsForReport.forEach(section => {
    if (content.includes(`ref={sectionRefs['${section}']}`)) {
      refsInDom++;
    }
  });
  
  console.log(`📊 ${reportName}: ${refsInDom}/${expectedSectionsForReport.length} refs found in DOM`);
  
  if (refsInDom < expectedSectionsForReport.length) {
    console.log(`⚠️  ${reportName}: Some refs may be missing from DOM elements`);
  }
  
  console.log('');
}

// Run tests for each report
Object.entries(reportFiles).forEach(([reportName, fileName]) => {
  checkReportNavigation(reportName, fileName);
});

// Check Navigation.jsx structure
console.log('🧭 Checking Navigation.jsx structure...');
if (fs.existsSync(NAVIGATION_FILE)) {
  const navContent = fs.readFileSync(NAVIGATION_FILE, 'utf8');
  
  // Check if handleSectionClick exists
  if (navContent.includes('handleSectionClick')) {
    console.log('✅ Navigation: Has handleSectionClick function');
  } else {
    console.log('❌ Navigation: Missing handleSectionClick function');
    totalErrors++;
  }
  
  // Check if it calls onSectionScroll
  if (navContent.includes('onSectionScroll(')) {
    console.log('✅ Navigation: Calls onSectionScroll');
  } else {
    console.log('❌ Navigation: Doesn\'t call onSectionScroll');
    totalErrors++;
  }
} else {
  console.log('❌ Navigation.jsx file not found');
  totalErrors++;
}

console.log('\n🏁 TEST RESULTS');
console.log('==============');

if (totalErrors === 0) {
  console.log('✅ All navigation tests passed!');
  console.log('🎉 Navigation system should work correctly.');
} else {
  console.log(`❌ Found ${totalErrors} issues with navigation system.`);
  console.log('🔧 Please fix these issues to ensure navigation works properly.');
}

process.exit(totalErrors > 0 ? 1 : 0);
