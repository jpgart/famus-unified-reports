import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import Papa from 'papaparse';
import { Chart as ChartJS } from 'chart.js/auto';
import { salesData, getSalesData, getDataSummary } from '../../data/salesDataEmbedded';
import { getUnique, filterData, groupBy } from '../../utils/dataProcessing';
import { formatNumber, formatPrice, isPriceField, isTotalSalesField, formatTotalSales } from '../../utils/formatters';
import { getDefaultChartOptions, FAMUS_COLORS, registerChartPlugins } from '../../utils/chartConfig';
import { KPISection } from '../common';
import { filterExportersList } from '../../utils/dataFiltering';

// Combined chart with dual Y-axis
const getChartData = (data, xKey, barKey, lineKey) => {
  const labels = getUnique(data, xKey);
  const barData = labels.map(label => {
    const rows = data.filter(row => row[xKey] === label);
    return rows.reduce((sum, r) => sum + Number(r[barKey] || 0), 0);
  });
  const lineData = labels.map(label => {
    const rows = data.filter(row => row[xKey] === label);
    const vals = rows.map(r => Number(r[lineKey] || 0)).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  return {
    labels,
    datasets: [
      {
        type: 'bar',
        label: barKey,
        data: barData,
        backgroundColor: 'rgba(59,130,246,0.5)',
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Avg Price',
        data: lineData,
        borderColor: 'rgba(16,185,129,1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };
};

// KPICards: tarjetas de KPIs grandes, centradas y filtrables por Exporter
const KPICards = ({ data }) => {
  const [selectedExporter, setSelectedExporter] = React.useState('All');
  const allExporters = Array.from(new Set(data.map(r => r['Exporter Clean'])).values()).filter(Boolean);
  const filteredExporters = filterExportersList(allExporters);
  const exporters = ['All', ...filteredExporters];
  const filtered = selectedExporter === 'All' ? data : data.filter(r => r['Exporter Clean'] === selectedExporter);
  
  if (!data.length) return null;

  // KPI calculations
  const totalSales = filtered.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0);
  const totalQty = filtered.reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0);
  const avgPrice = filtered.length ? filtered.map(r => Number(r['Price Four Star'] || 0)).filter(Boolean).reduce((a, b) => a + b, 0) / filtered.filter(r => Number(r['Price Four Star'])).length : 0;
  const uniqueRetailers = new Set(filtered.map(r => r['Retailer Name'])).size;
  const uniqueExporters = new Set(filtered.map(r => r['Exporter Clean'])).size;
  const uniqueVarieties = new Set(filtered.map(r => r['Variety'])).size;

  // KPIs data for the new component
  const kpis = [
    { 
      label: 'Total Sales', 
      value: totalSales, 
      type: 'totalSales',
      size: 'normal'
    },
    { 
      label: 'Total Quantity', 
      value: totalQty, 
      type: 'integer',
      size: 'normal'
    },
    { 
      label: 'Avg. Four Star Price', 
      value: avgPrice, 
      type: 'money',
      size: 'normal'
    },
    { 
      label: 'Retailers', 
      value: uniqueRetailers, 
      type: 'integer',
      size: 'normal'
    },
    { 
      label: 'Exporters', 
      value: uniqueExporters, 
      type: 'integer',
      size: 'normal'
    },
    { 
      label: 'Varieties', 
      value: uniqueVarieties, 
      type: 'integer',
      size: 'normal'
    },
  ];

  // Chart data for sales by exporter
  const exporterSalesData = exporters.filter(exp => exp !== 'All').map(exporter => {
    const exporterData = data.filter(r => r['Exporter Clean'] === exporter);
    return {
      exporter,
      sales: exporterData.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0)
    };
  }).sort((a, b) => b.sales - a.sales);

  const chartData = {
    labels: exporterSalesData.map(d => d.exporter),
    datasets: [
      {
        label: 'Total Sales ($)',
        data: exporterSalesData.map(d => d.sales),
        backgroundColor: '#3D5A80',
        borderColor: '#EE6C4D',
        borderWidth: 1,
      },
    ],
  };

  const chart = {
    type: 'bar',
    title: `Total Sales by Exporter${selectedExporter !== 'All' ? ` - ${selectedExporter}` : ''}`,
    data: chartData,
    options: {
      plugins: {
        legend: { display: false },
      },
    }
  };

  return (
    <div className="my-10">
      {/* KPI Section */}
      <KPISection
        title="📊 KPIs"
        subtitle="Key Performance Indicators - Sales Analysis"
        titleColor="text-famus-orange"
        backgroundColor="bg-[#F9F6F4]"
        kpis={kpis}
        chart={null}
        showChart={false}
        containerClass="rounded-xl"
      />

      {/* Exporter Filter */}
      <div className="flex justify-center my-8">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg text-[#3D5A80]">Filter by Exporter:</span>
          <select 
            value={selectedExporter} 
            onChange={e => setSelectedExporter(e.target.value)} 
            className="border border-famus-navy p-2 rounded text-lg bg-white focus:ring-2 focus:ring-famus-orange"
          >
            {exporters.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Sales Analysis Legend */}
      <div className="mt-6 max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">ℹ️</span>
            Sales Analysis Methodology
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>• Total Sales:</strong> Combined revenue from all recorded transactions</p>
            <p><strong>• Four Star Price:</strong> Premium pricing tier for highest quality grapes</p>
            <p><strong>• Analysis Scope:</strong> Includes all varieties, exporters, and retail channels</p>
            <p><strong>• Data Coverage:</strong> Complete sales performance across all market segments</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {selectedExporter === 'All' && (
        <div className="bg-white rounded-2xl shadow-md p-6 mx-auto max-w-6xl">
          <div className="relative h-[400px] sm:h-[500px] md:h-[600px]">
            <Bar data={chart.data} options={chart.options} />
          </div>
          <div className="mt-4 text-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold mb-1">Sales Volume and Price Analysis by Variety</p>
            <p>This chart displays the total sales quantity (blue bars) and average four-star price (green line) for each grape variety. The dual-axis visualization helps identify both volume leaders and premium-priced varieties in the market.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Key Market Insights Component with Collapsible Sections
const KeyMarketInsights = ({ data }) => {
  const [expandedSections, setExpandedSections] = useState({
    leadership: false,
    risks: false,
    premium: false,
    commodity: false,
    coverage: false
  });

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Generate insights categorized by section
  const generateCategorizedInsights = () => {
    const allExporters = getUnique(data, 'Exporter Clean').filter(Boolean);
    const allRetailers = getUnique(data, 'Retailer Name').filter(Boolean);
    
    const categorized = {
      leadership: [],
      risks: [],
      premium: [],
      commodity: [],
      coverage: []
    };

    if (!data.length) return categorized;

    // Calculate analysis data
    const exportersAnalysis = allExporters.map(exporter => {
      const exporterData = data.filter(d => d['Exporter Clean'] === exporter);
      const totalSales = exporterData.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0);
      const retailers = getUnique(exporterData, 'Retailer Name').filter(Boolean);
      
      const retailerStats = retailers.map(retailer => {
        const retailerData = exporterData.filter(d => d['Retailer Name'] === retailer);
        const sales = retailerData.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0);
        const avgPrice = retailerData.length 
          ? retailerData.map(r => Number(r['Price Four Star'] || 0)).filter(Boolean).reduce((a, b) => a + b, 0) / retailerData.filter(r => Number(r['Price Four Star'])).length
          : 0;
        
        return {
          retailer,
          sales,
          avgPrice,
          percentage: totalSales ? (sales / totalSales * 100) : 0
        };
      }).sort((a, b) => b.sales - a.sales);

      return { exporter, totalSales, topRetailers: retailerStats.slice(0, 5) };
    }).sort((a, b) => b.totalSales - a.totalSales);

    // 🥇 LEADERSHIP INSIGHTS
    if (exportersAnalysis.length > 0) {
      const marketLeader = exportersAnalysis[0];
      const totalMarketSales = data.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0);
      const leaderShare = totalMarketSales ? (marketLeader.totalSales / totalMarketSales * 100) : 0;
      
      categorized.leadership.push(`${marketLeader.exporter} leads the market with ${leaderShare.toFixed(1)}% of total sales ($${marketLeader.totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })})`);
      
      // Top performers concentration
      const top3Share = exportersAnalysis.slice(0, 3).reduce((sum, e) => sum + e.totalSales, 0);
      const top3Percentage = totalMarketSales ? (top3Share / totalMarketSales * 100) : 0;
      if (top3Percentage > 60) {
        categorized.leadership.push(`Market concentration: Top 3 exporters control ${top3Percentage.toFixed(1)}% of total sales`);
      }
    }

    // Retailer demand leadership
    const retailerDemand = allRetailers.map(retailer => {
      const retailerData = data.filter(d => d['Retailer Name'] === retailer);
      const totalVolume = retailerData.reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0);
      return { retailer, totalVolume };
    }).sort((a, b) => b.totalVolume - a.totalVolume);
    
    if (retailerDemand[0]) {
      const totalVolume = retailerDemand.reduce((sum, r) => sum + r.totalVolume, 0);
      const topRetailerShare = totalVolume ? (retailerDemand[0].totalVolume / totalVolume * 100) : 0;
      categorized.leadership.push(`${retailerDemand[0].retailer} represents the largest share of demand with ${topRetailerShare.toFixed(1)}% of total volume`);
    }

    // ⚠️ RISKS & CONCENTRATION
    exportersAnalysis.forEach(exporterData => {
      if (exporterData.topRetailers && exporterData.topRetailers.length > 0) {
        const topRetailer = exporterData.topRetailers[0];
        if (topRetailer.percentage > 60) {
          categorized.risks.push(`${exporterData.exporter} has high dependency risk: ${topRetailer.percentage.toFixed(1)}% of sales from ${topRetailer.retailer}`);
        }
      }
    });

    // Retailer dependency on exporters
    allRetailers.forEach(retailer => {
      const retailerData = data.filter(d => d['Retailer Name'] === retailer);
      const exporterSales = allExporters.map(exporter => {
        const exporterData = retailerData.filter(d => d['Exporter Clean'] === exporter);
        const sales = exporterData.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0);
        return { exporter, sales };
      }).filter(e => e.sales > 0).sort((a, b) => b.sales - a.sales);
      
      if (exporterSales.length > 0) {
        const totalRetailerSales = exporterSales.reduce((sum, e) => sum + e.sales, 0);
        const topExporterShare = totalRetailerSales ? (exporterSales[0].sales / totalRetailerSales * 100) : 0;
        if (topExporterShare > 60) {
          categorized.risks.push(`${retailer} depends heavily on ${exporterSales[0].exporter} for ${topExporterShare.toFixed(1)}% of purchases`);
        }
      }
    });

    // 💰 PREMIUM POSITIONING
    const allPrices = data.map(r => Number(r['Price Four Star'] || 0)).filter(p => p > 0);
    const avgMarketPrice = allPrices.length ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : 0;
    
    // Premium exporters (>$25)
    exportersAnalysis.forEach(exporterData => {
      if (exporterData.topRetailers && exporterData.topRetailers.length > 0) {
        const avgExporterPrice = exporterData.topRetailers.reduce((sum, r) => sum + r.avgPrice, 0) / exporterData.topRetailers.length;
        if (avgExporterPrice > 25) {
          categorized.premium.push(`${exporterData.exporter} maintains premium pricing at $${avgExporterPrice.toFixed(1)} average`);
        }
      }
    });

    // Premium retailers (above market average)
    allRetailers.forEach(retailer => {
      const retailerData = data.filter(d => d['Retailer Name'] === retailer);
      const retailerPrices = retailerData.map(r => Number(r['Price Four Star'] || 0)).filter(p => p > 0);
      if (retailerPrices.length > 0) {
        const avgRetailerPrice = retailerPrices.reduce((a, b) => a + b, 0) / retailerPrices.length;
        if (avgRetailerPrice > avgMarketPrice * 1.2) { // 20% above market
          categorized.premium.push(`${retailer} pays premium prices ($${avgRetailerPrice.toFixed(1)}) indicating high-value positioning`);
        }
      }
    });

    // Premium varieties
    const varieties = getUnique(data, 'Variety').filter(Boolean);
    const varietyPrices = varieties.map(variety => {
      const varietyData = data.filter(d => d['Variety'] === variety);
      const prices = varietyData.map(r => Number(r['Price Four Star'] || 0)).filter(p => p > 0);
      const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
      return { variety, avgPrice };
    }).sort((a, b) => b.avgPrice - a.avgPrice);
    
    if (varietyPrices[0] && varietyPrices[0].avgPrice > 0) {
      categorized.premium.push(`${varietyPrices[0].variety} commands highest pricing at $${varietyPrices[0].avgPrice.toFixed(1)} average`);
    }

    // 📉 COMMODITY PATTERNS
    // Low price exporters
    exportersAnalysis.forEach(exporterData => {
      if (exporterData.topRetailers && exporterData.topRetailers.length > 0) {
        const avgExporterPrice = exporterData.topRetailers.reduce((sum, r) => sum + r.avgPrice, 0) / exporterData.topRetailers.length;
        if (avgExporterPrice < avgMarketPrice * 0.8 && avgExporterPrice > 0) { // 20% below market
          categorized.commodity.push(`${exporterData.exporter} focuses on commodity pricing at $${avgExporterPrice.toFixed(1)} average`);
        }
      }
    });

    // Low price retailers (≤$10)
    allRetailers.forEach(retailer => {
      const retailerData = data.filter(d => d['Retailer Name'] === retailer);
      const retailerPrices = retailerData.map(r => Number(r['Price Four Star'] || 0)).filter(p => p > 0);
      if (retailerPrices.length > 0) {
        const avgRetailerPrice = retailerPrices.reduce((a, b) => a + b, 0) / retailerPrices.length;
        if (avgRetailerPrice <= 10) {
          categorized.commodity.push(`${retailer} pursues volume strategy with low prices ($${avgRetailerPrice.toFixed(1)} average)`);
        }
      }
    });

    // 📦 VOLUME & COVERAGE
    // Exporter market reach
    exportersAnalysis.forEach(exporterData => {
      const exporterRetailers = getUnique(data.filter(d => d['Exporter Clean'] === exporterData.exporter), 'Retailer Name').filter(Boolean);
      if (exporterRetailers.length >= 5) {
        categorized.coverage.push(`${exporterData.exporter} has broad reach, selling to ${exporterRetailers.length} unique retailers`);
      }
    });

    // Retailer diversification
    allRetailers.forEach(retailer => {
      const retailerExporters = getUnique(data.filter(d => d['Retailer Name'] === retailer), 'Exporter Clean').filter(Boolean);
      if (retailerExporters.length >= 3) {
        categorized.coverage.push(`${retailer} diversifies supply across ${retailerExporters.length} different exporters`);
      }
    });

    return categorized;
  };

  const categorizedInsights = generateCategorizedInsights();
  
  if (!data.length) return null;

  return (
    <div className="my-8 bg-[#F9F6F4] rounded-2xl p-6 shadow-md border border-[#98C1D9]">
      <h3 className="text-2xl font-bold mb-2 text-[#EE6C4D]">🔍 Key Market Insights</h3>
      <p className="text-gray-600 mb-6 text-sm">Overview of primary market statistics, including total revenue, sales volume, product diversity, and market participation metrics.</p>
      
      {/* 🥇 Market Share & Leadership */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('leadership')}
          className="w-full text-left flex items-center justify-between p-3 bg-[#3D5A80] rounded-lg hover:bg-[#2E4B6B] transition-colors"
        >
          <h4 className="text-lg font-bold text-white">🥇 Market Share & Leadership</h4>
          <span className="text-white">{expandedSections.leadership ? '▼' : '▶'}</span>
        </button>
        {expandedSections.leadership && (
          <div className="mt-2 p-4 bg-white rounded-lg border-2 border-[#3D5A80] max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {categorizedInsights.leadership.map((insight, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#3D5A80] mr-2 font-bold">•</span>
                  <span className="text-[#293241] text-sm leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ⚠️ Dependency & Concentration Risks */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('risks')}
          className="w-full text-left flex items-center justify-between p-3 bg-[#6B8B9E] rounded-lg hover:bg-[#5A7A8C] transition-colors"
        >
          <h4 className="text-lg font-bold text-white">⚠️ Dependency & Concentration Risks</h4>
          <span className="text-white">{expandedSections.risks ? '▼' : '▶'}</span>
        </button>
        {expandedSections.risks && (
          <div className="mt-2 p-4 bg-white rounded-lg border-2 border-[#6B8B9E] max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {categorizedInsights.risks.map((insight, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#6B8B9E] mr-2 font-bold">•</span>
                  <span className="text-[#293241] text-sm leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 💰 Premium Price Positioning */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('premium')}
          className="w-full text-left flex items-center justify-between p-3 bg-[#98C1D9] rounded-lg hover:bg-[#86B4D1] transition-colors"
        >
          <h4 className="text-lg font-bold text-white">💰 Premium Price Positioning</h4>
          <span className="text-white">{expandedSections.premium ? '▼' : '▶'}</span>
        </button>
        {expandedSections.premium && (
          <div className="mt-2 p-4 bg-white rounded-lg border-2 border-[#98C1D9] max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {categorizedInsights.premium.map((insight, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#98C1D9] mr-2 font-bold">•</span>
                  <span className="text-[#293241] text-sm leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 📉 Low Price / Commodity Patterns */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('commodity')}
          className="w-full text-left flex items-center justify-between p-3 bg-[#BEE0EB] rounded-lg hover:bg-[#AAD8E3] transition-colors"
        >
          <h4 className="text-lg font-bold text-[#293241]">📉 Low Price / Commodity Patterns</h4>
          <span className="text-[#293241]">{expandedSections.commodity ? '▼' : '▶'}</span>
        </button>
        {expandedSections.commodity && (
          <div className="mt-2 p-4 bg-white rounded-lg border-2 border-[#BEE0EB] max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {categorizedInsights.commodity.map((insight, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#BEE0EB] mr-2 font-bold">•</span>
                  <span className="text-[#293241] text-sm leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 📦 Volume & Coverage */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('coverage')}
          className="w-full text-left flex items-center justify-between p-3 bg-[#E0FBFC] rounded-lg hover:bg-[#D1F4F7] transition-colors"
        >
          <h4 className="text-lg font-bold text-[#293241]">📦 Volume & Coverage</h4>
          <span className="text-[#293241]">{expandedSections.coverage ? '▼' : '▶'}</span>
        </button>
        {expandedSections.coverage && (
          <div className="mt-2 p-4 bg-white rounded-lg border-2 border-[#E0FBFC] max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {categorizedInsights.coverage.map((insight, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#E0FBFC] mr-2 font-bold">•</span>
                  <span className="text-[#293241] text-sm leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Pie chart data util
const getPieData = (data, labelKey, valueKey) => {
  const labels = getUnique(data, labelKey);
  const values = labels.map(label => {
    const rows = data.filter(row => row[labelKey] === label);
    return rows.reduce((sum, r) => sum + Number(r[valueKey] || 0), 0);
  });
  const total = values.reduce((a, b) => a + b, 0);
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          '#60a5fa', '#64748b', '#34d399', '#475569', '#a78bfa', '#f472b6', '#facc15', '#38bdf8', '#fca5a5', '#a3e635',
        ],
        // Mostrar porcentaje en tooltip
        datalabels: {
          display: true,
          color: '#222',
          font: { weight: 'bold', size: 16 },
          formatter: (value, ctx) => {
            const percent = total ? (value / total * 100) : 0;
            return percent > 2 ? percent.toFixed(1) + '%' : '';
          },
        },
      },
    ],
  };
};

// Global chart options
// Enhanced chart options with complete price formatting for ALL price-related tooltips
// Updated to ensure $XX.X format for all price tooltips
// Fixed Total Sales to use proper thousands separator format
// Final review completed - all formatting standardized
const chartOptions = {
  responsive: true,
  interaction: { mode: 'index', intersect: false },
  plugins: { 
    legend: { position: 'top' },
    tooltip: {
      backgroundColor: '#3D5A80',
      titleColor: '#F9F6F4',
      bodyColor: '#F9F6F4',
      borderColor: '#EE6C4D',
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          let value = context.parsed.y;
          
          // Enhanced price detection - covers ALL price-related fields
          if (label.toLowerCase().includes('sales amount') ||
              label.toLowerCase().includes('total sales') ||
              label.toLowerCase().includes('revenue')) {
            // For large sales amounts, use thousands separator without decimals
            return `${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
          } else if (label.toLowerCase().includes('price') || 
              label.toLowerCase().includes('cost') || 
              label.toLowerCase().includes('avg price') ||
              label.toLowerCase().includes('four star price') ||
              label.toLowerCase().includes('average price') ||
              label.toLowerCase().includes('profit')) {
            return `${label}: $${value.toFixed(1)}`;
          } else if (label.toLowerCase().includes('quantity') || 
                     label.toLowerCase().includes('sale quantity') ||
                     label.toLowerCase().includes('boxes') ||
                     label.toLowerCase().includes('units')) {
            return `${label}: ${value.toLocaleString()}`;
          } else {
            // Default fallback: if value is decimal and > 10, likely price
            if (value > 10 && value % 1 !== 0) {
              return `${label}: $${value.toFixed(1)}`;
            }
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      }
    }
  },
  scales: {
    y: {
      type: 'linear',
      position: 'left',
      title: { display: true, text: 'Sale Quantity' },
      beginAtZero: true,
    },
    y1: {
      type: 'linear',
      position: 'right',
      title: { display: true, text: 'Avg Price ($)' },
      grid: { drawOnChartArea: false },
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '$' + value.toFixed(1);
        }
      },
    },
  },
};

// Chart by variety
const getVarietyChartData = (data) => {
  const labels = getUnique(data, 'Variety');
  const barData = labels.map(label => {
    const rows = data.filter(row => row['Variety'] === label);
    return rows.reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0);
  });
  const lineData = labels.map(label => {
    const rows = data.filter(row => row['Variety'] === label);
    const vals = rows.map(r => Number(r['Price Four Star'] || 0)).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  return {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Sale Quantity',
        data: barData,
        backgroundColor: 'rgba(59,130,246,0.5)',
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Avg Price',  // This label contains "Price" so tooltip formatting will work
        data: lineData,
        borderColor: 'rgba(16,185,129,1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };
};

// Temporal visualization (timeline)
const getTimelineChartData = (data) => {
  // Agrupar por fecha
  const dateKey = 'Sale Date';
  const labels = getUnique(data, dateKey).sort();
  const barData = labels.map(label => {
    const rows = data.filter(row => row[dateKey] === label);
    return rows.reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0);
  });
  const lineData = labels.map(label => {
    const rows = data.filter(row => row[dateKey] === label);
    const vals = rows.map(r => Number(r['Price Four Star'] || 0)).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  return {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Sale Quantity',
        data: barData,
        backgroundColor: 'rgba(59,130,246,0.5)',
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Avg Price',  // This label contains "Price" so tooltip formatting will work
        data: lineData,
        borderColor: 'rgba(16,185,129,1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };
};

// Price difference alert module
const PriceAlerts = ({ data, threshold = 0.15 }) => {
  if (!data.length) return null;
  const globalAvg = useMemo(() => {
    const vals = data.map(r => Number(r['Price Four Star'])).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [data]);
  const alerts = useMemo(() => {
    const byRetailer = groupBy(data, ['Retailer Name']);
    return Object.entries(byRetailer).map(([retailer, rows]) => {
      const avg = rows.map(r => Number(r['Price Four Star'])).filter(Boolean);
      const avgVal = avg.length ? avg.reduce((a, b) => a + b, 0) / avg.length : 0;
      const diff = Math.abs(avgVal - globalAvg) / (globalAvg || 1);
      return { retailer, avg: avgVal, diff };
    }).filter(a => a.diff > threshold).sort((a, b) => b.diff - a.diff);
  }, [data, globalAvg, threshold]);
  if (!alerts.length) return null;
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <strong>Price Alerts:</strong>
      <ul className="list-disc ml-6">
        {alerts.map(a => (
          <li key={a.retailer}>
            {a.retailer}: {formatPrice(a.avg)} ({(a.diff * 100).toFixed(1)}% diff from avg)
          </li>
        ))}
      </ul>
    </div>
  );
};

// Tabla ordenable y con ajuste de ancho de columnas
const columns = [
  { key: 'Exporter Clean', label: 'Exporter', width: 120 },
  { key: 'Retailer Name', label: 'Retailer', width: 140 },
  { key: 'Variety', label: 'Variety', width: 120 },
  { key: 'Size', label: 'Size', width: 80 },
  { key: 'Sale Quantity', label: 'Sale Quantity', isNumber: true, width: 120 },
  { key: 'Sales Amount', label: 'Sales Amount', isNumber: true, isMoney: true, width: 120 },
  { key: 'Price Four Star', label: 'Avg Price', isNumber: true, isMoney: true, isAvg: true, width: 140 },
];

const SortableTable = ({ data }) => {
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [colWidths, setColWidths] = useState(columns.map(c => c.width || 120));

  const handleResize = (idx, e) => {
    const startX = e.clientX;
    const startWidth = colWidths[idx];
    const onMouseMove = moveEvent => {
      const newWidths = [...colWidths];
      newWidths[idx] = Math.max(60, startWidth + moveEvent.clientX - startX);
      setColWidths(newWidths);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const sorted = useMemo(() => {
    if (!sortCol) return data.slice(0, 20);
    const col = columns.find(c => c.key === sortCol);
    const sortedData = [...data].sort((a, b) => {
      let aVal = a[sortCol], bVal = b[sortCol];
      if (col?.isNumber) {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        aVal = aVal || '';
        bVal = bVal || '';
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sortedData.slice(0, 20);
  }, [data, sortCol, sortDir]);

  // Calcular promedio para Four Star Price
  const avgPrice = arr => {
    const vals = arr.map(r => Number(r['Price Four Star'])).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs text-center">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                style={{ width: colWidths[idx], minWidth: 60, position: 'relative' }}
                className="px-2 py-1 font-bold bg-gray-100 cursor-pointer select-none group"
                onClick={() => {
                  if (sortCol === col.key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                  else { setSortCol(col.key); setSortDir('asc'); }
                }}
              >
                {col.label} {sortCol === col.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                <span
                  style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 8, cursor: 'col-resize', zIndex: 10 }}
                  onMouseDown={e => { e.stopPropagation(); handleResize(idx, e); }}
                  className="inline-block align-middle group-hover:bg-blue-200"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="border-b">
              {columns.map((col, idx) => (
                <td key={col.key} className="px-2 py-1">
                  {col.isAvg
                    ? formatPrice(avgPrice([row]))
                    : col.isNumber && isTotalSalesField(col.key)
                      ? formatTotalSales(row[col.key])
                    : col.isNumber && isPriceField(col.key)
                      ? formatPrice(row[col.key])
                      : col.isNumber
                      ? formatNumber(row[col.key], col.isMoney)
                      : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Interactive table with quick filters
const FilterableTable = ({ data }) => {
  const [filters, setFilters] = useState(columns.map(() => ''));
  const filtered = useMemo(() => {
    return data.filter(row =>
      columns.every((col, idx) =>
        !filters[idx] || String(row[col.key] || '').toLowerCase().includes(filters[idx].toLowerCase())
      )
    );
  }, [data, filters]);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs text-center">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key} className="px-2 py-1 font-bold bg-gray-100">
                <div>{col.label}</div>
                <input
                  className="w-full border rounded text-xs px-1 mt-1"
                  value={filters[idx]}
                  onChange={e => {
                    const newFilters = [...filters];
                    newFilters[idx] = e.target.value;
                    setFilters(newFilters);
                  }}
                  placeholder="Filter..."
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, 15).map((row, i) => (
            <tr key={i} className="border-b">
              {columns.map((col, idx) => (
                <td key={col.key} className="px-2 py-1">
                  {col.isAvg
                    ? formatPrice(row[col.key])
                    : col.isNumber && isPriceField(col.key)
                      ? formatPrice(row[col.key])
                      : col.isNumber
                      ? formatNumber(row[col.key], col.isMoney)
                      : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Heatmap util con soporte para ordenamiento por valores
const getHeatmapMatrix = (data, rowKey, colKey, valueKey, agg = 'avg', rowFilter = 'All', colFilter = 'All', rowSort = 'desc', colSort = 'asc', sortByValue = false) => {
  let rows = getUnique(data, rowKey);
  let cols = getUnique(data, colKey);
  if (rowFilter !== 'All') rows = rows.filter(r => r === rowFilter);
  if (colFilter !== 'All') cols = cols.filter(c => c === colFilter);
  
  // Calculate matrix first for value-based sorting
  const calculateMatrix = (sortedRows, sortedCols) => {
    return sortedRows.map(row =>
      sortedCols.map(col => {
        const filtered = data.filter(d => d[rowKey] === row && d[colKey] === col);
        const vals = filtered.map(d => Number(d[valueKey])).filter(Boolean);
        if (!vals.length) return null;
        if (agg === 'sum') return vals.reduce((a, b) => a + b, 0);
        return vals.reduce((a, b) => a + b, 0) / vals.length;
      })
    );
  };

  // Sort rows
  if (sortByValue) {
    // Calculate row averages for value-based sorting
    const rowAverages = rows.map(row => {
      const rowData = data.filter(d => d[rowKey] === row);
      const vals = rowData.map(d => Number(d[valueKey])).filter(Boolean);
      const average = vals.length ? (agg === 'sum' ? vals.reduce((a, b) => a + b, 0) : vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      return { row, average };
    });
    
    const sortedRowData = rowAverages.sort((a, b) => rowSort === 'desc' ? b.average - a.average : a.average - b.average);
    rows = sortedRowData.map(item => item.row);
  } else {
    if (rowSort === 'desc') rows = [...rows].sort().reverse();
    else rows = [...rows].sort();
  }

  // Sort columns by value for variety sorting
  if (colSort !== 'asc') {
    // Calculate column averages for value-based sorting
    const colAverages = cols.map(col => {
      const colData = data.filter(d => d[colKey] === col);
      const vals = colData.map(d => Number(d[valueKey])).filter(Boolean);
      const average = vals.length ? (agg === 'sum' ? vals.reduce((a, b) => a + b, 0) : vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      return { col, average };
    });
    
    const sortedColData = colAverages.sort((a, b) => colSort === 'desc' ? b.average - a.average : a.average - b.average);
    cols = sortedColData.map(item => item.col);
  } else {
    cols = [...cols].sort(); // Alphabetical ascending
  }

  const matrix = calculateMatrix(rows, cols);
  return { rows, cols, matrix };
};

// Heatmap: regla de colores personalizada
const getHeatColor = (val, min, max) => {
  if (val === null) return '#f3f4f6';
  if (val < 0) return '#ee6c4d';
  if (max === min) return '#e0fbfc';
  const percent = (val - min) / (max - min + 0.0001);
  if (percent > 0.85) return '#3d5a80';
  if (percent > 0.5) return '#98c1d9';
  if (percent > 0.01) return '#e0fbfc';
  return '#e0fbfc';
};

const Heatmap = ({ data, rowKey, colKey, valueKey, agg, title }) => {
  const [rowFilter, setRowFilter] = useState('All');
  const [rowSort, setRowSort] = useState('desc');
  const [colSort, setColSort] = useState('desc'); // Default to desc for value sorting
  const [sortByValue, setSortByValue] = useState(true); // Enable value sorting by default
  
  const { rows, cols, matrix } = getHeatmapMatrix(data, rowKey, colKey, valueKey, agg, rowFilter, 'All', rowSort, colSort, sortByValue);
  const max = Math.max(...matrix.flat().filter(v => v !== null));
  const min = Math.min(...matrix.flat().filter(v => v !== null));
  const allRows = getUnique(data, rowKey);

  return (
    <div className="overflow-x-auto my-8 bg-[#F9F6F4] rounded-2xl p-6 shadow-md">
      <h3 className="text-2xl font-bold mb-4 text-[#EE6C4D]">{title}</h3>
      
      {/* Enhanced Controls */}
      <div className="flex gap-4 mb-6 flex-wrap items-center bg-white p-4 rounded-lg shadow-sm">
        {/* Row Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#3D5A80]">Filter {rowKey}:</span>
          <select 
            value={rowFilter} 
            onChange={e => setRowFilter(e.target.value)} 
            className="border border-[#98C1D9] p-2 rounded-lg bg-white focus:ring-2 focus:ring-[#98C1D9]"
          >
            <option>All</option>
            {allRows.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Row Sorting */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#3D5A80]">Sort {rowKey}:</span>
          <button 
            onClick={() => setSortByValue(!sortByValue)}
            className={`px-3 py-1 rounded-lg border-2 transition-colors ${sortByValue ? 'bg-[#98C1D9] text-white border-[#98C1D9]' : 'bg-white text-[#3D5A80] border-[#98C1D9]'}`}
          >
            {sortByValue ? 'By Value' : 'By Name'}
          </button>
          <button 
            onClick={() => setRowSort(rowSort === 'asc' ? 'desc' : 'asc')} 
            className="px-3 py-1 rounded-lg border-2 border-[#98C1D9] bg-white text-[#3D5A80] hover:bg-[#98C1D9] hover:text-white transition-colors"
          >
            {rowSort === 'asc' ? '↑ Low to High' : '↓ High to Low'}
          </button>
        </div>

        {/* Column Sorting */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#3D5A80]">Sort {colKey}:</span>
          <button 
            onClick={() => setColSort(colSort === 'asc' ? 'desc' : 'asc')} 
            className="px-3 py-1 rounded-lg border-2 border-[#EE6C4D] bg-white text-[#3D5A80] hover:bg-[#EE6C4D] hover:text-white transition-colors"
          >
            {colSort === 'asc' ? '↑ A-Z' : '↓ High to Low Value'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <span className="font-semibold text-[#3D5A80]">Color Scale:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#e0fbfc] border"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#98c1d9] border"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#3d5a80] border"></div>
          <span>High</span>
        </div>
        <span className="text-gray-600 ml-4">
          Range: {valueKey.includes('Price') ? `$${min.toFixed(1)} - $${max.toFixed(1)}` : `${Math.round(min).toLocaleString()} - ${Math.round(max).toLocaleString()}`}
        </span>
      </div>

      {/* Heatmap Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-auto max-h-96" style={{ maxHeight: '500px' }}>
        <div className="overflow-x-auto overflow-y-auto">
          <table className="w-full border-collapse text-xs min-w-full">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-left font-bold border sticky left-0 z-20">
                  {rowKey} \ {colKey}
                </th>
                {cols.map(col => (
                  <th key={col} className="bg-[#3D5A80] text-white px-2 py-2 text-center font-bold border min-w-[80px] max-w-[100px]">
                    <div className="leading-tight text-center whitespace-normal h-12 flex items-center justify-center text-xs">
                      {col.length > 15 ? col.substring(0, 15) + '...' : col}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row} className="hover:bg-gray-50">
                  <td className="font-bold bg-[#E0FBFC] px-3 py-2 border text-[#3D5A80] min-w-[120px] sticky left-0 z-10">
                    {row.length > 20 ? row.substring(0, 20) + '...' : row}
                  </td>
                  {cols.map((col, j) => {
                    const val = matrix[i][j];
                    let cellValue = val;
                    if (title.includes('Exporter vs Retailer') && val !== null) cellValue = `$${Math.round(val).toLocaleString('en-US')}`;
                    else if (valueKey.includes('Price') && val !== null) cellValue = formatPrice(val);
                    else if (val !== null) cellValue = formatNumber(val);
                    
                    return (
                      <td 
                        key={col} 
                        style={{
                          background: getHeatColor(val, min, max), 
                          color: val !== null && val > (min + max) / 2 ? 'white' : '#222'
                        }} 
                        className="px-1 py-1 font-semibold text-center border hover:scale-105 transition-transform cursor-pointer text-xs"
                        title={`${row} × ${col}: ${val !== null ? cellValue : 'No data'}`}
                      >
                        {val !== null ? cellValue : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 text-sm text-gray-600 bg-white p-3 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="font-semibold">Rows:</span> {rows.length}
          </div>
          <div>
            <span className="font-semibold">Columns:</span> {cols.length}
          </div>
          <div>
            <span className="font-semibold">Data Points:</span> {matrix.flat().filter(v => v !== null).length}
          </div>
          <div>
            <span className="font-semibold">Coverage:</span> {((matrix.flat().filter(v => v !== null).length / (rows.length * cols.length)) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

// Horizontal ranking with multiple selection for top 20
const RankingBar = ({ data, groupKey, valueKey, title }) => {
  const [selected, setSelected] = useState([0,1]);
  const groups = getUnique(data, groupKey);
  const ranked = groups.map(g => {
    const vals = data.filter(d => d[groupKey] === g).map(d => Number(d[valueKey])).filter(Boolean);
    return { key: g, value: vals.length ? vals.reduce((a, b) => a + b, 0) : 0 };
  }).sort((a, b) => b.value - a.value).slice(0, 20);
  const handleSelect = e => {
    const options = Array.from(e.target.options);
    setSelected(options.filter(o => o.selected).map(o => Number(o.value)));
  };
  return (
    <div className="my-8">
      <h3 className="font-bold mb-2">{title}</h3>
      <div className="mb-2 flex gap-2 items-center">
        <span>Selecciona posiciones (Ctrl/Cmd para múltiple):</span>
        <select multiple value={selected} onChange={handleSelect} className="border p-1 rounded h-32">
          {ranked.map((r, idx) => <option key={r.key} value={idx}>{`#${idx+1} - ${r.key}`}</option>)}
        </select>
      </div>
      <Bar data={{
        labels: selected.map(i => ranked[i]?.key),
        datasets: [{ label: valueKey, data: selected.map(i => ranked[i]?.value), backgroundColor: '#3d5a80' }],
      }} options={{ 
        indexAxis: 'y', 
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: '#3D5A80',
            titleColor: '#F9F6F4',
            bodyColor: '#F9F6F4',
            borderColor: '#EE6C4D',
            borderWidth: 1,
            cornerRadius: 6,
            callbacks: {
              label: function(context) {
                const value = context.parsed.x;
                if (valueKey.toLowerCase().includes('sales') || valueKey.toLowerCase().includes('amount')) {
                  return `${valueKey}: $${value.toLocaleString()}`;
                } else {
                  return `${valueKey}: ${value.toLocaleString()}`;
                }
              }
            }
          }
        } 
      }} />
    </div>
  );
};

// ExporterComparator: Spectacular version with animations and mobile optimization
const ExporterComparator = ({ data, exporters }) => {
  const [exp1, setExp1] = useState(exporters[0] || '');
  const [exp2, setExp2] = useState(exporters[1] || '');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleExporterChange = (setter) => (e) => {
    setIsAnimating(true);
    setter(e.target.value);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const data1 = data.filter(d => d['Exporter Clean'] === exp1);
  const data2 = data.filter(d => d['Exporter Clean'] === exp2);
  
  // Get all unique retailers and calculate metrics
  const labels = getUnique([...data1, ...data2], 'Retailer Name').slice(0, 15); // Limit for better visualization
  
  const barData1 = labels.map(label => data1.filter(r => r['Retailer Name'] === label).reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0));
  const barData2 = labels.map(label => data2.filter(r => r['Retailer Name'] === label).reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0));
  
  const lineData1 = labels.map(label => {
    const vals = data1.filter(r => r['Retailer Name'] === label).map(r => Number(r['Price Four Star'] || 0)).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  
  const lineData2 = labels.map(label => {
    const vals = data2.filter(r => r['Retailer Name'] === label).map(r => Number(r['Price Four Star'] || 0)).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });

  // Calculate summary stats for comparison cards
  const stats1 = {
    totalSales: data1.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0),
    totalQuantity: data1.reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0),
    avgPrice: data1.length ? data1.map(r => Number(r['Price Four Star'] || 0)).filter(Boolean).reduce((a, b) => a + b, 0) / data1.filter(r => Number(r['Price Four Star'])).length : 0,
    uniqueRetailers: getUnique(data1, 'Retailer Name').length,
    uniqueVarieties: getUnique(data1, 'Variety').length
  };

  const stats2 = {
    totalSales: data2.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0),
    totalQuantity: data2.reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0),
    avgPrice: data2.length ? data2.map(r => Number(r['Price Four Star'] || 0)).filter(Boolean).reduce((a, b) => a + b, 0) / data2.filter(r => Number(r['Price Four Star'])).length : 0,
    uniqueRetailers: getUnique(data2, 'Retailer Name').length,
    uniqueVarieties: getUnique(data2, 'Variety').length
  };

  const enhancedChartOptions = {
    ...chartOptions,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: window.innerWidth < 640 ? 10 : window.innerWidth < 1024 ? 12 : 14,
            weight: 'bold'
          },
          boxWidth: window.innerWidth < 640 ? 10 : 12,
          boxHeight: window.innerWidth < 640 ? 10 : 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#EE6C4D',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: window.innerWidth < 640 ? 12 : 14
        },
        bodyFont: {
          size: window.innerWidth < 640 ? 11 : 13
        },
        callbacks: {
          title: function(context) {
            return `Retailer: ${context[0].label}`;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            let value = context.parsed.y;
            
            if (label.toLowerCase().includes('sale quantity') || label.toLowerCase().includes('quantity')) {
              return `${label}: ${value?.toLocaleString()}`;
            } else if (label.toLowerCase().includes('price') || label.toLowerCase().includes('avg price')) {
              return `${label}: $${value?.toFixed(1)}`;
            }
            return `${label}: ${value?.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: { 
          display: true, 
          text: 'Sale Quantity', 
          font: { 
            size: window.innerWidth < 640 ? 10 : window.innerWidth < 1024 ? 12 : 14, 
            weight: 'bold' 
          } 
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 9 : window.innerWidth < 1024 ? 10 : 11
          },
          callback: function(value) {
            return value?.toLocaleString();
          }
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: { 
          display: true, 
          text: 'Avg Price ($)', 
          font: { 
            size: window.innerWidth < 640 ? 10 : window.innerWidth < 1024 ? 12 : 14, 
            weight: 'bold' 
          } 
        },
        grid: { drawOnChartArea: false },
        beginAtZero: true,
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 9 : window.innerWidth < 1024 ? 10 : 11
          },
          callback: function(value) {
            return '$' + value?.toFixed(1);
          }
        }
      },
      x: {
        ticks: {
          maxRotation: window.innerWidth < 640 ? 60 : window.innerWidth < 1024 ? 45 : 45,
          minRotation: window.innerWidth < 640 ? 45 : window.innerWidth < 1024 ? 30 : 45,
          font: {
            size: window.innerWidth < 640 ? 8 : window.innerWidth < 1024 ? 9 : 10
          }
        }
      }
    }
  };

  return (
    <div className="my-6 lg:my-8 bg-gradient-to-br from-[#F9F6F4] to-[#E0FBFC] rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-2xl border border-[#98C1D9]">
      <div className="text-center mb-6 lg:mb-8">
        <h3 className="text-2xl lg:text-4xl font-bold mb-3 lg:mb-4 text-[#3D5A80] bg-gradient-to-r from-[#3D5A80] to-[#98C1D9] bg-clip-text text-transparent">
          ⚖️ Exporter Performance Arena
        </h3>
        <p className="text-sm lg:text-lg text-gray-600 max-w-2xl mx-auto">
          Head-to-head comparison of exporter performance across key metrics and retailer relationships
        </p>
      </div>

      {/* Exporter Selection with Enhanced UI */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
        <div className="flex flex-col items-center">
          <label className="text-xs lg:text-sm font-semibold text-[#3D5A80] mb-2">Champion 1</label>
          <select 
            value={exp1} 
            onChange={handleExporterChange(setExp1)}
            className="border-2 border-[#98C1D9] p-2 lg:p-3 rounded-lg lg:rounded-xl text-sm lg:text-lg bg-white shadow-lg focus:ring-4 focus:ring-[#98C1D9] focus:border-[#3D5A80] transition-all duration-300 hover:shadow-xl min-w-[150px] lg:min-w-[200px]"
          >
            {exporters.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        
        <div className="text-2xl lg:text-4xl text-[#EE6C4D] animate-pulse">🥊</div>
        
        <div className="flex flex-col items-center">
          <label className="text-xs lg:text-sm font-semibold text-[#EE6C4D] mb-2">Champion 2</label>
          <select 
            value={exp2} 
            onChange={handleExporterChange(setExp2)}
            className="border-2 border-[#EE6C4D] p-2 lg:p-3 rounded-lg lg:rounded-xl text-sm lg:text-lg bg-white shadow-lg focus:ring-4 focus:ring-[#EE6C4D] focus:border-[#3D5A80] transition-all duration-300 hover:shadow-xl min-w-[150px] lg:min-w-[200px]"
          >
            {exporters.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Exporter 1 Stats */}
        <div className="bg-gradient-to-br from-[#98C1D9] to-[#3D5A80] text-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl transform hover:scale-105 transition-all duration-300">
          <h4 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-4 text-center">{exp1}</h4>
          <div className="grid grid-cols-2 gap-2 lg:gap-4 text-center">
            <div className="bg-white/20 rounded-lg p-2 lg:p-3">
              <div className="text-lg lg:text-2xl font-bold">${stats1.totalSales.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-xs lg:text-sm opacity-90">Total Sales</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 lg:p-3">
              <div className="text-lg lg:text-2xl font-bold">{stats1.totalQuantity.toLocaleString()}</div>
              <div className="text-xs lg:text-sm opacity-90">Total Quantity</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 lg:p-3">
              <div className="text-lg lg:text-2xl font-bold">${stats1.avgPrice.toFixed(1)}</div>
              <div className="text-xs lg:text-sm opacity-90">Avg Price</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 lg:p-3">
              <div className="text-lg lg:text-2xl font-bold">{stats1.uniqueRetailers}</div>
              <div className="text-xs lg:text-sm opacity-90">Retailers</div>
            </div>
          </div>
        </div>

        {/* Exporter 2 Stats */}
        <div className="bg-gradient-to-br from-[#EE6C4D] to-[#B91C1C] text-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl transform hover:scale-105 transition-all duration-300">
          <h4 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-4 text-center">{exp2}</h4>
          <div className="grid grid-cols-2 gap-2 lg:gap-4 text-center">
            <div className="bg-white/20 rounded-lg p-2 lg:p-3">
              <div className="text-lg lg:text-2xl font-bold">${stats2.totalSales.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-xs lg:text-sm opacity-90">Total Sales</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 lg:p-3">
              <div className="text-lg lg:text-2xl font-bold">{stats2.totalQuantity.toLocaleString()}</div>
              <div className="text-xs lg:text-sm opacity-90">Total Quantity</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 lg:p-3">
              <div className="text-lg lg:text-2xl font-bold">${stats2.avgPrice.toFixed(1)}</div>
              <div className="text-xs lg:text-sm opacity-90">Avg Price</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 lg:p-3">
              <div className="text-lg lg:text-2xl font-bold">{stats2.uniqueRetailers}</div>
              <div className="text-xs lg:text-sm opacity-90">Retailers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Chart */}
      <div className={`bg-white rounded-xl lg:rounded-2xl shadow-2xl p-3 lg:p-6 border border-gray-200 transition-all duration-500 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="text-center mb-3 lg:mb-4">
          <h4 className="text-lg lg:text-2xl font-bold text-[#3D5A80]">Performance by Retailer</h4>
          <p className="text-gray-600 text-xs lg:text-sm">Sales quantity (bars) and average prices (lines) comparison</p>
        </div>
        <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
          <Bar 
            data={{
              labels,
              datasets: [
                { 
                  type: 'bar', 
                  label: `${exp1} - Sale Quantity`, 
                  data: barData1, 
                  backgroundColor: 'rgba(152,193,217,0.8)', 
                  borderColor: 'rgba(152,193,217,1)',
                  borderWidth: window.innerWidth < 640 ? 1 : 2,
                  yAxisID: 'y',
                  hoverBackgroundColor: 'rgba(152,193,217,1)',
                  hoverBorderWidth: window.innerWidth < 640 ? 2 : 3
                },
                { 
                  type: 'bar', 
                  label: `${exp2} - Sale Quantity`, 
                  data: barData2, 
                  backgroundColor: 'rgba(238,108,77,0.8)', 
                  borderColor: 'rgba(238,108,77,1)',
                  borderWidth: window.innerWidth < 640 ? 1 : 2,
                  yAxisID: 'y',
                  hoverBackgroundColor: 'rgba(238,108,77,1)',
                  hoverBorderWidth: window.innerWidth < 640 ? 2 : 3
                },
                { 
                  type: 'line', 
                  label: `${exp1} - Avg Price`, 
                  data: lineData1, 
                  borderColor: 'rgba(61,90,128,1)', 
                  backgroundColor: 'rgba(61,90,128,0.1)',
                  borderWidth: window.innerWidth < 640 ? 2 : 4, 
                  fill: false, 
                  tension: 0.4, 
                  yAxisID: 'y1',
                  pointRadius: window.innerWidth < 640 ? 3 : 6,
                  pointHoverRadius: window.innerWidth < 640 ? 5 : 8,
                  pointBackgroundColor: 'rgba(61,90,128,1)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: window.innerWidth < 640 ? 1 : 2
                },
                { 
                  type: 'line', 
                  label: `${exp2} - Avg Price`, 
                  data: lineData2, 
                  borderColor: 'rgba(185,28,28,1)', 
                  backgroundColor: 'rgba(185,28,28,0.1)',
                  borderWidth: window.innerWidth < 640 ? 2 : 4, 
                  fill: false, 
                  tension: 0.4, 
                  yAxisID: 'y1',
                  pointRadius: window.innerWidth < 640 ? 3 : 6,
                  pointHoverRadius: window.innerWidth < 640 ? 5 : 8,
                  pointBackgroundColor: 'rgba(185,28,28,1)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: window.innerWidth < 640 ? 1 : 2
                },
              ]
            }} 
            options={enhancedChartOptions} 
          />
        </div>
        
        {/* Chart Legend */}
        <div className="mt-4 lg:mt-6 text-center text-gray-600 text-xs lg:text-sm bg-gray-50 p-3 lg:p-4 rounded-lg">
          <p className="font-semibold mb-1 lg:mb-2">Performance Comparison Analysis</p>
          <p>This interactive chart compares sales volume (bars) and average pricing (lines) between two selected exporters across their shared retailer network. Hover over data points for detailed insights and use touch/pinch gestures on mobile devices for better exploration.</p>
        </div>
      </div>
    </div>
  );
};

// Exportar tabla a CSV
const exportToCSV = (data, filename = 'export.csv') => {
  const csv = [columns.map(c => c.label).join(',')].concat(
    data.map(row => columns.map(c => row[c.key]).join(','))
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Historial de precios por Retailer/Exportador
const PriceHistory = ({ data, groupKey }) => {
  const groups = getUnique(data, groupKey);
  const [selected, setSelected] = useState(groups[0] || '');
  const filtered = data.filter(d => d[groupKey] === selected);
  
  // Specific chart options for Price History with enhanced price formatting
  const priceHistoryOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            let value = context.parsed.y;
            
            // For Price History, handle different types of values
            if (label.toLowerCase().includes('sales amount') ||
                label.toLowerCase().includes('total sales') ||
                label.toLowerCase().includes('revenue')) {
              return `${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            } else if (label.toLowerCase().includes('price') || 
                label.toLowerCase().includes('avg') ||
                label.toLowerCase().includes('four star') ||
                label === 'Avg Price') {
              return `${label}: $${value.toFixed(1)}`;
            } else if (label.toLowerCase().includes('quantity') || 
                       label.toLowerCase().includes('sale quantity')) {
              return `${label}: ${value.toLocaleString()}`;
            } else {
              // Default: if value looks like price data, format as currency
              if (value > 0.1 && value < 1000) {
                return `${label}: $${value.toFixed(1)}`;
              }
              return `${label}: ${value.toLocaleString()}`;
            }
          }
        }
      }
    }
  };
  
  return (
    <div className="my-4">
      <h3 className="font-bold mb-2">Price History ({groupKey})</h3>
      <select value={selected} onChange={e => setSelected(e.target.value)} className="border p-1 rounded mb-2">{groups.map(g => <option key={g}>{g}</option>)}</select>
      <Line data={getTimelineChartData(filtered)} options={priceHistoryOptions} />
    </div>
  );
};

// Automatic Analysis: Top 5 Retailers per Exporter with Insights
const ExporterRetailerAnalysis = ({ data }) => {
  // Calculate top retailers per exporter
  const getTopRetailersPerExporter = () => {
    const exporters = getUnique(data, 'Exporter Clean').filter(Boolean);
    
    return exporters.map(exporter => {
      const exporterData = data.filter(d => d['Exporter Clean'] === exporter);
      const retailers = getUnique(exporterData, 'Retailer Name').filter(Boolean);
      
      // Calculate TOTAL sales for the exporter (all retailers)
      const exporterTotalSales = exporterData.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0);
      
      const allRetailerStats = retailers.map(retailer => {
        const retailerData = exporterData.filter(d => d['Retailer Name'] === retailer);
        const totalSales = retailerData.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0);
        const totalQuantity = retailerData.reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0);
        const avgPrice = retailerData.length 
          ? retailerData.map(r => Number(r['Price Four Star'] || 0)).filter(Boolean).reduce((a, b) => a + b, 0) / retailerData.filter(r => Number(r['Price Four Star'])).length
          : 0;
        const varietyCount = new Set(retailerData.map(r => r['Variety'])).size;
        
        return {
          retailer,
          totalSales,
          totalQuantity,
          avgPrice,
          varietyCount,
          percentage: exporterTotalSales ? (totalSales / exporterTotalSales * 100) : 0
        };
      }).sort((a, b) => b.totalSales - a.totalSales);
      
      const topRetailers = allRetailerStats.slice(0, 5);
      
      // Filter worst retailers to only include those with sales > $1
      const validWorstRetailers = allRetailerStats.filter(retailer => retailer.totalSales > 1);
      const worstRetailers = validWorstRetailers.slice(-5).reverse(); // Get last 5 and reverse to show worst first
      
      // Get odd retailers (sales amount <= $0)
      const oddRetailers = allRetailerStats.filter(retailer => retailer.totalSales <= 0);
      
      return { exporter, topRetailers, worstRetailers, oddRetailers, totalSales: exporterTotalSales };
    }).sort((a, b) => b.totalSales - a.totalSales);
  };

  // Generate automatic insights
  const generateInsights = (analysisData) => {
    const insights = [];
    
    // Check if we have data
    if (!analysisData || analysisData.length === 0) {
      insights.push('No data available for analysis. Please upload a CSV file to see insights.');
      return insights;
    }
    
    // Calculate market totals
    const totalMarketSales = analysisData.reduce((sum, e) => sum + e.totalSales, 0);
    const allRetailers = getUnique(data, 'Retailer Name').filter(Boolean);
    const allExporters = getUnique(data, 'Exporter Clean').filter(Boolean);
    
    // 🥇 MARKET SHARE & LEADERSHIP
    insights.push('🥇 Market Share & Leadership');
    
    const topExporter = analysisData[0];
    if (topExporter && topExporter.exporter) {
      const marketShare = totalMarketSales ? (topExporter.totalSales / totalMarketSales * 100) : 0;
      insights.push(`Market Leader: ${topExporter.exporter} dominates with ${marketShare.toFixed(1)}% market share ($${topExporter.totalSales.toLocaleString()})`);
    }
    
    // Top 3 Exporters concentration
    const top3Sales = analysisData.slice(0, 3).reduce((sum, e) => sum + e.totalSales, 0);
    const top3Concentration = totalMarketSales ? (top3Sales / totalMarketSales * 100) : 0;
    insights.push(`Top 3 Exporters account for ${top3Concentration.toFixed(1)}% of total sales → ${top3Concentration > 70 ? 'high market concentration' : 'moderate market concentration'}`);
    
    // Largest retailer by demand
    const retailerDemand = allRetailers.map(retailer => {
      const retailerData = data.filter(d => d['Retailer Name'] === retailer);
      const totalVolume = retailerData.reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0);
      return { retailer, totalVolume };
    }).sort((a, b) => b.totalVolume - a.totalVolume);
    
    if (retailerDemand[0]) {
      const totalVolume = retailerDemand.reduce((sum, r) => sum + r.totalVolume, 0);
      const topRetailerShare = totalVolume ? (retailerDemand[0].totalVolume / totalVolume * 100) : 0;
      insights.push(`${retailerDemand[0].retailer} represents the largest share of demand, receiving ${topRetailerShare.toFixed(1)}% of total volume`);
    }
    
    // Retailers that buy from 75%+ of exporters (market knowledge)
    const retailersWithBroadCoverage = allRetailers.filter(retailer => {
      const retailerExporters = getUnique(data.filter(d => d['Retailer Name'] === retailer), 'Exporter Clean').filter(Boolean);
      return retailerExporters.length >= (allExporters.length * 0.75);
    });
    retailersWithBroadCoverage.forEach(retailer => {
      const exporterCount = getUnique(data.filter(d => d['Retailer Name'] === retailer), 'Exporter Clean').filter(Boolean).length;
      insights.push(`${retailer} has broad market knowledge, sourcing from ${exporterCount}/${allExporters.length} exporters (${((exporterCount/allExporters.length)*100).toFixed(0)}%)`);
    });
    
    insights.push(''); // Empty line separator
    
    // ⚠️ DEPENDENCY & CONCENTRATION RISKS
    insights.push('⚠️ Dependency & Concentration Risks');
    
    // High concentration exporters (>60%)
    const highConcentrationExporters = analysisData.filter(exporterData => {
      if (!exporterData.topRetailers || exporterData.topRetailers.length === 0) return false;
      return exporterData.topRetailers[0].percentage > 60;
    });
    
    highConcentrationExporters.forEach(exporterData => {
      const topRetailer = exporterData.topRetailers[0];
      insights.push(`${exporterData.exporter} has more than 60% of sales concentrated in ${topRetailer.retailer} (${topRetailer.percentage.toFixed(1)}%) → high dependency risk`);
    });
    
    // Retailer dependency on exporters
    allRetailers.forEach(retailer => {
      const retailerData = data.filter(d => d['Retailer Name'] === retailer);
      const exporterSales = allExporters.map(exporter => {
        const exporterData = retailerData.filter(d => d['Exporter Clean'] === exporter);
        const sales = exporterData.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0);
        return { exporter, sales };
      }).filter(e => e.sales > 0).sort((a, b) => b.sales - a.sales);
      
      if (exporterSales.length > 0) {
        const totalRetailerSales = exporterSales.reduce((sum, e) => sum + e.sales, 0);
        const topExporterShare = totalRetailerSales ? (exporterSales[0].sales / totalRetailerSales * 100) : 0;
        if (topExporterShare > 60) {
          insights.push(`${retailer} depends mainly on ${exporterSales[0].exporter}, sourcing ${topExporterShare.toFixed(1)}% of purchases from them`);
        }
      }
    });
    
    insights.push(''); // Empty line separator
    
    // 💰 PREMIUM PRICE POSITIONING
    insights.push('💰 Premium Price Positioning');
    
    // Premium exporters (>$25)
    analysisData.forEach(exporterData => {
      if (!exporterData || !exporterData.topRetailers || exporterData.topRetailers.length === 0) return;
      const avgExporterPrice = exporterData.topRetailers.reduce((sum, r) => sum + r.avgPrice, 0) / exporterData.topRetailers.length;
      if (avgExporterPrice > 25) {
        insights.push(`${exporterData.exporter} maintains a high average price ($${avgExporterPrice.toFixed(2)}) compared to peers`);
      }
    });
    
    // Premium retailers (above average price)
    const allPrices = data.map(r => Number(r['Price Four Star'] || 0)).filter(p => p > 0);
    const avgMarketPrice = allPrices.length ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : 0;
    
    allRetailers.forEach(retailer => {
      const retailerData = data.filter(d => d['Retailer Name'] === retailer);
      const retailerPrices = retailerData.map(r => Number(r['Price Four Star'] || 0)).filter(p => p > 0);
      if (retailerPrices.length > 0) {
        const avgRetailerPrice = retailerPrices.reduce((a, b) => a + b, 0) / retailerPrices.length;
        if (avgRetailerPrice > avgMarketPrice * 1.2) { // 20% above market
          insights.push(`${retailer} pays above-average prices ($${avgRetailerPrice.toFixed(2)}) → indicates premium relationship`);
        }
      }
    });
    
    // Premium varieties
    const varieties = getUnique(data, 'Variety').filter(Boolean);
    const varietyPrices = varieties.map(variety => {
      const varietyData = data.filter(d => d['Variety'] === variety);
      const prices = varietyData.map(r => Number(r['Price Four Star'] || 0)).filter(p => p > 0);
      const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
      return { variety, avgPrice };
    }).sort((a, b) => b.avgPrice - a.avgPrice);
    
    if (varietyPrices[0] && varietyPrices[0].avgPrice > 0) {
      insights.push(`${varietyPrices[0].variety} commands the highest average price ($${varietyPrices[0].avgPrice.toFixed(2)}) → premium variety positioning`);
    }
    
    insights.push(''); // Empty line separator
    
    // 📉 LOW PRICE / COMMODITY PATTERNS
    insights.push('📉 Low Price / Commodity Patterns');
    
    // Low price exporters
    analysisData.forEach(exporterData => {
      if (!exporterData || !exporterData.topRetailers || exporterData.topRetailers.length === 0) return;
      const avgExporterPrice = exporterData.topRetailers.reduce((sum, r) => sum + r.avgPrice, 0) / exporterData.topRetailers.length;
      if (avgExporterPrice < avgMarketPrice * 0.8 && avgExporterPrice > 0) { // 20% below market
        insights.push(`${exporterData.exporter} has below-average prices ($${avgExporterPrice.toFixed(2)}), indicating possible commodity positioning`);
      }
    });
    
    // Low price retailers (≤$10)
    allRetailers.forEach(retailer => {
      const retailerData = data.filter(d => d['Retailer Name'] === retailer);
      const retailerPrices = retailerData.map(r => Number(r['Price Four Star'] || 0)).filter(p => p > 0);
      if (retailerPrices.length > 0) {
        const avgRetailerPrice = retailerPrices.reduce((a, b) => a + b, 0) / retailerPrices.length;
        if (avgRetailerPrice <= 10) {
          insights.push(`${retailer} consistently buys at lower prices ($${avgRetailerPrice.toFixed(2)}) → volume-focused approach`);
        }
      }
    });
    
    insights.push(''); // Empty line separator
    
    // 📦 VOLUME & COVERAGE
    insights.push('📦 Volume & Coverage');
    
    // Exporter market reach
    analysisData.forEach(exporterData => {
      const exporterRetailers = getUnique(data.filter(d => d['Exporter Clean'] === exporterData.exporter), 'Retailer Name').filter(Boolean);
      if (exporterRetailers.length >= 5) { // Threshold for "high reach"
        insights.push(`${exporterData.exporter} sold to ${exporterRetailers.length} unique retailers, indicating ${exporterRetailers.length >= 10 ? 'high' : 'moderate'} market reach`);
      }
    });
    
    // Retailer diversification
    allRetailers.forEach(retailer => {
      const retailerExporters = getUnique(data.filter(d => d['Retailer Name'] === retailer), 'Exporter Clean').filter(Boolean);
      if (retailerExporters.length >= 3) { // Threshold for "diversification"
        insights.push(`${retailer} sourced from ${retailerExporters.length} different exporters, indicating ${retailerExporters.length >= 5 ? 'high' : 'moderate'} diversification`);
      }
    });
    
    return insights;
  };

  const analysisData = getTopRetailersPerExporter();
  const insights = generateInsights(analysisData);
  
  if (!data.length) return null;

  return (
    <div className="my-8 bg-[#F9F6F4] rounded-2xl p-6 shadow-md border border-[#98C1D9]">
      <h3 className="text-2xl font-bold mb-2 text-[#EE6C4D]">🏪 Exporter-Retailer Analysis</h3>
      <p className="text-gray-600 mb-6 text-sm">Detailed breakdown of business relationships between exporters and retailers, showing distribution patterns and partnership dynamics.</p>
      
      {analysisData.map(exporterData => (
        <div key={exporterData.exporter} className="mb-8 border-b border-gray-200 pb-6 last:border-b-0">
          <div className="bg-[#98C1D9] p-4 rounded-lg mb-4">
            <h4 className="text-xl font-bold text-white mb-2">{exporterData.exporter}</h4>
            <p className="text-white">Total Sales: <span className="font-bold">${exporterData.totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span></p>
          </div>
          
          {/* Top 5 Retailers - Full Width */}
          <div className="mb-6">
            <h5 className="text-lg font-bold text-[#293241] mb-3 text-green-800">🥇 Top 5 Retailers</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-[#98C1D9] text-[#3D5A80]">
                  <tr>
                    <th className="border px-2 py-1 text-left">#</th>
                    <th className="border px-2 py-1 text-left">Retailer</th>
                    <th className="border px-2 py-1 text-right">Sales Amount</th>
                    <th className="border px-2 py-1 text-right">% of Exporter</th>
                    <th className="border px-2 py-1 text-right">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {exporterData.topRetailers.map((retailer, idx) => (
                    <tr key={retailer.retailer} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border px-2 py-1 font-bold">{idx + 1}</td>
                      <td className="border px-2 py-1">{retailer.retailer}</td>
                      <td className="border px-2 py-1 text-right font-semibold">${retailer.totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="border px-2 py-1 text-right text-blue-700 font-bold">{retailer.percentage.toFixed(1)}%</td>
                      <td className="border px-2 py-1 text-right">{formatPrice(retailer.avgPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Row: Worst 5 (Left) and Odd Retailers (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Worst 5 Retailers */}
            <div>
              <h5 className="text-lg font-bold text-[#293241] mb-3 text-[#6B8B9E]">📉 Worst 5 Retailers</h5>
              <p className="text-xs text-gray-600 mb-2">(Sales Amount greater than $1)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300">
                  <thead className="bg-[#6B8B9E] text-white">
                    <tr>
                      <th className="border px-2 py-1 text-left">Retailer</th>
                      <th className="border px-2 py-1 text-right">Sales Amount</th>
                      <th className="border px-2 py-1 text-right">% of Exporter</th>
                      <th className="border px-2 py-1 text-right">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exporterData.worstRetailers.map((retailer, idx) => (
                      <tr key={retailer.retailer} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border px-2 py-1">{retailer.retailer}</td>
                        <td className="border px-2 py-1 text-right font-semibold">${retailer.totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="border px-2 py-1 text-right text-[#6B8B9E] font-bold">{retailer.percentage.toFixed(1)}%</td>
                        <td className="border px-2 py-1 text-right">{formatPrice(retailer.avgPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Odd Retailers */}
            <div>
              <h5 className="text-lg font-bold text-[#293241] mb-3 text-[#BEE0EB]">🔍 Odd Retailers</h5>
              <p className="text-xs text-gray-600 mb-2">(Sales Amount ≤ $0)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300">
                  <thead className="bg-[#BEE0EB] text-[#293241]">
                    <tr>
                      <th className="border px-2 py-1 text-left">Retailer</th>
                      <th className="border px-2 py-1 text-right">Sales Amount</th>
                      <th className="border px-2 py-1 text-right">Sales Quantity</th>
                      <th className="border px-2 py-1 text-right">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exporterData.oddRetailers.length > 0 ? (
                      exporterData.oddRetailers.map((retailer, idx) => (
                        <tr key={retailer.retailer} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border px-2 py-1">{retailer.retailer}</td>
                          <td className="border px-2 py-1 text-right font-semibold">${retailer.totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                          <td className="border px-2 py-1 text-right text-[#BEE0EB] font-bold">{retailer.totalQuantity.toLocaleString()}</td>
                          <td className="border px-2 py-1 text-right">{formatPrice(retailer.avgPrice)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="border px-2 py-3 text-center text-gray-500 italic">No odd retailers found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Combined chart of key KPIs
const CombinedKPIChart = ({ data, exporterFilter }) => {
  const filteredData = exporterFilter === 'All' ? data : data.filter(d => d['Exporter Clean'] === exporterFilter);
  const totalSales = filteredData.reduce((sum, r) => sum + Number(r['Sales Amount'] || 0), 0);
  const totalQuantity = filteredData.reduce((sum, r) => sum + Number(r['Sale Quantity'] || 0), 0);
  const avgPrice = filteredData.length ? filteredData.map(r => Number(r['Price Four Star'] || 0)).filter(Boolean).reduce((a, b) => a + b, 0) / filteredData.filter(r => Number(r['Price Four Star'])).length : 0;

  const chartData = {
    labels: ['Total Sales', 'Total Quantity', 'Avg. Four Star Price'],
    datasets: [
      {
        label: 'Exporter Performance',
        data: [totalSales, totalQuantity, avgPrice],
        backgroundColor: ['#60a5fa', '#34d399', '#f472b6'],
        borderColor: ['#3b82f6', '#10b981', '#ec4899'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          },
        },
      },
    },
  };

  return (
    <div className="my-8">
      <h3 className="font-bold mb-4 text-lg">📊 Combined KPI Chart</h3>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

const SalesDetailReport = ({ onRefsUpdate }) => {
  const [salesData, setSalesData] = useState(getSalesData()); // Load data automatically
  const [exporter, setExporter] = useState('All');
  const [retailer, setRetailer] = useState('All');
  const [variety, setVariety] = useState('All');
  const [size, setSize] = useState('All');

  // Load data automatically on initialization
  useEffect(() => {
    const loadedData = getSalesData();
    setSalesData(loadedData);
  }, []);

  // Refs for navigation - new order
  const refs = {
    'KPIs': useRef(),
    'Key Insights': useRef(),
    'Exporter Comparator': useRef(),
    'Sales by Variety': useRef(),
    'Sales Timeline': useRef(),
    'Price History Retailer': useRef(),
    'Price History Exporter': useRef(),
    'Heatmap Retailer vs Variety': useRef(),
    'Heatmap Exporter vs Retailer': useRef(),
    'Exporter-Retailer Analysis': useRef(),
    'Ranking Retailers': useRef(),
    'Ranking Exporters': useRef(),
    'Sales by Retailer/Exporter/Variety/Size': useRef(),
    'Price Alerts by Variety': useRef(),
  };

  // Pass refs to parent component
  useEffect(() => {
    if (onRefsUpdate) {
      onRefsUpdate(refs);
    }
  }, []);

  // Carga de archivo CSV
  // Available filters (data already loaded automatically)
  const exporters = useMemo(() => ['All', ...getUnique(salesData, 'Exporter Clean')], [salesData]);
  const retailers = useMemo(() => ['All', ...getUnique(salesData, 'Retailer Name')], [salesData]);
  const varieties = useMemo(() => ['All', ...getUnique(salesData, 'Variety')], [salesData]);
  const sizes = useMemo(() => ['All', ...getUnique(salesData, 'Size')], [salesData]);

  // Filtro principal parte 1
  const filtered = useMemo(() => filterData(salesData, {
    'Exporter Clean': exporter,
    'Retailer Name': retailer,
    'Variety': variety,
    'Size': size
  }), [salesData, exporter, retailer, variety, size]);

  // Grouping for section 4 (only for 1st sheet)
  const grouped = useMemo(() => groupBy(filtered, ['Variety', 'Packaging Style', 'Size']), [filtered]);

  return (
    <div className="min-h-screen bg-[#F9F6F4] w-full m-0 p-0">
      <div className="p-6 space-y-16 w-full max-w-none m-0">
        <h1 className="text-5xl font-extrabold text-center mb-8 text-[#EE6C4D]">Sales Detail Report</h1>
        
        {/* 1. KPIs */}
        <div ref={refs['KPIs']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">📈 KPIs</h2>
          <p className="text-gray-600 mb-4 text-sm">Essential performance indicators providing a snapshot of overall business health and market position.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Key Performance Indicators showing overall sales metrics, quantities, and performance statistics across all exporters and retailers.</p>
          <KPICards data={salesData} />
        </div>
        
        {/* 3. Key Insights */}
        <div ref={refs['Key Insights']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">💡 Key Insights</h2>
          <p className="text-gray-600 mb-4 text-sm">Strategic insights and market analysis derived from sales data patterns and business intelligence.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Automated market insights highlighting leadership positions, risk analysis, premium segments, and coverage patterns.</p>
          <KeyMarketInsights data={salesData} />
        </div>
        
        {/* 4. Top 5 Analysis */}
        <div ref={refs['Exporter-Retailer Analysis']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">🏆 Top 5 Analysis</h2>
          <p className="text-gray-600 mb-6 text-sm">Ranking and performance analysis of the top 5 performers across different categories and metrics.</p>
          <ExporterRetailerAnalysis data={salesData} />
        </div>
        
        {/* 5. Exporter Comparator */}
        <div ref={refs['Exporter Comparator']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">⚖️ Exporter Comparator</h2>
          <p className="text-gray-600 mb-4 text-sm">Side-by-side comparison tool for analyzing performance differences between different exporters.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Side-by-side comparison of exporter performance metrics including sales volume, pricing, and market presence.</p>
          <ExporterComparator data={salesData} exporters={exporters} />
        </div>
        
        {/* 6. Sales by Variety */}
        <div ref={refs['Sales by Variety']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">🍇 Sales by Variety</h2>
          <p className="text-gray-600 mb-4 text-sm">Breakdown of sales performance across different grape varieties, showing market preferences and seasonal trends.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Visual breakdown of sales performance across different grape varieties, showing market preferences and demand patterns.</p>
          <section className="bg-[#F9F6F4] rounded-2xl p-6 shadow-md">
            <Bar data={getVarietyChartData(salesData)} options={chartOptions} />
          </section>
        </div>
        
        {/* 7. Sales Timeline */}
        <div ref={refs['Sales Timeline']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">📅 Sales Timeline</h2>
          <p className="text-gray-600 mb-4 text-sm">Chronological analysis of sales patterns showing temporal trends, seasonality, and growth trajectories over time.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Chronological view of sales activity over time, revealing seasonal patterns and market trends throughout the period.</p>
          <section className="bg-[#F9F6F4] rounded-2xl p-6 shadow-md">
            <Line data={getTimelineChartData(salesData)} options={chartOptions} />
          </section>
        </div>
        
        {/* 8. Price History (Retailer Name) */}
        <div ref={refs['Price History Retailer']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">📊 Price History (Retailer)</h2>
          <p className="text-gray-600 mb-4 text-sm">Historical pricing trends and analysis from the retailer perspective, tracking market price movements and variations.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Historical price evolution tracked by retailer, showing pricing strategies and market positioning over time.</p>
          <PriceHistory data={salesData} groupKey="Retailer Name" />
        </div>
        
        {/* 9. Price History (Exporter Clean) */}
        <div ref={refs['Price History Exporter']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">📈 Price History (Exporter)</h2>
          <p className="text-gray-600 mb-4 text-sm">Historical pricing trends and analysis from the exporter perspective, showing supply-side price dynamics and market positioning.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Exporter-specific price trends analysis, displaying how different exporters adjust pricing in response to market conditions.</p>
          <PriceHistory data={salesData} groupKey="Exporter Clean" />
        </div>
        
        {/* 10. Heatmap: Retailer vs Variety (Avg Price) */}
        <div ref={refs['Heatmap Retailer vs Variety']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">🔥 Heatmap: Retailer / Variety</h2>
          <p className="text-gray-600 mb-4 text-sm">Visual correlation matrix showing the relationship intensity between different retailers and grape varieties.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Heat map visualization showing average pricing relationships between retailers and grape varieties, identifying premium and value segments.</p>
          <Heatmap data={salesData} rowKey="Retailer Name" colKey="Variety" valueKey="Price Four Star" agg="avg" title="Heatmap: Retailer vs Variety (Avg Price)" />
        </div>
        
        {/* 11. Heatmap: Exporter vs Retailer (Sales Amount) */}
        <div ref={refs['Heatmap Exporter vs Retailer']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">🗺️ Heatmap: Exporter / Retailer</h2>
          <p className="text-gray-600 mb-4 text-sm">Visual correlation matrix displaying business relationship intensity and sales volume between exporters and retailers.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Sales volume heat map displaying business relationships between exporters and retailers, highlighting key partnerships and market concentrations.</p>
          <Heatmap data={salesData} rowKey="Exporter Clean" colKey="Retailer Name" valueKey="Sales Amount" agg="sum" title="Heatmap: Exporter vs Retailer (Sales Amount)" />
        </div>
        
        {/* 12. Top Retailers by Sales */}
        <div ref={refs['Ranking Retailers']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">🥇 Top Retailers by Sales</h2>
          <p className="text-gray-600 mb-4 text-sm">Ranking and detailed performance metrics of the highest-performing retailers based on sales volume and revenue.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Ranking of retailers by total sales volume, identifying the most significant customers and market leaders in the distribution network.</p>
          <RankingBar data={salesData} groupKey="Retailer Name" valueKey="Sales Amount" title="Top Retailers by Sales" />
        </div>
        
        {/* 13. Top Exporters by Sales */}
        <div ref={refs['Ranking Exporters']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">🚢 Top Exporters by Sales</h2>
          <p className="text-gray-600 mb-4 text-sm">Ranking and detailed performance metrics of the highest-performing exporters based on sales volume and market reach.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Comprehensive ranking of exporters based on sales performance, showing market share and competitive positioning within the industry.</p>
          <RankingBar data={salesData} groupKey="Exporter Clean" valueKey="Sales Amount" title="Top Exporters by Sales" />
        </div>
        
        {/* 14. Sales by Retailer/Exporter/Variety/Size */}
        <div ref={refs['Sales by Retailer/Exporter/Variety/Size']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">🔍 Filtered Sales Analysis</h2>
          <p className="text-gray-600 mb-4 text-sm">Interactive analysis tool allowing custom filtering and deep-dive exploration of specific market segments and conditions.</p>
          <section className="bg-[#F9F6F4] rounded-2xl p-6 shadow-md">
            <div className="flex gap-4 mb-2 flex-wrap">
              <select value={exporter} onChange={e => setExporter(e.target.value)} className="border p-1 rounded border-[#98C1D9]">
                {exporters.map(e => <option key={e}>{e}</option>)}
              </select>
              <select value={retailer} onChange={e => setRetailer(e.target.value)} className="border p-1 rounded border-[#98C1D9]">
                {retailers.map(r => <option key={r}>{r}</option>)}
              </select>
              <select value={variety} onChange={e => setVariety(e.target.value)} className="border p-1 rounded border-[#98C1D9]">
                {varieties.map(v => <option key={v}>{v}</option>)}
              </select>
              <select value={size} onChange={e => setSize(e.target.value)} className="border p-1 rounded border-[#98C1D9]">
                {sizes.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <Bar data={getChartData(filtered, 'Retailer Name', 'Sale Quantity', 'Price Four Star')} options={chartOptions} />
            <SortableTable data={filtered} />
            <div className="w-[420px] mx-auto my-4">
              <Pie data={getPieData(filtered, 'Retailer Name', 'Sales Amount')} options={{ plugins: { legend: { position: 'bottom' }, datalabels: { display: true } }, aspectRatio: 1 }} />
            </div>
          </section>
        </div>
        
        {/* 15. Price Alerts by Variety */}
        <div ref={refs['Price Alerts by Variety']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">⚠️ Price Alerts</h2>
          <p className="text-gray-600 mb-4 text-sm">Automated monitoring system identifying significant price variations, anomalies, and market opportunities requiring attention.</p>
          <section className="bg-[#F9F6F4] rounded-2xl p-6 shadow-md">
            <div className="flex gap-4 mb-2">
              <select value={variety} onChange={e => setVariety(e.target.value)} className="border p-1 rounded border-[#98C1D9]">
                {varieties.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <PriceAlerts data={filterData(salesData, { Variety: variety })} threshold={0.15} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default SalesDetailReport;
