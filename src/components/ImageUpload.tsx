import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploadProps {
  onUpload: (base64: string) => void;
  isAnalyzing: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, isAnalyzing }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + Math.random() * 15;
          return prev;
        });
      }, 400);
    } else {
      setProgress(0);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clear = () => {
    setPreview(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative group border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] cursor-pointer",
          isDragging ? "border-blue-500 bg-blue-500/5" : "border-white/10 hover:border-white/20 bg-zinc-900/30",
          preview && "border-none p-0 overflow-hidden"
        )}
      >
        {!preview ? (
          <>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={onSelect}
              accept="image/*"
            />
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Upload Trading Chart</h3>
            <p className="text-zinc-400 text-sm mb-1">Drag & drop or click to select</p>
            <p className="text-zinc-500 text-xs mb-6">Supports: PNG, JPG, JPEG</p>
            
            <div className="w-full max-w-sm p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-2">
                <ImageIcon className="w-3 h-3" />
                <span>For Best Results:</span>
              </div>
              <ul className="text-[10px] text-zinc-400 space-y-1">
                <li>✓ Clear candlesticks visible</li>
                <li>✓ Current price shown (rightmost candle)</li>
                <li>✓ Price scale visible on right side</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="relative w-full aspect-video bg-black">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-blue-500/20 backdrop-blur-[2px] flex flex-col items-center justify-center"
                >
                  <div className="relative w-full max-w-xs px-4">
                    <div className="bg-zinc-900/90 px-4 py-3 rounded-xl border border-blue-500/30 flex flex-col gap-3 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-blue-400 animate-pulse" />
                          <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">AI Scanning...</span>
                        </div>
                        <span className="text-[10px] font-mono text-blue-400">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-blue-500/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-8">
                    <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>⚡</span>
                    <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>⚡</span>
                    <span className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>⚡</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isAnalyzing && (
              <button 
                onClick={clear}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest bg-black/40 py-1 inline-block px-3 rounded-full">
                Click or drag to change image
              </p>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={onSelect}
                accept="image/*"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => preview && onUpload(preview)}
          disabled={!preview || isAnalyzing}
          className={cn(
            "relative px-12 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-3 overflow-hidden group",
            !preview || isAnalyzing 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] active:scale-95"
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Fast Analysis in Progress...</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span>Analyze Chart</span>
              <Zap className="w-4 h-4 fill-current" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const Zap = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
