import React, { useState, useRef } from 'react';
import { Header, Navigation } from './src/components/common';
import SalesDetailReport from './src/components/reports/SalesDetailReport';
import CostConsistencyReport from './src/components/reports/CostConsistencyReport';
import ProfitabilityReport from './src/components/reports/ProfitabilityReport';
import InventoryReport from './src/components/reports/InventoryReport';
import DataTest from './src/components/DataTest';

function App() {
  const [activeReport, setActiveReport] = useState('sales');
  const [sectionRefs, setSectionRefs] = useState({});

  const handleSectionScroll = (sectionId) => {
    if (sectionRefs[sectionId] && sectionRefs[sectionId].current) {
      sectionRefs[sectionId].current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleRefsUpdate = (refs) => {
    setSectionRefs(refs);
  };

  return (
    <div className="min-h-screen bg-famus-cream">
      <Header />
      <Navigation 
        activeReport={activeReport} 
        onReportChange={setActiveReport}
        sectionRefs={sectionRefs}
        onSectionScroll={handleSectionScroll}
      />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DataTest />
        <div className="fade-in">
          {activeReport === 'sales' && (
            <SalesDetailReport onRefsUpdate={handleRefsUpdate} />
          )}
          {activeReport === 'cost' && (
            <CostConsistencyReport onRefsUpdate={handleRefsUpdate} />
          )}
          {activeReport === 'profitability' && (
            <ProfitabilityReport onRefsUpdate={handleRefsUpdate} />
          )}
          {activeReport === 'inventory' && (
            <InventoryReport onRefsUpdate={handleRefsUpdate} />
          )}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Famus Analytics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
