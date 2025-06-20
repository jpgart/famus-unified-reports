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
  titleColor = "text-famus-orange",
  backgroundColor = "bg-gray-50",
  kpis = [],
  chart = null,
  showChart = true,
  containerClass = ""
}) => {
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
    <section className={`${backgroundColor} py-8 px-4 ${containerClass}`}>
      {/* Title */}
      <h2 className={`text-3xl font-bold ${titleColor} text-center mb-8`}>
        {title}
      </h2>

      {/* KPI Cards */}
      {kpis.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-3 gap-6 mb-6">
            {kpis.slice(0, 3).map((kpi, idx) => (
              <KPICard
                key={idx}
                title={kpi.label || kpi.title}
                value={kpi.value}
                type={kpi.type || 'number'}
                change={kpi.change}
                changeType={kpi.changeType}
                icon={kpi.icon}
                size={kpi.size || 'normal'}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {kpis.slice(3, 6).map((kpi, idx) => (
              <KPICard
                key={idx + 3}
                title={kpi.label || kpi.title}
                value={kpi.value}
                type={kpi.type || 'number'}
                change={kpi.change}
                changeType={kpi.changeType}
                icon={kpi.icon}
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
