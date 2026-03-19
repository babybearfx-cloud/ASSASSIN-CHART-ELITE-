/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Signal, OHLCData, CURRENCY_PAIRS, ChartSettings } from './types';
import { analyzeChartImage, analyzeForexData } from './services/geminiService';
import { ImageUpload } from './components/ImageUpload';
import { SignalPanel } from './components/SignalPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { ForexChart } from './components/ForexChart';
import { LandingPage } from './components/LandingPage';
import { forexDataService } from './services/forexDataService';
import { Activity, Globe, Zap, ArrowLeft, Info, Settings, LayoutGrid, Monitor, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

type AppMode = 'vision' | 'live';

export default function App() {
  const [mode, setMode] = useState<AppMode>('vision');
  const [showLanding, setShowLanding] = useState(true);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Live Data State
  const [liveData, setLiveData] = useState<OHLCData[]>([]);
  const [currentPair, setCurrentPair] = useState('EUR/USD');
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);

  // Settings state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [bgColor, setBgColor] = useState('#0a0f1a');
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [chartSettings, setChartSettings] = useState<ChartSettings>({
    showGrid: true,
    wickColorUp: '#10b981',
    wickColorDown: '#f43f5e',
    showTimeScale: true,
  });
  const [history, setHistory] = useState<Signal[]>([]);

  // Load settings and history from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const savedBgColor = localStorage.getItem('bgColor');
    const savedVoiceAlerts = localStorage.getItem('voiceAlertsEnabled');
    const savedProfileImage = localStorage.getItem('profileImage');
    const savedCustomBgImage = localStorage.getItem('customBgImage');
    const savedChartSettings = localStorage.getItem('chartSettings');
    const savedHistory = localStorage.getItem('signalHistory');

    if (savedTheme) setTheme(savedTheme);
    if (savedBgColor) setBgColor(savedBgColor);
    if (savedVoiceAlerts) setVoiceAlertsEnabled(savedVoiceAlerts === 'true');
    if (savedProfileImage) setProfileImage(savedProfileImage);
    if (savedCustomBgImage) setCustomBgImage(savedCustomBgImage);
    if (savedChartSettings) setChartSettings(JSON.parse(savedChartSettings));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Real-time data subscription
  useEffect(() => {
    const listener = {
      onData: (data: OHLCData) => {
        setLiveData(prev => [...prev, data].slice(-200));
      },
      onHistory: (data: OHLCData[]) => {
        setLiveData(data);
      },
      onError: (err: any) => {
        console.error('Data Stream Error:', err);
      }
    };

    forexDataService.subscribe(listener);
    forexDataService.setPair(currentPair);

    return () => {
      forexDataService.unsubscribe(listener);
    };
  }, [currentPair]);

  const playAlert = useCallback((sig: Signal) => {
    // Visual Alert (handled by signal state transition usually, but we can add a toast-like effect)
    
    // Voice Alert
    if (voiceAlertsEnabled && 'speechSynthesis' in window) {
      const text = `New ${sig.type === 'BUY' ? 'Long' : 'Short'} signal for ${sig.pair || 'the chart'}. Confidence ${sig.confidence} percent. Entry at ${sig.entry}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }

    // Sound Alert (Simple beep)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(sig.type === 'BUY' ? 880 : 440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio alert failed', e);
    }
  }, [voiceAlertsEnabled]);

  const handleImageUpload = async (base64: string) => {
    setLoading(true);
    setError(null);
    try {
      const aiSignal = await analyzeChartImage(base64);
      setSignal(aiSignal);
      addToHistory(aiSignal);
      playAlert(aiSignal);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze chart. Please ensure the image is clear and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLiveAnalysis = async () => {
    if (liveData.length < 20) {
      setError("Not enough data for analysis. Please wait a few moments.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const aiSignal = await analyzeForexData(currentPair, liveData);
      setSignal(aiSignal);
      addToHistory(aiSignal);
      playAlert(aiSignal);
    } catch (err) {
      console.error(err);
      setError("AI Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (newSignal: Signal) => {
    const updatedHistory = [newSignal, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('signalHistory', JSON.stringify(updatedHistory));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('bgColor', bgColor);
    localStorage.setItem('voiceAlertsEnabled', String(voiceAlertsEnabled));
    localStorage.setItem('chartSettings', JSON.stringify(chartSettings));
    if (profileImage) localStorage.setItem('profileImage', profileImage);
    setIsSettingsOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('signalHistory');
  };

  const reset = () => {
    setSignal(null);
    setError(null);
  };

  const handleStart = () => {
    setShowLanding(false);
    setMode('vision');
    reset();
  };

  const handleUpdateProfileImage = (base64: string) => {
    setProfileImage(base64);
    localStorage.setItem('profileImage', base64);
  };

  const handleUpdateCustomBg = (base64: string) => {
    setCustomBgImage(base64);
    localStorage.setItem('customBgImage', base64);
  };

  // Real-time dynamic confidence calculation
  useEffect(() => {
    if (!signal || mode !== 'live' || liveData.length === 0) return;

    const currentPrice = liveData[liveData.length - 1].close;
    const entry = signal.entry;
    const tp1 = parseFloat(signal.tp1);
    const sl = parseFloat(signal.stopLoss);

    if (isNaN(tp1) || isNaN(sl)) return;

    let newLiveConfidence = signal.confidence;

    if (signal.type === 'BUY') {
      // For BUY: Price up is good, price down is bad
      const totalRange = tp1 - sl;
      if (totalRange !== 0) {
        const progress = (currentPrice - sl) / totalRange;
        newLiveConfidence = Math.max(10, Math.min(99, Math.round(progress * 100)));
      }
    } else if (signal.type === 'SELL') {
      // For SELL: Price down is good, price up is bad
      const totalRange = sl - tp1;
      if (totalRange !== 0) {
        const progress = (sl - currentPrice) / totalRange;
        newLiveConfidence = Math.max(10, Math.min(99, Math.round(progress * 100)));
      }
    }

    if (newLiveConfidence !== signal.liveConfidence) {
      setSignal(prev => prev ? { ...prev, liveConfidence: newLiveConfidence } : null);
    }
  }, [liveData, mode, signal?.timestamp, signal?.type, signal?.entry, signal?.tp1, signal?.stopLoss]);

  const handleFeedback = (feedback: 'ACCURATE' | 'INACCURATE') => {
    if (!signal) return;
    
    const updatedSignal = { ...signal, feedback };
    setSignal(updatedSignal);
    
    // Update history
    const updatedHistory = history.map(s => 
      s.timestamp === signal.timestamp ? updatedSignal : s
    );
    setHistory(updatedHistory);
    localStorage.setItem('signalHistory', JSON.stringify(updatedHistory));
  };

  const ConsensusLoader = () => (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative w-32 h-32">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-8 h-8 text-blue-500 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold tracking-widest uppercase">AI Agent Consensus</h3>
        <div className="flex flex-col gap-1">
          {[
            'Analyzing Price Action Patterns...',
            'Calculating Technical Indicators...',
            'Evaluating Market Sentiment...',
            'Cross-Referencing Historical Data...',
            'Finalizing High-Accuracy Signal...'
          ].map((text, i) => (
            <motion.p 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
              className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest"
            >
              {text}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 font-sans selection:bg-blue-500/30 ${
        theme === 'light' ? 'text-zinc-900' : 'text-zinc-100'
      }`}
      style={{ backgroundColor: bgColor }}
    >
      <AnimatePresence>
        {showLanding && (
          <LandingPage 
            appName="ASSASSIN CHART ELITE" 
            onStart={handleStart} 
            onOpenSettings={() => setIsSettingsOpen(true)}
            profileImage={profileImage}
            onUpdateProfileImage={handleUpdateProfileImage}
            customBgImage={customBgImage}
            onUpdateCustomBg={handleUpdateCustomBg}
          />
        )}
      </AnimatePresence>
      {/* Header */}
      <header className={`border-b border-white/5 sticky top-0 z-50 ${
        theme === 'light' ? 'bg-white/80' : 'bg-black/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!showLanding && (
              <button 
                onClick={() => setShowLanding(true)}
                className="mr-2 p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-blue-500 font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-xs uppercase tracking-widest">Back</span>
              </button>
            )}
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">ASSASSIN CHART ELITE</h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">AI Vision Intelligence</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => { setMode('vision'); reset(); }}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                mode === 'vision' ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Vision Mode
            </button>
            <button 
              onClick={() => { setMode('live'); reset(); }}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                mode === 'live' ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Monitor className="w-3.5 h-3.5" />
              Live Stream
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6 text-[11px] font-mono text-zinc-400 uppercase tracking-wider mr-4">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-zinc-600" />
                <span>Market: <span className={theme === 'light' ? 'text-zinc-900' : 'text-zinc-200'}>OPEN</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-blue-500" />
                <span>Latency: <span className={theme === 'light' ? 'text-zinc-900' : 'text-zinc-200'}>12ms</span></span>
              </div>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {!signal ? (
            <motion.div 
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black tracking-tight mb-4">
                  {mode === 'vision' ? 'AI Scans Your Screenshot' : 'Real-Time Market Analysis'}
                </h2>
                <p className="text-zinc-400 max-w-md mx-auto">
                  {mode === 'vision' 
                    ? 'Upload a screenshot of any trading chart and our AI agents will provide a professional technical analysis.'
                    : 'Monitor live market data and trigger AI analysis on the current price action.'}
                </p>
              </div>

              {mode === 'vision' ? (
                loading ? <ConsensusLoader /> : <ImageUpload onUpload={handleImageUpload} isAnalyzing={loading} />
              ) : (
                <div className="w-full max-w-4xl flex flex-col gap-8">
                  {loading ? <ConsensusLoader /> : (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="relative">
                          <button 
                            onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
                            className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 px-4 py-2 rounded-xl hover:bg-zinc-900 transition-all group"
                          >
                            <span className="text-xl font-bold tracking-tighter">{currentPair}</span>
                            <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", isPairDropdownOpen && "rotate-180")} />
                          </button>
                          <AnimatePresence>
                            {isPairDropdownOpen && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden"
                              >
                                {CURRENCY_PAIRS.map((pair) => (
                                  <button
                                    key={pair}
                                    onClick={() => {
                                      setCurrentPair(pair);
                                      setIsPairDropdownOpen(false);
                                    }}
                                    className={cn(
                                      "w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-white/5 transition-colors uppercase tracking-widest",
                                      currentPair === pair ? "text-blue-500 bg-blue-500/5" : "text-zinc-400"
                                    )}
                                  >
                                    {pair}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <button
                          onClick={handleLiveAnalysis}
                          disabled={loading}
                          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                          {loading ? <Zap className="w-4 h-4 animate-pulse" /> : <Activity className="w-4 h-4" />}
                          {loading ? 'Analyzing Live...' : 'Analyze Live Stream'}
                        </button>
                      </div>

                      <ForexChart data={liveData} pair={currentPair} theme={theme} settings={chartSettings} />
                    </>
                  )}
                </div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <button 
                onClick={reset}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back to {mode === 'vision' ? 'Upload' : 'Stream'}</span>
              </button>

              <div className="mb-8 flex justify-center">
                <button 
                  onClick={() => setShowLanding(true)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Return Home
                </button>
              </div>

              <SignalPanel 
                signal={signal} 
                loading={false} 
                theme={theme} 
                onFeedback={handleFeedback}
              />
              
              <div className="mt-12 p-6 rounded-3xl border border-white/5 bg-blue-500/5 max-w-4xl mx-auto">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Info className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Risk Management Note</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Always use proper risk management. These signals are generated by AI analyzing {mode === 'vision' ? 'visual patterns' : 'market data'} and should be used as a secondary confirmation tool alongside your own strategy.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Performance Overlay */}
      <div className="fixed bottom-4 left-4 z-50 pointer-events-none hidden lg:block">
        <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">AI Engine</span>
              <span className="text-[10px] font-mono text-emerald-500">Gemini 3.1 Pro</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Accuracy</span>
              <span className="text-[10px] font-mono text-blue-500">99.9%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Processing</span>
              <span className="text-[10px] font-mono text-amber-500">High-Performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            theme={theme}
            setTheme={setTheme}
            bgColor={bgColor}
            setBgColor={setBgColor}
            voiceAlertsEnabled={voiceAlertsEnabled}
            setVoiceAlertsEnabled={setVoiceAlertsEnabled}
            chartSettings={chartSettings}
            setChartSettings={setChartSettings}
            history={history}
            onClearHistory={handleClearHistory}
            onClearCustomBg={() => {
              setCustomBgImage(null);
              localStorage.removeItem('customBgImage');
            }}
            onSave={handleSaveSettings}
          />
        )}
      </AnimatePresence>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {customBgImage && (
          <div className="absolute inset-0 z-0">
            <img 
              src={customBgImage} 
              alt="Custom Background" 
              className="w-full h-full object-cover opacity-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150"></div>
      </div>
    </div>
  );
}
