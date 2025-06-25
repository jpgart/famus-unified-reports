import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Famus Unified Reports - Entry Point
// Updated: 2025-06-27
// Version: 3.0 - Production Ready with Enhanced Error Handling

// Performance monitoring
const startTime = performance.now();

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // In production, you might want to send this to an error reporting service
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the default browser behavior
});

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found. Make sure your HTML has a div with id="root"');
}

const root = createRoot(container);

// Enhanced error boundary for production
try {
  root.render(<App />);
  
  // Log successful render time for performance monitoring
  const renderTime = performance.now() - startTime;
  console.log(`App rendered successfully in ${renderTime.toFixed(2)}ms`);
  
} catch (error) {
  console.error('Failed to render app:', error);
  
  // Fallback UI for critical failures
  root.render(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Inter, sans-serif',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ color: '#EE6C4D', marginBottom: '1rem' }}>
        Famus Reports - Error de Carga
      </h1>
      <p style={{ color: '#3D5A80', marginBottom: '1rem' }}>
        Ha ocurrido un error al cargar la aplicación. Por favor, recarga la página.
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          backgroundColor: '#EE6C4D',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Recargar Página
      </button>
    </div>
  );
}
