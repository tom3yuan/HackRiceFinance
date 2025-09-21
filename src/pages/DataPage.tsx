import React, { useState, useEffect, useRef } from 'react';
import './DataPage.css';
import Chart from 'chart.js/auto';
import HomePage from "./HomePage"; // Import HomePage for toggling

interface DataPageProps {
  onSwitchToPDF: () => void;
  companyCode?: string; // optional company code passed from parent
}

interface DataPoint {
  timestamp: number;
  price: number | null;
}

function DataPage({ onSwitchToPDF, companyCode }: DataPageProps) {
  const [message, setMessage] = useState<string>('');
  const [showHomePage, setShowHomePage] = useState<boolean>(false);
  const chartRef = useRef<Chart | null>(null); // ✅ useRef instead of useState

  // Helper to sanitize a potential ticker symbol
  const sanitizeTicker = (raw?: string | null): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    const upper = raw.toUpperCase();

    // Immediately reject obvious placeholders
    if (upper.includes('N/A') || upper === 'NA' || upper === 'N') return null;

    // Find candidate tokens that look like tickers: 1-6 uppercase letters, optional .SUFFIX (1-3)
    const tokens = upper.match(/\b[A-Z]{1,6}(?:\.[A-Z]{1,3})?\b/g);
    if (!tokens) return null;

    const blacklist = new Set([
      'THE','AND','COMPANY','CORP','INC','LIMITED','LTD','PLC','ABSTRACT','PAGE','USD','US','NYSE','NASDAQ','LLC','SA','AG','BV','CO','CO.','FOR','OF','A','AN','IN','ON','BY','WITH'
    ]);

    // Filter out common words and keep plausible tokens
    const candidates = tokens.filter(tok => !blacklist.has(tok));
    if (!candidates.length) return null;

    // Heuristic: prefer the first plausible token (e.g., 'NVDA' from 'NVDA FOR ABSTRACT')
    return candidates[0];
  };

  // Fallback to localStorage if prop not provided
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('parsedData') || '{}'); } catch { return {}; }
  })();
  const effectiveCode = sanitizeTicker(companyCode ?? stored?.Company_Info?.Company_Code ?? null);

  useEffect(() => {
    if (effectiveCode) {
      // Optional: small debug to aid troubleshooting during development
      console.debug('Using ticker for visualization:', effectiveCode);
      fetchStockData(effectiveCode);
    } else {
      setMessage('Data is not available');
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [effectiveCode]);

  const fetchStockData = async (symbol: string) => {
    setMessage(`Fetching data for ${symbol}...`);

    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?region=US&lang=en-US&includePrePost=false&interval=1d&useYfid=true&range=3mo`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const rawData = await response.json();
      const data = JSON.parse(rawData.contents);

      if (data.chart?.error) {
        throw new Error(data.chart.error.description);
      }

      const chartData = data.chart?.result?.[0];
      if (!chartData || !chartData.timestamp || chartData.timestamp.length === 0) {
        throw new Error(`No data found for symbol '${symbol}'.`);
      }

      const timestamps = chartData.timestamp as number[];
      const prices = chartData.indicators.quote[0].close as Array<number | null>;

      const validData: DataPoint[] = timestamps
        .map((ts: number, index: number): DataPoint => ({
          timestamp: ts,
          price: prices[index],
        }))
        .filter((dataPoint: DataPoint) => dataPoint.price !== null);

      if (!validData.length) {
        throw new Error('No data points available.');
      }

      const labels = validData.map((d) => new Date(d.timestamp * 1000).toLocaleDateString());
      const dataPoints = validData.map((d) => d.price as number);

      renderChart(labels, dataPoints, symbol);
      setMessage('');
    } catch (error: unknown) {
      console.error('Fetch Error:', error);
      setMessage('Data is not available');
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    }
  };

  const renderChart = (labels: string[], dataPoints: number[], symbol: string) => {
    const canvas = document.getElementById('stockChart') as HTMLCanvasElement | null;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('2D context not available');
      return;
    }

    // Destroy any existing chart before creating a new one
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `${symbol} Closing Price (USD)`,
            data: dataPoints,
            borderColor: 'rgb(34, 211, 238)',
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            borderWidth: 2,
            pointRadius: 1,
            pointHoverRadius: 6,
            tension: 0.1,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              color: 'rgb(156, 163, 175)',
              callback: function (value: number | string) {
                return '$' + value.toLocaleString();
              },
            },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
          },
          x: {
            ticks: { color: 'rgb(156, 163, 175)', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
          },
        },
        plugins: {
          legend: { labels: { color: 'rgb(209, 213, 219)' } },
          tooltip: {
            backgroundColor: 'rgb(31, 41, 55)',
            titleColor: 'rgb(209, 213, 219)',
            bodyColor: 'rgb(209, 213, 219)',
            borderColor: 'rgb(34, 211, 238)',
            borderWidth: 1,
            callbacks: {
              label: function (context: any) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
      },
    });
  };

  if (showHomePage) {
    return (
      <HomePage
        onGenerate={() => {}}
        isLoading={false}
        extractedData={null}
        file={new File([], '')}
        onSwitchtoPDF={() => setShowHomePage(false)}
      />
    );
  }

  return (
    <div className="data-page-container">
      <div className="data-page-header">
        <h1 className="data-page-title">Stock Market Visualizer</h1>
        <p className="data-page-subtitle">{message}</p>
        <button className="data-page-switch-button" onClick={() => setShowHomePage(true)}>
          Back to PDF View
        </button>
      </div>

      <div className="data-page-chart">
        <canvas id="stockChart"></canvas>
      </div>
    </div>
  );
}

export default DataPage;
