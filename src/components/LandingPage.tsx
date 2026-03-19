import React, { useRef, useEffect, useState } from 'react';
import { Play, Settings as SettingsIcon, Home as HomeIcon, Camera, Image as ImageIcon, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onStart: () => void;
  onOpenSettings: () => void;
  appName: string;
  profileImage: string | null;
  onUpdateProfileImage: (base64: string) => void;
  customBgImage: string | null;
  onUpdateCustomBg: (base64: string) => void;
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, 
  onOpenSettings, 
  appName,
  profileImage,
  onUpdateProfileImage,
  customBgImage,
  onUpdateCustomBg
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [showPasteHint, setShowPasteHint] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              onUpdateCustomBg(reader.result as string);
              setShowPasteHint(false);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onUpdateCustomBg]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionRef.current.onend = () => {
        setIsVoiceActive(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsVoiceActive(false);
      };
    }
  }, []);

  const handleCircleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleBackgroundClick = () => {
    // setShowPasteHint(true);
    // setTimeout(() => setShowPasteHint(false), 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateCustomBg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceSpeaker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVoiceActive(true);
    setTranscript("");
    
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const text = `This is ASSASSIN CHART ELITE. How Can I Assist you?`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        // Start listening after speaking
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.warn("Recognition already started or failed:", err);
          }
        } else {
          setIsVoiceActive(false);
        }
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis not supported in this browser.");
      setIsVoiceActive(false);
    }
  };

  return (
    <div 
      onClick={handleBackgroundClick}
      className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-between py-12 px-6 overflow-hidden"
    >
      {/* Custom Background Image */}
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

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={bgInputRef} 
        onChange={handleBgFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {/* Background Tech Patterns */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,transparent_70%)]" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* Background Upload Button (Floating) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); bgInputRef.current?.click(); }}
        className="absolute top-8 right-8 p-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-zinc-400 hover:text-blue-500 transition-colors z-[70] flex items-center gap-2 group"
      >
        <ImageIcon className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-widest hidden group-hover:inline">Customize BG</span>
      </motion.button>

      <AnimatePresence>
        {showPasteHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-8 bg-blue-600/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-2xl z-[100] flex items-center gap-3"
          >
            <ImageIcon className="w-5 h-5 text-white" />
            <span className="text-sm font-bold text-white uppercase tracking-widest">Paste an image (Ctrl+V) to set background</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Portrait & App Name Section with Backdrop Blur */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="absolute inset-0 -inset-x-12 -inset-y-8 bg-white/5 rounded-[4rem] border border-white/10 -z-10" />
        
        {/* AI Portrait Section */}
        <div className="relative mt-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-blue-900/30 p-2 shadow-[0_0_50px_rgba(30,58,138,0.3)] cursor-pointer group"
            onClick={handleCircleClick}
          >
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-500/50 relative">
              <img 
                src={profileImage || "https://images.unsplash.com/photo-1675271591211-126ad94e495d?q=80&w=800&auto=format&fit=crop"} 
                alt="AI Intelligence" 
                className="w-full h-full object-cover grayscale-[0.2] brightness-75 transition-transform group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                <Camera className="w-10 h-10 text-white mb-2" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change Image</span>
              </div>
            </div>
            
            {/* Decorative Rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-dashed border-blue-500/20 rounded-full"
            />
          </motion.div>
        </div>

        {/* App Name & Status */}
        <div className="text-center mt-8">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-black tracking-tighter text-blue-500/90 italic mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            {appName.replace(/ /g, '_')}
          </motion.h1>
          <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase mb-8">
            AI TRADING SUITE
          </p>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"
              />
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">System Status</span>
            </div>
            <h2 className="text-lg font-bold tracking-widest text-white/90 uppercase">AI Scanner Ready</h2>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="w-full max-w-md px-6 mb-8 relative z-10 flex flex-col items-center gap-12">
        <div className="bg-zinc-900/80 border border-white/5 rounded-full p-2 flex items-center justify-center relative h-20 w-full">
          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onStart(); }}
            className="w-24 h-24 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full absolute -top-4 flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(30,58,138,0.5)] border-4 border-black group"
          >
            <Play className="w-8 h-8 text-white fill-current mb-1" />
            <span className="text-[10px] font-black tracking-widest text-white uppercase">Start</span>
            
            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>

        {/* Voice Speaker Button */}
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleVoiceSpeaker}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl border-2",
              isVoiceActive 
                ? "bg-blue-600 border-blue-400 shadow-blue-500/50 animate-pulse" 
                : "bg-zinc-900/80 border-white/10 text-zinc-400 hover:text-blue-500"
            )}
          >
            {isVoiceActive ? <Volume2 className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8" />}
          </motion.button>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest transition-colors",
            isVoiceActive ? "text-blue-500" : "text-zinc-500"
          )}>
            {isVoiceActive ? (transcript || "Listening...") : "Voice Speaker"}
          </span>
          {transcript && isVoiceActive && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-blue-400 font-mono text-center max-w-[200px] line-clamp-2"
            >
              "{transcript}"
            </motion.p>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full max-w-xs flex items-center justify-around pb-4 relative z-10">
        <button className="flex flex-col items-center gap-1 text-blue-500">
          <HomeIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
          className="flex flex-col items-center gap-1 text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <SettingsIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
        </button>
      </div>
    </div>
  );
};
