# Debug Directory

Contains debugging and troubleshooting scripts for development.

## Files Overview

- `debug-charge-types.js` - Debug charge type issues (2.8KB)
- `debug-charge-types2.js` - Alternative charge type debugging (2.9KB)
- `debug-dashboard.js` - Debug dashboard functionality (3.5KB)
- `debug-frontend-complete.js` - Complete frontend debugging (5.9KB)
- `debug-ocean-freight.js` - Debug ocean freight calculations (3.4KB)
- `debug-specific-charge.js` - Debug specific charge issues (3.3KB)

## Usage

Run from project root:

```bash
# Using npm scripts (recommended)
npm run debug:charges    # Debug charge types

# Or run directly
node scripts/debug/debug-charge-types.js
```

## Purpose

These scripts help diagnose and troubleshoot specific issues during development. They provide detailed output for debugging data processing, calculations, and UI components.
