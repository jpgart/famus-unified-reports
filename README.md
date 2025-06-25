# 🚀 Famus Unified Reports v3.0

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/jpgart/famus-unified-reports)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://jpgart.github.io/famus-unified-reports/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A comprehensive React-based dashboard for analyzing fruit import operations, providing detailed insights into inventory, costs, sales, and profitability metrics across four integrated report modules. Now with enhanced UI, performance optimizations, and modern development standards.

## ✨ What's New in v3.0

### 🎨 **Enhanced User Experience**
- **Modern Color System** - Extended palette with accessibility features
- **Loading States** - Professional loading indicators and fallback UI
- **Error Handling** - Robust error boundaries with user-friendly messages
- **Performance Monitoring** - Built-in performance tracking and optimization

### 🛡️ **Production Ready**
- **Global Error Handling** - Comprehensive error catching and reporting
- **SEO Optimized** - Complete meta tags, Open Graph, and Twitter Cards
- **Asset Optimization** - Webpack configured for optimal production builds
- **Logo Display** - Fixed logo rendering with proper asset copying

### �️ **Technical Improvements**
- **Modern CSS Variables** - Comprehensive design system with CSS custom properties
- **Utility Functions** - Enhanced color manipulation and accessibility tools
- **Build Optimization** - cssnano for production, JIT mode for Tailwind
- **Developer Experience** - Improved debugging, testing, and verification tools

## �🎯 Core Features

### 📦 **Inventory Report**
- Initial stock analysis by exporter and variety
- Stock distribution metrics and composition breakdowns
- Real-time inventory KPI tracking with modern indicators
- Comprehensive stock level insights with enhanced visualizations

### 💰 **Cost Consistency Report**
- Operational cost analysis across exporters with improved accuracy
- Ocean freight and packing materials analysis with advanced filtering
- Enhanced outlier detection with statistical modeling
- Internal and external consistency checks with better error handling
- Final cost analysis with detailed comparisons and insights

### 📊 **Sales Detail Report** 
- Interactive sales analytics with enhanced KPI cards
- Dynamic filtering by exporter, retailer, and time periods
- Real-time data visualization with zoom, pan, and export capabilities
- Comprehensive sales trends with performance monitoring

### 💹 **Profitability Analysis Report**
- Advanced ROI calculations and profit margin analysis
- Performance rankings with interactive comparisons
- Cost vs. revenue analysis with Commission calculations
- Profitability trends with predictive insights

### 🎨 **Unified Experience v3.0**
- Seamless navigation between all four reports
- Modern design system with extended Famus branding
- Professional styling with enhanced accessibility
- Fully responsive design optimized for all devices
- **New**: Glass effects, gradients, and modern UI components

## 🏗️ **Architecture v3.0**

```
famus-unified-reports/
├── src/
│   ├── components/
│   │   ├── common/          # Shared UI components with modern styling
│   │   ├── reports/         # Report-specific components (enhanced)
│   │   └── charts/          # Chart components with v3.0 config
│   ├── data/               # Embedded data files (optimized)
│   ├── utils/              # Enhanced utility functions
│   │   ├── colorPalette.js # Extended color system
│   │   ├── formatters.js   # Internationalization support
│   │   └── index.js        # Centralized exports
│   └── styles/             # Modern CSS with variables
├── public/                 # Static assets (logos, favicons)
├── dist/                   # Production build (optimized)
├── docs/                   # Comprehensive documentation
│   ├── VERSION_3.0_UPDATES.md
│   └── LEGACY_FILES_UPDATE_COMPLETE.md
├── scripts/                # Organized development tools
│   ├── tests/              # Testing utilities
│   ├── verification/       # Data verification tools
│   ├── debug/              # Debugging scripts
│   └── build/              # Build analysis tools
└── .github/workflows/      # CI/CD with GitHub Actions
```

## 🚀 **Quick Start**

