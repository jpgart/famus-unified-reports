import React, { useState, useEffect } from 'react';
import { 
  embeddedCostData, 
  embeddedStockData, 
  calculateMetricsFromEmbedded 
} from '../data/costDataEmbedded';

const DataTest = () => {
  const [testResults, setTestResults] = useState({
    costData: null,
    stockData: null,
    metrics: null,
    error: null
  });

  useEffect(() => {
    const testData = async () => {
      try {
        console.log('🔍 Testing embedded data in React component...');
        
        // Test basic data access
        const costCount = embeddedCostData?.length || 0;
        const stockCount = embeddedStockData?.length || 0;
        
        console.log('📊 Cost data records:', costCount);
        console.log('📦 Stock data records:', stockCount);
        
        // Test metrics calculation
        const metrics = await calculateMetricsFromEmbedded();
        const metricsCount = Object.keys(metrics).length;
        
        console.log('📈 Calculated metrics for', metricsCount, 'lots');
        
        setTestResults({
          costData: costCount,
          stockData: stockCount,
          metrics: metricsCount,
          error: null
        });
        
      } catch (error) {
        console.error('❌ Error in data test:', error);
        setTestResults(prev => ({
          ...prev,
          error: error.message
        }));
      }
    };
    
    testData();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px', borderRadius: '8px' }}>
      <h3>🔍 Data Test Results</h3>
      
      {testResults.error ? (
        <div style={{ color: 'red', fontWeight: 'bold' }}>
          ❌ Error: {testResults.error}
        </div>
      ) : (
        <div>
          <p>📊 Cost Data Records: <strong>{testResults.costData || 'Loading...'}</strong></p>
          <p>📦 Stock Data Records: <strong>{testResults.stockData || 'Loading...'}</strong></p>
          <p>📈 Calculated Metrics: <strong>{testResults.metrics || 'Loading...'}</strong></p>
          
          {testResults.costData > 0 && testResults.stockData > 0 && testResults.metrics > 0 && (
            <p style={{ color: 'green', fontWeight: 'bold' }}>
              ✅ All data is loading correctly!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTest;
