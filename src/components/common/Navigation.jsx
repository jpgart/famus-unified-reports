import React, { useState } from 'react';

const Navigation = ({ activeReport, onReportChange, sectionRefs, onSectionScroll }) => {
  const [hoveredReport, setHoveredReport] = useState(null);

  const reports = [
    { 
      id: 'sales', 
      name: 'Sales Detail Report', 
      icon: '📊',
      sections: [
        { id: 'KPIs', name: 'KPIs', icon: '📈' },
        { id: 'Key Insights', name: 'Key Insights', icon: '💡' },
        { id: 'Exporter Comparator', name: 'Exporter Comparator', icon: '⚖️' },
        { id: 'Sales by Variety', name: 'Sales by Variety', icon: '🍇' },
        { id: 'Sales Timeline', name: 'Sales Timeline', icon: '📅' },
        { id: 'Price History Retailer', name: 'Price History (Retailer)', icon: '📊' },
        { id: 'Price History Exporter', name: 'Price History (Exporter)', icon: '📈' },
        { id: 'Heatmap Retailer vs Variety', name: 'Heatmap: Retailer / Variety', icon: '🔥' },
        { id: 'Heatmap Exporter vs Retailer', name: 'Heatmap: Exporter / Retailer', icon: '🗺️' },
        { id: 'Exporter-Retailer Analysis', name: 'Top 5 Analysis', icon: '🏆' },
        { id: 'Ranking Retailers', name: 'Top Retailers by Sales', icon: '🥇' },
        { id: 'Ranking Exporters', name: 'Top Exporters by Sales', icon: '🚢' },
        { id: 'Sales by Retailer/Exporter/Variety/Size', name: 'Filtered Sales Analysis', icon: '🔍' },
        { id: 'Price Alerts by Variety', name: 'Price Alerts', icon: '⚠️' },
      ]
    },
    { 
      id: 'cost', 
      name: 'Cost Consistency Report', 
      icon: '💰',
      sections: [
        { id: 'KPIs', name: 'KPI Overview', icon: '📊' },
        { id: 'Key Insights', name: 'Key Insights', icon: '💡' },
        { id: 'Exporter Comparator', name: 'Exporter Comparator', icon: '⚖️' },
        { id: 'Outlier Analysis', name: 'Outlier Analysis', icon: '⚠️' },
        { id: 'Grower Advances', name: 'Grower Advances', icon: '🌾' },
        { id: 'Ocean Freight', name: 'Ocean Freight', icon: '🚢' },
        { id: 'Packing Materials', name: 'Packing Materials', icon: '📦' },
        { id: 'Internal Consistency', name: 'Internal Consistency', icon: '🔍' },
        { id: 'External Consistency', name: 'External Consistency', icon: '⚖️' },
        { id: 'Final Tables', name: 'Final Cost Tables', icon: '📊' },
        { id: 'Summary Table', name: 'Tabla Resumen Integral', icon: '📋' },
      ]
    },
    { 
      id: 'profitability', 
      name: 'Profitability Analysis', 
      icon: '💰',
      sections: [
        { id: 'KPIs', name: 'Profitability KPIs', icon: '💰' },
        { id: 'Top Performers', name: 'Performance Rankings', icon: '🏆' },
        { id: 'Variety Analysis', name: 'Variety Analysis', icon: '🍇' },
        { id: 'Exporter Analysis', name: 'Exporter Analysis', icon: '🚢' },
      ]
    },
    { 
      id: 'inventory', 
      name: 'Inventory Report', 
      icon: '📦',
      sections: [
        { id: 'Initial Stock', name: 'Initial Stock Analysis', icon: '📊' },
        { id: 'Variety Details', name: 'Variety Details', icon: '🍇' },
        { id: 'Exporter Analysis', name: 'Exporter Analysis', icon: '🚢' },
        { id: 'Monthly Distribution', name: 'Monthly Distribution', icon: '📅' },
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
                <span className="text-lg">{report.icon}</span>
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
                      <span className="text-sm">{section.icon}</span>
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