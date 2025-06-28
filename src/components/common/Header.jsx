import React from 'react';

const Header = () => {
  return (
    <header className="bg-famus-blue shadow-lg mt-16 py-4 sm:py-6 lg:py-8">{/* mt-16 para no quedar tapado por la navegación sticky, py aumentado para banda más ancha */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2 min-h-[80px] sm:min-h-[100px]">
          {/* Left: Famus HTML Report */}
          <div className="flex items-center flex-shrink-0 order-1 sm:order-1">
            <div className="flex-shrink-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-famus-navy text-center sm:text-left">
                <span className="hidden sm:inline">Famus HTML Report</span>
                <span className="inline sm:hidden">Famus Report</span>
              </h1>
            </div>
          </div>
          
          {/* Center: Logo */}
          <div className="flex items-center justify-center flex-shrink-0 order-2 sm:order-2">
            <img 
              src="./Header PP Logo.png" 
              alt="Famus Logo" 
              className="h-12 sm:h-14 lg:h-16 w-auto max-w-[150px] sm:max-w-[180px]"
              onError={(e) => {
                console.error('Header logo failed to load:', e.target.src);
                // Try alternative paths
                if (e.target.src.includes('./Header')) {
                  e.target.src = './public/Header PP Logo.png';
                } else if (e.target.src.includes('./public/Header')) {
                  e.target.src = 'Header PP Logo.png';
                } else {
                  e.target.style.display = 'none';
                }
              }}
            />
          </div>
          
          {/* Right: Season */}
          <div className="flex items-center flex-shrink-0 order-3 sm:order-3">
            <span className="text-sm sm:text-base lg:text-lg font-bold text-famus-navy text-center sm:text-right">
              <span className="hidden sm:inline">Season 2024-2025</span>
              <span className="inline sm:hidden">2024-25</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
