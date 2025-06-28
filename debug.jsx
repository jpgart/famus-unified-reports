import React from 'react';
import { createRoot } from 'react-dom/client';

// Ultra-minimal debug version
console.log('🚀 Debug script started');

function DebugApp() {
  console.log('✅ DebugApp component rendering...');
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      backgroundColor: '#F9F6F4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }
  }, [
    React.createElement('div', { key: 'container' }, [
      React.createElement('h1', { 
        key: 'title',
        style: { color: '#EE6C4D', marginBottom: '1rem', fontSize: '2rem' }
      }, '🎯 Famus Debug v2'),
      React.createElement('p', { 
        key: 'status',
        style: { color: '#3D5A80', marginBottom: '1rem', fontSize: '1.2rem' }
      }, '✅ React está funcionando!'),
      React.createElement('p', { 
        key: 'time',
        style: { color: '#64748B', fontSize: '1rem' }
      }, `Hora: ${new Date().toLocaleTimeString()}`),
      React.createElement('div', { 
        key: 'box',
        style: {
          backgroundColor: '#98C1D9',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px',
          display: 'inline-block'
        }
      }, 'GitHub Pages funciona correctamente')
    ])
  ]);
}

console.log('🔍 Looking for root container...');

const container = document.getElementById('root');

if (!container) {
  console.error('❌ Root container not found!');
} else {
  console.log('✅ Root container found');
  
  try {
    console.log('🔧 Creating React root...');
    const root = createRoot(container);
    
    console.log('🎨 Rendering debug app...');
    root.render(React.createElement(DebugApp));
    
    console.log('🎉 Debug app rendered successfully!');
    
    // Clear the loading message after successful render
    setTimeout(() => {
      console.log('🧹 Render complete - everything working!');
    }, 100);
    
  } catch (error) {
    console.error('💥 Failed to render debug app:', error);
  }
}
