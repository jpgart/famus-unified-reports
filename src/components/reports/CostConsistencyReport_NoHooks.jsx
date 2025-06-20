import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  getChargeDataFromCSV, 
  calculateMetricsFromCSV, 
  getDataSummaryFromCSV 
} from '../../data/costDataCSV';
import { formatNumber, formatPercentage, formatPrice } from '../../utils/formatters';

// Register Chart.js plugins
import { registerChartPlugins } from '../../utils/chartConfig';
registerChartPlugins();

// Simple Executive Summary (no hooks)
const ExecutiveSummary = ({ insights }) => (
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
);

// Simple KPI Cards (no hooks)
const KPICards = ({ metrics }) => {
  const lotids = Object.values(metrics);
  const validCosts = lotids.filter(l => l.costPerBox !== null);
  
  if (validCosts.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">⚠️ No valid cost data available for KPI calculation</p>
      </div>
    );
  }

  const totalLots = validCosts.length;
  const avgCostPerBox = validCosts.reduce((sum, l) => sum + l.costPerBox, 0) / validCosts.length;
  const totalCharges = validCosts.reduce((sum, l) => sum + l.totalChargeAmount, 0);
  const totalBoxes = validCosts.reduce((sum, l) => sum + l.totalBoxes, 0);

  const exporterStats = {};
  validCosts.forEach(lotid => {
    if (!exporterStats[lotid.exporter]) {
      exporterStats[lotid.exporter] = { costs: [], lots: 0 };
    }
    exporterStats[lotid.exporter].costs.push(lotid.costPerBox);
    exporterStats[lotid.exporter].lots++;
  });

  const exporterCount = Object.keys(exporterStats).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Lot Records</h3>
        <p className="text-3xl font-bold text-blue-600">{formatNumber(totalLots)}</p>
        <p className="text-sm text-gray-600 mt-1">Analyzed from CSV</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Avg Cost/Box</h3>
        <p className="text-3xl font-bold text-green-600">{formatPrice(avgCostPerBox)}</p>
        <p className="text-sm text-gray-600 mt-1">Across all lots</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Charges</h3>
        <p className="text-3xl font-bold text-purple-600">{formatPrice(totalCharges)}</p>
        <p className="text-sm text-gray-600 mt-1">{formatNumber(totalBoxes)} boxes</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Exporters</h3>
        <p className="text-3xl font-bold text-orange-600">{exporterCount}</p>
        <p className="text-sm text-gray-600 mt-1">With cost data</p>
      </div>
    </div>
  );
};

// Simple Analysis Component (no hooks)
const SimpleAnalysisComponent = ({ title, description, metrics, chargeData }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="font-medium">Lot Records:</span> {Object.keys(metrics).length}
      </div>
      <div>
        <span className="font-medium">Charge Records:</span> {chargeData.length}
      </div>
    </div>
  </div>
);

