# Verification Directory

Contains scripts for verifying data consistency and report accuracy.

## Files Overview

### Core Verification
- `verify-full-report.js` - Complete report verification
- `verify-complete-analysis.js` - Comprehensive analysis verification

### Consistency Checks
- `verify-external-consistency-detailed.js` - External data consistency
- `verify-internal-consistency-detailed.js` - Internal data consistency
- `verify-external-consistency-detailed-fixed.js` - Fixed external consistency
- `verify-internal-consistency-detailed-fixed.js` - Fixed internal consistency

### Specific Analysis
- `verify-inventory-analysis-detailed.js` - Inventory analysis verification
- `verify-profitability-analysis-detailed.js` - Profitability analysis verification
- `verify-sales-detail-analysis-detailed.js` - Sales detail verification
- `verify-packing-materials-detailed.js` - Packing materials verification
- `verify-repacking-detailed.js` - Repacking analysis verification

### Other Verifications
- `verify-ocean-freight.js` - Ocean freight verification
- `verify-ocean-freight-detailed.js` - Detailed ocean freight verification
- `verify-all-charge-types.js` - All charge types verification
- `verify-ui-consistency-updates.js` - UI consistency verification

## Usage

Run from project root:

```bash
node scripts/verification/verify-full-report.js
```
