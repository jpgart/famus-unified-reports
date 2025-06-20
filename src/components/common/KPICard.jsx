import React from 'react';
import { formatNumber, formatPercentage, formatCompactNumber, formatInteger, formatCurrency, formatTotalSales } from '../../utils/formatters';

const KPICard = ({ 
  title, 
  value, 
  type = 'number', 
  change = null, 
  changeType = 'percentage',
  icon = null,
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
        return 'w-full px-4 py-3';
      case 'large':
        return 'w-full px-8 py-6';
      case 'normal':
      default:
        return 'w-full px-6 py-4';
    }
  };

  const getValueSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-xl';
      case 'large':
        return 'text-3xl';
      case 'normal':
      default:
        return 'text-2xl';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-md ${getSizeClasses()} text-center hover:scale-105 transition-transform duration-200 cursor-pointer`}>
      {icon && (
        <div className="text-2xl mb-2 opacity-75">
          {icon}
        </div>
      )}
      <div className={`${getValueSizeClass()} font-bold text-famus-navy mb-1`}>
        {formatValue()}
      </div>
      <div className="text-sm text-famus-navy uppercase tracking-wide font-medium">
        {title}
      </div>
      {change !== null && change !== undefined && (
        <div className={`text-xs mt-2 ${getChangeColor()} flex items-center justify-center`}>
          <span className="mr-1">
            {change > 0 ? '↗' : '↘'}
          </span>
          {formatChange()}
        </div>
      )}
    </div>
  );
};

export default KPICard;
