import React from 'react';

const FilterDropdown = ({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder = "Select...",
  className = "" 
}) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-famus-navy">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-famus-orange focus:border-famus-orange text-sm bg-white text-famus-navy"
      >
        <option value="All">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
