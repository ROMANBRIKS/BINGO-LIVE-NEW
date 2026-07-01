import React, { useEffect, useRef, useState } from 'react';
import { Mic, Waves, Info } from 'lucide-react';

interface RealtimeAudioVisualizerProps {
  stream: MediaStream | null;
  mode: 'voice' | 'studio' | 'custom';
}

export function RealtimeAudioVisualizer({ stream, mode }: RealtimeAudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const [dbLevel, setDbLevel] = useState(-100);
  const [peakLevel, setPeakLevel] = useState(-100);

  useEffect(() => {
    if (!stream) {
      setDbLevel(-100);
      setPeakLevel(-100);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setDbLevel(-100);
      setPeakLevel(-100);
      return;
    }

    // Create AudioContext safely
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    let audioContext: AudioContext;
    try {
      audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
    } catch {
      return;
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.4;
    analyserRef.current = analyser;

    try {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
    } catch (err) {
      console.warn("Failed to create MediaStreamAudioSourceNode:", err);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const canvas = canvasRef.current;
    
    const draw = () => {
      const currentCanvas = canvasRef.current;
      if (!currentCanvas) return;
      const ctx = currentCanvas.getContext('2d');
      if (!ctx) return;
      
      animationId = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Clear layout background with trailing opacity
      ctx.fillStyle = 'rgba(26, 26, 46, 0.25)';
      ctx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);

      const barWidth = (currentCanvas.width / bufferLength) * 2.0;
      let barHeight;
      let x = 0;

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        sum += val * val;

        barHeight = (val / 255) * currentCanvas.height * 0.9;

        let gradient = ctx.createLinearGradient(0, currentCanvas.height, 0, 0);
        if (mode === 'studio') {
          gradient.addColorStop(0, '#00f2fe');
          gradient.addColorStop(1, '#4facfe');
        } else if (mode === 'voice') {
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(1, '#8b5cf6');
        } else {
          gradient.addColorStop(0, '#ec4899');
          gradient.addColorStop(1, '#f43f5e');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, currentCanvas.height - barHeight, barWidth - 1.5, barHeight);
        x += barWidth;
      }

      const rms = Math.sqrt(sum / bufferLength);
      const calculatedDb = rms > 0 ? 20 * Math.log10(rms / 255) : -100;
      
      setDbLevel(prev => {
        const target = calculatedDb;
        return prev * 0.7 + target * 0.3;
      });
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, [stream, mode]);

  // Track Peak level decay
  useEffect(() => {
    if (dbLevel > peakLevel) {
      setPeakLevel(dbLevel);
    } else {
      const timer = setTimeout(() => {
        setPeakLevel(prev => Math.max(-100, prev - 0.5));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [dbLevel, peakLevel]);

  const dbPercentage = Math.min(100, Math.max(0, ((dbLevel + 60) / 60) * 100)); // normalized -60dB to 0dB range
  const peakPercentage = Math.min(100, Math.max(0, ((peakLevel + 60) / 60) * 100));

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            mode === 'studio' ? 'bg-cyan-500/20 text-cyan-400' : 
            mode === 'voice' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-pink-500/20 text-pink-400'
          }`}>
            <Mic size={16} className={mode === 'studio' ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h4 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-1.5 flex-wrap">
              Acoustic Environment Monitor
              {mode === 'studio' && (
                <span className="text-[8px] px-2 py-0.5 rounded-full bg-cyan-400 text-black font-black uppercase tracking-wider animate-pulse">
                  HI-RES PIN-DROP SENSITIVITY
                </span>
              )}
            </h4>
            <p className="text-[10px] text-white/50">
              {mode === 'studio' 
                ? 'High sample rate raw room acoustics. background suppressors disabled.' 
                : mode === 'voice' 
                ? 'Speech adaptive gate. constant buzzers & room hums filtered.' 
                : 'Custom user-defined room filter bounds.'}
            </p>
          </div>
        </div>
      </div>

      {stream ? (
        <div className="space-y-3">
          {/* Signal Level Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono select-none">
              <span className="text-white/40">Mic Input dB Signal</span>
              <span className={`font-black ${dbLevel > -15 ? 'text-rose-400 animate-bounce' : dbLevel > -30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {dbLevel > -60 ? `${Math.round(dbLevel)} dB` : 'MUTED / SILENT'}
              </span>
            </div>
            
            {/* VU Meter Slider Bar Layout */}
            <div className="h-2 w-full bg-white/5 rounded-full relative overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-75 ${
                  mode === 'studio' ? 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-rose-500' :
                  mode === 'voice' ? 'bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-500' :
                  'bg-gradient-to-r from-emerald-500 via-pink-400 to-rose-500'
                }`}
                style={{ width: `${dbPercentage}%` }}
              />
              <div 
                className="absolute top-0 bottom-0 w-[2px] bg-red-400 shadow-[0_0_8px_rgba(239,68,68,1)] transition-all duration-100"
                style={{ left: `${peakPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[7px] font-mono text-white/20 px-1">
              <span>-60dB (Quiet)</span>
              <span>-40dB</span>
              <span>-25dB</span>
              <span>-10dB</span>
              <span>0dB (CLIP)</span>
            </div>
          </div>

          {/* Actual Audio Frequency Sound Canvas */}
          <div className="relative h-14 bg-[#141424] rounded-xl overflow-hidden border border-white/5">
            <canvas 
              ref={canvasRef} 
              width={350} 
              height={56} 
              className="w-full h-full block" 
            />
            <div className="absolute inset-x-0 bottom-1 flex justify-center pointer-events-none">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 border border-white/5">
                <Waves size={10} className={mode === 'studio' ? 'text-cyan-400' : 'text-emerald-400'} />
                <span className="text-[7.5px] font-bold text-white/60 tracking-wider uppercase font-mono">Spectrum Analysis</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-6 bg-[#1a1a2e]/30 rounded-xl border border-dashed border-white/10 text-white/40 gap-2">
          <Info size={14} />
          <span className="text-xs font-semibold">Microphone stream missing or offline</span>
        </div>
      )}
    </div>
  );
}
