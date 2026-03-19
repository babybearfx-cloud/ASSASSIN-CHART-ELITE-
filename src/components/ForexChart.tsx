import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';
import { OHLCData, ChartSettings } from '../types';

interface ChartProps {
  data: OHLCData[];
  pair: string;
  theme?: 'light' | 'dark';
  settings: ChartSettings;
}

export const ForexChart: React.FC<ChartProps> = ({ data, pair, theme = 'dark', settings }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isLight = theme === 'light';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isLight ? '#ffffff' : '#0a0a0a' },
        textColor: isLight ? '#1a1a1a' : '#d1d1d1',
      },
      grid: {
        vertLines: { 
          color: isLight ? '#f0f0f0' : '#1f1f1f',
          visible: settings.showGrid,
        },
        horzLines: { 
          color: isLight ? '#f0f0f0' : '#1f1f1f',
          visible: settings.showGrid,
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: isLight ? '#e5e5e5' : '#333',
        timeVisible: true,
        secondsVisible: false,
        visible: settings.showTimeScale,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: settings.wickColorUp,
      wickDownColor: settings.wickColorDown,
    });

    candlestickSeries.setData(data as any);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [theme, settings]); // Re-create chart on theme or settings change

  // Handle data updates
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const lastData = data[data.length - 1];
      seriesRef.current.update(lastData as any);
    }
  }, [data]);

  return (
    <div className={`w-full rounded-2xl border overflow-hidden transition-colors ${
      theme === 'light' ? 'bg-white border-black/5' : 'bg-[#0a0a0a] border-white/5'
    }`}>
      <div className="p-4 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">{pair} Live Stream</h3>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold font-mono">REAL-TIME</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
