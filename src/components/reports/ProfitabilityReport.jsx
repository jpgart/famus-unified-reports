import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS } from 'chart.js/auto';
import { salesData } from '../../data/salesDataEmbedded';
import { calculateMetricsFromEmbedded } from '../../data/costDataEmbedded';
import { formatNumber, formatPercentage, formatInteger, formatCurrency, formatPrice, isPriceField, formatTotalSales } from '../../utils/formatters';
import { getDefaultChartOptions, FAMUS_COLORS, registerChartPlugins } from '../../utils/chartConfig';
import { KPISection } from '../common';
import { filterExportersList } from '../../utils/dataFiltering';

// Data Processing Functions
const processProfitabilityData = async () => {
  const costMetrics = await calculateMetricsFromEmbedded();
  
  // Group sales by Lotid
  const salesByLotid = {};
  salesData.forEach(sale => {
    const lotid = sale.Lotid;
    if (!salesByLotid[lotid]) {
      salesByLotid[lotid] = {
        lotid,
        exporter: sale['Exporter Clean'],
        variety: sale.Variety,
        totalSales: 0,
        totalQuantity: 0,
        transactions: 0,
        retailers: new Set(),
        avgPrice: 0
      };
    }
    
    salesByLotid[lotid].totalSales += Number(sale['Sales Amount'] || 0);
    salesByLotid[lotid].totalQuantity += Number(sale['Sale Quantity'] || 0);
    salesByLotid[lotid].transactions += 1;
    salesByLotid[lotid].retailers.add(sale['Retailer Name']);
  });

  // Calculate average prices
  Object.values(salesByLotid).forEach(lotidData => {
    lotidData.avgPrice = lotidData.totalQuantity > 0 ? 
      lotidData.totalSales / lotidData.totalQuantity : 0;
    lotidData.retailers = lotidData.retailers.size;
  });

  // Combine sales and cost data
  const profitabilityData = [];
  
  Object.keys(salesByLotid).forEach(lotid => {
    const salesData = salesByLotid[lotid];
    const costData = costMetrics[lotid];
    
    if (costData && costData.totalChargeAmount !== null) {
      const profit = salesData.totalSales - costData.totalChargeAmount;
      const profitMargin = salesData.totalSales > 0 ? 
        (profit / salesData.totalSales) * 100 : 0;
      const roi = costData.totalChargeAmount > 0 ? 
        (profit / costData.totalChargeAmount) * 100 : 0;
      
      profitabilityData.push({
        ...salesData,
        totalCosts: costData.totalChargeAmount,
        costPerBox: costData.costPerBox,
        profit,
        profitMargin,
        roi,
        profitPerBox: salesData.totalQuantity > 0 ? profit / salesData.totalQuantity : 0
      });
    }
  });

  return profitabilityData;
};

