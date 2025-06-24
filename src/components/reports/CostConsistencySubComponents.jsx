import React, { useState, useMemo, useEffect } from 'react';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { 
  analyzeSpecificChargeFromCSV 
} from '../../data/costDataCSV';
import { formatNumber, formatPercentage, formatPrice, isPriceField, formatTotalSales } from '../../utils/formatters';
import { getDefaultChartOptions, FAMUS_COLORS, CHART_COLORS } from '../../utils/chartConfig';
import { KPISection } from '../common';
import { filterExportersList } from '../../utils/dataFiltering';

// Helper functions for specific charge analysis
const analyzeSpecificCharge = async (chargeType, displayName) => {
  return await analyzeSpecificChargeFromCSV(chargeType, displayName);
};

// Executive Summary Component
export const ExecutiveSummary = React.memo(({ insights }) => (
  <div className="executive-summary mb-8 p-6 rounded-lg">
    <h2 className="text-3xl font-bold mb-6 text-[#3D5A80]">📊 Executive Summary</h2>
    <div className="text-lg leading-relaxed space-y-4">
      <p className="text-xl font-semibold mb-4 text-[#3D5A80]">Key Findings:</p>
      <ul className="list-disc list-inside space-y-2">
        {insights.map((insight, index) => (
          <li key={index} className="text-sm text-gray-600">{insight}</li>
        ))}
      </ul>
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> For cost comparison purposes, Commissions and Grower Advances have been excluded from the main cost calculations as they represent different operational categories. These charges are analyzed separately in dedicated sections below.
        </p>
      </div>
    </div>
  </div>
));

// KPI Cards Component - Using same standard as Sales Detail Report
export const KPICards = React.memo(({ metrics }) => {
  const [selectedExporter, setSelectedExporter] = useState('All');
  
  // Get unique exporters for filter (exclude Videxport)
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
    
    if (filteredLotids.length === 0) {
      return {
        totalLots: 0,
        totalCharges: 0,
        avgCostPerBox: 0,
        consistencyScore: 0,
        dataQuality: 0,
        totalBoxes: 0,
        exporterCount: 0,
        chargeTypeCount: 0
      };
    }

    // Calculate metrics
    const validCosts = filteredLotids.filter(l => l.costPerBox !== null && l.costPerBox > 0);
    const totalLots = filteredLotids.length;
    const totalCharges = filteredLotids.reduce((sum, l) => sum + l.totalChargeAmount, 0);
    const totalBoxes = filteredLotids.reduce((sum, l) => sum + (l.totalBoxes || 0), 0);
    const avgCostPerBox = validCosts.length > 0 
      ? validCosts.reduce((sum, l) => sum + l.costPerBox, 0) / validCosts.length 
      : 0;
    
    // Consistency Score (coefficient of variation inverted - lower CV means higher consistency)
    const costs = validCosts.map(l => l.costPerBox);
    const costMean = costs.reduce((sum, c) => sum + c, 0) / costs.length;
    const costVariance = costs.reduce((sum, c) => sum + Math.pow(c - costMean, 2), 0) / costs.length;
    const costStdDev = Math.sqrt(costVariance);
    const coefficientOfVariation = costMean > 0 ? costStdDev / costMean : 0;
    const consistencyScore = Math.max(0, 100 - (coefficientOfVariation * 100));
    
    // Data Quality Score (percentage of records with valid cost data)
    const dataQuality = totalLots > 0 ? (validCosts.length / totalLots) * 100 : 0;
    
    // Unique counts
    const exporterCount = [...new Set(filteredLotids.map(l => l.exporter))].length;
    const chargeTypeCount = [...new Set(filteredLotids.flatMap(l => 
      Object.keys(l.charges || {})
    ))].length;

    return {
      totalLots,
      totalCharges,
      avgCostPerBox,
      consistencyScore,
      dataQuality,
      totalBoxes,
      exporterCount,
      chargeTypeCount
    };
  }, [metrics, selectedExporter]);

  const kpiCards = [
    {
      title: "Total Lot IDs",
      value: formatNumber(kpiData.totalLots),
      icon: "📦",
      color: "bg-blue-500",
      description: `Analyzing ${kpiData.totalLots} unique lot records`
    },
    {
      title: "Total Charges",
      value: formatPrice(kpiData.totalCharges),
      icon: "💰",
      color: "bg-green-500",
      description: "Sum of all charge amounts across lots"
    },
    {
      title: "Average Cost/Box",
      value: formatPrice(kpiData.avgCostPerBox),
      icon: "📊",
      color: "bg-purple-500",
      description: "Mean cost per box across all valid records"
    },
    {
      title: "Consistency Score",
      value: `${formatNumber(kpiData.consistencyScore)}%`,
      icon: "🎯",
      color: kpiData.consistencyScore >= 80 ? "bg-green-500" : 
             kpiData.consistencyScore >= 60 ? "bg-yellow-500" : "bg-red-500",
      description: "Cost consistency rating (higher is better)"
    },
    {
      title: "Data Quality",
      value: `${formatNumber(kpiData.dataQuality)}%`,
      icon: "✅",
      color: kpiData.dataQuality >= 90 ? "bg-green-500" : 
             kpiData.dataQuality >= 70 ? "bg-yellow-500" : "bg-red-500",
      description: "Percentage of records with valid cost data"
    },
    {
      title: "Total Boxes",
      value: formatNumber(kpiData.totalBoxes),
      icon: "📋",
      color: "bg-indigo-500",
      description: "Total box count across all lots"
    },
    {
      title: "Exporters",
      value: formatNumber(kpiData.exporterCount),
      icon: "🏢",
      color: "bg-orange-500",
      description: "Number of unique exporters"
    },
    {
      title: "Charge Types",
      value: formatNumber(kpiData.chargeTypeCount),
      icon: "🏷️",
      color: "bg-pink-500",
      description: "Number of different charge categories"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Exporter Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <label className="text-sm font-medium text-gray-700">Filter by Exporter:</label>
        <select 
          value={selectedExporter}
          onChange={(e) => setSelectedExporter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {exporters.map(exporter => (
            <option key={exporter} value={exporter}>{exporter}</option>
          ))}
        </select>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-l-famus-orange">
            <div className="flex items-center justify-between mb-3">
              <div className={`${kpi.color} text-white p-3 rounded-full text-xl`}>
                {kpi.icon}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{kpi.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            <p className="text-xs text-gray-600 mt-2">{kpi.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

// Export the helper function too
export { analyzeSpecificCharge };
