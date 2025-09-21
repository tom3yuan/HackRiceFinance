import { useState, useEffect, useRef } from 'react';
import './DataPage.css';
import Chart from 'chart.js/auto';
import { useLocation } from 'react-router-dom';

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
  const chartRef = useRef<Chart | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const location = useLocation();

  // Robust ticker sanitizer: extract first plausible ticker, ignore common words and placeholders
  const sanitizeTicker = (raw?: string | null): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    const upper = raw.toUpperCase().trim();

    // Reject obvious placeholders
    if (upper === 'N/A' || upper === 'NA' || upper === 'N') return null;

    // Tokens that look like tickers: 1-6 uppercase letters/numbers, optional .SUFFIX or -
    const tokens = upper.match(/\b[A-Z0-9]{1,6}(?:[.-][A-Z0-9]{1,4})?\b/g);
    if (!tokens) return null;

    const blacklist = new Set([
      'THE','AND','COMPANY','CORP','INC','LIMITED','LTD','PLC','ABSTRACT','PAGE','USD','US','NYSE','NASDAQ','LLC','SA','AG','BV','CO','CO.','FOR','OF','A','AN','IN','ON','BY','WITH','CODE','STOCK','TICKER'
    ]);

    const candidates = tokens.filter(tok => !blacklist.has(tok));
    if (candidates.length === 0) return null;

    // Prefer the first plausible token
    return candidates[0];
  };

  // Try to get code from router state if available
  const getCodeFromLocation = (): string | null => {
    try {
      const state: any = (location as any).state;
      const ed = state?.extractedData;
      const obj = typeof ed === 'string' ? JSON.parse(ed) : ed;
      return obj?.Company_Info?.Company_Code ?? null;
    } catch {
      return null;
    }
  };

  // Fallback to localStorage if prop not provided
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('parsedData') || '{}'); } catch { return {}; }
  })();
  const effectiveCode = sanitizeTicker(
    companyCode ?? getCodeFromLocation() ?? stored?.Company_Info?.Company_Code ?? null
  );

  useEffect(() => {
    if (effectiveCode) {
      // Debug log to help verify which ticker is used
      console.debug('[DataPage] Using ticker:', effectiveCode);
      fetchStockData(effectiveCode);
    } else {
      setMessage('Data is not available');
    }

    // Cleanup function to destroy the chart instance when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [effectiveCode]);

  const fetchStockData = async (symbol: string) => {
    if (isFetchingRef.current) return; // prevent overlapping fetches
    isFetchingRef.current = true;

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
        throw new Error(data.chart.error.description || 'Chart API error');
      }

      const chartData = data.chart?.result?.[0];
      if (!chartData || !chartData.timestamp || chartData.timestamp.length === 0) {
        throw new Error(`No data found for symbol '${symbol}'.`);
      }

      const timestamps = chartData.timestamp as number[];
      const prices = chartData.indicators.quote?.[0]?.close as Array<number | null> | undefined;
      if (!prices || prices.length === 0) {
        throw new Error('No price series available.');
      }

      const validData: DataPoint[] = timestamps
        .map((ts: number, index: number): DataPoint => ({ timestamp: ts, price: prices[index] ?? null }))
        .filter((d) => d.price !== null);

      if (!validData.length) {
        throw new Error('No data points available.');
      }

      const labels = validData.map((d) => new Date(d.timestamp * 1000).toLocaleDateString());
      const dataPoints = validData.map((d) => d.price as number);

      renderChart(labels, dataPoints, symbol);
      setMessage('');
    } catch (error: any) {
      console.error('[DataPage] Fetch Error:', error);
      setMessage('Data is not available');
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    } finally {
      isFetchingRef.current = false;
    }
  };

  const renderChart = (labels: string[], dataPoints: number[], symbol: string) => {
    const canvas = document.getElementById('stockChart') as HTMLCanvasElement | null;
    if (!canvas) {
      console.error('[DataPage] Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[DataPage] 2D context not available');
      return;
    }

    // Make sure the canvas itself has a white background
    canvas.style.backgroundColor = '#FFFFFF';

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
            borderColor: 'rgb(34, 197, 94)', // green line
            backgroundColor: 'rgba(34, 197, 94, 0.1)', // not used when fill=false
            borderWidth: 2,
            pointRadius: 1,
            pointHoverRadius: 6,
            tension: 0.1,
            fill: false, // keep chart body white
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
              color: 'rgb(0, 0, 0)',
              callback: function (value: number | string) {
                return '$' + value.toLocaleString();
              },
            },
            grid: { color: 'rgba(0, 0, 0, 0.1)' },
          },
          x: {
            ticks: { color: 'rgb(0, 0, 0)', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
            grid: { color: 'rgba(0, 0, 0, 0.1)' },
          },
        },
        plugins: {
          legend: { labels: { color: 'rgb(0, 0, 0)' } },
          tooltip: {
            backgroundColor: '#FFFFFF',
            titleColor: '#000000',
            bodyColor: '#000000',
            borderColor: 'rgb(34, 197, 94)',
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

  return (
    <div
      style={{
        padding: '0px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: 'transparent',
        color: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <h3 style={{ margin: 0, color: 'black' }}>Stock Market Visualizer</h3>

        <button
          onClick={onSwitchToPDF}
          style={{
            padding: '10px 20px',
            borderRadius: '99999px',
            border: 'none',
            height: '35px',
            background: '#90C96E',
            color: '#1a202c',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Poppins', sans-serif",
            transition: 'background-color 0.3s, transform 0.3s',
          }}
        >
          Back to PDF View
        </button>
      
      

      </div>
     

      {message && (
        <div style={{ color: '#dbe4ea', marginTop: '-12px' }}>{message}</div>
      )}

      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          border: '1px solid #4A5568',
          borderRadius: '5px',
          padding: '10px',
          background: 'transparent',
          height: '65vh',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            height: '100%',
            display: 'flex',
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas id="stockChart" style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF' }}></canvas>
          
        </div>
      </div>
    </div>
    </div>
  );
}

export default DataPage;
