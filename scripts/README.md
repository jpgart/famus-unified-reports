# Scripts Directory

This directory contains all project scripts organized by purpose.

## Directory Structure

- **`tests/`** - Testing scripts and test utilities
- **`verification/`** - Data verification and validation scripts  
- **`debug/`** - Debugging and troubleshooting scripts
- **`build/`** - Build, analysis, and data processing scripts

## Usage

All scripts should be run from the project root directory:

```bash
# Run tests
node scripts/tests/test-data.js

# Run verification
node scripts/verification/verify-full-report.js

# Run debug tools
node scripts/debug/debug-charge-types.js

# Run build tools
node scripts/build/clean-data.js
```

## Best Practices

- Keep scripts focused on a single responsibility
- Use descriptive names indicating the script's purpose
- Document any dependencies or requirements
- Follow the existing naming conventions
