#!/usr/bin/env node

/**
 * Verification Script - UI Consistency Updates
 * 
 * Verifies that all the requested UI consistency changes have been applied:
 * 1. ✅ All reports have "📊 KPIs" title instead of custom dashboard titles
 * 2. ✅ All reports have consistent subtitle format
 * 3. ✅ All KPI cards have consistent icons (💰📦⭐🏪🚢🍇)
 * 4. ✅ All reports have legends below the KPI section
 * 5. ✅ All reports have filters positioned after KPIs
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFYING UI CONSISTENCY UPDATES...\n');

// Files to check
const reportFiles = [
  'src/components/reports/SalesDetailReport.jsx',
  'src/components/reports/CostConsistencyReport.jsx', 
  'src/components/reports/ProfitabilityReport.jsx',
  'src/components/reports/InventoryReport.jsx'
];

const kpiSectionFile = 'src/components/common/KPISection.jsx';

let allChecksPass = true;
const results = {
  titleStandardization: { pass: 0, fail: 0, details: [] },
  subtitleImplementation: { pass: 0, fail: 0, details: [] },
  iconConsistency: { pass: 0, fail: 0, details: [] },
  legendPresence: { pass: 0, fail: 0, details: [] },
  filterPositioning: { pass: 0, fail: 0, details: [] }
};

// Check 1: KPISection supports subtitle prop
console.log('📋 CHECK 1: KPISection Component Subtitle Support');
try {
  const kpiSectionContent = fs.readFileSync(kpiSectionFile, 'utf8');
  
  if (kpiSectionContent.includes('subtitle = null') && 
      kpiSectionContent.includes('{subtitle && (')) {
    console.log('   ✅ KPISection now supports subtitle prop');
    results.subtitleImplementation.pass++;
  } else {
    console.log('   ❌ KPISection does not properly support subtitle');
    results.subtitleImplementation.fail++;
    allChecksPass = false;
  }
} catch (error) {
  console.log(`   ❌ Error reading KPISection file: ${error.message}`);
  results.subtitleImplementation.fail++;
  allChecksPass = false;
}

// Check 2-6: Individual Report Analysis
reportFiles.forEach((file, index) => {
  const reportName = path.basename(file, '.jsx');
  console.log(`\n📋 CHECK ${index + 2}: Analyzing ${reportName}...`);
  
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for standardized KPI title
    const hasStandardTitle = content.includes('title="📊 KPIs"');
    if (hasStandardTitle) {
      console.log('   ✅ Has standardized "📊 KPIs" title');
      results.titleStandardization.pass++;
    } else {
      console.log('   ❌ Does not have standardized KPI title');
      results.titleStandardization.fail++;
      results.titleStandardization.details.push(reportName);
      allChecksPass = false;
    }
    
    // Check for subtitle implementation
    const hasSubtitle = content.includes('subtitle="Key Performance Indicators');
    if (hasSubtitle) {
      console.log('   ✅ Has standardized subtitle format');
      results.subtitleImplementation.pass++;
    } else {
      console.log('   ❌ Missing standardized subtitle');
      results.subtitleImplementation.fail++;
      results.subtitleImplementation.details.push(reportName);
      allChecksPass = false;
    }
    
    // Check for consistent KPI icons
    const standardIcons = ['💰', '📦', '⭐', '🏪', '🚢', '🍇'];
    const hasConsistentIcons = standardIcons.some(icon => content.includes(`icon: '${icon}'`));
    if (hasConsistentIcons) {
      console.log('   ✅ Has consistent KPI icons');
      results.iconConsistency.pass++;
    } else {
      console.log('   ❌ Missing consistent KPI icons');
      results.iconConsistency.fail++;
      results.iconConsistency.details.push(reportName);
      allChecksPass = false;
    }
    
    // Check for legend presence
    const hasLegend = content.includes('Analysis Methodology') && 
                     content.includes('bg-blue-50 border border-blue-200');
    if (hasLegend) {
      console.log('   ✅ Has analysis methodology legend');
      results.legendPresence.pass++;
    } else {
      console.log('   ❌ Missing analysis methodology legend');
      results.legendPresence.fail++;
      results.legendPresence.details.push(reportName);
      allChecksPass = false;
    }
    
    // Check for filter positioning (after KPIs)
    const kpiSectionIndex = content.indexOf('<KPISection');
    const filterIndex = content.indexOf('Filter by');
    const hasCorrectFilterPosition = kpiSectionIndex > -1 && filterIndex > kpiSectionIndex;
    
    if (hasCorrectFilterPosition || !content.includes('Filter by')) {
      console.log('   ✅ Filter positioned correctly (after KPIs) or not applicable');
      results.filterPositioning.pass++;
    } else {
      console.log('   ❌ Filter not positioned after KPIs');
      results.filterPositioning.fail++;
      results.filterPositioning.details.push(reportName);
      allChecksPass = false;
    }
    
  } catch (error) {
    console.log(`   ❌ Error reading ${reportName}: ${error.message}`);
    allChecksPass = false;
  }
});

// Summary Report
console.log('\n' + '='.repeat(60));
console.log('📊 UI CONSISTENCY VERIFICATION SUMMARY');
console.log('='.repeat(60));

console.log(`\n🎯 Title Standardization: ${results.titleStandardization.pass}/${reportFiles.length} reports`);
if (results.titleStandardization.details.length > 0) {
  console.log(`   Missing: ${results.titleStandardization.details.join(', ')}`);
}

console.log(`\n📝 Subtitle Implementation: ${results.subtitleImplementation.pass}/${reportFiles.length + 1} components`);
if (results.subtitleImplementation.details.length > 0) {
  console.log(`   Missing: ${results.subtitleImplementation.details.join(', ')}`);
}

console.log(`\n🎨 Icon Consistency: ${results.iconConsistency.pass}/${reportFiles.length} reports`);
if (results.iconConsistency.details.length > 0) {
  console.log(`   Missing: ${results.iconConsistency.details.join(', ')}`);
}

console.log(`\n📋 Legend Presence: ${results.legendPresence.pass}/${reportFiles.length} reports`);
if (results.legendPresence.details.length > 0) {
  console.log(`   Missing: ${results.legendPresence.details.join(', ')}`);
}

console.log(`\n🔄 Filter Positioning: ${results.filterPositioning.pass}/${reportFiles.length} reports`);
if (results.filterPositioning.details.length > 0) {
  console.log(`   Incorrect: ${results.filterPositioning.details.join(', ')}`);
}

// Final Status
console.log('\n' + '='.repeat(60));
if (allChecksPass) {
  console.log('🎉 ALL UI CONSISTENCY CHECKS PASSED!');
  console.log('✅ All reports now have consistent:');
  console.log('   • Standardized "📊 KPIs" titles');
  console.log('   • Descriptive subtitles');
  console.log('   • Consistent emoji icons');
  console.log('   • Analysis methodology legends');
  console.log('   • Proper filter positioning');
} else {
  console.log('⚠️  SOME CHECKS FAILED - See details above');
}

console.log('='.repeat(60));

process.exit(allChecksPass ? 0 : 1);