// KPI Cards Component
const ProfitabilityKPIs = ({ data }) => {
  const [selectedExporter, setSelectedExporter] = useState('All');
  
  const exporters = useMemo(() => {
    const allExporters = [...new Set(data.map(d => d.exporter))].sort();
    const filteredExporters = filterExportersList(allExporters);
    return ['All', ...filteredExporters];
  }, [data]);

  const filteredData = selectedExporter === 'All' ? 
    data : data.filter(d => d.exporter === selectedExporter);

  const kpiData = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, d) => sum + d.totalSales, 0);
    const totalCosts = filteredData.reduce((sum, d) => sum + d.totalCosts, 0);
    const totalProfit = totalRevenue - totalCosts;
    const avgProfitMargin = filteredData.length > 0 ? 
      filteredData.reduce((sum, d) => sum + d.profitMargin, 0) / filteredData.length : 0;
    const avgROI = filteredData.length > 0 ? 
      filteredData.reduce((sum, d) => sum + d.roi, 0) / filteredData.length : 0;
    const profitableLots = filteredData.filter(d => d.profit > 0).length;

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      avgProfitMargin,
      avgROI,
      profitableLots,
      totalLots: filteredData.length,
      profitablePercentage: filteredData.length > 0 ? 
        (profitableLots / filteredData.length) * 100 : 0
    };
  }, [filteredData]);

  const kpis = [
    { 
      label: 'Total Revenue', 
      value: kpiData.totalRevenue, 
      type: 'currency',
      size: 'normal'
    },
    { 
      label: 'Total Costs', 
      value: kpiData.totalCosts, 
      type: 'currency',
      size: 'normal'
    },
    { 
      label: 'Net Profit', 
      value: kpiData.totalProfit, 
      type: 'currency',
      size: 'normal'
    },
    { 
      label: 'Avg Profit Margin', 
      value: kpiData.avgProfitMargin, 
      type: 'integer',
      size: 'normal'
    },
    { 
      label: 'Avg ROI', 
      value: kpiData.avgROI, 
      type: 'integer',
      size: 'normal'
    },
    { 
      label: 'Profitable Lots', 
      value: `${kpiData.profitableLots}/${kpiData.totalLots}`, 
      type: 'text',
      size: 'normal'
    },
  ];

  return (
    <div className="bg-[#F9F6F4] flex flex-col items-center my-10">
      <KPISection
        title="📊 KPIs"
        subtitle="Key Performance Indicators - Profitability Analysis"
        titleColor="text-famus-orange"
        backgroundColor="bg-transparent"
        kpis={kpis}
        chart={null}
        showChart={false}
        containerClass=""
      />
      
      {/* Exporter Filter */}
      <div className="mb-6 flex flex-row items-center gap-3">
        <span className="font-semibold text-lg text-[#3D5A80]">Filter by Exporter:</span>
        <select 
          value={selectedExporter} 
          onChange={e => setSelectedExporter(e.target.value)} 
          className="border border-famus-navy p-2 rounded text-lg bg-white focus:ring-2 focus:ring-famus-orange"
        >
          {exporters.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>
      
      {/* Profitability Analysis Legend */}
      <div className="mt-6 max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">ℹ️</span>
            Profitability Analysis Methodology
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>• Total Costs:</strong> All operational charges including Ocean Freight, Cold Storage, Customs, Packing Materials, Terminal Charges, and Inspections</p>
            <p><strong>• Excluded Costs:</strong> Grower Advances (considered as advances, not operational costs)</p>
            <p><strong>• Analysis Scope:</strong> Only lots with both sales and cost data for accurate profitability calculations</p>
            <p><strong>• Performance Metrics:</strong> ROI, profit margins, and cost efficiency analysis across all exporters</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Top/Bottom Performers Component
const TopBottomPerformers = ({ data }) => {
  const topByProfit = [...data]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);
    
  const bottomByProfit = [...data]
    .filter(d => d.profit < 0)
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 10);

  const topByROI = [...data]
    .filter(d => d.roi > 0)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-8">
      {/* Top Profitable Lots */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h4 className="text-lg font-bold text-green-700 mb-4">Top 10 Most Profitable Lots</h4>
        <div className="space-y-3">
          {topByProfit.map((lot, idx) => (
            <div key={lot.lotid} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-semibold text-sm">{lot.lotid}</div>
                <div className="text-xs text-gray-600">{lot.exporter} - {lot.variety}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-700">${lot.profit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                <div className="text-xs text-gray-600">{lot.profitMargin.toFixed(1)}% margin</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worst Performing Lots */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h4 className="text-lg font-bold text-red-700 mb-4">Top 10 Least Profitable Lots</h4>
        <div className="space-y-3">
          {bottomByProfit.map((lot, idx) => (
            <div key={lot.lotid} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <div className="font-semibold text-sm">{lot.lotid}</div>
                <div className="text-xs text-gray-600">{lot.exporter} - {lot.variety}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-red-700">${lot.profit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                <div className="text-xs text-gray-600">{lot.profitMargin.toFixed(1)}% margin</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top ROI Lots */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h4 className="text-lg font-bold text-blue-700 mb-4">Top 10 Best ROI Lots</h4>
        <div className="space-y-3">
          {topByROI.map((lot, idx) => (
            <div key={lot.lotid} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-sm">{lot.lotid}</div>
                <div className="text-xs text-gray-600">{lot.exporter} - {lot.variety}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-700">{lot.roi.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</div>
                <div className="text-xs text-gray-600">${lot.profit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Variety Analysis Component
const VarietyAnalysis = ({ data }) => {
  const varietyStats = useMemo(() => {
    const stats = {};
    
    data.forEach(lot => {
      if (!stats[lot.variety]) {
        stats[lot.variety] = {
          variety: lot.variety,
          totalProfit: 0,
          totalRevenue: 0,
          totalCosts: 0,
          lots: 0,
          avgMargin: 0,
          avgROI: 0
        };
      }
      
      stats[lot.variety].totalProfit += lot.profit;
      stats[lot.variety].totalRevenue += lot.totalSales;
      stats[lot.variety].totalCosts += lot.totalCosts;
      stats[lot.variety].lots += 1;
    });

    // Calculate averages
    Object.values(stats).forEach(variety => {
      variety.avgMargin = variety.totalRevenue > 0 ? 
        (variety.totalProfit / variety.totalRevenue) * 100 : 0;
      variety.avgROI = variety.totalCosts > 0 ? 
        (variety.totalProfit / variety.totalCosts) * 100 : 0;
    });

    return Object.values(stats)
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 15);
  }, [data]);

  const chartData = {
    labels: varietyStats.map(v => v.variety),
    datasets: [
      {
        type: 'bar',
        label: 'Total Profit',
        data: varietyStats.map(v => v.totalProfit),
        backgroundColor: 'rgba(59,130,246,0.7)',
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Avg Profit Margin %',
        data: varietyStats.map(v => v.avgMargin),
        borderColor: 'rgba(16,185,129,1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Total Profit ($)' },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Profit Margin (%)' },
        grid: { drawOnChartArea: false },
      },
    },
    plugins: {
      title: { display: true, text: 'Profitability by Variety' },
      legend: { display: true, position: 'top' }
    }
  };

  return (
    <div className="my-8">
      <h3 className="text-2xl font-bold mb-2 text-[#EE6C4D]">Variety Profitability Analysis</h3>
      <p className="text-gray-600 mb-6 text-sm">Analysis of profitability performance across different grape varieties, showing total profits and average margins.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="h-[400px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Variety Stats Table */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="text-lg font-bold mb-4">Top 15 Varieties by Profit</h4>
          <div className="overflow-y-auto max-h-[350px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="text-left p-2">Variety</th>
                  <th className="text-right p-2">Profit</th>
                  <th className="text-right p-2">Margin</th>
                  <th className="text-right p-2">Lots</th>
                </tr>
              </thead>
              <tbody>
                {varietyStats.map((variety, idx) => (
                  <tr key={variety.variety} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-2 font-medium">{variety.variety}</td>
                    <td className="p-2 text-right">{formatTotalSales(variety.totalProfit)}</td>
                    <td className="p-2 text-right">{variety.avgMargin.toFixed(1)}%</td>
                    <td className="p-2 text-right">{variety.lots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exporter Analysis Component
const ExporterAnalysis = ({ data }) => {
  const exporterStats = useMemo(() => {
    const stats = {};
    
    data.forEach(lot => {
      if (!stats[lot.exporter]) {
        stats[lot.exporter] = {
          exporter: lot.exporter,
          totalProfit: 0,
          totalRevenue: 0,
          totalCosts: 0,
          lots: 0,
          profitableLots: 0,
          avgMargin: 0,
          avgROI: 0
        };
      }
      
      stats[lot.exporter].totalProfit += lot.profit;
      stats[lot.exporter].totalRevenue += lot.totalSales;
      stats[lot.exporter].totalCosts += lot.totalCosts;
      stats[lot.exporter].lots += 1;
      if (lot.profit > 0) stats[lot.exporter].profitableLots += 1;
    });

    // Calculate averages
    Object.values(stats).forEach(exporter => {
      exporter.avgMargin = exporter.totalRevenue > 0 ? 
        (exporter.totalProfit / exporter.totalRevenue) * 100 : 0;
      exporter.avgROI = exporter.totalCosts > 0 ? 
        (exporter.totalProfit / exporter.totalCosts) * 100 : 0;
      exporter.successRate = exporter.lots > 0 ? 
        (exporter.profitableLots / exporter.lots) * 100 : 0;
    });

    return Object.values(stats).sort((a, b) => b.totalProfit - a.totalProfit);
  }, [data]);

  return (
    <div className="my-8">
      <h3 className="text-2xl font-bold mb-2 text-[#EE6C4D]">Exporter Profitability Analysis</h3>
      <p className="text-gray-600 mb-6 text-sm">Comprehensive profitability analysis by exporter, including success rates, margins, and return on investment metrics.</p>
      
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3">Exporter</th>
                <th className="text-right p-3">Total Profit</th>
                <th className="text-right p-3">Revenue</th>
                <th className="text-right p-3">Costs</th>
                <th className="text-right p-3">Profit Margin</th>
                <th className="text-right p-3">ROI</th>
                <th className="text-right p-3">Success Rate</th>
                <th className="text-right p-3">Total Lots</th>
              </tr>
            </thead>
            <tbody>
              {exporterStats.map((exporter, idx) => (
                <tr key={exporter.exporter} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3 font-semibold">{exporter.exporter}</td>
                  <td className={`p-3 text-right font-bold ${exporter.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatTotalSales(exporter.totalProfit)}
                  </td>
                  <td className="p-3 text-right">{formatTotalSales(exporter.totalRevenue)}</td>
                  <td className="p-3 text-right">{formatTotalSales(exporter.totalCosts)}</td>
                  <td className={`p-3 text-right ${exporter.avgMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {exporter.avgMargin.toFixed(1)}%
                  </td>
                  <td className={`p-3 text-right ${exporter.avgROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {exporter.avgROI.toFixed(1)}%
                  </td>
                  <td className="p-3 text-right">{exporter.successRate.toFixed(1)}%</td>
                  <td className="p-3 text-right">{exporter.lots}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main Profitability Report Component
const ProfitabilityReport = ({ onRefsUpdate }) => {
  const [expandedSections, setExpandedSections] = useState({
    kpis: true,
    performers: true,
    varieties: true,
    exporters: true,
  });
  const [profitabilityData, setProfitabilityData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create refs for navigation using useRef to ensure they persist
  const sectionRefs = useRef({
    'KPIs': useRef(null),
    'Top Performers': useRef(null),
    'Variety Analysis': useRef(null),
    'Exporter Analysis': useRef(null),
  }).current;

  // Update parent component with refs
  useEffect(() => {
    console.log('📊 ProfitabilityReport useEffect for refs update');
    console.log('📊 onRefsUpdate exists:', !!onRefsUpdate);
    console.log('📊 sectionRefs keys:', Object.keys(sectionRefs));
    
    // Use setTimeout to ensure refs are ready after render
    const timeoutId = setTimeout(() => {
      if (onRefsUpdate) {
        console.log('📊 Calling onRefsUpdate with refs (delayed)');
        onRefsUpdate(sectionRefs);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [onRefsUpdate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await processProfitabilityData();
        setProfitabilityData(data);
        registerChartPlugins();
        console.log('💰 Profitability Report loaded with', data.length, 'lots');
      } catch (error) {
        console.error('Error loading profitability data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳</div>
          <div className="text-lg text-gray-600">Loading profitability data...</div>
        </div>
      </div>
    );
  }

  if (!profitabilityData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-2xl mb-4">⚠️</div>
          <div className="text-lg text-gray-600">No profitability data available</div>
          <div className="text-sm text-gray-500">Unable to match sales and cost data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F4] w-full m-0 p-0">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-center mb-8 text-[#EE6C4D]">Profitability Analysis Report</h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Comprehensive profitability analysis combining sales revenue and operational costs to identify the most and least profitable lots, varieties, and exporters.
          </p>
        </div>

      {/* KPI Cards */}
      <div ref={sectionRefs['KPIs']} id="KPIs">
        <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">Profitability KPIs</h2>
        <p className="text-gray-600 mb-4 text-sm">Key profitability metrics showing overall financial performance, profit margins, and return on investment.</p>
        <ProfitabilityKPIs data={profitabilityData} />
      </div>

      {/* Top/Bottom Performers */}
      <div ref={sectionRefs['Top Performers']} id="Top Performers">
        <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">Performance Rankings</h2>
        <p className="text-gray-600 mb-4 text-sm">Rankings of individual lots by profitability, identifying top performers and opportunities for improvement. ROI (Return on Investment) is calculated as: (Total Profit / Total Operational Costs) × 100.</p>
        <TopBottomPerformers data={profitabilityData} />
      </div>

      {/* Variety Analysis */}
      <div ref={sectionRefs['Variety Analysis']} id="Variety Analysis">
        <VarietyAnalysis data={profitabilityData} />
      </div>

      {/* Exporter Analysis */}
      <div ref={sectionRefs['Exporter Analysis']} id="Exporter Analysis">
        <ExporterAnalysis data={profitabilityData} />
      </div>
      </div>
    </div>
  );
};

export default ProfitabilityReport;
