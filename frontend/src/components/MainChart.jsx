import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

const MainChart = ({ chartData }) => {
  if (!chartData || !chartData.datasets) {
    return null;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: '#e0e0ff' } },
      title: { display: true, text: 'Price Chart', color: '#e0e0ff', font: { size: 18 } },
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // --- แก้ไขบรรทัดนี้ ---
              label += Number(context.parsed.y).toFixed(3);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: { ticks: { color: '#e0e0ff' }, grid: { color: 'var(--border-color)' } },
      y: { 
        ticks: { 
          color: '#e0e0ff',
          callback: function(value) {
            // --- แก้ไขบรรทัดนี้ ---
            return Number(value).toFixed(3);
          }
        }, 
        grid: { color: 'var(--border-color)' } 
      }
    }
  };

  return (
    <div style={{ height: '450px' }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default MainChart;