### Prerequisites
- **Node.js** (version 16 or higher) 
- **npm** (version 8 or higher)
- Modern web browser with ES6+ support

### Installation
```bash
# Clone the repository
git clone https://github.com/jpgart/famus-unified-reports.git
cd famus-unified-reports

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production (optimized)
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🛠️ **Development v3.0**

### Available Scripts
- `npm run dev` - Development server with performance monitoring
- `npm run start` - Development server with auto-open browser
- `npm run build` - Optimized production build with asset copying
- `npm run build:analyze` - Bundle analysis with detailed metrics
- `npm run deploy` - Automated GitHub Pages deployment
- `npm run lint` - ESLint with modern standards
- `npm run format` - Prettier with enhanced configuration

### Enhanced Scripts (v3.0)
- `npm run test:all` - Comprehensive component testing
- `npm run test:csv` - Data validation testing
- `npm run verify:full` - Complete system verification
- `npm run verify:consistency` - Data consistency checks
- `npm run debug:charges` - Charge types debugging
- `npm run build:analyze-data` - Data overlap analysis

### Technology Stack v3.0
- **React 18** - Latest UI framework with concurrent features
- **Chart.js 4.5** - Advanced data visualization
- **Tailwind CSS 3** - Modern utility-first styling with JIT
- **Webpack 5** - Module bundler with optimization plugins
- **Babel** - ES6+ transpilation with modern presets
- **PostCSS** - CSS processing with cssnano optimization
- **Copy Webpack Plugin** - Static asset management

## 📊 **Data Management v3.0**

### Embedded Data Security
All data is embedded in JavaScript files for security and performance:
- **salesDataEmbedded.js** - Sales transactions with enhanced processing
- **costDataEmbedded.js** - Cost analysis data with improved validation
- **No CSV Exposure** - Raw data files are git-ignored for security
- **Optimized Loading** - Data is processed at build time for faster runtime

### Data Processing Enhancements
- **Advanced Filtering** - Multi-dimensional data filtering capabilities
- **Real-time Validation** - Data consistency checks during processing
- **Error Handling** - Graceful degradation for data issues
- **Performance Optimization** - Lazy loading and chunking strategies

## 🚀 **Deployment v3.0**

### Automated GitHub Pages Deployment
The project deploys automatically to GitHub Pages on every push to main:

```yaml
# .github/workflows/deploy.yml
- Build with optimized webpack configuration
- Copy static assets (logos, favicons)
- Deploy to GitHub Pages with proper routing
- SEO optimization with meta tags
```

### Live Application
🌐 **[https://jpgart.github.io/famus-unified-reports/](https://jpgart.github.io/famus-unified-reports/)**

### Manual Deployment
```bash
# Production build with all optimizations
npm run build

# Deploy to GitHub Pages
npm run deploy

