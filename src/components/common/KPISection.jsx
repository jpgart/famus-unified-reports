import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import KPICard from './KPICard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const KPISection = ({ 
  title = "Dashboard Overview",
  subtitle = null,
  titleColor = "text-famus-orange",
  backgroundColor = "bg-gray-50",
  kpis = [],
  chart = null,
  showChart = true,
  containerClass = ""
}) => {
  // Function to calculate optimal grid layout based on KPI count
  const getGridClasses = (count) => {
    if (count === 1) {
      return 'grid-cols-1 max-w-md mx-auto';
    } else if (count === 2) {
      return 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto';
    } else if (count === 3) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto';
    } else if (count === 4) {
      // 4 KPIs: 2 rows of 2 each - optimal distribution
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto';
    } else if (count === 5) {
      // 5 KPIs: 2 rows (3+2) - first row 3, second row 2
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    } else if (count === 6) {
      // 6 KPIs: 2 rows of 3 each - perfect distribution
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    } else if (count === 7) {
      // 7 KPIs: 3 rows (3+3+1) - 3 cols max
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    } else if (count === 8) {
      // 8 KPIs: 3 rows (3+3+2) - 3 cols max
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    } else if (count === 9) {
      // 9 KPIs: 3 rows of 3 each - perfect 3 cols
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    } else {
      // More than 9: Always 3 cols max, multiple rows
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    }
  };
  const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: {
          color: '#3D5A80',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: !!chart?.title,
        text: chart?.title || '',
        color: '#3D5A80',
        font: {
          size: 18,
          weight: 'bold'
        },
      },
      tooltip: {
        backgroundColor: '#3D5A80',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#EE6C4D',
        borderWidth: 1,
      },
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: {
          pinch: { enabled: true },
          wheel: { enabled: true },
          mode: 'x',
        },
      },
    },
    scales: chart?.type !== 'pie' && chart?.type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#3D5A80',
          font: {
            size: 11
          }
        },
        grid: {
          color: '#e2e8f0'
        }
      },
      x: {
        ticks: {
          color: '#3D5A80',
          font: {
            size: 11
          }
        },
        grid: {
          color: '#e2e8f0'
        }
      },
    } : undefined,
  };

  const getChartComponent = () => {
    if (!chart) return null;

    const chartOptions = {
      ...defaultChartOptions,
      ...chart.options
    };

    switch (chart.type) {
      case 'bar':
        return <Bar data={chart.data} options={chartOptions} />;
      case 'line':
        return <Line data={chart.data} options={chartOptions} />;
      case 'pie':
        return <Pie data={chart.data} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chart.data} options={chartOptions} />;
      default:
        return <Bar data={chart.data} options={chartOptions} />;
    }
  };

  return (
    <section className={`${backgroundColor} py-6 sm:py-8 px-2 sm:px-4 lg:px-6 ${containerClass}`}>
      {/* Title */}
      <h2 className={`text-2xl sm:text-3xl font-bold ${titleColor} text-center mb-2`}>
        {title}
      </h2>
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-center text-gray-600 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          {subtitle}
        </p>
      )}

      {/* KPI Cards */}
      {kpis.length > 0 && (
        <div className="w-full max-w-7xl mx-auto mb-8 px-2 sm:px-4">
          {/* Grid with optimal distribution - maximum 3 columns */}
          <div className={`grid gap-4 md:gap-6 mb-6 ${getGridClasses(kpis.length)}`}>
            {kpis.map((kpi, idx) => (
              <KPICard
                key={idx}
                title={kpi.label || kpi.title}
                value={kpi.value}
                type={kpi.type || 'number'}
                change={kpi.change}
                changeType={kpi.changeType}
                size={kpi.size || 'normal'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Chart Section */}
      {showChart && chart && (
        <div className="w-full mt-12">
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] max-w-screen-lg mx-auto bg-white rounded-2xl shadow-md p-6">
            {getChartComponent()}
          </div>
        </div>
      )}
    </section>
  );
};

export default KPISection;
