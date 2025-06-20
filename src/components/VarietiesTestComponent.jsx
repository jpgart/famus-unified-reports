import React, { useState, useEffect } from 'react';
import { getTopVarietiesByStockFromEmbedded, getInitialStockAnalysisFromEmbedded } from '../data/costDataEmbedded';
import { formatNumber, formatPercentage } from '../utils/formatters';

const VarietiesTestComponent = () => {
  const [varieties, setVarieties] = useState([]);
  const [stockAnalysis, setStockAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🧪 Test component loading data...');
        const [varietiesData, analysisData] = await Promise.all([
          getTopVarietiesByStockFromEmbedded(8),
          getInitialStockAnalysisFromEmbedded()
        ]);
        
        console.log('🧪 Test varieties:', varietiesData);
        console.log('🧪 Test analysis:', analysisData);
        
        setVarieties(varietiesData);
        setStockAnalysis(analysisData);
      } catch (err) {
        console.error('🧪 Test error:', err);
        setError(err.message);
      }
    };
    
    loadData();
  }, []);

  if (error) {
    return <div className="p-4 bg-red-100 text-red-800">Error: {error}</div>;
  }

  if (!varieties.length || !stockAnalysis) {
    return <div className="p-4 bg-gray-100">Loading test data...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🧪 Varieties Test Component</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Variety</th>
              <th className="px-4 py-2 text-center">Stock</th>
              <th className="px-4 py-2 text-center">Lots</th>
              <th className="px-4 py-2 text-center">Exporters</th>
              <th className="px-4 py-2 text-center">%</th>
            </tr>
          </thead>
          <tbody>
            {varieties.map((variety, index) => {
              const stockPercent = variety.totalStock / stockAnalysis.totalStock;
              return (
                <tr key={variety.variety} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{variety.variety}</td>
                  <td className="px-4 py-2 text-center">{formatNumber(Math.round(variety.totalStock))}</td>
                  <td className="px-4 py-2 text-center">{formatNumber(variety.lots)}</td>
                  <td className="px-4 py-2 text-center">{formatNumber(variety.exporterCount || 0)}</td>
                  <td className="px-4 py-2 text-center">{formatPercentage(stockPercent)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VarietiesTestComponent;
