import { OHLCData } from '../types';

export interface ForexDataListener {
  onData: (data: OHLCData) => void;
  onHistory: (data: OHLCData[]) => void;
  onError: (error: any) => void;
}

export class ForexDataService {
  private socket: WebSocket | null = null;
  private listeners: Set<ForexDataListener> = new Set();
  private currentPair: string = 'EUR/USD';
  private mockInterval: any = null;
  private history: OHLCData[] = [];

  constructor() {}

  public subscribe(listener: ForexDataListener) {
    this.listeners.add(listener);
    if (this.history.length > 0) {
      listener.onHistory(this.history);
    }
  }

  public unsubscribe(listener: ForexDataListener) {
    this.listeners.delete(listener);
  }

  public setPair(pair: string) {
    this.currentPair = pair;
    this.history = this.generateInitialHistory(pair);
    this.broadcastHistory();
    this.restartStream();
  }

  private restartStream() {
    this.stopStream();
    this.startMockStream();
    // In a real app, you'd connect to a real WebSocket here:
    // this.connectToWebSocket();
  }

  private stopStream() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private startMockStream() {
    this.mockInterval = setInterval(() => {
      const last = this.history[this.history.length - 1];
      const next = this.generateNextCandle(last);
      this.history.push(next);
      if (this.history.length > 200) this.history.shift();
      this.broadcastData(next);
    }, 5000); // New candle every 5 seconds for "real-time" feel
  }

  private broadcastData(data: OHLCData) {
    this.listeners.forEach(l => l.onData(data));
  }

  private broadcastHistory() {
    this.listeners.forEach(l => l.onHistory(this.history));
  }

  private generateInitialHistory(pair: string): OHLCData[] {
    const data: OHLCData[] = [];
    let currentPrice = pair.includes('JPY') ? 150.0 : 1.1;
    const volatility = pair.includes('JPY') ? 0.5 : 0.002;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 0; i < 100; i++) {
      const time = now - (100 - i) * 60; // 1 minute intervals
      const open = currentPrice;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
      const close = low + Math.random() * (high - low);
      
      data.push({ time, open, high, low, close });
      currentPrice = close;
    }
    return data;
  }

  private generateNextCandle(last: OHLCData): OHLCData {
    const volatility = this.currentPair.includes('JPY') ? 0.1 : 0.0005;
    const open = last.close;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);
    const time = (last.time as number) + 60;
    
    return { time, open, high, low, close };
  }

  // Placeholder for real WebSocket implementation
  private connectToWebSocket() {
    // Example: Finnhub or similar
    // this.socket = new WebSocket('wss://ws.finnhub.io?token=YOUR_TOKEN');
    // this.socket.onmessage = (event) => { ... };
  }
}

export const forexDataService = new ForexDataService();
