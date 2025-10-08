import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const IndicatorChart = ({ chartData, title }) => {
  if (!chartData || !chartData.datasets) {
    return null;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#e0e0ff' } },
      title: { display: true, text: title, color: '#e0e0ff', font: { size: 16 } },
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
      x: { ticks: { display: false }, grid: { color: 'var(--border-color)' } },
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

  const hasBarData = chartData.datasets.some(d => d.type === 'bar');

  return (
    <div style={{ height: '200px', marginTop: '1rem', width: '100%' }}>
      {hasBarData ? <Bar options={options} data={chartData} /> : <Line options={options} data={chartData} />}
    </div>
  );
};

export default IndicatorChart;