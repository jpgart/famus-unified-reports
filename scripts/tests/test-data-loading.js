// Test simple para verificar la carga de datos
const testCostConsistencyData = async () => {
  try {
    console.log('🧪 Testing Cost Consistency Data Loading...');
    
    // Test CSV loading
    const response = await fetch('/data/Charge Summary New.csv');
    const csvText = await response.text();
    console.log('✅ CSV loaded successfully, size:', csvText.length);
    
    // Test stock data
    const stockResponse = await fetch('/data/Initial_Stock_All.csv');
    const stockText = await stockResponse.text();
    console.log('✅ Stock CSV loaded successfully, size:', stockText.length);
    
    // Parse first few lines to check format
    const lines = csvText.split('\n').slice(0, 3);
    console.log('📊 CSV Sample:', lines);
    
    const stockLines = stockText.split('\n').slice(0, 3);
    console.log('📦 Stock Sample:', stockLines);
    
    console.log('🎉 All data tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run test when page loads
if (window.location.hostname === 'localhost') {
  setTimeout(testCostConsistencyData, 2000);
}
