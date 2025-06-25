import React, { useState } from 'react';

const Navigation = ({ activeReport, onReportChange, sectionRefs, onSectionScroll }) => {
  const [hoveredReport, setHoveredReport] = useState(null);

  const reports = [
    { 
      id: 'sales', 
      name: 'Sales Detail Report', 
      sections: [
        { id: 'KPIs', name: '📈 KPIs' },
        { id: 'Key Insights', name: '💡 Key Insights' },
        { id: 'Exporter Comparator', name: '⚖️ Exporter Comparator' },
        { id: 'Sales by Variety', name: '🍇 Sales by Variety' },
        { id: 'Sales Timeline', name: '📅 Sales Timeline' },
        { id: 'Price History Retailer', name: '📊 Price History (Retailer)' },
        { id: 'Price History Exporter', name: '📈 Price History (Exporter)' },
        { id: 'Heatmap Retailer vs Variety', name: '🔥 Heatmap: Retailer / Variety' },
        { id: 'Heatmap Exporter vs Retailer', name: '🗺️ Heatmap: Exporter / Retailer' },
        { id: 'Exporter-Retailer Analysis', name: '🏆 Top 5 Analysis' },
        { id: 'Ranking Retailers', name: '🥇 Top Retailers by Sales' },
        { id: 'Ranking Exporters', name: '🏅 Top Exporters by Sales' },
        { id: 'Sales by Retailer/Exporter/Variety/Size', name: '🔍 Filtered Sales Analysis' },
        { id: 'Price Alerts by Variety', name: '⚠️ Price Alerts' },
      ]
    },
    { 
      id: 'cost', 
      name: 'Cost Consistency Report', 
      sections: [
        { id: 'KPIs', name: '📊 KPI Overview' },
        { id: 'Key Insights', name: '💡 Key Insights' },
        { id: 'Exporter Comparator', name: '⚖️ Exporter Comparator' },
        { id: 'Outlier Analysis', name: '⚠️ Outlier Analysis' },
        { id: 'Grower Advances', name: '🌱 Grower Advances' },
        { id: 'Ocean Freight', name: '🚢 Ocean Freight' },
        { id: 'Packing Materials', name: '📦 Packing Materials' },
        { id: 'Internal Consistency', name: '🔍 Internal Consistency' },
        { id: 'External Consistency', name: '🔗 External Consistency' },
        { id: 'Final Tables', name: '📋 Final Cost Tables' },
        { id: 'Summary Table', name: '📊 Tabla Resumen Integral' },
      ]
    },
    { 
      id: 'profitability', 
      name: 'Profitability Analysis', 
      sections: [
        { id: 'KPIs', name: '💰 Profitability KPIs' },
        { id: 'Top Performers', name: '🏆 Performance Rankings' },
        { id: 'Variety Analysis', name: '🍇 Variety Analysis' },
        { id: 'Exporter Analysis', name: '📈 Exporter Analysis' },
      ]
    },
    { 
      id: 'inventory', 
      name: 'Inventory Report', 
      sections: [
        { id: 'Initial Stock', name: '📦 Initial Stock Analysis' },
        { id: 'Variety Details', name: '🍇 Variety Details' },
        { id: 'Exporter Analysis', name: '📈 Exporter Analysis' },
        { id: 'Monthly Distribution', name: '📅 Monthly Distribution' },
      ]
    },
  ];

  const handleSectionClick = (sectionId) => {
    if (onSectionScroll && sectionRefs && sectionRefs[sectionId]) {
      onSectionScroll(sectionId);
    }
    setHoveredReport(null);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="relative"
              onMouseEnter={() => setHoveredReport(report.id)}
              onMouseLeave={() => setHoveredReport(null)}
            >
              <button
                onClick={() => onReportChange(report.id)}
                className={`nav-button flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeReport === report.id
                    ? 'border-famus-orange text-famus-orange'
                    : 'border-transparent text-gray-500 hover:text-famus-navy hover:border-gray-300'
                }`}
              >
                <span>{report.name}</span>
                <span className="text-xs">▼</span>
              </button>

              {/* Dropdown Menu */}
              {hoveredReport === report.id && activeReport === report.id && (
                <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 shadow-lg rounded-md z-50 py-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    Sections
                  </div>
                  {report.sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-famus-orange transition-colors duration-150 flex items-center space-x-2"
                    >
                      <span>{section.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;