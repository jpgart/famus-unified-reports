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
        return 'w-full px-4 py-3 sm:px-5 sm:py-4 min-h-[100px] sm:min-h-[110px]';
      case 'large':
        return 'w-full px-5 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 min-h-[130px] sm:min-h-[140px] lg:min-h-[150px]';
      case 'normal':
      default:
        return 'w-full px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5 min-h-[120px] sm:min-h-[130px] lg:min-h-[140px]';
    }
  };

  const getValueSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-lg sm:text-xl lg:text-2xl';
      case 'large':
        return 'text-2xl sm:text-3xl lg:text-4xl';
      case 'normal':
      default:
        return 'text-xl sm:text-2xl lg:text-3xl';
    }
  };

  const getTitleSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-xs sm:text-sm lg:text-base';
      case 'large':
        return 'text-sm sm:text-base lg:text-lg';
      case 'normal':
      default:
        return 'text-xs sm:text-sm lg:text-base';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md ${getSizeClasses()} text-center hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col justify-center`}>
      <div className={`${getValueSizeClass()} font-bold text-famus-navy mb-2 leading-tight break-words`}>
        {formatValue()}
      </div>
      <div className={`${getTitleSizeClass()} text-famus-navy uppercase tracking-wide font-medium leading-tight break-words px-1`}>
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
