import React, { useState, useEffect, useRef } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { 
  getInitialStockAnalysisFromEmbedded,
  getTopVarietiesByStockFromEmbedded,
  getStockDistributionByMonthFromEmbedded,
  clearEmbeddedDataCache
} from '../../data/costDataEmbedded';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { getDefaultChartOptions, FAMUS_COLORS, BLUE_PALETTE } from '../../utils/chartConfig';
import { KPISection } from '../common';

// Register Chart.js plugins
import { registerChartPlugins } from '../../utils/chartConfig';
registerChartPlugins();

const InventoryReport = ({ onRefsUpdate }) => {
  const [stockAnalysis, setStockAnalysis] = useState(null);
  const [topVarieties, setTopVarieties] = useState([]);
  const [monthlyDistribution, setMonthlyDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create refs for navigation using useRef to ensure they persist
  const sectionRefs = useRef({
    'Initial Stock': useRef(null),
    'Variety Details': useRef(null),
    'Exporter Analysis': useRef(null),
    'Monthly Distribution': useRef(null),
  }).current;

  // Update parent component with refs
  useEffect(() => {
    console.log('📦 InventoryReport useEffect for refs update');
    console.log('📦 onRefsUpdate exists:', !!onRefsUpdate);
    console.log('📦 sectionRefs keys:', Object.keys(sectionRefs));
    
    // Use setTimeout to ensure refs are ready after render
    const timeoutId = setTimeout(() => {
      if (onRefsUpdate) {
        console.log('📦 Calling onRefsUpdate with refs (delayed)');
        onRefsUpdate(sectionRefs);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [onRefsUpdate]);

  useEffect(() => {
    const loadStockAnalysis = async () => {
      try {
        setLoading(true);
        console.log('📦 Loading inventory data from embedded data...');
        
        // Clear cache to ensure fresh data
        clearEmbeddedDataCache();
        console.log('🧹 Cleared embedded data cache');
        
        // Test functions individually
        console.log('🔍 Testing inventory functions...');
        const testAnalysis = await getInitialStockAnalysisFromEmbedded();
        console.log('✅ Stock analysis test:', testAnalysis?.totalLots, 'lots');
        
        const [analysis, varieties, monthly] = await Promise.all([
          getInitialStockAnalysisFromEmbedded(),
          getTopVarietiesByStockFromEmbedded(8),
          getStockDistributionByMonthFromEmbedded()
        ]);
        
        console.log('📊 Raw analysis data:', analysis);
        console.log('🌱 Raw varieties data:', varieties);
        console.log('📅 Raw monthly data:', monthly);
        
        setStockAnalysis(analysis);
        setTopVarieties(varieties);
        setMonthlyDistribution(monthly);
        
        console.log('📦 Inventory analysis loaded successfully');
      } catch (error) {
        console.error('❌ Error loading stock analysis:', error);
        console.error('❌ Error stack:', error.stack);
      } finally {
        setLoading(false);
      }
    };

    loadStockAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE6C4D]"></div>
          <span className="ml-3 text-gray-600">Loading inventory analysis...</span>
        </div>
      </div>
    );
  }

  if (!stockAnalysis) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">⚠️ Inventory data not available</p>
      </div>
    );
  }

  // Prepare chart data for varieties with correct blue palette
  const varietyChartData = {
    labels: topVarieties.map(v => v.variety),
    datasets: [
      {
        label: 'Initial Stock (boxes)',
        data: topVarieties.map(v => v.totalStock),
        backgroundColor: BLUE_PALETTE.slice(0, topVarieties.length),
        borderColor: BLUE_PALETTE.slice(0, topVarieties.length).map(color => color),
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for monthly distribution
  const monthlyChartData = {
    labels: monthlyDistribution.map(m => {
      const date = new Date(m.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Stock by Month',
        data: monthlyDistribution.map(m => m.totalStock),
        backgroundColor: FAMUS_COLORS.blue,
        borderColor: FAMUS_COLORS.orange,
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const exporterData = stockAnalysis?.byExporter ? 
    Object.entries(stockAnalysis.byExporter)
      .sort(([,a], [,b]) => b.totalStock - a.totalStock) 
    : [];

  return (
    <div className="min-h-screen bg-[#F9F6F4] w-full m-0 p-0">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-center mb-8 text-[#EE6C4D]">Inventory Report</h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Comprehensive analysis of initial stock levels, distribution, and inventory composition across exporters and varieties.
          </p>
        </div>

      {/* Main Content */}
      <div ref={sectionRefs['Initial Stock']} className="bg-[#F9F6F4] rounded-2xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2 flex items-center">
          <span className="mr-3">📊</span>
          Initial Stock Analysis
        </h2>

        {/* Stock Summary KPI Cards */}
        <KPISection
          title="📊 KPIs"
          subtitle="Key Performance Indicators - Inventory Analysis"
          titleColor="text-[#3D5A80]"
          backgroundColor="bg-white"
          kpis={[
            { 
              label: 'Total Stock', 
              value: stockAnalysis.totalStock, 
              type: 'integer',
              size: 'normal'
            },
            { 
              label: 'Total Lots', 
              value: stockAnalysis.totalLots, 
              type: 'integer',
              size: 'normal'
            },
            { 
              label: 'Avg Stock per Lot', 
              value: stockAnalysis.avgStockPerLot, 
              type: 'decimal',
              decimals: 1,
              size: 'normal'
            },
            { 
              label: 'Active Exporters', 
              value: exporterData.length, 
              type: 'integer',
              size: 'normal'
            }
          ]}
        />

        {/* Inventory Analysis Legend */}
        <div className="mt-6 max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
              <span className="mr-2">ℹ️</span>
              Inventory Analysis Methodology
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>• Total Stock:</strong> Combined inventory across all varieties and exporters</p>
              <p><strong>• Lot Analysis:</strong> Individual inventory batches with unique identifiers</p>
              <p><strong>• Stock Efficiency:</strong> Average inventory per lot for optimal management</p>
              <p><strong>• Coverage:</strong> Complete analysis of active inventory positions</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Top Varieties Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold text-[#EE6C4D] mb-3">Top Varieties by Stock</h4>
            <div className="h-64">
              <Bar data={varietyChartData} options={{
                ...getDefaultChartOptions(),
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatNumber(value);
                      }
                    }
                  }
                }
              }} />
            </div>
          </div>

          {/* Monthly Distribution Chart */}
          <div ref={sectionRefs['Monthly Distribution']} className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold text-[#EE6C4D] mb-3">Stock Distribution by Month</h4>
            <div className="h-64">
              <Line data={monthlyChartData} options={{
                ...getDefaultChartOptions(),
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatNumber(value);
                      }
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Color Legend for Heatmap Tables */}
        <div className="mb-4 bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-semibold text-[#EE6C4D] mb-2">Heatmap Color Guide</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-[#3D5A80] text-white">Highest</span>
            <span className="px-2 py-1 rounded bg-[#6B8B9E] text-white">High</span>
            <span className="px-2 py-1 rounded bg-[#98C1D9] text-black">Medium</span>
            <span className="px-2 py-1 rounded bg-[#BEE0EB] text-black">Low</span>
            <span className="px-2 py-1 rounded bg-[#E0FBFC] text-black">Lowest</span>
          </div>
        </div>

        {/* Exporter Stock Analysis Table - Heatmap Style */}
        <div ref={sectionRefs['Exporter Analysis']} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-[#3D5A80] text-white border-b">
            <h4 className="text-lg font-semibold">Stock Analysis by Exporter</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="bg-[#3D5A80] text-white px-3 py-2 text-left font-bold border">Exporter</th>
                  <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Total Stock</th>
                  <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Lots</th>
                  <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Avg per Lot</th>
                  <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Stock %</th>
                </tr>
              </thead>
              <tbody>
                {exporterData.map(([exporter, data], index) => {
                  const stockPercent = data.totalStock / stockAnalysis.totalStock;
                  const avgPerLot = data.lots > 0 ? data.totalStock / data.lots : 0;
                  const stockColor = stockPercent > 0.25 ? 'bg-[#3D5A80] text-white' : 
                                    stockPercent > 0.20 ? 'bg-[#6B8B9E] text-white' :
                                    stockPercent > 0.15 ? 'bg-[#98C1D9] text-black' : 
                                    stockPercent > 0.10 ? 'bg-[#BEE0EB] text-black' :
                                    'bg-[#E0FBFC] text-black';
                  return (
                    <tr key={exporter} className="hover:bg-gray-50 border-b">
                      <td className="font-bold bg-[#E0FBFC] px-3 py-2 border text-[#3D5A80]">{exporter}</td>
                      <td className={`px-3 py-2 text-center font-semibold border ${stockColor}`}>
                        {formatNumber(Math.round(data.totalStock))}
                      </td>
                      <td className="px-3 py-2 text-center border">{formatNumber(data.lots)}</td>
                      <td className="px-3 py-2 text-center border">{formatNumber(Math.round(avgPerLot))}</td>
                      <td className="px-3 py-2 text-center border">{formatPercentage(stockPercent)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Variety Details - Heatmap Style */}
        <div ref={sectionRefs['Variety Details']} className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-[#3D5A80] text-white border-b">
            <h4 className="text-lg font-semibold">Top Varieties Details</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="bg-[#3D5A80] text-white px-3 py-2 text-left font-bold border">Variety</th>
                  <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Total Stock</th>
                  <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Lots</th>
                  <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Exporters</th>
                  <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Stock %</th>
                </tr>
              </thead>
              <tbody>
                {topVarieties && topVarieties.length > 0 ? (
                  topVarieties.map((variety, index) => {
                    const stockPercent = variety.totalStock / stockAnalysis.totalStock;
                    const stockColor = stockPercent > 0.20 ? 'bg-[#3D5A80] text-white' : 
                                      stockPercent > 0.15 ? 'bg-[#6B8B9E] text-white' :
                                      stockPercent > 0.10 ? 'bg-[#98C1D9] text-black' : 
                                      stockPercent > 0.05 ? 'bg-[#BEE0EB] text-black' :
                                      'bg-[#E0FBFC] text-black';
                    return (
                      <tr key={variety.variety} className="hover:bg-gray-50 border-b">
                        <td className="font-bold bg-[#E0FBFC] px-3 py-2 border text-[#3D5A80]">{variety.variety}</td>
                        <td className={`px-3 py-2 text-center font-semibold border ${stockColor}`}>
                          {formatNumber(Math.round(variety.totalStock))}
                        </td>
                        <td className="px-3 py-2 text-center border">{formatNumber(variety.lots)}</td>
                        <td className="px-3 py-2 text-center border">{formatNumber(variety.exporterCount || 0)}</td>
                        <td className="px-3 py-2 text-center border">{formatPercentage(stockPercent)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 py-8 text-center text-gray-500">
                      Loading varieties data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Source Information */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-[#3D5A80] mb-2">📋 Data Source Information</h4>
          <p className="text-gray-600 text-sm mb-6 italic">Complete inventory analysis from Initial_Stock_All.csv providing detailed insights into stock composition, variety distribution, and seasonal patterns.</p>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-[#3D5A80]">Data Coverage:</h5>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Total Records: {formatNumber(stockAnalysis.totalLotids)}</li>
                <li>• Date Range: Multi-period analysis</li>
                <li>• Exporters: {stockAnalysis.uniqueExporters} active</li>
                <li>• Product Varieties: {stockAnalysis.uniqueVarieties}</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-[#3D5A80]">Analysis Features:</h5>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Stock distribution by exporter</li>
                <li>• Variety performance analysis</li>
                <li>• Seasonal distribution patterns</li>
                <li>• Inventory utilization metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default InventoryReport;