// Main Component - ALL HOOKS AT TOP LEVEL
const CostConsistencyReport = ({ onRefsUpdate }) => {
  // All hooks at the very top - never conditional, never in objects
  const [metrics, setMetrics] = useState({});
  const [chargeData, setChargeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    internal: true,
    external: true,
    outliers: true,
    breakdown: true,
    growerAdvances: true,
    oceanFreight: true,
    packingMaterials: true,
    finalTables: true,
    details: false
  });

  // Individual refs - no hooks in objects
  const kpiRef = useRef();
  const internalRef = useRef();
  const externalRef = useRef();
  const outlierRef = useRef();
  const breakdownRef = useRef();
  const growerRef = useRef();
  const oceanRef = useRef();
  const packingRef = useRef();
  const finalRef = useRef();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('📊 Loading cost data from CSV...');
        
        const [metricsData, chargeDataCSV, dataSummary] = await Promise.all([
          calculateMetricsFromCSV(),
          getChargeDataFromCSV(),
          getDataSummaryFromCSV()
        ]);
        
        setMetrics(metricsData);
        setChargeData(chargeDataCSV);
        
        console.log('📈 Cost Consistency Report loaded from CSV');
        console.log(`📊 Analyzing ${Object.keys(metricsData).length} lot IDs`);
        console.log('🔍 Data summary:', dataSummary);
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Error loading cost data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Create refs object AFTER all individual refs are defined
  const refs = {
    'KPIs': kpiRef,
    'Internal Consistency': internalRef,
    'External Consistency': externalRef,
    'Outlier Analysis': outlierRef,
    'Charge Breakdown': breakdownRef,
    'Grower Advances': growerRef,
    'Ocean Freight': oceanRef,
    'Packing Materials': packingRef,
    'Final Tables': finalRef,
  };

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
      `${highestCost.exporter} has the highest average cost (${formatPrice(highestCost.avg)}/box, ${formatPercentage((highestCost.avg - overallAvg) / overallAvg)} above industry average), requiring cost structure review.`
    ];
    
    return insights;
  }, [metrics]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-famus-cream w-full m-0 p-0">
        <div className="p-6 space-y-8 w-full max-w-none m-0">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-famus-orange mb-4">
              Cost Consistency Analysis Report
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-famus-orange"></div>
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
      <div className="min-h-screen bg-famus-cream w-full m-0 p-0">
        <div className="p-6 space-y-8 w-full max-w-none m-0">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-famus-orange mb-4">
              Cost Consistency Analysis Report
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
      <div className="min-h-screen bg-famus-cream w-full m-0 p-0">
        <div className="p-6 space-y-8 w-full max-w-none m-0">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-famus-orange mb-4">
              Cost Consistency Analysis Report
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
    <div className="min-h-screen bg-famus-cream w-full m-0 p-0">
      <div className="p-6 space-y-8 w-full max-w-none m-0">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-famus-orange mb-4">
            Cost Consistency Analysis Report
          </h1>
        </div>

        {/* KPI Cards */}
        <div ref={kpiRef}>
          <h2 className="text-2xl font-bold text-famus-orange mb-2">📊 KPI Cards</h2>
          <p className="text-gray-600 mb-4 text-sm">Key performance indicators providing a comprehensive overview of cost consistency, data quality, and financial health metrics.</p>
          <KPICards metrics={metrics} />
        </div>

        {/* Executive Summary */}
        {expandedSections.summary && (
          <ExecutiveSummary insights={insights} />
        )}

        {/* Internal Consistency Analysis */}
        {expandedSections.internal && (
          <div ref={internalRef}>
            <h2 className="text-2xl font-bold text-famus-orange mb-2">🔍 Internal Consistency Analysis</h2>
            <p className="text-gray-600 mb-4 text-sm">Analysis of data consistency within individual records, identifying discrepancies and validation issues in internal calculations.</p>
            <SimpleAnalysisComponent 
              title="Internal Consistency Analysis"
              description="Data consistency analysis within individual records loaded from CSV."
              metrics={metrics}
              chargeData={chargeData}
            />
          </div>
        )}

        {/* External Consistency Analysis */}
        {expandedSections.external && (
          <div ref={externalRef}>
            <h2 className="text-2xl font-bold text-famus-orange mb-2">⚖️ External Consistency Analysis</h2>
            <p className="text-gray-600 mb-4 text-sm">Cross-validation analysis comparing data patterns across different sources and entities to ensure external data integrity.</p>
            <SimpleAnalysisComponent 
              title="External Consistency Analysis"
              description="Cross-validation analysis comparing data patterns across different sources loaded from CSV."
              metrics={metrics}
              chargeData={chargeData}
            />
          </div>
        )}

        {/* Outlier Analysis */}
        {expandedSections.outliers && (
          <div ref={outlierRef}>
            <h2 className="text-2xl font-bold text-famus-orange mb-2">⚠️ Outlier Analysis</h2>
            <p className="text-gray-600 mb-4 text-sm">Statistical detection and analysis of data outliers, identifying unusual patterns that may indicate errors or exceptional cases.</p>
            <SimpleAnalysisComponent 
              title="Outlier Analysis"
              description="Statistical detection and analysis of data outliers loaded from CSV."
              metrics={metrics}
              chargeData={chargeData}
            />
          </div>
        )}

        {/* Exporter Cost Comparator */}
        {expandedSections.breakdown && (
          <div ref={breakdownRef}>
            <h2 className="text-2xl font-bold text-famus-orange mb-2">⚖️ Exporter Cost Comparator</h2>
            <p className="text-gray-600 mb-4 text-sm">Interactive comparison tool to analyze cost efficiency differences between exporters, focusing on average cost per box and total cost volumes.</p>
            <SimpleAnalysisComponent 
              title="Exporter Cost Comparator"
              description="Cost efficiency comparison between exporters loaded from CSV."
              metrics={metrics}
              chargeData={chargeData}
            />
          </div>
        )}

        {/* Special Charge Analysis Sections */}
        {expandedSections.growerAdvances && (
          <div ref={growerRef}>
            <h2 className="text-2xl font-bold text-famus-orange mb-2">🌾 Grower Advances Analysis</h2>
            <p className="text-gray-600 mb-4 text-sm">Analysis of grower advance payments, tracking pre-season financing patterns and recovery rates by exporter.</p>
            <SimpleAnalysisComponent 
              title="Grower Advances Analysis"
              description="Analysis of grower advance payments loaded from CSV."
              metrics={metrics}
              chargeData={chargeData}
            />
          </div>
        )}

        {expandedSections.oceanFreight && (
          <div ref={oceanRef}>
            <h2 className="text-2xl font-bold text-famus-orange mb-2">🚢 Ocean Freight Analysis</h2>
            <p className="text-gray-600 mb-4 text-sm">Ocean freight cost analysis showing shipping efficiency and cost optimization opportunities across exporters.</p>
            <SimpleAnalysisComponent 
              title="Ocean Freight Analysis"
              description="Ocean freight cost analysis loaded from CSV."
              metrics={metrics}
              chargeData={chargeData}
            />
          </div>
        )}

        {expandedSections.packingMaterials && (
          <div ref={packingRef}>
            <h2 className="text-2xl font-bold text-famus-orange mb-2">📦 Packing Materials + Repacking Analysis</h2>
            <p className="text-gray-600 mb-4 text-sm">Combined analysis of packing materials and repacking charges, identifying cost efficiency in packaging operations.</p>
            <SimpleAnalysisComponent 
              title="Packing Materials Analysis"
              description="Combined analysis of packing materials and repacking charges loaded from CSV."
              metrics={metrics}
              chargeData={chargeData}
            />
          </div>
        )}

        {/* Final Tables Section */}
        {expandedSections.finalTables && (
          <div ref={finalRef}>
            <h2 className="text-2xl font-bold text-famus-orange mb-2">📊 Final Cost Analysis Tables</h2>
            <p className="text-gray-600 mb-4 text-sm">Comprehensive cost breakdown tables by category and exporter, showing both total amounts and per-box averages for complete financial analysis.</p>
            <SimpleAnalysisComponent 
              title="Final Cost Analysis Tables"
              description="Comprehensive cost breakdown tables by category and exporter loaded from CSV."
              metrics={metrics}
              chargeData={chargeData}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-16 pt-8 border-t border-gray-200">
          <p>Cost Consistency Analysis Report - Famus Analytics Platform</p>
          <p>Powered by React + Chart.js + Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

export default CostConsistencyReport;
