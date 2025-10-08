import { useState } from 'react';
import axios from 'axios';
import MainChart from './components/MainChart';
import IndicatorChart from './components/IndicatorChart';
import './App.css';

const INDICATORS = [
  { id: 'ema', name: 'EMA (20)' },
  { id: 'bb', name: 'Bollinger Bands' },
  { id: 'macd', name: 'MACD' },
  { id: 'rsi', name: 'RSI (14)' },
  { id: 'stoch', name: 'Stochastic' },
];

function App() {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState({
    ema: false, macd: false, rsi: false, bb: false, stoch: false,
  });

  // --- 1. แก้ไข Logic การทำงานให้อัตโนมัติ ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processData(file); // << เรียก processData ทันทีที่เลือกไฟล์
    }
  };

  const processData = async (fileToProcess) => {
    if (!fileToProcess) return;
    setIsLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', fileToProcess);

    try {
      const response = await axios.post('http://localhost:3001/api/upload', formData);
      setChartData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndicatorToggle = (indicatorId) => setActiveIndicators(prev => ({ ...prev, [indicatorId]: !prev[indicatorId] }));

  // --- 2. อัปเดตสีในฟังก์ชันเตรียมข้อมูลกราฟ (ใช้ธีมสีก่อนหน้า) ---
  const getMainChartData = () => {
    if (!chartData) return null;
    let datasets = [{
      label: 'Price', data: chartData.prices, borderColor: '#72ddf7', borderWidth: 2, pointRadius: 0
    }];
    if (activeIndicators.ema) {
      datasets.push({
        label: 'EMA (20)', data: chartData.indicators.ema20, borderColor: '#f7aef8', borderWidth: 1.5, pointRadius: 0
      });
    }
    if (activeIndicators.bb) {
      const { bb } = chartData.indicators;
      datasets.push(
        { label: 'BB Upper', data: bb.map(d => d.upper), borderColor: '#fdc5f5', borderWidth: 1, pointRadius: 0 },
        { label: 'BB Middle', data: bb.map(d => d.middle), borderColor: '#f7aef8', borderWidth: 1.5, pointRadius: 0, borderDash: [5, 5] },
        { label: 'BB Lower', data: bb.map(d => d.lower), borderColor: '#fdc5f5', borderWidth: 1, pointRadius: 0, fill: '-1', backgroundColor: '#fdc5f51a' }
      );
    }
    return { labels: chartData.labels, datasets };
  };

  const getMacdData = () => {
    if (!chartData) return null;
    const { macd } = chartData.indicators;
    return {
      labels: chartData.labels.slice(25),
      datasets: [
        { type: 'bar', label: 'Histogram', data: macd.map(d => d.histogram), backgroundColor: (ctx) => (ctx.raw >= 0 ? '#72ddf780' : '#f7aef880') },
        { type: 'line', label: 'MACD', data: macd.map(d => d.MACD), borderColor: '#8093f1', borderWidth: 1.5, pointRadius: 0 },
        { type: 'line', label: 'Signal', data: macd.map(d => d.signal), borderColor: '#f7aef8', borderWidth: 1.5, pointRadius: 0 }
      ]
    };
  };
  
  const getRsiData = () => {
    if (!chartData) return null;
    return {
      labels: chartData.labels.slice(13),
      datasets: [{ label: 'RSI (14)', data: chartData.indicators.rsi14, borderColor: '#b388eb', borderWidth: 1.5, pointRadius: 0 }]
    };
  };

  const getStochasticData = () => {
    if (!chartData) return null;
    const { stochastic } = chartData.indicators;
    return {
      labels: chartData.labels.slice(13),
      datasets: [
        { label: '%K', data: stochastic.map(d => d.k), borderColor: '#8093f1', borderWidth: 1.5, pointRadius: 0 },
        { label: '%D', data: stochastic.map(d => d.d), borderColor: '#f7aef8', borderWidth: 1.5, pointRadius: 0, borderDash: [5, 5] }
      ]
    };
  };

  return (
    // --- 3. เพิ่ม class แบบมีเงื่อนไขและเปลี่ยนรูปแบบปุ่ม ---
    <div className={chartData ? "container loaded" : "container initial"}>
      <header className="header">
        <h1>Pro Chart Visualizer</h1>
        <div className="upload-area">
          <label htmlFor="file-upload" className="file-input-label">
            {isLoading ? 'Loading...' : 'Select Chart File'}
          </label>
          <input id="file-upload" type="file" onChange={handleFileChange} disabled={isLoading} />
        </div>
        {error && <p style={{color: '#ef5350'}}>{error}</p>}
      </header>

      {chartData && (
        <>
          <div className="controls">
            {INDICATORS.map(ind => (
              <div key={ind.id} className="control-toggle">
                <input type="checkbox" id={ind.id} checked={activeIndicators[ind.id]} onChange={() => handleIndicatorToggle(ind.id)} />
                <label htmlFor={ind.id}>{ind.name}</label>
              </div>
            ))}
          </div>
          <div className="chart-area">
            <MainChart chartData={getMainChartData()} />
            {activeIndicators.macd && <IndicatorChart chartData={getMacdData()} title="MACD" />}
            {activeIndicators.rsi && <IndicatorChart chartData={getRsiData()} title="RSI" />}
            {activeIndicators.stoch && <IndicatorChart chartData={getStochasticData()} title="Stochastic (14, 3)" />}
          </div>
        </>
      )}
    </div>
  );
}

export default App;