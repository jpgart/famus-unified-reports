import React, { useState, useRef, useEffect } from 'react';
import { Header, Navigation } from './src/components/common';
import SalesDetailReport from './src/components/reports/SalesDetailReport';
import CostConsistencyReport from './src/components/reports/CostConsistencyReport';
import ProfitabilityReport from './src/components/reports/ProfitabilityReport';
import InventoryReport from './src/components/reports/InventoryReport';

// Famus Unified Reports - Main Application Component
// Updated: 2025-06-27
// Version: 3.0 - Enhanced with performance monitoring and error boundaries

function App() {
  const [activeReport, setActiveReport] = useState('sales');
  const [sectionRefs, setSectionRefs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Performance monitoring
  useEffect(() => {
    const loadStart = performance.now();
    
    // Simulate app initialization
    setTimeout(() => {
      setIsLoading(false);
      const loadTime = performance.now() - loadStart;
      console.log(`App initialized in ${loadTime.toFixed(2)}ms`);
    }, 100);
  }, []);

  // Error boundary simulation
  useEffect(() => {
    const handleError = (event) => {
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleSectionScroll = (sectionId) => {
    console.log('🎯 App handleSectionScroll called:', sectionId);
    console.log('🎯 Available sectionRefs:', Object.keys(sectionRefs));
    console.log('🎯 Target ref exists:', !!sectionRefs[sectionId]);
    console.log('🎯 Target ref current exists:', sectionRefs[sectionId] ? !!sectionRefs[sectionId].current : false);
    
    if (sectionRefs[sectionId] && sectionRefs[sectionId].current) {
      console.log('✅ Scrolling to section:', sectionId);
      sectionRefs[sectionId].current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      console.log('❌ Cannot scroll - ref not found or current is null');
    }
  };

  const handleRefsUpdate = (refs) => {
    console.log('📝 App handleRefsUpdate called with refs:', Object.keys(refs));
    setSectionRefs(refs);
  };

  const handleReportChange = (newReport) => {
    setActiveReport(newReport);
    // Reset any error state when changing reports
    setError(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-famus-cream flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-famus-blue border-t-famus-orange rounded-full mx-auto mb-4"></div>
          <p className="text-famus-navy text-lg font-medium">Cargando Famus Reports...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-famus-cream flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-famus-error text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-famus-error mb-4">Error en la Aplicación</h1>
          <p className="text-famus-navy mb-6">
            Se ha producido un error inesperado. Por favor, recarga la página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Recargar Aplicación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-famus-cream">
      <Header />
      <Navigation 
        activeReport={activeReport} 
        onReportChange={handleReportChange}
        sectionRefs={sectionRefs}
        onSectionScroll={handleSectionScroll}
      />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-2 sm:mb-0">
              © 2025 Famus Analytics. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>v3.0.0</span>
              <span>•</span>
              <span>Updated: Jun 27, 2025</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
