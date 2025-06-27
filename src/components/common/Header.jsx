import React from 'react';

const Header = () => {
  return (
    <header className="bg-famus-blue shadow-lg mt-16 py-3 sm:py-4 lg:py-5">{/* mt-16 para no quedar tapado por la navegación sticky, py para banda más ancha */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Famus HTML Report */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <div className="flex-shrink-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-famus-navy whitespace-nowrap">
                <span className="hidden sm:inline">Famus HTML Report</span>
                <span className="inline sm:hidden">Famus Report</span>
              </h1>
            </div>
          </div>
          
          {/* Center: Logo */}
          <div className="flex items-center justify-center flex-shrink-0 mx-2 sm:mx-4">
            <img 
              src="/Header PP Logo.png" 
              alt="Famus Logo" 
              className="h-8 sm:h-10 lg:h-12 w-auto max-w-[120px] sm:max-w-none"
              onError={(e) => {
                console.error('Header logo failed to load:', e.target.src);
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Right: Season */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <span className="text-sm sm:text-base lg:text-lg font-bold text-famus-navy whitespace-nowrap">
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
