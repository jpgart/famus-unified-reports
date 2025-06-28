import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import 'chart.js/auto';
import { 
  calculateMetricsFromEmbedded, 
  getDataSummaryFromEmbedded,
  getChargeDataFromEmbedded,
  getInitialStockAnalysisFromEmbedded,
  analyzeSpecificChargeFromEmbedded,
  analyzeRepackingChargesFromEmbedded
} from '../../data/costDataEmbedded';
import { formatNumber, formatPercentage, formatPrice } from '../../utils/formatters';
import { getDefaultChartOptions, FAMUS_COLORS, CHART_COLORS, BLUE_PALETTE } from '../../utils/chartConfig';
import { KPISection } from '../common';
import { filterExportersList, isExporterExcluded } from '../../utils/dataFiltering';

// Temporary clear cache function to avoid import error
const clearEmbeddedDataCache = () => {
  console.log('🧹 Cache clear requested (temporary implementation)');
};

// Register Chart.js plugins
import { registerChartPlugins } from '../../utils/chartConfig';
registerChartPlugins();

// KPI Cards Component - Following Sales Detail Report Style
const KPICards = ({ metrics }) => {
  const [selectedExporter, setSelectedExporter] = useState('All');
  
  // Get unique exporters for filter (exclude specified exporters)
  const exporters = useMemo(() => {
    const allExporters = [...new Set(Object.values(metrics).map(l => l.exporter))]
      .filter(Boolean);
    const filteredExporters = filterExportersList(allExporters);
    return ['All', ...filteredExporters];
  }, [metrics]);

  const kpiData = useMemo(() => {
    const lotids = Object.values(metrics);
    const filteredLotids = selectedExporter === 'All' 
      ? lotids 
      : lotids.filter(l => l.exporter === selectedExporter);
    
    const validCosts = filteredLotids.filter(l => l.costPerBox !== null);
    
    if (validCosts.length === 0) {
      return {
        totalLots: 0,
        avgCostPerBox: 0,
        totalCharges: 0,
        totalBoxes: 0,
        uniqueExporters: 0,
        consistencyScore: 0
      };
    }

    const totalLots = validCosts.length;
    const avgCostPerBox = validCosts.reduce((sum, l) => sum + l.costPerBox, 0) / validCosts.length;
    const totalCharges = validCosts.reduce((sum, l) => sum + l.totalChargeAmount, 0);
    const totalBoxes = validCosts.reduce((sum, l) => sum + l.totalBoxes, 0);

    // Calculate consistency score (inverse of coefficient of variation)
    const costs = validCosts.map(l => l.costPerBox);
    const variance = costs.reduce((sum, cost) => sum + Math.pow(cost - avgCostPerBox, 2), 0) / costs.length;
    const stdDev = Math.sqrt(variance);
    const cv = avgCostPerBox > 0 ? (stdDev / avgCostPerBox) : 1;
    const consistencyScore = Math.max(0, 1 - cv); // 1 = perfect consistency, 0 = high variability

    const exporterStats = {};
    validCosts.forEach(lotid => {
      if (!exporterStats[lotid.exporter]) {
        exporterStats[lotid.exporter] = { costs: [], lots: 0 };
      }
      exporterStats[lotid.exporter].costs.push(lotid.costPerBox);
      exporterStats[lotid.exporter].lots++;
    });

    return {
      totalLots,
      avgCostPerBox,
      totalCharges,
      totalBoxes,
      uniqueExporters: Object.keys(exporterStats).length,
      consistencyScore
    };
  }, [metrics, selectedExporter]);

  // KPIs configuration for KPISection component
  const kpis = [
    { 
      label: 'Total Lot Records', 
      value: kpiData.totalLots, 
      type: 'integer',
      size: 'normal'
    },
    { 
      label: 'Avg Cost/Box', 
      value: kpiData.avgCostPerBox, 
      type: 'money',
      size: 'normal'
    },
    { 
      label: 'Total Charges', 
      value: kpiData.totalCharges, 
      type: 'totalSales',
      size: 'normal'
    },
    { 
      label: 'Total Boxes', 
      value: kpiData.totalBoxes, 
      type: 'integer',
      size: 'normal'
    },
    { 
      label: 'Active Exporters', 
      value: kpiData.uniqueExporters, 
      type: 'integer',
      size: 'normal'
    },
    { 
      label: 'Consistency Score', 
      value: kpiData.consistencyScore, 
      type: 'percentage',
      size: 'normal'
    },
  ];

  // Chart data for costs by exporter
  const exporterCostData = exporters.filter(exp => exp !== 'All').map(exporter => {
    const exporterLots = Object.values(metrics).filter(l => l.exporter === exporter && l.costPerBox !== null);
    const avgCost = exporterLots.length > 0 
      ? exporterLots.reduce((sum, l) => sum + l.costPerBox, 0) / exporterLots.length 
      : 0;
    return {
      exporter,
      avgCost,
      totalCost: exporterLots.reduce((sum, l) => sum + l.totalChargeAmount, 0)
    };
  }).sort((a, b) => b.avgCost - a.avgCost);

  const chartData = {
    labels: exporterCostData.map(d => d.exporter),
    datasets: [
      {
        label: 'Avg Cost per Box ($)',
        data: exporterCostData.map(d => d.avgCost),
        backgroundColor: FAMUS_COLORS.orange,
        borderColor: FAMUS_COLORS.navy,
        borderWidth: 1,
      },
    ],
  };

  const chart = {
    type: 'bar',
    title: `Average Cost per Box by Exporter${selectedExporter !== 'All' ? ` - ${selectedExporter}` : ''}`,
    data: chartData,
    options: {
      ...getDefaultChartOptions(),
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cost per Box ($)'
          }
        }
      }
    }
  };

  return (
    <div className="my-10">
      {/* KPI Section */}
      <KPISection
        title="📊 KPIs"
        subtitle="Key Performance Indicators - Cost Consistency Analysis"
        titleColor="text-[#EE6C4D]"
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
            className="border border-[#3D5A80] p-2 rounded text-lg bg-white focus:ring-2 focus:ring-[#EE6C4D]"
          >
            {exporters.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Cost Analysis Legend */}
      <div className="mt-6 max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">ℹ️</span>
            Cost Analysis Methodology
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>• Cost per Box:</strong> Total charges divided by total boxes processed</p>
            <p><strong>• Consistency Score:</strong> Percentage of lots with complete cost data</p>
            <p><strong>• Total Charges:</strong> Combined packing materials, repacking, and ocean freight costs</p>
            <p><strong>• Analysis Scope:</strong> Includes all exporters with recorded charge activities</p>
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
            <p className="font-semibold mb-1">Cost Efficiency Analysis by Exporter</p>
            <p>This chart displays the average cost per box for each exporter. Lower costs indicate better operational efficiency and cost management practices.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Key Cost Insights Component - Replicated from Sales Report KeyMarketInsights
const KeyCostInsights = ({ insights }) => {
  const [expandedSections, setExpandedSections] = useState({
    leadership: false,
    risks: false,
    efficiency: false,
    optimization: false,
    consistency: false
  });

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Generate categorized insights for cost analysis
  const generateCategorizedInsights = () => {
    const categorized = {
      leadership: [],
      risks: [],
      efficiency: [],
      optimization: [],
      consistency: []
    };

    // Populate with the provided insights, categorizing them appropriately
    if (insights && insights.length > 0) {
      insights.forEach((insight, index) => {
        if (insight.toLowerCase().includes('lead') || insight.toLowerCase().includes('highest') || insight.toLowerCase().includes('top')) {
          categorized.leadership.push(insight);
        } else if (insight.toLowerCase().includes('risk') || insight.toLowerCase().includes('variability') || insight.toLowerCase().includes('inconsistent')) {
          categorized.risks.push(insight);
        } else if (insight.toLowerCase().includes('efficient') || insight.toLowerCase().includes('performance') || insight.toLowerCase().includes('best')) {
          categorized.efficiency.push(insight);
        } else if (insight.toLowerCase().includes('optimization') || insight.toLowerCase().includes('opportunity') || insight.toLowerCase().includes('improvement')) {
          categorized.optimization.push(insight);
        } else {
          categorized.consistency.push(insight);
        }
      });
    }

    // Add default insights if categories are empty
    if (categorized.leadership.length === 0) {
      categorized.leadership.push('Cost leadership analysis requires more data for detailed insights.');
    }
    if (categorized.risks.length === 0) {
      categorized.risks.push('Risk assessment analysis requires more data for detailed insights.');
    }
    if (categorized.efficiency.length === 0) {
      categorized.efficiency.push('Efficiency analysis requires more data for detailed insights.');
    }
    if (categorized.optimization.length === 0) {
      categorized.optimization.push('Optimization opportunities analysis requires more data for detailed insights.');
    }
    if (categorized.consistency.length === 0) {
      categorized.consistency.push('Consistency analysis requires more data for detailed insights.');
    }

    return categorized;
  };

  const categorizedInsights = generateCategorizedInsights();

  if (!insights || insights.length === 0) return null;

  return (
    <div className="my-8 bg-[#F9F6F4] rounded-2xl p-6 shadow-md border border-[#98C1D9]">
      <h3 className="text-2xl font-bold mb-2 text-[#293241]">🔍 Key Cost Insights</h3>
      <p className="text-gray-600 mb-6 text-sm">Overview of cost efficiency metrics, operational patterns, risk assessment, and optimization opportunities across exporters.</p>
      
      {/* 🥇 Cost Leadership & Performance */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('leadership')}
          className="w-full text-left flex items-center justify-between p-3 bg-[#3D5A80] rounded-lg hover:bg-[#2E4B6B] transition-colors"
        >
          <h4 className="text-lg font-bold text-white">🥇 Cost Leadership & Performance</h4>
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

      {/* ⚠️ Cost Risks & Variability */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('risks')}
          className="w-full text-left flex items-center justify-between p-3 bg-[#6B8B9E] rounded-lg hover:bg-[#5A7A8C] transition-colors"
        >
          <h4 className="text-lg font-bold text-white">⚠️ Cost Risks & Variability</h4>
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

      {/* 💰 Operational Efficiency */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('efficiency')}
          className="w-full text-left flex items-center justify-between p-3 bg-[#98C1D9] rounded-lg hover:bg-[#86B4D1] transition-colors"
        >
          <h4 className="text-lg font-bold text-white">💰 Operational Efficiency</h4>
          <span className="text-white">{expandedSections.efficiency ? '▼' : '▶'}</span>
        </button>
        {expandedSections.efficiency && (
          <div className="mt-2 p-4 bg-white rounded-lg border-2 border-[#98C1D9] max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {categorizedInsights.efficiency.map((insight, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#98C1D9] mr-2 font-bold">•</span>
                  <span className="text-[#293241] text-sm leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 📈 Optimization Opportunities */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('optimization')}
          className="w-full text-left flex items-center justify-between p-3 bg-[#BEE0EB] rounded-lg hover:bg-[#AAD8E3] transition-colors"
        >
          <h4 className="text-lg font-bold text-[#293241]">📈 Optimization Opportunities</h4>
          <span className="text-[#293241]">{expandedSections.optimization ? '▼' : '▶'}</span>
        </button>
        {expandedSections.optimization && (
          <div className="mt-2 p-4 bg-white rounded-lg border-2 border-[#BEE0EB] max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {categorizedInsights.optimization.map((insight, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#BEE0EB] mr-2 font-bold">•</span>
                  <span className="text-[#293241] text-sm leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 📊 Cost Consistency */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('consistency')}
          className="w-full text-left flex items-center justify-between p-3 bg-[#E0FBFC] rounded-lg hover:bg-[#D1F4F7] transition-colors"
        >
          <h4 className="text-lg font-bold text-[#293241]">📊 Cost Consistency</h4>
          <span className="text-[#293241]">{expandedSections.consistency ? '▼' : '▶'}</span>
        </button>
        {expandedSections.consistency && (
          <div className="mt-2 p-4 bg-white rounded-lg border-2 border-[#E0FBFC] max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {categorizedInsights.consistency.map((insight, idx) => (
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

// Exporter Cost Comparator Component
const ExporterCostComparator = ({ metrics }) => {
  const [sortBy, setSortBy] = useState('avgCost');
  const [selectedExporter, setSelectedExporter] = useState('All');

  const exporterAnalysis = useMemo(() => {
    const lotids = Object.values(metrics);
    const exporterStats = {};

    lotids.filter(l => l.costPerBox !== null).forEach(lotid => {
      if (!exporterStats[lotid.exporter]) {
        exporterStats[lotid.exporter] = { 
          costs: [], 
          totalAmount: 0, 
          totalBoxes: 0,
          lots: 0
        };
      }
      exporterStats[lotid.exporter].costs.push(lotid.costPerBox);
      exporterStats[lotid.exporter].totalAmount += lotid.totalChargeAmount;
      exporterStats[lotid.exporter].totalBoxes += lotid.totalBoxes;
      exporterStats[lotid.exporter].lots++;
    });

    return Object.entries(exporterStats).map(([exporter, data]) => {
      const avgCost = data.costs.reduce((sum, cost) => sum + cost, 0) / data.costs.length;
      const variance = data.costs.reduce((sum, cost) => sum + Math.pow(cost - avgCost, 2), 0) / data.costs.length;
      const stdDev = Math.sqrt(variance);
      const cv = avgCost > 0 ? (stdDev / avgCost) : 0;
      
      return { 
        exporter, 
        avgCost, 
        cv, 
        totalAmount: data.totalAmount, 
        totalBoxes: data.totalBoxes,
        lots: data.lots,
        efficiency: avgCost > 0 ? 1 / avgCost : 0 // Higher is better
      };
    }).sort((a, b) => {
      switch(sortBy) {
        case 'avgCost': return a.avgCost - b.avgCost;
        case 'cv': return a.cv - b.cv;
        case 'totalAmount': return b.totalAmount - a.totalAmount;
        case 'efficiency': return b.efficiency - a.efficiency;
        default: return 0;
      }
    });
  }, [metrics, sortBy]);

  const chartData = {
    labels: exporterAnalysis.map(e => e.exporter),
    datasets: [
      {
        type: 'bar',
        label: 'Avg Cost/Box ($)',
        data: exporterAnalysis.map(e => e.avgCost),
        backgroundColor: BLUE_PALETTE[0], // Navy blue
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Consistency (1-CV)',
        data: exporterAnalysis.map(e => Math.max(0, 1 - e.cv)),
        borderColor: BLUE_PALETTE[2], // Light blue
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    ...getDefaultChartOptions('Cost vs Consistency by Exporter'),
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Cost per Box ($)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Consistency Score (0-1)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-[#F9F6F4] rounded-2xl p-6 shadow-md">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#3D5A80]">Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-[#98C1D9] p-2 rounded bg-white focus:ring-2 focus:ring-[#EE6C4D]"
          >
            <option value="avgCost">Average Cost</option>
            <option value="cv">Consistency</option>
            <option value="totalAmount">Total Amount</option>
            <option value="efficiency">Efficiency</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="relative h-[300px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#3D5A80] text-white">
              <tr>
                <th className="p-3 text-left">Exporter</th>
                <th className="p-3 text-right">Avg Cost/Box</th>
                <th className="p-3 text-right">Consistency</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-right">Lots</th>
                <th className="p-3 text-right">Efficiency Score</th>
              </tr>
            </thead>
            <tbody>
              {exporterAnalysis.map((exporter, index) => (
                <tr key={exporter.exporter} className={index % 2 === 0 ? 'bg-[#E8F4F8]' : 'bg-white'}>
                  <td className="p-3 font-medium text-[#3D5A80]">{exporter.exporter}</td>
                  <td className="p-3 text-right">{formatPrice(exporter.avgCost)}</td>
                  <td className="p-3 text-right">{formatPercentage(Math.max(0, 1 - exporter.cv))}</td>
                  <td className="p-3 text-right">${exporter.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                  <td className="p-3 text-right">{Math.round(exporter.lots)}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      exporter.efficiency > 0.1 ? 'bg-green-100 text-green-800' :
                      exporter.efficiency > 0.05 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {(exporter.efficiency * 1000).toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legend below the table */}
        <div className="p-4 bg-gray-50 border-t text-sm text-gray-700">
          <h4 className="font-semibold mb-2 text-[#3D5A80]">How Metrics Are Calculated:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="font-medium">Consistency Score:</span> Calculated as (1 - CV), where CV is the Coefficient of Variation (Standard Deviation / Mean). Higher scores indicate more consistent costs across lots.
            </div>
            <div>
              <span className="font-medium">Efficiency Score:</span> Calculated as (1000 / Average Cost per Box). Higher scores indicate better cost efficiency, with lower costs per box resulting in higher efficiency ratings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ocean Freight Analysis Component with Inconsistency Detection
const OceanFreightAnalysis = () => {
  const [freightData, setFreightData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFreightAnalysis = async () => {
      try {
        setLoading(true);
        const data = await analyzeSpecificChargeFromEmbedded('OCEAN FREIGHT', 'Ocean Freight');
        setFreightData(data);
      } catch (error) {
        console.error('Error analyzing Ocean Freight:', error);
        setFreightData(null);
      } finally {
        setLoading(false);
      }
    };

    loadFreightAnalysis();
  }, []);

  // Function to detect inconsistencies in Ocean Freight costs
  const detectInconsistencies = () => {
    if (!freightData || !freightData.byExporter) return [];
    
    const avgFreight = freightData.summary?.avgPerBox || 0;
    const inconsistencies = [];
    
    // Convert byExporter object to array
    const exportersArray = Object.values(freightData.byExporter);
    
    exportersArray.forEach(exporter => {
      const deviation = Math.abs(exporter.avgPerBox - avgFreight);
      const percentageDeviation = avgFreight > 0 ? (deviation / avgFreight) * 100 : 0;
      
      if (percentageDeviation > 30) { // More than 30% deviation
        inconsistencies.push({
          exporter: exporter.exporter,
          cost: exporter.avgPerBox,
          deviation: percentageDeviation,
          type: exporter.avgPerBox > avgFreight ? 'High' : 'Low',
          flag: exporter.avgPerBox > avgFreight ? '🔴' : '🟡'
        });
      }
    });
    
    return inconsistencies.sort((a, b) => b.deviation - a.deviation);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE6C4D]"></div>
          <span className="ml-3 text-gray-600">Loading Ocean Freight analysis...</span>
        </div>
      </div>
    );
  }

  if (!freightData || !freightData.byExporter || freightData.byExporter.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">⚠️ No Ocean Freight data available</p>
        <p className="text-yellow-600 text-sm mt-2">
          No records found for Ocean Freight charge type in the current dataset.
        </p>
      </div>
    );
  }

  const inconsistencies = detectInconsistencies();
  
  // Convert byExporter object to array for chart data
  const exportersArray = Object.values(freightData.byExporter);
  
  const chartData = {
    labels: exportersArray.map(e => e.exporter),
    datasets: [
      {
        label: 'Ocean Freight per Box ($)',
        data: exportersArray.map(e => e.avgPerBox || 0),
        backgroundColor: BLUE_PALETTE[1],
        borderColor: BLUE_PALETTE[0],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h4 className="text-lg font-semibold text-[#3D5A80] mb-4 flex items-center">
        <span className="mr-2">🚢</span>
        Ocean Freight Cost Analysis & Inconsistency Detection
      </h4>
      
      {/* KPI Section */}
      <KPISection
        title="🚢 Ocean Freight KPIs"
        subtitle="Key metrics for ocean freight cost analysis"
        titleColor="text-[#3D5A80]"
        backgroundColor="bg-white"
        kpis={[
          { 
            label: 'Total Amount', 
            value: freightData.summary?.totalAmount || 0, 
            type: 'currency',
            size: 'normal'
          },
          { 
            label: 'Avg per Box', 
            value: freightData.summary?.avgPerBox || 0, 
            type: 'currency',
            size: 'normal'
          },
          { 
            label: 'Exporters', 
            value: Object.keys(freightData.byExporter || {}).length, 
            type: 'integer',
            size: 'normal'
          },
          { 
            label: 'Inconsistencies', 
            value: inconsistencies.length, 
            type: 'integer',
            size: 'normal'
          }
        ]}
        chart={null}
        showChart={false}
        containerClass=""
      />

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="relative h-[300px]">
          <Bar data={chartData} options={{
            ...getDefaultChartOptions('Ocean Freight Cost by Exporter'),
            plugins: {
              ...getDefaultChartOptions().plugins,
              zoom: {
                zoom: {
                  wheel: {
                    enabled: false
                  },
                  pinch: {
                    enabled: false
                  }
                },
                pan: {
                  enabled: false
                }
              }
            }
          }} />
        </div>
      </div>

      {/* Inconsistency Detection Table */}
      {inconsistencies.length > 0 && (
        <div className="mb-6">
          <h5 className="text-md font-semibold text-[#EE6C4D] mb-3">🔍 Detected Cost Inconsistencies</h5>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border">
            <table className="w-full text-sm">
              <thead className="bg-[#3D5A80] text-white">
                <tr>
                  <th className="p-3 text-left">Flag</th>
                  <th className="p-3 text-left">Exporter</th>
                  <th className="p-3 text-right">Cost/Box</th>
                  <th className="p-3 text-right">Deviation</th>
                  <th className="p-3 text-center">Issue Type</th>
                </tr>
              </thead>
              <tbody>
                {inconsistencies.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-[#E8F4F8]' : 'bg-white'}>
                    <td className="p-3 text-center text-lg">{item.flag}</td>
                    <td className="p-3 font-medium text-[#3D5A80]">{item.exporter}</td>
                    <td className="p-3 text-right font-semibold">{formatPrice(item.cost)}</td>
                    <td className="p-3 text-right text-[#EE6C4D]">{item.deviation.toFixed(1)}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.type === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.type} Cost
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Exporter Comparison Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border">
        <div className="bg-[#3D5A80] text-white p-3">
          <h5 className="font-semibold">Complete Ocean Freight Comparison</h5>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#98C1D9] text-white">
              <tr>
                <th className="p-3 text-left">Exporter</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-right">Cost per Box</th>
                <th className="p-3 text-right">Deviation from Avg</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {exportersArray.map((exporter, index) => {
                const avgFreight = freightData.summary?.avgPerBox || 0;
                const deviation = Math.abs(exporter.avgPerBox - avgFreight);
                const percentageDeviation = avgFreight > 0 ? (deviation / avgFreight) * 100 : 0;
                const isInconsistent = percentageDeviation > 30;
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-[#E8F4F8]' : 'bg-white'}>
                    <td className="p-3 font-medium text-[#3D5A80]">{exporter.exporter}</td>
                    <td className="p-3 text-right">${exporter.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}</td>
                    <td className="p-3 text-right font-semibold">{formatPrice(exporter.avgPerBox || 0)}</td>
                    <td className="p-3 text-right">{percentageDeviation.toFixed(1)}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        isInconsistent ? 
                          (exporter.avgPerBox > avgFreight ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800') :
                          'bg-green-100 text-green-800'
                      }`}>
                        {isInconsistent ? 'Review' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
        <p><strong>Analysis Summary:</strong> Ocean freight costs show {inconsistencies.length > 0 ? `${inconsistencies.length} potential inconsistencies` : 'consistent patterns'} across exporters. 
        {inconsistencies.length > 0 ? ' Review flagged exporters for potential shipping optimization opportunities.' : ' All exporters show similar freight efficiency levels.'}</p>
      </div>
    </div>
  );
};

// Repacking Analysis Component (combines PACKING MATERIALS + REPACKING CHARGES)
const RepackingAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Using the combined repacking analysis function
  const displayName = "Repacking";

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const data = await analyzeRepackingChargesFromEmbedded(displayName);
        setAnalysisData(data);
      } catch (error) {
        console.error(`Error analyzing ${displayName}:`, error);
        setAnalysisData(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [displayName]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE6C4D]"></div>
          <span className="ml-3 text-gray-600">Loading {displayName} analysis...</span>
        </div>
      </div>
    );
  }

  if (!analysisData || !analysisData.byExporter || analysisData.byExporter.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">⚠️ No {displayName} data available</p>
        <p className="text-yellow-600 text-sm mt-2">
          {!analysisData ? 'Analysis data not loaded' : 
           !analysisData.byExporter ? 'Exporter data structure missing' : 
           'No records found for this charge type'}
        </p>
      </div>
    );
  }

  // Convert byExporter object to array for chart data
  const exportersArray = Object.values(analysisData.byExporter);

  // Debug logs for repacking data structure
  console.log('🔍 Repacking Debug - analysisData:', analysisData);
  console.log('🔍 Repacking Debug - analysisData.analysis:', analysisData.analysis);
  console.log('🔍 Repacking Debug - Available keys:', analysisData.analysis ? Object.keys(analysisData.analysis) : 'No analysis object');

  const chartData = {
    labels: exportersArray.map(e => e.exporter),
    datasets: [
      {
        label: `${displayName} per Box ($)`,
        data: exportersArray.map(e => e.avgPerBox || 0),
        backgroundColor: CHART_COLORS[0],
        borderColor: CHART_COLORS[1],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h4 className="text-lg font-semibold text-[#3D5A80] mb-4 flex items-center">
        <span className="mr-2">📦</span>
        {displayName} Analysis
      </h4>
      
      {/* KPI Section */}
      <KPISection
        title="📦 Repacking KPIs"
        subtitle="Key metrics for repacking and packing materials analysis"
        titleColor="text-[#3D5A80]"
        backgroundColor="bg-white"
        kpis={[
          { 
            label: 'Total Amount', 
            value: analysisData.summary?.totalAmount || 0, 
            type: 'currency',
            size: 'normal'
          },
          { 
            label: 'Packing Materials', 
            value: analysisData.analysis?.packingMaterialsAmount || 0, 
            type: 'currency',
            size: 'normal'
          },
          { 
            label: 'Repacking Charges', 
            value: analysisData.analysis?.repackingChargesAmount || 0, 
            type: 'currency',
            size: 'normal'
          },
          { 
            label: 'Total Lots', 
            value: analysisData.summary?.lotsWithCharge || 0, 
            type: 'integer',
            size: 'normal'
          }
        ]}
        chart={null}
        showChart={false}
        containerClass=""
      />

      {/* Breakdown by Charge Type */}
      {analysisData.analysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h5 className="font-semibold text-blue-800 mb-3">📊 Breakdown by Charge Type</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">📦 Packing Materials</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {analysisData.analysis.totalAmount > 0 ? 
                    ((analysisData.analysis.packingMaterialsAmount / analysisData.analysis.totalAmount) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="text-lg font-bold text-[#3D5A80]">{formatPrice(analysisData.analysis.packingMaterialsAmount || 0)}</div>
              <div className="text-xs text-gray-600">{formatNumber(analysisData.analysis.packingMaterialsRecords || 0)} records</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">🔄 Repacking Charges</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {analysisData.analysis.totalAmount > 0 ? 
                    ((analysisData.analysis.repackingChargesAmount / analysisData.analysis.totalAmount) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="text-lg font-bold text-[#3D5A80]">{formatPrice(analysisData.analysis.repackingChargesAmount || 0)}</div>
              <div className="text-xs text-gray-600">{formatNumber(analysisData.analysis.repackingChargesRecords || 0)} records</div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="relative h-[300px] mb-4">
        <Bar data={chartData} options={{
          ...getDefaultChartOptions(`${displayName} by Exporter`),
          plugins: {
            ...getDefaultChartOptions().plugins,
            zoom: {
              zoom: {
                wheel: {
                  enabled: false
                },
                pinch: {
                  enabled: false
                }
              },
              pan: {
                enabled: false
              }
            }
          }
        }} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#98C1D9] text-white">
            <tr>
              <th className="p-2 text-left">Exporter</th>
              <th className="p-2 text-right">Total Amount</th>
              <th className="p-2 text-right">Packing Materials</th>
              <th className="p-2 text-right">Repacking Charges</th>
              <th className="p-2 text-right">Per Box</th>
              <th className="p-2 text-right">Lots</th>
            </tr>
          </thead>
          <tbody>
            {exportersArray.map((row, index) => (
              <tr key={row.exporter || `exporter-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-2 font-medium">{row.exporter || 'Unknown'}</td>
                <td className="p-2 text-right font-semibold">{formatPrice(row.totalAmount || 0)}</td>
                <td className="p-2 text-right text-blue-600">{formatPrice(row.packingMaterials || 0)}</td>
                <td className="p-2 text-right text-green-600">{formatPrice(row.repackingCharges || 0)}</td>
                <td className="p-2 text-right">{formatPrice(row.avgPerBox || 0)}</td>
                <td className="p-2 text-right">{formatNumber(row.lots || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Outlier Analysis Component
const OutlierAnalysis = ({ metrics }) => {
  const [selectedOutlier, setSelectedOutlier] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [chargeData, setChargeData] = useState([]);
  const itemsPerPage = 15;

  // Load charge data when component mounts
  useEffect(() => {
    const loadChargeData = async () => {
      try {
        const data = await getChargeDataFromEmbedded();
        setChargeData(data);
      } catch (error) {
        console.error('Error loading charge data:', error);
      }
    };
    loadChargeData();
  }, []);

  // Function to get top 3 cost contributors for a specific outlier
  const getTopCostContributors = (lotid) => {
    if (!chargeData || chargeData.length === 0) return [];
    
    // Excluded charge types (same as in general cost analysis)
    const excludedCharges = ['COMMISSION', 'GROWER ADVANCES'];
    
    // Filter charges for this specific lotid and exclude commission/grower advances
    const lotCharges = chargeData.filter(charge => 
      charge.Lotid === lotid && 
      !excludedCharges.includes(charge.Chargedescr?.toUpperCase())
    );
    
    // Group by charge description and sum amounts
    const chargeGroups = {};
    lotCharges.forEach(charge => {
      const desc = charge.Chargedescr || 'Unknown Charge';
      const amount = parseFloat(charge.Chgamt) || 0;
      
      if (!chargeGroups[desc]) {
        chargeGroups[desc] = {
          description: desc,
          totalAmount: 0,
          count: 0
        };
      }
      
      chargeGroups[desc].totalAmount += amount;
      chargeGroups[desc].count += 1;
    });
    
    // Convert to array and sort by total amount (descending)
    const sortedCharges = Object.values(chargeGroups)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 3); // Get top 3
    
    return sortedCharges;
  };

  const outlierAnalysis = useMemo(() => {
    const lotids = Object.values(metrics).filter(l => l.costPerBox !== null);
    
    if (lotids.length === 0) return { outliers: [], stats: null };

    const costs = lotids.map(l => l.costPerBox);
    const mean = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    const variance = costs.reduce((sum, cost) => sum + Math.pow(cost - mean, 2), 0) / costs.length;
    const stdDev = Math.sqrt(variance);
    
    // Define outliers as values beyond 2 standard deviations
    const threshold = 2;
    const outliers = lotids.filter(l => Math.abs(l.costPerBox - mean) > threshold * stdDev);
    
    const stats = {
      mean,
      stdDev,
      outlierCount: outliers.length,
      outlierPercentage: (outliers.length / lotids.length) * 100,
      minCost: Math.min(...costs),
      maxCost: Math.max(...costs)
    };

    return { outliers, stats };
  }, [metrics]);

  if (!outlierAnalysis.stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">⚠️ Insufficient data for outlier analysis</p>
      </div>
    );
  }

  const scatterData = {
    datasets: [
      {
        label: 'Normal Costs',
        data: Object.values(metrics)
          .filter(l => l.costPerBox !== null && !outlierAnalysis.outliers.includes(l))
          .map((l, index) => ({ x: index, y: l.costPerBox })),
        backgroundColor: FAMUS_COLORS.blue,
        pointRadius: 4,
      },
      {
        label: 'Outliers',
        data: outlierAnalysis.outliers.map((l, index) => ({ 
          x: Object.values(metrics).indexOf(l), 
          y: l.costPerBox,
          lotid: l.lotid,
          exporter: l.exporter,
          totalBoxes: l.totalBoxes,
          totalChargeAmount: l.totalChargeAmount
        })),
        backgroundColor: FAMUS_COLORS.orange,
        pointRadius: 8,
        pointHoverRadius: 10,
      },
    ],
  };

  const scatterOptions = {
    ...getDefaultChartOptions('Cost Distribution - Outlier Detection'),
    plugins: {
      ...getDefaultChartOptions('Cost Distribution - Outlier Detection').plugins,
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
        },
        pan: {
          enabled: true,
          mode: 'xy',
        },
        limits: {
          y: {min: 0, max: 50},
          x: {min: 0, max: Object.values(metrics).length}
        }
      },
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Lot Index (Sequential order of records in dataset)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Cost per Box (USD)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.1)'
        },
        beginAtZero: true
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const dataIndex = element.index;
        
        if (datasetIndex === 1) { // Outliers dataset
          const outlierData = scatterData.datasets[1].data[dataIndex];
          const outlier = outlierAnalysis.outliers[dataIndex];
          setSelectedOutlier({
            ...outlier,
            deviation: Math.abs(outlier.costPerBox - outlierAnalysis.stats.mean),
            meanCost: outlierAnalysis.stats.mean
          });
          setShowDetailModal(true);
        }
      }
    },
    interaction: {
      intersect: false,
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(outlierAnalysis.outliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOutliers = outlierAnalysis.outliers.slice(startIndex, endIndex);

  return (
    <div className="bg-[#F9F6F4] rounded-2xl p-6 shadow-md">
      {/* Stats Summary - Maximum 3 columns for better distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-w-6xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Outliers Found</div>
          <div className="text-2xl font-bold text-[#EE6C4D]">{outlierAnalysis.stats.outlierCount}</div>
          <div className="text-xs text-gray-500">{outlierAnalysis.stats.outlierPercentage.toFixed(1)}% of total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Mean Cost</div>
          <div className="text-2xl font-bold text-[#3D5A80]">{formatPrice(outlierAnalysis.stats.mean)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Std Deviation</div>
          <div className="text-2xl font-bold text-[#3D5A80]">{formatPrice(outlierAnalysis.stats.stdDev)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Cost Range</div>
          <div className="text-lg font-bold text-[#3D5A80]">
            {formatPrice(outlierAnalysis.stats.minCost)} - {formatPrice(outlierAnalysis.stats.maxCost)}
          </div>
        </div>
      </div>

      {/* Interactive Scatter Plot with Zoom Controls */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-[#3D5A80]">Interactive Cost Distribution Chart</h4>
          <div className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>Normal Costs
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1 ml-4"></span>Outliers (Click for details)
          </div>
        </div>
        <div className="relative h-[500px]">
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
        <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
          <p><strong>Chart Instructions:</strong> Use mouse wheel to zoom in/out, click and drag to pan. Click on orange outlier points to view detailed information. The X-axis represents the sequential order of lot records, and the Y-axis shows cost per box in USD.</p>
        </div>
      </div>

      {/* Outlier Details Table with Pagination */}
      {outlierAnalysis.outliers.length > 0 && (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="bg-[#EE6C4D] text-white p-3">
            <h4 className="font-semibold">Detailed Outlier Analysis ({outlierAnalysis.outliers.length} total outliers)</h4>
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-[#3D5A80] text-white sticky top-0">
                <tr>
                  <th className="p-3 text-left min-w-[120px]">Lot ID</th>
                  <th className="p-3 text-left min-w-[100px]">Exporter</th>
                  <th className="p-3 text-right min-w-[80px]">Cost/Box</th>
                  <th className="p-3 text-right min-w-[80px]">Deviation</th>
                  <th className="p-3 text-right min-w-[80px]">Total Boxes</th>
                  <th className="p-3 text-right min-w-[100px]">Total Amount</th>
                  <th className="p-3 text-center min-w-[80px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentOutliers.map((outlier, index) => (
                  <tr key={outlier.lotid} className={index % 2 === 0 ? 'bg-[#E8F4F8]' : 'bg-white'}>
                    <td className="p-3 font-mono text-xs">{outlier.lotid}</td>
                    <td className="p-3 text-[#3D5A80] font-medium">{outlier.exporter}</td>
                    <td className="p-3 text-right font-semibold text-[#EE6C4D]">{formatPrice(outlier.costPerBox)}</td>
                    <td className="p-3 text-right">{formatPrice(Math.abs(outlier.costPerBox - outlierAnalysis.stats.mean))}</td>
                    <td className="p-3 text-right">{Math.round(outlier.totalBoxes)}</td>
                    <td className="p-3 text-right">${outlier.totalChargeAmount?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}</td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => {
                          setSelectedOutlier({
                            ...outlier,
                            deviation: Math.abs(outlier.costPerBox - outlierAnalysis.stats.mean),
                            meanCost: outlierAnalysis.stats.mean
                          });
                          setShowDetailModal(true);
                        }}
                        className="px-2 py-1 bg-[#3D5A80] text-white rounded text-xs hover:bg-[#2A4A6B] transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, outlierAnalysis.outliers.length)} of {outlierAnalysis.outliers.length} outliers
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Outlier Modal */}
      {showDetailModal && selectedOutlier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-[#EE6C4D]">Outlier Detail: {selectedOutlier.lotid}</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Exporter</div>
                  <div className="font-semibold text-[#3D5A80]">{selectedOutlier.exporter}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Lot ID</div>
                  <div className="font-mono text-sm">{selectedOutlier.lotid}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Cost per Box</div>
                  <div className="font-bold text-lg text-[#EE6C4D]">{formatPrice(selectedOutlier.costPerBox)}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Mean Cost</div>
                  <div className="font-bold text-lg text-[#3D5A80]">{formatPrice(selectedOutlier.meanCost)}</div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded">
                <div className="text-sm text-gray-600">Deviation from Mean</div>
                <div className="font-bold text-lg text-yellow-800">{formatPrice(selectedOutlier.deviation)}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {selectedOutlier.costPerBox > selectedOutlier.meanCost ? 'Above average' : 'Below average'} by {(selectedOutlier.deviation / selectedOutlier.meanCost * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Total Boxes</div>
                  <div className="font-semibold">{Math.round(selectedOutlier.totalBoxes).toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="font-semibold">${selectedOutlier.totalChargeAmount?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}</div>
                </div>
              </div>

              {/* Top 3 Cost Contributors */}
              <div className="bg-[#F0F8FF] p-4 rounded-lg border-2 border-[#3D5A80]">
                <h4 className="font-bold text-[#3D5A80] mb-3 flex items-center">
                  <span className="mr-2">💰</span>
                  Top 3 Cost Contributors (Why this is an outlier)
                </h4>
                <div className="text-xs text-gray-600 mb-3 italic">
                  * Commission and Grower Advances are excluded from this analysis (consistent with overall cost metrics)
                </div>
                {(() => {
                  const topCosts = getTopCostContributors(selectedOutlier.lotid);
                  
                  if (topCosts.length === 0) {
                    return (
                      <div className="text-sm text-gray-600 italic">
                        No detailed cost breakdown available for this lot (excluding Commission and Grower Advances).
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-3">
                      {topCosts.map((cost, index) => {
                        const costPerBox = selectedOutlier.totalBoxes > 0 ? cost.totalAmount / selectedOutlier.totalBoxes : 0;
                        const percentageOfTotal = selectedOutlier.totalChargeAmount > 0 ? (cost.totalAmount / selectedOutlier.totalChargeAmount * 100) : 0;
                        
                        return (
                          <div key={index} className="bg-white p-3 rounded shadow-sm border-l-4 border-[#3D5A80]">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-semibold text-[#3D5A80] text-sm">
                                  #{index + 1}. {cost.description}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {cost.count} charge{cost.count !== 1 ? 's' : ''} • {percentageOfTotal.toFixed(1)}% of total cost
                                </div>
                              </div>
                              <div className="text-right ml-3">
                                <div className="font-bold text-[#EE6C4D]">
                                  ${cost.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {formatPrice(costPerBox)}/box
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {topCosts.length > 0 && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-gray-700">
                          <strong>Analysis:</strong> These are the largest operational cost components contributing to this lot's {selectedOutlier.costPerBox > selectedOutlier.meanCost ? 'higher than average' : 'lower than average'} cost per box. 
                          {selectedOutlier.costPerBox > selectedOutlier.meanCost ? 
                            ' Focus on optimizing these operational cost areas for better efficiency.' : 
                            ' This lot shows exceptional operational cost efficiency in these areas.'}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              
              <div className="bg-orange-50 p-3 rounded">
                <div className="text-sm text-gray-600">Statistical Impact Analysis</div>
                <div className="text-sm mt-1">
                  This outlier represents a cost that is <strong>{(selectedOutlier.deviation / outlierAnalysis.stats.stdDev).toFixed(1)} standard deviations</strong> away from the mean, 
                  indicating {selectedOutlier.costPerBox > selectedOutlier.meanCost ? 'significantly higher' : 'significantly lower'} than expected operational costs.
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-[#3D5A80] text-white rounded hover:bg-[#2A4A6B] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal Consistency Analysis Component
const InternalConsistencyAnalysis = ({ metrics, chargeData }) => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterExporter, setFilterExporter] = useState('');
  const [filterIssueType, setFilterIssueType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const itemsPerPage = 15;

  const consistencyData = useMemo(() => {
    const lots = Object.values(metrics);
    const issues = [];
    
    lots.forEach(lot => {
      // Get exporter info for the issue
      const exporter = lot.exporter || 'Unknown';
      
      // Check for missing critical data
      if (!lot.exporter || lot.exporter === '') {
        issues.push({
          lotId: lot.lotid,
          exporter: 'Missing',
          type: 'Missing Exporter',
          severity: 'High',
          description: 'Lot missing exporter information',
          costPerBox: lot.costPerBox,
          totalCharges: lot.totalCharges
        });
      }
      
      // Check for inconsistent cost calculations
      if (lot.costPerBox === null || lot.costPerBox === 0) {
        issues.push({
          lotId: lot.lotid,
          exporter: exporter,
          type: 'Invalid Cost',
          severity: 'High',
          description: 'Cost per box is null or zero',
          costPerBox: lot.costPerBox,
          totalCharges: lot.totalCharges
        });
      }
      
      // Check for outlier costs (> 3 standard deviations)
      const validCosts = lots.filter(l => l.costPerBox !== null).map(l => l.costPerBox);
      if (validCosts.length > 0) {
        const mean = validCosts.reduce((a, b) => a + b, 0) / validCosts.length;
        const stdDev = Math.sqrt(validCosts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validCosts.length);
        
        if (lot.costPerBox !== null && Math.abs(lot.costPerBox - mean) > 3 * stdDev) {
          issues.push({
            lotId: lot.lotid,
            exporter: exporter,
            type: 'Statistical Outlier',
            severity: 'Medium',
            description: `Cost significantly deviates from average (${formatPrice(lot.costPerBox)} vs avg ${formatPrice(mean)})`,
            costPerBox: lot.costPerBox,
            totalCharges: lot.totalCharges
          });
        }
      }

      // Check for missing total charges
      if (!lot.totalCharges || lot.totalCharges === 0) {
        issues.push({
          lotId: lot.lotid,
          exporter: exporter,
          type: 'Missing Charges',
          severity: 'Medium',
          description: 'No charge data found for this lot',
          costPerBox: lot.costPerBox,
          totalCharges: 0
        });
      }
    });
    
    return issues.sort((a, b) => {
      const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [metrics]);

  // Filter issues based on selected filters
  const filteredIssues = useMemo(() => {
    return consistencyData.filter(issue => {
      const matchesExporter = !filterExporter || issue.exporter.toLowerCase().includes(filterExporter.toLowerCase());
      const matchesIssueType = !filterIssueType || issue.type === filterIssueType;
      const matchesSeverity = !filterSeverity || issue.severity === filterSeverity;
      return matchesExporter && matchesIssueType && matchesSeverity;
    });
  }, [consistencyData, filterExporter, filterIssueType, filterSeverity]);

  // Get unique values for filters
  const uniqueExporters = [...new Set(consistencyData.map(issue => issue.exporter))].sort();
  const uniqueIssueTypes = [...new Set(consistencyData.map(issue => issue.type))].sort();
  const uniqueSeverities = [...new Set(consistencyData.map(issue => issue.severity))].sort();

  // Count issues by exporter
  const issuesByExporter = useMemo(() => {
    const counts = {};
    consistencyData.forEach(issue => {
      counts[issue.exporter] = (counts[issue.exporter] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 exporters with most issues
  }, [consistencyData]);

  // Get details for a specific issue
  const getIssueDetails = (lotId) => {
    const lot = metrics[lotId];
    if (!lot) return null;

    const lotCharges = chargeData.filter(charge => charge.lotid === lotId);
    return {
      lot,
      charges: lotCharges,
      chargeBreakdown: lotCharges.reduce((acc, charge) => {
        acc[charge.chargeName] = (acc[charge.chargeName] || 0) + parseFloat(charge.chargeAmount || 0);
        return acc;
      }, {})
    };
  };

  // Pagination
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredIssues.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterExporter, filterIssueType, filterSeverity]);

  const handleIssueClick = (issue) => {
    const details = getIssueDetails(issue.lotId);
    if (details) {
      setSelectedIssue({ ...issue, details });
      setShowDetailModal(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Internal Consistency Issues</h3>
        <div className="text-sm text-gray-600">
          {filteredIssues.length} of {consistencyData.length} issues shown
        </div>
      </div>

      {/* Issues by Exporter Summary */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">📊 Issues by Exporter (Top 10)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {issuesByExporter.map(([exporter, count]) => (
            <div key={exporter} className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-700 truncate" title={exporter}>{exporter}</div>
              <div className="text-blue-600 font-bold">{count} issues</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">🔍 Filters</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Exporter</label>
            <select
              value={filterExporter}
              onChange={(e) => setFilterExporter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Exporters</option>
              {uniqueExporters.map(exporter => (
                <option key={exporter} value={exporter}>{exporter}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Issue Type</label>
            <select
              value={filterIssueType}
              onChange={(e) => setFilterIssueType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {uniqueIssueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Severities</option>
              {uniqueSeverities.map(severity => (
                <option key={severity} value={severity}>{severity}</option>
              ))}
            </select>
          </div>
        </div>
        {(filterExporter || filterIssueType || filterSeverity) && (
          <div className="mt-3">
            <button
              onClick={() => {
                setFilterExporter('');
                setFilterIssueType('');
                setFilterSeverity('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Issues Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exporter</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Box</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((issue, index) => (
              <tr key={`${issue.lotId}-${issue.type}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{issue.lotId}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{issue.exporter}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{issue.type}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    issue.severity === 'High' ? 'bg-red-100 text-red-800' : 
                    issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.severity}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {issue.costPerBox !== null ? formatPrice(issue.costPerBox) : 'N/A'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleIssueClick(issue)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredIssues.length)} of {filteredIssues.length} issues
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Issue Details - Lot {selectedIssue.lotId}</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Issue Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Type:</strong> {selectedIssue.type}</div>
                    <div><strong>Severity:</strong> <span className={`px-2 py-1 rounded text-xs ${
                      selectedIssue.severity === 'High' ? 'bg-red-100 text-red-800' : 
                      selectedIssue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>{selectedIssue.severity}</span></div>
                    <div><strong>Description:</strong> {selectedIssue.description}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Lot Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Exporter:</strong> {selectedIssue.details.lot.exporter || 'Unknown'}</div>
                    <div><strong>Cost per Box:</strong> {selectedIssue.details.lot.costPerBox ? formatPrice(selectedIssue.details.lot.costPerBox) : 'N/A'}</div>
                    <div><strong>Total Charges:</strong> {formatPrice(selectedIssue.details.lot.totalCharges || 0)}</div>
                    <div><strong>Charge Records:</strong> {selectedIssue.details.charges.length}</div>
                  </div>
                </div>
              </div>

              {selectedIssue.details.charges.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Charge Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left">Charge Type</th>
                          <th className="px-3 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedIssue.details.chargeBreakdown).map(([type, amount]) => (
                          <tr key={type} className="border-t">
                            <td className="px-3 py-2">{type}</td>
                            <td className="px-3 py-2 text-right">{formatPrice(amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// External Consistency Analysis Component
const ExternalConsistencyAnalysis = ({ metrics, chargeData }) => {
  const consistencyData = useMemo(() => {
    const exporterAnalysis = {};
    
    Object.values(metrics).forEach(lot => {
      if (!lot.exporter || isExporterExcluded(lot.exporter)) return;
      
      if (!exporterAnalysis[lot.exporter]) {
        exporterAnalysis[lot.exporter] = {
          exporter: lot.exporter,
          totalLots: 0,
          validCosts: [],
          totalCharges: 0,
          avgCostPerBox: 0,
          stdDeviation: 0,
          consistencyScore: 0
        };
      }
      
      exporterAnalysis[lot.exporter].totalLots++;
      if (lot.costPerBox !== null) {
        exporterAnalysis[lot.exporter].validCosts.push(lot.costPerBox);
      }
      exporterAnalysis[lot.exporter].totalCharges += lot.totalCharges || 0;
    });
    
    // Calculate statistics and consistency scores
    Object.values(exporterAnalysis).forEach(exp => {
      if (exp.validCosts.length > 0) {
        exp.avgCostPerBox = exp.validCosts.reduce((a, b) => a + b, 0) / exp.validCosts.length;
        const variance = exp.validCosts.reduce((a, b) => a + Math.pow(b - exp.avgCostPerBox, 2), 0) / exp.validCosts.length;
        exp.stdDeviation = Math.sqrt(variance);
        exp.consistencyScore = exp.stdDeviation > 0 ? Math.max(0, 100 - (exp.stdDeviation / exp.avgCostPerBox * 100)) : 100;
      }
    });
    
    return Object.values(exporterAnalysis).sort((a, b) => b.consistencyScore - a.consistencyScore);
  }, [metrics, chargeData]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">External Consistency by Exporter</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exporter</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Lots</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost/Box</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Std Deviation</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consistency Score</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {consistencyData.map((exp, index) => (
              <tr key={exp.exporter} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{exp.exporter}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{exp.totalLots}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatPrice(exp.avgCostPerBox)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatPrice(exp.stdDeviation)}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    exp.consistencyScore >= 80 ? 'bg-green-100 text-green-800' : 
                    exp.consistencyScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {formatPercentage(exp.consistencyScore / 100)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Final Cost Analysis Tables Component
const FinalCostAnalysisTables = ({ metrics, chargeData }) => {
  const [selectedLot, setSelectedLot] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExporter, setSelectedExporter] = useState('All');
  const [sortBy, setSortBy] = useState('costPerBox');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 20;

  // Prepare data for the table
  const tableData = useMemo(() => {
    const lots = Object.values(metrics)
      .filter(lot => !isExporterExcluded(lot.exporter))
      .filter(lot => lot.costPerBox !== null);

    // Apply filters
    let filtered = lots;

    if (searchTerm) {
      filtered = filtered.filter(lot => 
        lot.lotid.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedExporter !== 'All') {
      filtered = filtered.filter(lot => lot.exporter === selectedExporter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'exporter' || sortBy === 'lotid') {
        aVal = aVal || '';
        bVal = bVal || '';
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        aVal = aVal || 0;
        bVal = bVal || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    return filtered;
  }, [metrics, searchTerm, selectedExporter, sortBy, sortOrder]);

  // Get unique exporters for filter
  const exporters = useMemo(() => {
    const uniqueExporters = [...new Set(Object.values(metrics)
      .filter(lot => lot.exporter && !isExporterExcluded(lot.exporter))
      .map(lot => lot.exporter))];
    return ['All', ...uniqueExporters.sort()];
  }, [metrics]);

  // Pagination
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = tableData.slice(startIndex, startIndex + itemsPerPage);

  // Get detailed analysis for a specific lot
  const getLotDetails = (lotId) => {
    const lot = metrics[lotId];
    if (!lot) return null;

    const lotCharges = chargeData.filter(charge => charge.lotid === lotId);
    
    // Calculate statistics for this exporter
    const exporterLots = Object.values(metrics)
      .filter(l => l.exporter === lot.exporter && l.costPerBox !== null);
    
    const exporterAvg = exporterLots.length > 0 
      ? exporterLots.reduce((sum, l) => sum + l.costPerBox, 0) / exporterLots.length 
      : 0;
    
    const exporterStdDev = exporterLots.length > 1
      ? Math.sqrt(exporterLots.reduce((sum, l) => sum + Math.pow(l.costPerBox - exporterAvg, 2), 0) / (exporterLots.length - 1))
      : 0;

    // Calculate global statistics
    const allLots = Object.values(metrics)
      .filter(l => l.costPerBox !== null && !isExporterExcluded(l.exporter));
    
    const globalAvg = allLots.length > 0
      ? allLots.reduce((sum, l) => sum + l.costPerBox, 0) / allLots.length
      : 0;
    
    const globalStdDev = allLots.length > 1
      ? Math.sqrt(allLots.reduce((sum, l) => sum + Math.pow(l.costPerBox - globalAvg, 2), 0) / (allLots.length - 1))
      : 0;

    // Group charges by type
    const chargeBreakdown = lotCharges.reduce((acc, charge) => {
      const type = charge.chargeName || charge.Chargedescr || 'Unknown';
      const amount = parseFloat(charge.chargeAmount || charge.Chgamt || 0);
      
      if (!acc[type]) {
        acc[type] = {
          totalAmount: 0,
          count: 0,
          charges: []
        };
      }
      
      acc[type].totalAmount += amount;
      acc[type].count++;
      acc[type].charges.push(charge);
      
      return acc;
    }, {});

    // Calculate charge type comparisons
    const chargeComparisons = Object.entries(chargeBreakdown).map(([type, data]) => {
      // Get average for this charge type across all lots of same exporter
      const exporterChargesOfType = chargeData
        .filter(c => (c.chargeName || c.Chargedescr) === type)
        .filter(c => {
          const lotOfCharge = metrics[c.lotid];
          return lotOfCharge && lotOfCharge.exporter === lot.exporter;
        });
      
      const exporterAvgForType = exporterChargesOfType.length > 0
        ? exporterChargesOfType.reduce((sum, c) => sum + parseFloat(c.chargeAmount || c.Chgamt || 0), 0) / exporterChargesOfType.length
        : 0;

      // Get global average for this charge type
      const globalChargesOfType = chargeData
        .filter(c => (c.chargeName || c.Chargedescr) === type)
        .filter(c => {
          const lotOfCharge = metrics[c.lotid];
          return lotOfCharge && !isExporterExcluded(lotOfCharge.exporter);
        });
      
      const globalAvgForType = globalChargesOfType.length > 0
        ? globalChargesOfType.reduce((sum, c) => sum + parseFloat(c.chargeAmount || c.Chgamt || 0), 0) / globalChargesOfType.length
        : 0;

      return {
        type,
        amount: data.totalAmount,
        count: data.count,
        exporterAvg: exporterAvgForType,
        globalAvg: globalAvgForType,
        deviationFromExporter: exporterAvgForType > 0 ? ((data.totalAmount - exporterAvgForType) / exporterAvgForType * 100) : 0,
        deviationFromGlobal: globalAvgForType > 0 ? ((data.totalAmount - globalAvgForType) / globalAvgForType * 100) : 0
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      lot,
      charges: lotCharges,
      chargeBreakdown,
      chargeComparisons,
      statistics: {
        exporter: {
          avg: exporterAvg,
          stdDev: exporterStdDev,
          deviation: exporterAvg > 0 ? ((lot.costPerBox - exporterAvg) / exporterAvg * 100) : 0,
          count: exporterLots.length
        },
        global: {
          avg: globalAvg,
          stdDev: globalStdDev,
          deviation: globalAvg > 0 ? ((lot.costPerBox - globalAvg) / globalAvg * 100) : 0,
          count: allLots.length
        }
      }
    };
  };

  const handleLotClick = (lot) => {
    const details = getLotDetails(lot.lotid);
    if (details) {
      setSelectedLot(details);
      setShowDetailModal(true);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Final Cost Analysis - All Lots</h3>
        <div className="text-sm text-gray-600">
          {tableData.length} lots found
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Lot ID</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter Lot ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exporter</label>
          <select
            value={selectedExporter}
            onChange={(e) => setSelectedExporter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {exporters.map(exp => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="costPerBox-desc">Cost/Box (High to Low)</option>
            <option value="costPerBox-asc">Cost/Box (Low to High)</option>
            <option value="totalCharges-desc">Total Charges (High to Low)</option>
            <option value="totalCharges-asc">Total Charges (Low to High)</option>
            <option value="exporter-asc">Exporter (A-Z)</option>
            <option value="lotid-asc">Lot ID (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th 
                onClick={() => handleSort('lotid')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Lot ID {sortBy === 'lotid' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('exporter')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Exporter {sortBy === 'exporter' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('costPerBox')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Cost/Box {sortBy === 'costPerBox' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('totalCharges')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Total Charges {sortBy === 'totalCharges' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((lot, index) => (
              <tr key={lot.lotid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{lot.lotid}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{lot.exporter}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatPrice(lot.costPerBox)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatPrice(lot.totalCharges || 0)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleLotClick(lot)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, tableData.length)} of {tableData.length} lots
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Cost Analysis - Lot {selectedLot.lot.lotid}</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Lot Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Exporter:</strong> {selectedLot.lot.exporter}</div>
                    <div><strong>Cost per Box:</strong> {formatPrice(selectedLot.lot.costPerBox)}</div>
                    <div><strong>Total Charges:</strong> {formatPrice(selectedLot.lot.totalCharges || 0)}</div>
                    <div><strong>Charge Records:</strong> {selectedLot.charges.length}</div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">vs Exporter Average</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Exporter Avg:</strong> {formatPrice(selectedLot.statistics.exporter.avg)}</div>
                    <div><strong>Std Deviation:</strong> {formatPrice(selectedLot.statistics.exporter.stdDev)}</div>
                    <div><strong>Deviation:</strong> <span className={`font-medium ${
                      Math.abs(selectedLot.statistics.exporter.deviation) > 20 ? 'text-red-600' : 
                      Math.abs(selectedLot.statistics.exporter.deviation) > 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {selectedLot.statistics.exporter.deviation > 0 ? '+' : ''}{selectedLot.statistics.exporter.deviation.toFixed(1)}%
                    </span></div>
                    <div><strong>Sample Size:</strong> {selectedLot.statistics.exporter.count} lots</div>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">vs Global Average</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Global Avg:</strong> {formatPrice(selectedLot.statistics.global.avg)}</div>
                    <div><strong>Std Deviation:</strong> {formatPrice(selectedLot.statistics.global.stdDev)}</div>
                    <div><strong>Deviation:</strong> <span className={`font-medium ${
                      Math.abs(selectedLot.statistics.global.deviation) > 20 ? 'text-red-600' : 
                      Math.abs(selectedLot.statistics.global.deviation) > 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {selectedLot.statistics.global.deviation > 0 ? '+' : ''}{selectedLot.statistics.global.deviation.toFixed(1)}%
                    </span></div>
                    <div><strong>Sample Size:</strong> {selectedLot.statistics.global.count} lots</div>
                  </div>
                </div>
              </div>

              {/* Charge Breakdown with Comparisons */}
              <div>
                <h4 className="font-semibold mb-4">Charge Breakdown & Comparisons</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left">Charge Type</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-right">Count</th>
                        <th className="px-3 py-2 text-right">Exporter Avg</th>
                        <th className="px-3 py-2 text-right">vs Exporter</th>
                        <th className="px-3 py-2 text-right">Global Avg</th>
                        <th className="px-3 py-2 text-right">vs Global</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLot.chargeComparisons.map((comp, index) => (
                        <tr key={comp.type} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 font-medium">{comp.type}</td>
                          <td className="px-3 py-2 text-right">{formatPrice(comp.amount)}</td>
                          <td className="px-3 py-2 text-right">{comp.count}</td>
                          <td className="px-3 py-2 text-right">{formatPrice(comp.exporterAvg)}</td>
                          <td className="px-3 py-2 text-right">
                            <span className={`font-medium ${
                              Math.abs(comp.deviationFromExporter) > 30 ? 'text-red-600' : 
                              Math.abs(comp.deviationFromExporter) > 15 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {comp.deviationFromExporter > 0 ? '+' : ''}{comp.deviationFromExporter.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">{formatPrice(comp.globalAvg)}</td>
                          <td className="px-3 py-2 text-right">
                            <span className={`font-medium ${
                              Math.abs(comp.deviationFromGlobal) > 30 ? 'text-red-600' : 
                              Math.abs(comp.deviationFromGlobal) > 15 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {comp.deviationFromGlobal > 0 ? '+' : ''}{comp.deviationFromGlobal.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Advanced Initial Stock Analysis Component
const AdvancedStockAnalysis = () => {
  const [stockAnalysis, setStockAnalysis] = useState(null);
  const [topVarieties, setTopVarieties] = useState([]);
  const [monthlyDistribution, setMonthlyDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStockAnalysis = async () => {
      try {
        setLoading(true);
        
        // Load all analysis data in parallel
        const [analysis, varieties, monthly] = await Promise.all([
          getInitialStockAnalysis(),
          getTopVarietiesByStock(8),
          getStockDistributionByMonth()
        ]);
        
        setStockAnalysis(analysis);
        setTopVarieties(varieties);
        setMonthlyDistribution(monthly);
        
        // Log validation data
        await validateInitialStockByExporter();
      } catch (error) {
        console.error('Error loading stock analysis:', error);
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
          <span className="ml-3 text-gray-600">Loading stock analysis...</span>
        </div>
      </div>
    );
  }

  if (!stockAnalysis) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">⚠️ Stock analysis data not available</p>
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

  const exporterData = Object.entries(stockAnalysis.byExporter)
    .sort(([,a], [,b]) => b.totalStock - a.totalStock);

  return (
    <div className="bg-[#F9F6F4] rounded-2xl p-6 shadow-md">
      <h3 className="text-2xl font-bold text-[#3D5A80] mb-6 flex items-center">
        <span className="mr-3">📊</span>
        Advanced Stock Analysis
      </h3>

      {/* Stock Summary KPI Cards */}
      <KPISection
        title="Initial Stock Analysis Overview"
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
            label: 'Total Lotids', 
            value: stockAnalysis.totalLotids, 
            type: 'integer',
            size: 'normal'
          },
          { 
            label: 'Varieties', 
            value: Object.keys(stockAnalysis.byVariety).length, 
            type: 'integer',
            size: 'normal'
          },
          { 
            label: 'Avg per Lot', 
            value: Math.round(stockAnalysis.totalStock / stockAnalysis.totalLotids), 
            type: 'integer',
            size: 'normal'
          },
        ]}
        chart={null}
        showChart={false}
        containerClass="rounded-xl mb-8"
      />

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Top Varieties Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-[#3D5A80] mb-3">Top Varieties by Stock</h4>
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
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-[#3D5A80] mb-3">Stock Distribution by Month</h4>
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

      {/* Legend for Heatmap Tables */}
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
          Based on stock distribution percentages
        </span>
      </div>

      {/* Exporter Stock Analysis Table - Heatmap Style */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-[#3D5A80] text-white border-b">
          <h4 className="text-lg font-semibold">Stock Analysis by Exporter</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-left font-bold border">Exporter</th>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Total Stock</th>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Lotids</th>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Varieties</th>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Stock %</th>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Stock %</th>
              </tr>
            </thead>
            <tbody>
              {exporterData.map(([exporter, data], index) => {
                const stockPercent = data.totalStock / stockAnalysis.totalStock;
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
                    <td className="px-3 py-2 text-center border">{formatNumber(Math.round(data.lotidCount))}</td>
                    <td className="px-3 py-2 text-center border">{formatNumber(Math.round(data.varietyCount))}</td>
                    <td className="px-3 py-2 text-center border">{formatNumber(Math.round(data.avgStockPerLotid))}</td>
                    <td className="px-3 py-2 text-center border">{formatPercentage(stockPercent)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variety Details - Heatmap Style */}
      <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-[#3D5A80] text-white border-b">
          <h4 className="text-lg font-semibold">Top Varieties Details</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-left font-bold border">Variety</th>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Total Stock</th>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Lotids</th>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Exporters</th>
                <th className="bg-[#3D5A80] text-white px-3 py-2 text-center font-bold border">Stock %</th>
              </tr>
            </thead>
            <tbody>
              {topVarieties.map((variety, index) => {
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
                    <td className="px-3 py-2 text-center border">{formatNumber(Math.round(variety.lotidCount))}</td>
                    <td className="px-3 py-2 text-center border">{formatNumber(Math.round(variety.exporterCount))}</td>
                    <td className="px-3 py-2 text-center border">{formatPercentage(stockPercent)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Comprehensive Summary Table Component
const ComprehensiveSummaryTable = ({ metrics }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummaryData = async () => {
      try {
        setLoading(true);
        
        // Load both charge metrics and stock analysis
        const [stockAnalysis] = await Promise.all([
          getInitialStockAnalysis()
        ]);
        
        // Process charge data by exporter
        const chargesByExporter = {};
        Object.values(metrics).forEach(lotid => {
          const exporter = lotid.exporter;
          if (!chargesByExporter[exporter]) {
            chargesByExporter[exporter] = {
              exporter,
              totalCharges: 0,
              totalBoxes: 0,
              lotCount: 0,
              avgCostPerBox: 0
            };
          }
          chargesByExporter[exporter].totalCharges += lotid.totalChargeAmount || 0;
          chargesByExporter[exporter].totalBoxes += lotid.totalBoxes || 0;
          chargesByExporter[exporter].lotCount += 1;
        });
        
        // Calculate averages for charges
        Object.values(chargesByExporter).forEach(data => {
          data.avgCostPerBox = data.totalBoxes > 0 ? data.totalCharges / data.totalBoxes : 0;
        });
        
        // Combine with stock data
        const combinedData = [];
        const allExporters = new Set([
          ...Object.keys(chargesByExporter),
          ...Object.keys(stockAnalysis.byExporter)
        ]);
        
        allExporters.forEach(exporter => {
          const chargeData = chargesByExporter[exporter] || {
            totalCharges: 0,
            totalBoxes: 0,
            lotCount: 0,
            avgCostPerBox: 0
          };
          
          const stockData = stockAnalysis.byExporter[exporter] || {
            totalStock: 0,
            lotidCount: 0,
            varietyCount: 0,
            avgStockPerLotid: 0
          };
          
          combinedData.push({
            exporter,
            // Charge data
            totalCharges: chargeData.totalCharges,
            chargeBoxes: chargeData.totalBoxes,
            chargeLots: chargeData.lotCount,
            avgCostPerBox: chargeData.avgCostPerBox,
            // Stock data
            initialStock: stockData.totalStock,
            stockLots: stockData.lotidCount,
            varieties: stockData.varietyCount,
            avgStockPerLot: stockData.avgStockPerLotid,
            // Combined metrics
            stockUtilization: chargeData.totalBoxes > 0 && stockData.totalStock > 0 
              ? (chargeData.totalBoxes / stockData.totalStock) * 100 
              : 0,
            totalCostPerInitialBox: stockData.totalStock > 0 
              ? chargeData.totalCharges / stockData.totalStock 
              : 0
          });
        });
        
        // Sort by total charges descending
        combinedData.sort((a, b) => b.totalCharges - a.totalCharges);
        
        setSummaryData(combinedData);
      } catch (error) {
        console.error('Error loading summary data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(metrics).length > 0) {
      loadSummaryData();
    }
  }, [metrics]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE6C4D]"></div>
          <span className="ml-3 text-gray-600">Loading comprehensive summary...</span>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">⚠️ Summary data not available</p>
      </div>
    );
  }

  // Calculate totals
  const totals = summaryData.reduce((acc, row) => ({
    totalCharges: acc.totalCharges + row.totalCharges,
    chargeBoxes: acc.chargeBoxes + row.chargeBoxes,
    chargeLots: acc.chargeLots + row.chargeLots,
    initialStock: acc.initialStock + row.initialStock,
    stockLots: acc.stockLots + row.stockLots,
    varieties: Math.max(acc.varieties, row.varieties) // Max instead of sum for varieties
  }), {
    totalCharges: 0,
    chargeBoxes: 0,
    chargeLots: 0,
    initialStock: 0,
    stockLots: 0,
    varieties: 0
  });

  const overallAvgCostPerBox = totals.chargeBoxes > 0 ? totals.totalCharges / totals.chargeBoxes : 0;
  const overallStockUtilization = totals.initialStock > 0 ? (totals.chargeBoxes / totals.initialStock) * 100 : 0;

  return (
    <div className="bg-[#F9F6F4] rounded-2xl p-6 shadow-md">
      <h3 className="text-2xl font-bold text-[#3D5A80] mb-6 flex items-center">
        <span className="mr-3">📊</span>
        Resumen Integral: Cargos vs Stock Inicial por Exportador
      </h3>

      {/* Summary Cards - Maximum 3 columns for better distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-w-6xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Total Cargos</div>
          <div className="text-xl font-bold text-[#EE6C4D]">{formatPrice(totals.totalCharges)}</div>
          <div className="text-xs text-gray-500">suma total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Stock Inicial Total</div>
          <div className="text-xl font-bold text-[#3D5A80]">{formatNumber(totals.initialStock)}</div>
          <div className="text-xs text-gray-500">cajas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Costo Promedio/Caja</div>
          <div className="text-xl font-bold text-[#98C1D9]">{formatPrice(overallAvgCostPerBox)}</div>
          <div className="text-xs text-gray-500">general</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Utilización Stock</div>
          <div className="text-xl font-bold text-[#EE6C4D]">{formatPercentage(overallStockUtilization / 100)}</div>
          <div className="text-xs text-gray-500">% procesado</div>
        </div>
      </div>

      {/* Main Summary Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h4 className="text-lg font-semibold text-[#3D5A80]">Tabla Resumen Completa por Exportador</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#3D5A80] text-white">
              <tr>
                <th className="p-3 text-left">Exportador</th>
                <th className="p-3 text-right">Total Cargos</th>
                <th className="p-3 text-right">Stock Inicial</th>
                <th className="p-3 text-right">Costo/Caja</th>
                <th className="p-3 text-right">Cajas Procesadas</th>
                <th className="p-3 text-right">Utilización %</th>
                <th className="p-3 text-right">Lotes Cargos</th>
                <th className="p-3 text-right">Lotes Stock</th>
                <th className="p-3 text-right">Variedades</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((row, index) => (
                <tr key={row.exporter} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3 font-medium text-[#3D5A80]">{row.exporter}</td>
                  <td className="p-3 text-right font-semibold text-[#EE6C4D]">{formatPrice(row.totalCharges)}</td>
                  <td className="p-3 text-right font-semibold">{formatNumber(row.initialStock)}</td>
                  <td className="p-3 text-right">{formatPrice(row.avgCostPerBox)}</td>
                  <td className="p-3 text-right">{formatNumber(row.chargeBoxes)}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      row.stockUtilization > 80 ? 'bg-green-100 text-green-800' :
                      row.stockUtilization > 50 ? 'bg-yellow-100 text-yellow-800' :
                      row.stockUtilization > 0 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {formatPercentage(row.stockUtilization / 100)}
                    </span>
                  </td>
                  <td className="p-3 text-right">{formatNumber(row.chargeLots)}</td>
                  <td className="p-3 text-right">{formatNumber(row.stockLots)}</td>
                  <td className="p-3 text-right">{formatNumber(row.varieties)}</td>
                </tr>
              ))}
            </tbody>
            {/* Totals Row */}
            <tfoot className="bg-[#98C1D9] text-white font-semibold">
              <tr>
                <td className="p-3">TOTALES</td>
                <td className="p-3 text-right">{formatPrice(totals.totalCharges)}</td>
                <td className="p-3 text-right">{formatNumber(totals.initialStock)}</td>
                <td className="p-3 text-right">{formatPrice(overallAvgCostPerBox)}</td>
                <td className="p-3 text-right">{formatNumber(totals.chargeBoxes)}</td>
                <td className="p-3 text-right">{formatPercentage(overallStockUtilization / 100)}</td>
                <td className="p-3 text-right">{formatNumber(totals.chargeLots)}</td>
                <td className="p-3 text-right">{formatNumber(totals.stockLots)}</td>
                <td className="p-3 text-right">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Analysis Notes */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-800 mb-2">📋 Notas del Análisis</h5>
        <ul className="text-blue-700 text-sm space-y-1">
          <li><strong>Total Cargos:</strong> Suma de todos los costos/cargos aplicados por exportador</li>
          <li><strong>Stock Inicial:</strong> Inventario inicial total en cajas por exportador</li>
          <li><strong>Costo/Caja:</strong> Costo promedio por caja basado en cargos aplicados</li>
          <li><strong>Utilización %:</strong> Porcentaje del stock inicial que ha sido procesado/tiene cargos</li>
          <li><strong>Lotes:</strong> Cantidad de lotes únicos con cargos vs. lotes con stock inicial</li>
        </ul>
      </div>
    </div>
  );
};

// Main Component - ALL HOOKS AT TOP LEVEL
const CostConsistencyReport = ({ onRefsUpdate }) => {
  // All hooks at the very top - never conditional, never in objects
  const [metrics, setMetrics] = useState({});
  const [chargeData, setChargeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for navigation - following Sales Detail Report structure
  const refs = {
    'KPIs': useRef(),
    'Initial Stock': useRef(),
    'Key Insights': useRef(),
    'Exporter Comparator': useRef(),
    'Outlier Analysis': useRef(),
    'Ocean Freight': useRef(),
    'Repacking': useRef(),
    'Internal Consistency': useRef(),
    'External Consistency': useRef(),
    'Final Tables': useRef(),
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('📊 Loading cost data...');
        
        const [metricsData, chargeDataCSV] = await Promise.all([
          calculateMetricsFromEmbedded(),
          getChargeDataFromEmbedded()
        ]);
        
        setMetrics(metricsData);
        setChargeData(chargeDataCSV);
        setLoading(false);
        
        console.log(`✅ Loaded ${Object.keys(metricsData).length} lots`);
      } catch (err) {
        console.error('❌ Error loading cost data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Pass refs to parent component
  useEffect(() => {
    if (onRefsUpdate) {
      onRefsUpdate(refs);
    }
  }, []);

  // Generate automated insights - always run, no conditional hooks
  const insights = useMemo(() => {
    const lotids = Object.values(metrics);
    const validCosts = lotids.filter(l => l.costPerBox !== null);
    
    if (validCosts.length === 0) return ['No valid cost data available for analysis.'];
    
    const exporterStats = {};
    validCosts.forEach(lotid => {
      if (!exporterStats[lotid.exporter]) {
        exporterStats[lotid.exporter] = { costs: [], total: 0 };
      }
      exporterStats[lotid.exporter].costs.push(lotid.costPerBox);
      exporterStats[lotid.exporter].total += lotid.totalChargeAmount;
    });
    
    const exporterAnalysis = Object.entries(exporterStats).map(([exporter, data]) => {
      const avg = data.costs.reduce((sum, cost) => sum + cost, 0) / data.costs.length;
      const variance = data.costs.reduce((sum, cost) => sum + Math.pow(cost - avg, 2), 0) / data.costs.length;
      const stdDev = Math.sqrt(variance);
      const cv = avg > 0 ? (stdDev / avg) : 0;
      
      return { exporter, avg, cv, total: data.total, lotCount: data.costs.length };
    });
    
    const overallAvg = validCosts.reduce((sum, l) => sum + l.costPerBox, 0) / validCosts.length;
    const highestCV = exporterAnalysis.reduce((max, exp) => exp.cv > max.cv ? exp : max);
    const lowestCV = exporterAnalysis.reduce((min, exp) => exp.cv < min.cv ? exp : min);
    const highestCost = exporterAnalysis.reduce((max, exp) => exp.avg > max.avg ? exp : max);
    const lowestCost = exporterAnalysis.reduce((min, exp) => exp.avg < min.avg ? exp : min);
    
    const insights = [
      `Analysis covers ${validCosts.length} lot IDs across ${exporterAnalysis.length} exporters with an overall average cost of ${formatPrice(overallAvg)} per box.`,
      `${highestCV.exporter} shows the highest cost variability (CV: ${formatPercentage(highestCV.cv)}), indicating potential inefficiencies in lot management that merit investigation.`,
      `${lowestCV.exporter} demonstrates the most consistent operations (CV: ${formatPercentage(lowestCV.cv)}), suggesting strong cost control processes.`,
      `${lowestCost.exporter} operates at the lowest average cost (${formatPrice(lowestCost.avg)}/box, ${formatPercentage((lowestCost.avg - overallAvg) / overallAvg)} below industry average), demonstrating superior cost efficiency.`,
      `${highestCost.exporter} has the highest average cost (${formatPrice(highestCost.avg)}/box, ${formatPercentage((highestCost.avg - overallAvg) / overallAvg)} above industry average), requiring cost structure review.`,
      `Cost optimization opportunities exist across ${exporterAnalysis.filter(e => e.cv > 0.3).length} exporters with high variability, potentially saving significant operational expenses.`,
      `The industry shows ${overallAvg > 15 ? 'premium' : overallAvg > 10 ? 'moderate' : 'competitive'} cost positioning with opportunities for strategic cost leadership initiatives.`
    ];
    
    return insights;
  }, [metrics]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6F4] w-full m-0 p-0">
        <div className="p-6 space-y-8 w-full max-w-none m-0">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-[#EE6C4D] mb-4">
              Cost Consistency Report
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE6C4D]"></div>
              <span className="text-lg text-gray-600">Loading cost data from CSV...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F6F4] w-full m-0 p-0">
        <div className="p-6 space-y-8 w-full max-w-none m-0">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-[#EE6C4D] mb-4">
              Cost Consistency Report
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800 font-semibold">❌ Error loading cost data</p>
              <p className="text-red-600 text-sm mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F6F4] w-full m-0 p-0">
        <div className="p-6 space-y-8 w-full max-w-none m-0">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-[#EE6C4D] mb-4">
              Cost Consistency Report
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800 font-semibold">⚠️ No cost data available</p>
              <p className="text-yellow-600 text-sm mt-2">Please check if the CSV file exists and contains valid data.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F4] w-full m-0 p-0">
      <div className="p-6 space-y-16 w-full max-w-none m-0">
        <h1 className="report-title">Cost Consistency Report</h1>
        
        {/* 1. KPIs */}
        <div ref={refs['KPIs']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">KPIs</h2>
          <p className="text-gray-600 mb-4 text-sm">Essential performance indicators providing a snapshot of overall cost efficiency and operational health.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Key Performance Indicators showing overall cost metrics, consistency scores, and efficiency statistics across all exporters and lot records.</p>
          <KPICards metrics={metrics} />
        </div>
        
        {/* 3. Key Insights */}
        <div ref={refs['Key Insights']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">Key Insights</h2>
          <p className="text-gray-600 mb-4 text-sm">Strategic insights and cost analysis derived from operational data patterns and business intelligence.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Automated cost insights highlighting efficiency leaders, variability analysis, optimization opportunities, and competitive positioning.</p>
          <KeyCostInsights insights={insights} />
        </div>
        
        {/* 4. Exporter Cost Comparator */}
        <div ref={refs['Exporter Comparator']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">Exporter Cost Comparator</h2>
          <p className="text-gray-600 mb-4 text-sm">Interactive comparison tool to analyze cost efficiency differences between exporters, focusing on average cost per box and operational consistency.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Comprehensive analysis comparing cost efficiency, consistency, and performance metrics across different exporters.</p>
          <ExporterCostComparator metrics={metrics} />
        </div>
        
        {/* 5. Outlier Analysis */}
        <div ref={refs['Outlier Analysis']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">Outlier Analysis</h2>
          <p className="text-gray-600 mb-4 text-sm">Statistical detection and analysis of cost outliers, identifying unusual patterns that may indicate errors or exceptional operational conditions.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Advanced statistical analysis to identify cost anomalies and outliers that require attention or investigation.</p>
          <OutlierAnalysis metrics={metrics} />
        </div>
        
        {/* 6. Ocean Freight Analysis */}
        <div ref={refs['Ocean Freight']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">Ocean Freight Analysis</h2>
          <p className="text-gray-600 mb-4 text-sm">Ocean freight cost analysis showing shipping efficiency and cost optimization opportunities across exporters.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Comprehensive analysis of shipping costs, freight efficiency, and logistics optimization opportunities.</p>
          <OceanFreightAnalysis />
        </div>

        {/* 7. Repacking Analysis */}
        <div ref={refs['Repacking']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">Repacking Analysis</h2>
          <p className="text-gray-600 mb-4 text-sm">Combined analysis of packing materials and repacking charges, identifying cost efficiency in packaging operations.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Detailed examination of packaging costs, material efficiency, and repacking optimization opportunities.</p>
          <RepackingAnalysis />
        </div>

        {/* 8. Internal Consistency Analysis */}
        <div ref={refs['Internal Consistency']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">Internal Consistency Analysis</h2>
          <p className="text-gray-600 mb-4 text-sm">Analysis of data consistency within individual records, identifying discrepancies and validation issues in internal calculations.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Internal data validation and consistency checks to ensure accurate cost calculations and reporting.</p>
          <InternalConsistencyAnalysis 
            metrics={metrics}
            chargeData={chargeData}
          />
        </div>

        {/* 9. External Consistency Analysis */}
        <div ref={refs['External Consistency']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">External Consistency Analysis</h2>
          <p className="text-gray-600 mb-4 text-sm">Cross-validation analysis comparing data patterns across different sources and entities to ensure external data integrity.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Cross-system validation and external data consistency checks to ensure alignment across different data sources.</p>
          <ExternalConsistencyAnalysis 
            metrics={metrics}
            chargeData={chargeData}
          />
        </div>

        {/* 10. Final Cost Analysis Tables */}
        <div ref={refs['Final Tables']}>
          <h2 className="text-2xl font-bold text-[#EE6C4D] mb-2">Final Cost Analysis Tables</h2>
          <p className="text-gray-600 mb-4 text-sm">Comprehensive cost breakdown tables by category and exporter, showing both total amounts and per-box averages for complete financial analysis.</p>
          <p className="text-gray-600 text-sm mb-6 italic">Final comprehensive tables providing detailed cost breakdowns and summary statistics for complete financial analysis.</p>
          <FinalCostAnalysisTables 
            metrics={metrics}
            chargeData={chargeData}
          />
        </div>



        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-16 pt-8 border-t border-gray-200">
          <p>Cost Consistency Report - Famus Analytics Platform</p>
          <p>Powered by React + Chart.js + Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

export default CostConsistencyReport;
