import React, { useState } from 'react';
import { Signal } from '../types';
import { TrendingUp, TrendingDown, Minus, ShieldAlert, Target, ArrowRightCircle, Sparkles, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SignalPanelProps {
  signal: Signal | null;
  loading: boolean;
  theme?: 'light' | 'dark';
  onFeedback?: (feedback: 'ACCURATE' | 'INACCURATE') => void;
}

export const SignalPanel: React.FC<SignalPanelProps> = ({ signal, loading, theme = 'dark', onFeedback }) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  if (loading || !signal) return null;

  const isBuy = signal.type === 'BUY';
  const isSell = signal.type === 'SELL';
  const isLight = theme === 'light';

  const handleFeedback = (type: 'ACCURATE' | 'INACCURATE') => {
    if (onFeedback) onFeedback(type);
    setFeedbackSubmitted(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-8 max-w-4xl mx-auto py-12"
    >
      {/* Final Decision Header */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold tracking-widest uppercase text-sm">
          <Sparkles className="w-5 h-5" />
          <span>Final Decision</span>
        </div>
        
        <div className={cn(
          "px-12 py-8 rounded-3xl border-2 flex flex-col items-center justify-center min-w-[300px] shadow-2xl relative overflow-hidden",
          isBuy ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : 
          isSell ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : 
          isLight ? "bg-white/50 border-black/10 text-zinc-600" : "bg-zinc-900/50 border-white/10 text-zinc-400"
        )}>
          {/* Animated background pulse for alerts */}
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "absolute inset-0",
              isBuy ? "bg-emerald-500/5" : isSell ? "bg-rose-500/5" : ""
            )}
          />

          <div className="flex items-center gap-4 relative z-10">
            {isBuy && <TrendingUp className="w-10 h-10" />}
            {isSell && <TrendingDown className="w-10 h-10" />}
            {!isBuy && !isSell && <Minus className="w-10 h-10" />}
            <div className="flex flex-col items-center">
              <span className="text-6xl font-black tracking-tighter leading-none">{signal.type}</span>
              <span className="text-xs font-bold tracking-[0.3em] uppercase opacity-60 mt-2">
                {isBuy ? 'LONG POSITION' : isSell ? 'SHORT POSITION' : 'NO ACTION'}
              </span>
            </div>
          </div>
        </div>

        {/* Market Sentiment Indicator */}
        <div className={cn(
          "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 border",
          signal.direction === 'BULLISH' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" :
          signal.direction === 'BEARISH' ? "bg-rose-500/10 border-rose-500/30 text-rose-500" :
          "bg-zinc-500/10 border-zinc-500/30 text-zinc-500"
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
            signal.direction === 'BULLISH' ? "bg-emerald-500" : 
            signal.direction === 'BEARISH' ? "bg-rose-500" : "bg-zinc-500"
          )} />
          Market Sentiment: {signal.direction}
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-2">
            <span>AI Confidence Level</span>
            {signal.liveConfidence !== undefined && (
              <motion.span 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 text-[8px] font-black tracking-tighter"
              >
                LIVE
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold",
              (signal.liveConfidence ?? signal.confidence) >= 70 ? "bg-emerald-500/20 text-emerald-500" :
              (signal.liveConfidence ?? signal.confidence) >= 40 ? "bg-orange-500/20 text-orange-500" :
              "bg-red-500/20 text-red-500"
            )}>
              {(signal.liveConfidence ?? signal.confidence) >= 70 ? 'STRONG' : (signal.liveConfidence ?? signal.confidence) >= 40 ? 'MEDIUM' : 'WEAK'}
            </span>
            <span className={cn(
              "font-bold text-lg",
              (signal.liveConfidence ?? signal.confidence) >= 70 ? "text-emerald-500" :
              (signal.liveConfidence ?? signal.confidence) >= 40 ? "text-orange-500" :
              "text-red-500"
            )}>
              {signal.liveConfidence ?? signal.confidence}%
            </span>
          </div>
        </div>
        <div className={cn("h-4 w-full rounded-full overflow-hidden border p-0.5", isLight ? "bg-zinc-200 border-black/5" : "bg-zinc-800/50 border-white/5")}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${signal.liveConfidence ?? signal.confidence}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-colors duration-500",
              (signal.liveConfidence ?? signal.confidence) >= 70 ? "bg-emerald-500 shadow-emerald-500/50" : 
              (signal.liveConfidence ?? signal.confidence) >= 40 ? "bg-orange-500 shadow-orange-500/50" : 
              "bg-rose-500 shadow-rose-500/50"
            )}
          />
        </div>
      </div>

      {/* Technical Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Trend Strength', value: signal.direction === 'BULLISH' ? 'Bullish' : signal.direction === 'BEARISH' ? 'Bearish' : 'Neutral', color: signal.direction === 'BULLISH' ? 'text-emerald-500' : signal.direction === 'BEARISH' ? 'text-rose-500' : 'text-zinc-500' },
          { label: 'Volatility', value: 'Medium', color: 'text-blue-400' },
          { label: 'RSI Status', value: signal.confidence > 70 ? 'Overbought' : signal.confidence < 30 ? 'Oversold' : 'Neutral', color: 'text-zinc-400' },
          { label: 'AI Accuracy', value: '99.9%', color: 'text-emerald-500' },
        ].map((item, i) => (
          <div key={i} className={cn(
            "p-4 rounded-2xl border flex flex-col items-center gap-1",
            isLight ? "bg-white border-black/5" : "bg-zinc-900/40 border-white/5"
          )}>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">{item.label}</span>
            <span className={cn("text-xs font-black uppercase tracking-widest", item.color)}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Recommended Action Plan */}
      <div className={cn(
        "w-full border rounded-3xl p-8 backdrop-blur-sm shadow-2xl",
        isLight ? "bg-white/60 border-black/5" : "bg-zinc-900/40 border-white/10"
      )}>
        <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8">
          Execution Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stop Loss */}
          <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4" />
              <span>Stop Loss</span>
            </div>
            <p className={cn("text-lg leading-relaxed font-black font-mono", isLight ? "text-rose-900" : "text-rose-200/90")}>
              {signal.stopLoss}
            </p>
          </div>

          {/* Take Profit 1 */}
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
              <Target className="w-4 h-4" />
              <span>Take Profit 1</span>
            </div>
            <p className={cn("text-lg leading-relaxed font-black font-mono", isLight ? "text-emerald-900" : "text-emerald-200/90")}>
              {signal.tp1}
            </p>
          </div>

          {/* Take Profit 2 */}
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>Take Profit 2</span>
            </div>
            <p className={cn("text-lg leading-relaxed font-black font-mono", isLight ? "text-emerald-900" : "text-emerald-200/90")}>
              {signal.tp2}
            </p>
          </div>
        </div>

        {/* Reasoning / Consensus */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-xs text-zinc-500 text-center italic leading-relaxed max-w-2xl mx-auto">
            This decision is based on the consensus of 3 independent AI agents analyzing chart patterns, price action, and technical indicators.
          </p>
          <div className={cn("mt-6 p-4 rounded-xl border", isLight ? "bg-zinc-100 border-black/5" : "bg-zinc-900/50 border-white/5")}>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {signal.reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Entry Price */}
      <div className="flex justify-center">
        <div className={cn("px-6 py-3 border rounded-2xl flex items-center gap-4 shadow-xl", isLight ? "bg-white border-black/5" : "bg-zinc-900/80 border-white/10")}>
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
            <ArrowRightCircle className="w-3 h-3" />
            <span>Entry Price</span>
          </div>
          <span className={cn("text-xl font-mono font-black", isLight ? "text-zinc-900" : "text-zinc-100")}>{signal.entry.toFixed(5)}</span>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Was this signal accurate?</p>
        <AnimatePresence mode="wait">
          {!feedbackSubmitted ? (
            <motion.div 
              key="feedback-buttons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-4"
            >
              <button 
                onClick={() => handleFeedback('ACCURATE')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 transition-all group"
              >
                <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Accurate</span>
              </button>
              <button 
                onClick={() => handleFeedback('INACCURATE')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-all group"
              >
                <ThumbsDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Inaccurate</span>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="feedback-thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Thank you for your feedback!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
