import React from 'react';

const Header = () => {
  return (
    <header className="bg-famus-blue shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Famus HTML Report */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-lg font-bold text-famus-navy">
                Famus HTML Report
              </h1>
            </div>
          </div>
          
          {/* Center: Logo */}
          <div className="flex items-center">
            <img 
              src="./Header PP Logo.png" 
              alt="Famus Logo" 
              className="h-10 w-auto"
              onError={(e) => {
                console.error('Header logo failed to load:', e.target.src);
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Right: Season */}
          <div className="flex items-center">
            <span className="text-lg font-bold text-famus-navy">
              Season 2024-2025
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
