import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Debug version - minimal app to test what's working
function DebugApp() {
  console.log('DebugApp rendering...');
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9F6F4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#EE6C4D', marginBottom: '1rem' }}>
          🎯 Famus Reports Debug
        </h1>
        <p style={{ color: '#3D5A80', marginBottom: '1rem' }}>
          Si ves este mensaje, React está funcionando correctamente.
        </p>
        <div style={{
          backgroundColor: '#98C1D9',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          display: 'inline-block'
        }}>
          Debug Version - {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

console.log('Starting debug app...');

const container = document.getElementById('root');

if (!container) {
  console.error('Root container not found!');
} else {
  console.log('Root container found, creating React app...');
  
  try {
    const root = createRoot(container);
    root.render(<DebugApp />);
    console.log('Debug app rendered successfully!');
  } catch (error) {
    console.error('Failed to render debug app:', error);
  }
}
