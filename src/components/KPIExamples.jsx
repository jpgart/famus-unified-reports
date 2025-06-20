// Example usage of KPISection and KPICard components

import React from 'react';
import { KPISection } from '../components/common';

const KPIExamples = () => {
  // Example 1: Sales Dashboard with Bar Chart
  const salesKPIs = [
    { label: 'Total Revenue', value: 2485000, type: 'money', icon: '💰', size: 'normal' },
    { label: 'Units Sold', value: 15643, type: 'number', icon: '📦', size: 'normal' },
    { label: 'Growth Rate', value: 12.5, type: 'percentage', icon: '📈', size: 'normal' },
    { label: 'Avg Order Value', value: 158.75, type: 'money', icon: '🛒', size: 'normal' },
  ];

  const salesChart = {
    type: 'bar',
    title: 'Monthly Sales Performance',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Sales ($)',
        data: [320000, 380000, 420000, 385000, 450000, 480000],
        backgroundColor: '#3D5A80',
        borderColor: '#EE6C4D',
        borderWidth: 1,
      }]
    }
  };

  // Example 2: Inventory Dashboard with Line Chart
  const inventoryKPIs = [
    { label: 'Total Items', value: 5420, type: 'number', icon: '📋', size: 'small' },
    { label: 'Low Stock', value: 23, type: 'number', icon: '⚠️', size: 'small' },
    { label: 'Turnover Rate', value: 8.2, type: 'number', icon: '🔄', size: 'small' },
    { label: 'Stock Value', value: 1250000, type: 'money', icon: '💎', size: 'small' },
    { label: 'Avg Days', value: 45, type: 'number', icon: '📅', size: 'small' },
  ];

  const inventoryChart = {
    type: 'line',
    title: 'Inventory Levels Trend',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Stock Level',
        data: [5800, 5650, 5420, 5280],
        borderColor: '#EE6C4D',
        backgroundColor: 'rgba(238, 108, 77, 0.1)',
        tension: 0.4,
      }]
    }
  };

  // Example 3: Market Share with Pie Chart
  const marketKPIs = [
    { label: 'Market Share', value: 28.5, type: 'percentage', icon: '🥇', size: 'large' },
    { label: 'Competitors', value: 12, type: 'number', icon: '🏢', size: 'large' },
    { label: 'Market Size', value: 8500000, type: 'money', icon: '🌍', size: 'large' },
  ];

  const marketChart = {
    type: 'pie',
    title: 'Market Share Distribution',
    data: {
      labels: ['Our Company', 'Competitor A', 'Competitor B', 'Others'],
      datasets: [{
        data: [28.5, 22.1, 18.7, 30.7],
        backgroundColor: ['#3D5A80', '#EE6C4D', '#98C1D9', '#E0FBFC'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    }
  };

  // Example 4: Customer Analytics with Doughnut Chart
  const customerKPIs = [
    { label: 'Active Users', value: 24567, type: 'compact', icon: '👥' },
    { label: 'Retention Rate', value: 87.2, type: 'percentage', icon: '🔒' },
    { label: 'Satisfaction', value: 4.6, type: 'number', icon: '⭐' },
    { label: 'Churn Rate', value: -2.3, type: 'percentage', change: -0.5, icon: '📉' },
  ];

  const customerChart = {
    type: 'doughnut',
    title: 'Customer Segmentation',
    data: {
      labels: ['Premium', 'Standard', 'Basic', 'Trial'],
      datasets: [{
        data: [35, 40, 20, 5],
        backgroundColor: ['#3D5A80', '#EE6C4D', '#98C1D9', '#E0FBFC'],
        borderWidth: 0,
      }]
    },
    options: {
      cutout: '60%',
    }
  };

  return (
    <div className="space-y-12 py-8">
      <h1 className="text-4xl font-bold text-center text-famus-navy mb-12">
        KPI Dashboard Examples
      </h1>

      {/* Example 1: Sales Dashboard */}
      <KPISection
        title="Sales Performance Dashboard"
        titleColor="text-famus-orange"
        backgroundColor="bg-white"
        kpis={salesKPIs}
        chart={salesChart}
        showChart={true}
        containerClass="border border-gray-200 shadow-lg"
      />

      {/* Example 2: Inventory Dashboard */}
      <KPISection
        title="Inventory Management"
        titleColor="text-famus-blue"
        backgroundColor="bg-blue-50"
        kpis={inventoryKPIs}
        chart={inventoryChart}
        showChart={true}
        containerClass="border border-blue-200"
      />

      {/* Example 3: Market Share */}
      <KPISection
        title="Market Analysis"
        titleColor="text-famus-navy"
        backgroundColor="bg-gray-100"
        kpis={marketKPIs}
        chart={marketChart}
        showChart={true}
        containerClass="border border-gray-300"
      />

      {/* Example 4: Customer Analytics */}
      <KPISection
        title="Customer Analytics"
        titleColor="text-green-600"
        backgroundColor="bg-green-50"
        kpis={customerKPIs}
        chart={customerChart}
        showChart={true}
        containerClass="border border-green-200"
      />

      {/* Example 5: KPIs Only (No Chart) */}
      <KPISection
        title="Quick Metrics"
        titleColor="text-purple-600"
        backgroundColor="bg-purple-50"
        kpis={[
          { label: 'Orders Today', value: 156, type: 'number', icon: '📋', size: 'small' },
          { label: 'Revenue Today', value: 24780, type: 'money', icon: '💰', size: 'small' },
          { label: 'Conversion Rate', value: 3.2, type: 'percentage', icon: '🎯', size: 'small' },
          { label: 'Avg Response Time', value: 2.1, type: 'number', icon: '⚡', size: 'small' },
          { label: 'Support Tickets', value: 8, type: 'number', icon: '🎫', size: 'small' },
          { label: 'System Uptime', value: 99.9, type: 'percentage', icon: '🔧', size: 'small' },
        ]}
        chart={null}
        showChart={false}
        containerClass="border border-purple-200"
      />
    </div>
  );
};

export default KPIExamples;
