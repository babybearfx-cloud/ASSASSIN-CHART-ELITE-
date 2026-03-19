import { OHLCData } from '../types';

export function generateMockData(pair: string, count: number = 100): OHLCData[] {
  const data: OHLCData[] = [];
  let currentPrice = pair.includes('JPY') ? 150.0 : 1.1;
  const volatility = pair.includes('JPY') ? 0.5 : 0.002;
  
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const time = new Date(now.getTime() - (count - i) * 3600000); // Hourly
    const open = currentPrice;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);
    
    data.push({
      time: Math.floor(time.getTime() / 1000),
      open,
      high,
      low,
      close
    });
    
    currentPrice = close;
  }
  
  return data;
}