# Or deploy dist/ directory to any static hosting provider
```

## 📈 **Performance v3.0**

### Build Optimizations
- **Code Splitting** - Automatic vendor chunk separation (397 KiB)
- **Asset Optimization** - Images, fonts, and static files optimized
- **Bundle Analysis** - Detailed webpack bundle analysis available
- **Caching Strategy** - Optimal cache headers for static assets

### Runtime Optimizations
- **Performance Monitoring** - Built-in render time tracking
- **Lazy Loading** - Components loaded on demand
- **Memory Management** - Optimized data structures and cleanup
- **Error Boundaries** - Graceful error handling without crashes

### Metrics
- **Bundle Size**: Main bundle ~5.38 MiB (data-heavy application)
- **Vendor Bundle**: 397 KiB (optimized dependencies)
- **Build Time**: ~9 seconds (optimized pipeline)
- **Load Time**: <3 seconds on modern connections

## 🔒 **Security v3.0**

### Enhanced Security Measures
- **No CSV Exposure** - All sensitive data embedded in compiled JS
- **Clean Repository** - CSV files and credentials git-ignored
- **Production Build** - Minified and obfuscated for production
- **Error Handling** - No sensitive information in error messages
- **Asset Integrity** - Webpack ensures asset integrity with content hashes

## 📚 **Documentation v3.0**

### Comprehensive Documentation
- `docs/VERSION_3.0_UPDATES.md` - Latest version updates and features
- `docs/LEGACY_FILES_UPDATE_COMPLETE.md` - Migration documentation
- `docs/TECH_STANDARDS.md` - Technical standards and guidelines
- `docs/KPI_COMPONENTS.md` - Component usage documentation
- In-code documentation with JSDoc comments

### Development Resources
- Component API documentation in source files
- Utility function documentation with examples
- Build configuration explanations
- Testing and debugging guides
- `src/data/salesDataEmbedded.js` - Sales data
- `src/data/costDataEmbedded.js` - Cost data

### Data Processing
Centralized data processing utilities:
- Filtering and grouping
- Statistical calculations
- Data aggregation and transformation

## 🎨 **Design System**

### Color Palette
```css
--famus-orange: #EE6C4D    /* Primary */
--famus-navy: #3D5A80      /* Secondary */
--famus-blue: #98C1D9      /* Accent */
--famus-cream: #F9F6F4     /* Background */
```

### Components
- **KPI Cards** - Standardized metric display
- **Filter Dropdowns** - Consistent filtering interface
- **Charts** - Unified chart configurations with zoom/pan
- **Navigation** - Seamless report switching

## 📱 **Responsive Design**

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 **Configuration**

### Chart Configuration
Default chart options with Famus branding and zoom capabilities are defined in `src/utils/chartConfig.js`.

### Tailwind Configuration
Custom Famus colors and design tokens are configured in `tailwind.config.js`.

### Webpack Configuration
Optimized build configuration with code splitting and asset optimization in `webpack.config.js`.

## 🚀 **Deployment**

### GitHub Pages
The application is automatically deployed to GitHub Pages:
```bash
npm run deploy
## 🤝 **Contributing v3.0**

### Development Workflow
1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Install** dependencies (`npm install`)
5. **Make** your changes with proper testing
6. **Build** and verify (`npm run build`)
7. **Test** thoroughly with provided scripts
8. **Commit** with descriptive messages
9. **Push** to your fork
10. **Submit** a pull request

### Code Standards
- Follow ESLint configuration
- Use Prettier for code formatting
- Write descriptive commit messages
- Include documentation for new features
- Test all changes thoroughly

### Testing Your Changes
```bash
# Run all tests
npm run test:all

# Verify data consistency
npm run verify:full

# Build and check for errors
npm run build

# Test locally
npm run dev
```

## � **Troubleshooting**

### Common Issues
- **Logo not displaying**: Ensure webpack copy plugin is configured
- **Build failures**: Check Node.js version (requires 16+)
- **Deployment issues**: Verify GitHub Pages settings
- **Performance issues**: Use `npm run build:analyze` to inspect bundle

### Getting Help
- Check the `docs/` directory for detailed documentation
- Review GitHub Issues for similar problems
- Contact the development team for support

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support & Contact**

For questions, support, or collaboration:
- 📧 **Email**: Contact the development team
- 📚 **Documentation**: Refer to the `docs/` directory
- 🐛 **Issues**: Report bugs via GitHub Issues
- 💡 **Feature Requests**: Submit via GitHub Discussions

---

## 📊 **Project Status**

| Metric | Status |
|--------|--------|
| **Version** | 3.0.0 |
| **Build** | ✅ Passing |
| **Tests** | ✅ All Passing |
| **Deployment** | ✅ Live on GitHub Pages |
| **Documentation** | ✅ Complete |
| **Security** | ✅ No Vulnerabilities |

**Last Updated**: June 27, 2025  
**Maintainer**: JP  
**Repository**: [https://github.com/jpgart/famus-unified-reports](https://github.com/jpgart/famus-unified-reports)

---

*Built with ❤️ using React, Chart.js, and modern web technologies*
