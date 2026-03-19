import React from 'react';
import { X, Moon, Sun, Palette, History, Save, Trash2, ArrowLeft, Layout, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Signal, ChartSettings } from '../types';
import { cn } from '../lib/utils';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  voiceAlertsEnabled: boolean;
  setVoiceAlertsEnabled: (enabled: boolean) => void;
  chartSettings: ChartSettings;
  setChartSettings: (settings: ChartSettings) => void;
  history: Signal[];
  onClearHistory: () => void;
  onClearCustomBg: () => void;
  onSave: () => void;
}

const PRESET_COLORS = [
  '#0a0f1a', // Default Dark
  '#1a1a1a', // Neutral Dark
  '#0f172a', // Slate
  '#171717', // Zinc
  '#050505', // Pitch Black
  '#f8fafc', // Light Slate
  '#ffffff', // Pure White
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  bgColor,
  setBgColor,
  voiceAlertsEnabled,
  setVoiceAlertsEnabled,
  chartSettings,
  setChartSettings,
  history,
  onClearHistory,
  onClearCustomBg,
  onSave,
}) => {
  const [activeTab, setActiveTab] = React.useState<'general' | 'history'>('general');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 z-[100] shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-500" />
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-800/50 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('general')}
            className={cn(
              "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              activeTab === 'general' ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              activeTab === 'history' ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'general' ? (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Theme Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Appearance
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      theme === 'dark'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <Moon className="w-6 h-6" />
                    <span className="text-xs font-bold">Dark Mode</span>
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      theme === 'light'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <Sun className="w-6 h-6" />
                    <span className="text-xs font-bold">Light Mode</span>
                  </button>
                </div>
              </section>

              {/* Voice Alerts Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                  </svg>
                  Voice Alerts
                </h3>
                <button
                  onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                    voiceAlertsEnabled
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                      : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      voiceAlertsEnabled ? 'bg-emerald-500/20' : 'bg-zinc-700/50'
                    }`}>
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold block">AI Voice Assistant</span>
                      <span className="text-[10px] opacity-60">Announce new signals via voice</span>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${
                    voiceAlertsEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}>
                    <motion.div
                      animate={{ x: voiceAlertsEnabled ? 24 : 4 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </button>
              </section>

              {/* Chart Appearance Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  Chart Appearance
                </h3>
                
                <div className="space-y-4">
                  {/* Grid Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-white/5">
                    <span className="text-xs font-bold text-zinc-300">Show Grid Lines</span>
                    <button 
                      onClick={() => setChartSettings({ ...chartSettings, showGrid: !chartSettings.showGrid })}
                      className={`p-2 rounded-lg transition-colors ${chartSettings.showGrid ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-600'}`}
                    >
                      {chartSettings.showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Time Scale Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-white/5">
                    <span className="text-xs font-bold text-zinc-300">Show Time Scale</span>
                    <button 
                      onClick={() => setChartSettings({ ...chartSettings, showTimeScale: !chartSettings.showTimeScale })}
                      className={`p-2 rounded-lg transition-colors ${chartSettings.showTimeScale ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-600'}`}
                    >
                      {chartSettings.showTimeScale ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Wick Colors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Wick Up</span>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-800/30 border border-white/5">
                        <input 
                          type="color" 
                          value={chartSettings.wickColorUp}
                          onChange={(e) => setChartSettings({ ...chartSettings, wickColorUp: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-400">{chartSettings.wickColorUp}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Wick Down</span>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-800/30 border border-white/5">
                        <input 
                          type="color" 
                          value={chartSettings.wickColorDown}
                          onChange={(e) => setChartSettings({ ...chartSettings, wickColorDown: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-400">{chartSettings.wickColorDown}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Background Color Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Background
                </h3>
                
                {/* Custom Background Panel */}
                <div className="p-4 rounded-xl bg-zinc-800/30 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">Custom Background</span>
                        <span className="text-[10px] opacity-60">Manage your home background</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={onClearCustomBg}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Clear Background Image
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Solid Colors</span>
                  <div className="flex flex-wrap gap-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setBgColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          bgColor === color ? 'border-blue-500 scale-110' : 'border-white/10 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <div className="relative w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                      />
                      <div
                        className="w-full h-full flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: bgColor }}
                      >
                        +
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Signal History
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 uppercase tracking-tighter"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <History className="w-12 h-12 text-zinc-800 mb-4" />
                    <p className="text-xs text-zinc-500 italic">No signals recorded yet</p>
                  </div>
                ) : (
                  history.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-zinc-800/50 border border-white/5 space-y-3 relative overflow-hidden group"
                    >
                      {/* Background Accent */}
                      <div className={cn(
                        "absolute top-0 left-0 w-1 h-full",
                        sig.type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'
                      )} />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                            sig.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                          )}>
                            {sig.type[0]}
                          </div>
                          <div>
                            <span className="text-xs font-black text-zinc-100 uppercase tracking-tighter">{sig.pair || 'CHART'}</span>
                            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                              {new Date(sig.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            "text-xs font-mono font-black",
                            sig.confidence >= 70 ? "text-emerald-500" :
                            sig.confidence >= 40 ? "text-orange-500" :
                            "text-red-500"
                          )}>
                            {sig.confidence}%
                          </span>
                          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Confidence</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Entry Price</span>
                            <span className="text-xs font-mono font-black text-zinc-100">{sig.entry}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold text-rose-500/80">Stop Loss</span>
                            <span className="text-xs font-mono font-black text-rose-500">{sig.stopLoss}</span>
                          </div>
                        </div>
                        <div className="space-y-3 border-l border-white/5 pl-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold text-emerald-500/80">Take Profit 1</span>
                            <span className="text-xs font-mono font-black text-emerald-500">{sig.tp1}</span>
                          </div>
                          {sig.tp2 && (
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold text-emerald-500/80">Take Profit 2</span>
                              <span className="text-xs font-mono font-black text-emerald-500">{sig.tp2}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {sig.feedback && (
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                            sig.feedback === 'ACCURATE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                          )}>
                            {sig.feedback}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Panel */}
      <div className="p-6 border-t border-white/10 bg-black/20">
        <button
          onClick={onSave}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Save className="w-5 h-5" />
          Save Preferences
        </button>
        <p className="text-[10px] text-zinc-500 text-center mt-3 uppercase tracking-widest">
          Settings are saved to local storage
        </p>
      </div>
    </motion.div>
  );
};
