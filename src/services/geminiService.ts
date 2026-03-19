import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { Signal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Calculates a simple RSI for the given data to provide more context to the AI.
 */
function calculateRSI(data: any[], period: number = 14): number {
  if (data.length <= period) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = data[data.length - i].close - data[data.length - i - 1].close;
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

export async function analyzeChartImage(base64Image: string): Promise<Signal> {
  const systemInstruction = `
    You are the ASSASSIN CHART ELITE AI, a high-performance algorithmic trading engine.
    Your objective is 100% accuracy in technical analysis.
    Analyze chart images with extreme precision, identifying:
    - Key Support and Resistance zones
    - Major and Minor Trendlines
    - Candlestick patterns (Pin bars, Engulfing, Morning Stars, etc.)
    - Chart patterns (Head & Shoulders, Double Tops/Bottoms, Flags)
    - Fibonacci Retracement levels if visible
    
    You MUST provide:
    - A clear market DIRECTION (BULLISH if trend is up, BEARISH if trend is down, NEUTRAL if ranging)
    - A precise confidence percentage (0-100)
    - Accurate Entry, Take Profit (TP1, TP2), and Stop Loss (SL) levels.
  `;

  const prompt = `
    Analyze this chart image and provide a professional trading signal.
    Ensure the Stop Loss is placed logically (e.g., below recent support for BUY, above resistance for SELL).
    TP1 should be at a conservative level, TP2 at a more ambitious target.
    
    JSON fields:
    - type: "BUY", "SELL", or "NEUTRAL"
    - direction: "BULLISH", "BEARISH", or "NEUTRAL"
    - strength: 0-100 confidence
    - reasoning: Detailed technical breakdown
    - entry: suggested entry price (number)
    - tp1: suggested Take Profit 1 level (string)
    - tp2: suggested Take Profit 2 level (string)
    - stopLoss: suggested Stop Loss level (string)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image
          }
        }
      ],
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["BUY", "SELL", "NEUTRAL"] },
            direction: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "NEUTRAL"] },
            strength: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            entry: { type: Type.NUMBER },
            tp1: { type: Type.STRING },
            tp2: { type: Type.STRING },
            stopLoss: { type: Type.STRING },
          },
          required: ["type", "direction", "strength", "reasoning", "entry", "tp1", "tp2", "stopLoss"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      confidence: result.strength,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Gemini image analysis failed:", error);
    throw error;
  }
}

export async function analyzeForexData(pair: string, data: any[]): Promise<Signal> {
  const recentData = data.slice(-50);
  const rsi = calculateRSI(recentData);
  const dataString = recentData.slice(-30).map(d => `Time: ${d.time}, O: ${d.open}, H: ${d.high}, L: ${d.low}, C: ${d.close}`).join('\n');

  const systemInstruction = `
    You are the ASSASSIN CHART ELITE AI, a high-performance algorithmic trading engine.
    Your objective is 100% accuracy in technical analysis.
    Analyze OHLC data with extreme precision.
    
    You MUST provide:
    - A clear market DIRECTION (BULLISH if trend is up, BEARISH if trend is down, NEUTRAL if ranging)
    - A precise confidence percentage (0-100)
    - Accurate Entry, Take Profit (TP1, TP2), and Stop Loss (SL) levels.
  `;

  const prompt = `
    Analyze the following OHLC data and RSI for ${pair}.
    RSI (14): ${rsi.toFixed(2)}
    
    Data:
    ${dataString}
    
    Provide a professional trading signal.
    Ensure the Stop Loss is placed logically based on recent Highs/Lows.
    
    JSON fields:
    - type: "BUY", "SELL", or "NEUTRAL"
    - direction: "BULLISH", "BEARISH", or "NEUTRAL"
    - strength: 0-100 confidence
    - reasoning: Detailed technical breakdown including RSI and Price Action
    - entry: suggested entry price (number)
    - tp1: suggested Take Profit 1 level (string)
    - tp2: suggested Take Profit 2 level (string)
    - stopLoss: suggested Stop Loss level (string)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        { text: prompt }
      ],
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["BUY", "SELL", "NEUTRAL"] },
            direction: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "NEUTRAL"] },
            strength: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            entry: { type: Type.NUMBER },
            tp1: { type: Type.STRING },
            tp2: { type: Type.STRING },
            stopLoss: { type: Type.STRING },
          },
          required: ["type", "direction", "strength", "reasoning", "entry", "tp1", "tp2", "stopLoss"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      pair,
      confidence: result.strength,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      pair,
      type: 'NEUTRAL',
      direction: 'NEUTRAL',
      strength: 0,
      confidence: 0,
      reasoning: "Analysis currently unavailable due to a technical error.",
      timestamp: new Date().toISOString(),
      entry: 0,
      tp1: "N/A",
      tp2: "N/A",
      stopLoss: "N/A"
    };
  }
}
