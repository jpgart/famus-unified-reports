import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Famus Unified Reports - Entry Point
// Updated: 2025-07-02 - FINAL PRODUCTION VERSION
// Version: 3.0.0-FINAL-PRODUCTION - Cost Consistency Report completed

console.log('🚀 Famus Reports v3.0.0-FINAL-PRODUCTION starting...');
console.log('📊 Cost Consistency Report - All features implemented');
console.log('✅ ISO 5725 standards applied, formatters updated, all lots detected');

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found. Make sure your HTML has a div with id="root"');
}

try {
  const root = createRoot(container);
  root.render(<App />);
  console.log('✅ Famus Reports loaded successfully');
} catch (error) {
  console.error('❌ Failed to render app:', error);
  
  // Fallback UI for critical failures
  container.innerHTML = `
    <div style="min-height: 100vh; background-color: #F9F6F4; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; padding: 2rem; text-align: center;">
      <div>
        <h1 style="color: #EE6C4D; margin-bottom: 1rem; font-size: 2rem;">
          Famus Reports - Error de Carga
        </h1>
        <p style="color: #3D5A80; margin-bottom: 1rem;">
          Ha ocurrido un error al cargar la aplicación. Por favor, recarga la página.
        </p>
        <button 
          onclick="window.location.reload()"
          style="background-color: #EE6C4D; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
          Recargar Página
        </button>
      </div>
    </div>
  `;
}
