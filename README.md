# 🚀 Famus Unified Reports

A comprehensive React-based dashboard for analyzing fruit import operations, providing detailed insights into inventory, costs, sales, and profitability metrics across four integrated report modules.

## 🎯 Features

### 📦 **Inventory Report**
- Initial stock analysis by exporter and variety
- Stock distribution metrics and composition breakdowns
- Real-time inventory KPI tracking
- Comprehensive stock level insights

### 💰 **Cost Consistency Report**
- Operational cost analysis across exporters
- Ocean freight and packing materials analysis
- Advanced outlier detection with statistical modeling
- Internal and external consistency checks
- Final cost analysis with detailed comparisons

### 📊 **Sales Detail Report** 
- Interactive sales analytics and KPIs
- Dynamic filtering by exporter, retailer, and time periods
- Real-time data visualization with zoom and pan capabilities
- Comprehensive sales trends and performance metrics

### � **Profitability Analysis Report**
- ROI calculations and profit margin analysis
- Performance rankings and comparisons
- Cost vs. revenue analysis with Commission included
- Profitability trends and insights

### 🎨 **Unified Experience**
- Seamless navigation between all four reports
- Consistent design system with Famus branding
- Professional styling with standardized titles and layouts
- Responsive design for all device sizes

## 🏗️ **Architecture**

```
famus-unified-reports/
├── src/
│   ├── components/
│   │   ├── common/          # Shared UI components
│   │   ├── reports/         # Report-specific components
│   │   └── charts/          # Chart components
│   ├── data/               # Embedded data files
│   ├── utils/              # Utility functions
│   └── styles/             # Styling files
├── public/                 # Static assets
├── dist/                   # Build output (generated)
└── docs/                   # Documentation
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
```bash
# Clone or navigate to the project directory
cd famus-unified-reports

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🛠️ **Development**

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run start` - Start development server and open browser
- `npm run build` - Build optimized production bundle
- `npm run build:analyze` - Build with bundle analyzer
- `npm run deploy` - Deploy to GitHub Pages
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Technology Stack
- **React 18** - UI framework
- **Chart.js 4.5** - Data visualization
- **Tailwind CSS 3** - Styling framework
- **Webpack 5** - Module bundler
- **Babel** - JavaScript transpiler

## 📊 **Data Management**

### Embedded Data
All data is embedded in JavaScript files for security and performance:
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
```

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy the `dist/` directory to your hosting provider

## 📈 **Performance**

- **Code Splitting** - Automatic vendor chunk separation
- **Asset Optimization** - Compressed images and fonts
- **Bundle Analysis** - Use `npm run build:analyze` to inspect bundle size
- **Caching** - Optimized cache headers for static assets

## 🔒 **Security**

- **No CSV Exposure** - All data is embedded in JavaScript
- **Clean Repository** - CSV files are git-ignored
- **Production Build** - Minified and optimized for production

## 📚 **Documentation**

- `TECH_STANDARDS.md` - Technical standards and guidelines
- `DEPLOYMENT.md` - Deployment instructions
- Component documentation available in source files

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 📞 **Support**

For questions or support, please contact the development team or refer to the documentation in the `docs/` directory.

---

**Version**: 2.0.0  
**Date**: June 19, 2025  
**Maintainer**: JP
