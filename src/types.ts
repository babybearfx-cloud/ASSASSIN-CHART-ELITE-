export interface OHLCData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Signal {
  pair?: string;
  type: 'BUY' | 'SELL' | 'NEUTRAL';
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // 0 to 100
  reasoning: string;
  timestamp: string;
  entry: number;
  tp1: string;
  tp2: string;
  stopLoss: string;
  confidence: number;
  liveConfidence?: number;
  feedback?: 'ACCURATE' | 'INACCURATE' | null;
}

export const CURRENCY_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'AUD/USD',
  'USD/CAD',
  'EUR/GBP'
];

export interface ChartSettings {
  showGrid: boolean;
  wickColorUp: string;
  wickColorDown: string;
  showTimeScale: boolean;
}
