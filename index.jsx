import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// DEBUGGING: Log immediately when script starts
console.log('🚀 INDEX.JSX: Script started - ', new Date().toISOString());

// Immediately show debug info in DOM
const container = document.getElementById('root');
if (container) {
  console.log('✅ ROOT: Container found');
  
  // Immediately replace loading message with debug info
  container.innerHTML = `
    <div style="min-height: 100vh; background-color: #F9F6F4; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; padding: 20px; text-align: center;">
      <div>
        <h1 style="color: #EE6C4D; margin-bottom: 1rem; font-size: 2rem;">⚡ Script Loaded!</h1>
        <p style="color: #3D5A80; margin-bottom: 1rem; font-size: 1.2rem;">JavaScript se está ejecutando correctamente</p>
        <p style="color: #64748B; font-size: 1rem;">Timestamp: ${new Date().toLocaleTimeString()}</p>
        <div style="background-color: #98C1D9; color: white; padding: 15px; border-radius: 8px; margin-top: 20px; display: inline-block;">
          Preparando React...
        </div>
      </div>
    </div>
  `;
  
  // Give immediate visual feedback, then try React
  setTimeout(() => {
    try {
      console.log('🔧 REACT: Creating root...');
      const root = createRoot(container);
      
      console.log('🎨 REACT: Rendering App...');
      root.render(<App />);
      
      console.log('🎉 REACT: App rendered successfully!');
    } catch (error) {
      console.error('💥 REACT: Failed to render:', error);
      
      container.innerHTML = `
        <div style="min-height: 100vh; background-color: #F9F6F4; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; padding: 20px; text-align: center;">
          <div>
            <h1 style="color: #F44336; margin-bottom: 1rem; font-size: 2rem;">❌ Error React</h1>
            <p style="color: #3D5A80; margin-bottom: 1rem; font-size: 1.2rem;">Error al cargar React: ${error.message}</p>
            <p style="color: #64748B; font-size: 1rem;">Ver consola para más detalles</p>
          </div>
        </div>
      `;
    }
  }, 100);
  
} else {
  console.error('❌ ROOT: Container not found!');
}
