import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wand2, Crown, Glasses, Maximize2 } from 'lucide-react';
import { mediaPipeService, ARSettings } from '../services/MediaPipeService';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

interface ARPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ARPreviewModal: React.FC<ARPreviewModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [arSettings, setArSettings] = useState<ARSettings>({
    beautyLevel: 30,
    brightness: 20,
    activeMask: null,
    virtualBackground: null,
    virtualAvatar: null
  });
  const [activeTab, setActiveTab] = useState<'beauty' | 'magic'>('beauty');

  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setupCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    mediaPipeService.updateSettings(arSettings);
  }, [arSettings]);

  const setupCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        const initMediaPipe = () => {
          if (canvasRef.current && videoRef.current) {
            const width = videoRef.current.videoWidth || 640;
            const height = videoRef.current.videoHeight || 480;
            canvasRef.current.width = width;
            canvasRef.current.height = height;
            
            mediaPipeService.initialize(videoRef.current, canvasRef.current).then(() => {
              mediaPipeService.startProcessing();
            });
          }
        };

        if (videoRef.current.readyState >= 2) {
          initMediaPipe();
        } else {
          videoRef.current.onloadeddata = initMediaPipe;
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(err instanceof Error ? err.message : String(err));
      showToast("Could not access camera. Please check permissions.", 'error');
    }
  };

  const stopCamera = () => {
    mediaPipeService.stopProcessing();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg bg-[#1a1a1a] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Preview Area */}
        <div className="relative aspect-[3/4] bg-black overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="hidden" />
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
          
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
              <Sparkles size={32} className="text-white/20 mb-4" />
              <p className="text-white/60 text-xs mb-4">Camera access is required for AR effects</p>
              <button 
                onClick={setupCamera}
                className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase rounded-full"
              >
                Retry
              </button>
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
            <button 
              onClick={() => setActiveTab('beauty')}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-widest transition-all",
                activeTab === 'beauty' ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/20" : "bg-black/40 text-white/40 backdrop-blur-md"
              )}
            >
              Beauty
            </button>
            <button 
              onClick={() => setActiveTab('magic')}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-widest transition-all",
                activeTab === 'magic' ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" : "bg-black/40 text-white/40 backdrop-blur-md"
              )}
            >
              Magic
            </button>
          </div>
        </div>

        {/* Controls Area */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {activeTab === 'beauty' ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                  <span>Skin Smoothing</span>
                  <span className="text-cyan-400">{arSettings.beautyLevel}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={arSettings.beautyLevel}
                  onChange={(e) => setArSettings(prev => ({ ...prev, beautyLevel: parseInt(e.target.value) }))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                  <span>Brightness</span>
                  <span className="text-cyan-400">{arSettings.brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={arSettings.brightness}
                  onChange={(e) => setArSettings(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Face Masks</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: null, label: 'None', icon: X },
                    { id: 'crown', label: 'Crown', icon: Crown },
                    { id: 'glasses', label: 'Glasses', icon: Glasses },
                  ].map((mask) => (
                    <button
                      key={String(mask.id)}
                      onClick={() => setArSettings(prev => ({ ...prev, activeMask: mask.id as any }))}
                      className={cn(
                        "aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all",
                        arSettings.activeMask === mask.id ? "bg-pink-500 border-pink-400 text-white" : "bg-white/5 border-white/10 text-white/40"
                      )}
                    >
                      <mask.icon size={20} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">{mask.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Virtual Background</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: null, label: 'None', icon: X },
                    { id: 'blur', label: 'Blur', icon: Maximize2 },
                    { id: 'cyan', label: 'Cyan', icon: Sparkles },
                  ].map((bg) => (
                    <button
                      key={String(bg.id)}
                      onClick={() => setArSettings(prev => ({ ...prev, virtualBackground: bg.id as any }))}
                      className={cn(
                        "aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all",
                        arSettings.virtualBackground === bg.id ? "bg-cyan-500 border-cyan-400 text-white" : "bg-white/5 border-white/10 text-white/40"
                      )}
                    >
                      <bg.icon size={20} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={onClose}
            className="w-full py-4 bg-cyan-400 text-black font-black uppercase italic tracking-widest text-xs rounded-2xl shadow-lg shadow-cyan-400/20 active:scale-95 transition-all"
          >
            Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};
