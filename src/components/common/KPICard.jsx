import React from 'react';
import { formatNumber, formatPercentage, formatCompactNumber, formatInteger, formatCurrency, formatTotalSales } from '../../utils/formatters';

const KPICard = ({ 
  title, 
  value, 
  type = 'number', 
  change = null, 
  changeType = 'percentage',
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  const formatValue = () => {
    switch (type) {
      case 'money':
        return formatNumber(value, true);
      case 'currency':
        return formatCurrency(value);
      case 'totalSales':
        return formatTotalSales(value);
      case 'integer':
        return formatInteger(value);
      case 'percentage':
        return formatPercentage(value);
      case 'compact':
        return formatCompactNumber(value);
      case 'text':
        return value;
      default:
        return formatNumber(value);
    }
  };

  const formatChange = () => {
    if (change === null || change === undefined) return null;
    
    const prefix = change > 0 ? '+' : '';
    const formattedChange = changeType === 'percentage' 
      ? formatPercentage(Math.abs(change))
      : formatNumber(Math.abs(change));
    
    return `${prefix}${formattedChange}`;
  };

  const getChangeColor = () => {
    if (change === null || change === undefined) return '';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-full px-3 py-2 sm:px-4 sm:py-3';
      case 'large':
        return 'w-full px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6';
      case 'normal':
      default:
        return 'w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4';
    }
  };

  const getValueSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-lg sm:text-xl';
      case 'large':
        return 'text-xl sm:text-2xl lg:text-3xl';
      case 'normal':
      default:
        return 'text-lg sm:text-xl lg:text-2xl';
    }
  };

  const getTitleSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-xs sm:text-sm';
      case 'large':
        return 'text-sm sm:text-base';
      case 'normal':
      default:
        return 'text-xs sm:text-sm';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${getSizeClasses()} text-center hover:shadow-lg transition-all duration-200 border border-gray-100`}>
      <div className={`${getValueSizeClass()} font-bold text-famus-navy mb-1 leading-tight`}>
        {formatValue()}
      </div>
      <div className={`${getTitleSizeClass()} text-famus-navy uppercase tracking-wide font-medium leading-tight`}>
        {title}
      </div>
      {change !== null && change !== undefined && (
        <div className={`text-xs mt-2 ${getChangeColor()} flex items-center justify-center font-medium`}>
          <span className="mr-1 text-sm">
            {change > 0 ? '↗' : '↘'}
          </span>
          {formatChange()}
        </div>
      )}
    </div>
  );
};

export default KPICard;
