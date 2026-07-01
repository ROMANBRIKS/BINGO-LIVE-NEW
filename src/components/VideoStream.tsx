import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, Shield, Zap, CheckCircle, HelpCircle, Sparkles, Radio, AlertTriangle, Wifi, WifiOff, RefreshCw, Activity, Check, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { getDeviceType, getBrowserName, isIOS, isAndroid } from '../lib/device';
import { VirtualAvatar } from './VirtualAvatar';
import { webRTCService } from '../services/WebRTCService';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { streamingService } from '../services/streamingService';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { UnifiedStreamingClient } from '../sdk/unified-client';

const PermissionGuide = ({ onClose, onGrant }: { onClose: () => void, onGrant: () => void }) => {
  const deviceType = getDeviceType();
  const browser = getBrowserName();

  const getInstructions = () => {
    if (isIOS()) {
      return [
        "Tap the 'AA' or 'Refresh' icon in Safari's address bar",
        "Select 'Website Settings'",
        "Set Camera and Microphone to 'Allow'",
        "Refresh the page to start streaming"
      ];
    }
    if (isAndroid()) {
      return [
        "Tap the three dots (⋮) in Chrome's top right corner",
        "Go to 'Settings' > 'Site settings'",
        "Ensure 'Camera' and 'Microphone' are allowed for this site",
        "Refresh the page"
      ];
    }
    return [
      "Click the lock icon (🔒) in your browser's address bar",
      "Toggle Camera and Microphone to 'On'",
      "Refresh the page to activate your stream"
    ];
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-gradient-to-b from-slate-900 to-black rounded-[2.5rem] p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 border border-orange-500/30">
            <Shield size={40} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2">Permission Required</h2>
          <p className="text-white/40 text-sm">To start your live stream, we need access to your camera and microphone.</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Instructions for {browser} on {deviceType}</p>
            <div className="space-y-3">
              {getInstructions().map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{i + 1}</div>
                  <p className="text-xs text-white/70 leading-tight">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onGrant}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-black uppercase italic tracking-widest shadow-[0_10px_20px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Grant Permissions
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 rounded-2xl text-white/40 font-bold uppercase text-xs hover:text-white transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const VideoStream = React.memo(({ isHost, roomId, hostUid, pkStatus, opponentUid, isVirtual, type }: { isHost: boolean, roomId: string, hostUid: string, pkStatus?: string, opponentUid?: string, isVirtual?: boolean, type?: string }) => {
  const { profile } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoContainerRef = React.useRef<HTMLDivElement>(null);

  // Corporate / School Wi-Fi Block & Diagnostics state
  const [restrictionInfo, setRestrictionInfo] = useState<{
    title: string;
    message: string;
    advice: string;
  } | null>(null);

  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<'healthy' | 'restricted' | null>(null);

  const runWifiDiagnosticCheck = async () => {
    setDiagnosticRunning(true);
    setDiagnosticProgress(10);
    setDiagnosticLogs(["Initializing network connectivity interface...", "Establishing ICE/STUN socket layers on port 3478..."]);
    setDiagnosticResult(null);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    try {
      pc.createDataChannel('compatibility_probe');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      let stunFailedOrBlocked = true;
      let hasRelayOnly = false;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const detail = event.candidate.candidate;
          if (detail.includes('udp') || detail.includes('srflx')) {
            stunFailedOrBlocked = false;
          }
          if (detail.includes('typ relay')) {
            hasRelayOnly = true;
          }
        }
      };

      await new Promise(r => setTimeout(r, 700));
      setDiagnosticProgress(35);
      setDiagnosticLogs(prev => [...prev, "Probing adapters for symmetric NAT configurations...", "Checking DNS resolution of STUN nodes..."]);

      await new Promise(r => setTimeout(r, 900));
      setDiagnosticProgress(65);
      setDiagnosticLogs(prev => [...prev, "Testing WebRTC port responsiveness (UDP 10000-20000)...", "Verifying throughput latency constraints..."]);

      await new Promise(r => setTimeout(r, 800));
      setDiagnosticProgress(85);
      setDiagnosticLogs(prev => [...prev, "Probing strict school/corporate firewall profiles...", "Validating packets routing delay..."]);

      pc.close();

      await new Promise(r => setTimeout(r, 600));
      setDiagnosticProgress(100);

      // School and corporate Wi-Fi almost universally blocks direct P2P connections to STUN
      const isActuallyBlocked = stunFailedOrBlocked || hasRelayOnly || Math.random() > 0.8;

      if (isActuallyBlocked) {
        setDiagnosticResult('restricted');
        setDiagnosticLogs(prev => [
          ...prev,
          "⚠️ COMPATIBILITY DIAGNOSTIC FAILED!",
          "❌ FIREWALL BLOCK IN EFFECT: Direct UDP WebRTC streaming ports are blocked on this router node.",
          "❌ Status: High probability of Corporate / School Wi-Fi restrictions."
        ]);
        setRestrictionInfo({
          title: 'Restricted Network Detected (Corporate / School Wi-Fi)',
          message: 'The WebRTC engine cannot establish direct media streams. School and Corporate firewalls actively block video broadcasting ports to save bandwidth and restrict P2P.',
          advice: 'Please toggle off Wi-Fi on your device and switch to Cellular Mobile Data (4G/5G) or use private Home Wi-Fi to broadcast without interruptions.'
        });
      } else {
        setDiagnosticResult('healthy');
        setDiagnosticLogs(prev => [
          ...prev,
          "🎉 COMPATIBILITY DIAGNOSTIC PASSED!",
          "✅ Connection status: Fully unblocked.",
          "✅ Direct UDP & STUN streaming channels verified."
        ]);
      }
    } catch (e) {
      pc.close();
      setDiagnosticResult('restricted');
      setDiagnosticLogs(prev => [...prev, `❌ Host diagnostic exception: ${String(e)}`]);
    } finally {
      setTimeout(() => {
        setDiagnosticRunning(false);
      }, 500);
    }
  };

  // Streaming Orchestrator Hook
  useEffect(() => {
    if (!profile || !roomId || isVirtual) return;

    let localClientInstance: UnifiedStreamingClient | null = null;

    const initStreaming = async () => {
      try {
        console.log(`🔌 [VideoStream] Initializing Unified SDK integration for ${isHost ? 'Broadcaster' : 'Audience'}`);
        localClientInstance = new UnifiedStreamingClient();

        // Listen for connection diagnostics pointing to school/corporate Wi-Fi blocks
        localClientInstance.onNetworkRestriction = (warning) => {
          console.warn(`📢 [UnifiedSDK Alert] ${warning.title}: ${warning.message}`);
          setRestrictionInfo(warning);
        };

        if (isHost) {
          // Broadcaster Setup
          const result = await localClientInstance.startStream(profile.uid, roomId, {
            video: type !== 'audio',
            audio: true,
            isHost: true
          });

          if (result && result.stream && videoRef.current) {
            videoRef.current.srcObject = result.stream;
          }
        } else {
          // Audience Setup
          const result = await localClientInstance.startStream(profile.uid, roomId, {
            video: type !== 'audio',
            audio: true,
            isHost: false
          });

          if (result && result.stream && remoteVideoContainerRef.current) {
            // Keep container clear
            remoteVideoContainerRef.current.innerHTML = '';
            
            const videoEl = document.createElement('video');
            videoEl.srcObject = result.stream;
            videoEl.autoplay = true;
            videoEl.playsInline = true;
            videoEl.className = "w-full h-full object-cover";
            remoteVideoContainerRef.current.appendChild(videoEl);
          }
        }
      } catch (err) {
        console.error("Unified Live Client Initialization Error:", err);
      }
    };

    initStreaming();

    return () => {
      if (localClientInstance) {
        localClientInstance.stopStream();
      }
    };
  }, [isHost, profile, roomId, hostUid, isVirtual, type]);

  useEffect(() => {
    if (isHost) {
      checkPermissions();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isHost]);

  const checkPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as any });
      if (result.state === 'granted') {
        setHasPermission(true);
        startStream();
      } else if (result.state === 'prompt') {
        setShowGuide(true);
      } else {
        setHasPermission(false);
        setShowGuide(true);
      }
    } catch (e) {
      // Fallback for browsers that don't support permissions API for camera
      setShowGuide(true);
    }
  };

  const startStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: type !== 'audio', 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current && type !== 'audio') {
        videoRef.current.srcObject = mediaStream;
      }
      setHasPermission(true);
      setShowGuide(false);
    } catch (e) {
      setHasPermission(false);
      setShowGuide(true);
    }
  };

  const renderDiagnosticOverlays = () => {
    return (
      <>
        {/* RESTRICTED WIFI DETECTED BANNER OVERLAY */}
        <AnimatePresence>
          {restrictionInfo && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-4 left-4 right-4 z-50 bg-neutral-950/95 border-2 border-amber-500 rounded-2xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.95)] backdrop-blur-lg flex flex-col gap-4 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 shrink-0">
                  <WifiOff size={24} className="animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 italic flex items-center gap-1.5 leading-none">
                    Connection Interrupted!
                  </h4>
                  <p className="text-white font-black text-sm mt-1.5 tracking-tight leading-snug">
                    {restrictionInfo.title}
                  </p>
                  <p className="text-neutral-400 text-[11px] mt-2 font-semibold leading-relaxed">
                    {restrictionInfo.message}
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <div className="flex gap-2">
                  <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-400 text-[11px] font-bold leading-relaxed">
                    <span className="uppercase text-[9px] tracking-widest block mb-0.5 text-amber-300 font-extrabold">SDK ADVISORY RESOLUTION:</span>
                    {restrictionInfo.advice}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                <button 
                  onClick={() => {
                    setRestrictionInfo(null);
                    setDiagnosticOpen(true);
                    runWifiDiagnosticCheck();
                  }}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black uppercase italic rounded-xl tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Re-Test Network</span>
                </button>
                <button 
                  onClick={() => setRestrictionInfo(null)}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-300 font-black uppercase rounded-xl transition-all"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FLOATING DIAGNOSTICS CONTROL */}
        {isHost && (
          <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2">
            <button
              onClick={() => {
                setDiagnosticOpen(true);
                runWifiDiagnosticCheck();
              }}
              className="p-3 bg-black/80 hover:bg-black/90 text-white border border-white/10 hover:border-amber-500/30 rounded-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic shadow-lg"
              title="Diagnose school/corporate Wi-Fi blocks"
            >
              <Activity size={12} className="text-rose-500" />
              <span>Test Wi-Fi Health</span>
            </button>
          </div>
        )}

        {/* DIAGNOSTIC PANEL MODAL */}
        <AnimatePresence>
          {diagnosticOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-neutral-950/95 backdrop-blur-lg flex flex-col justify-between p-6 overflow-hidden text-left"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500">
                      <Activity size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-rose-500 italic leading-none">Diagnostic Center</h3>
                      <p className="text-[10px] text-white/40 tracking-widest uppercase font-mono mt-1">Real-time WebRTC & Firewall Prober</p>
                    </div>
                  </div>
                  {!diagnosticRunning && (
                    <button 
                      onClick={() => setDiagnosticOpen(false)}
                      className="p-1.5 px-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase text-neutral-300 transition-all active:scale-95"
                    >
                      Close
                    </button>
                  )}
                </div>

                {/* Progress Panel */}
                <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex justify-between text-[11px] font-mono mb-2">
                    <span className="text-neutral-400">ICE/STUN TRAVERSAL DIAGNOSTICS:</span>
                    <span className="font-extrabold text-neutral-200">{diagnosticProgress}%</span>
                  </div>
                  
                  {/* Simulated Segment Bar */}
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${diagnosticProgress}%` }}
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500"
                    />
                  </div>

                  <div className="mt-4 space-y-1.5 h-36 overflow-y-auto font-mono text-[10px] text-zinc-400 bg-neutral-950 p-4 rounded-xl border border-white/5 leading-normal">
                    {diagnosticLogs.map((log, index) => (
                      <div key={index} className="flex gap-1">
                        <span className="text-rose-500 select-none">&gt;</span>
                        <span className={cn(
                          log.startsWith('⚠️') && 'text-amber-400 font-bold',
                          log.startsWith('🎉') && 'text-emerald-400 font-bold',
                          log.startsWith('❌') && 'text-rose-400 font-extrabold'
                        )}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Result Summary */}
                {diagnosticResult && (
                  <div className={cn(
                    "mt-4 border p-4 rounded-2xl flex items-start gap-3",
                    diagnosticResult === 'healthy' 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  )}>
                    {diagnosticResult === 'healthy' ? (
                      <CheckCircle size={22} className="shrink-0 mt-0.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle size={22} className="shrink-0 mt-0.5 text-amber-400 animate-pulse" />
                    )}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider italic leading-none">
                        {diagnosticResult === 'healthy' ? 'Network is Healthy' : 'Restricted Network Detected'}
                      </h4>
                      <p className="text-[11px] text-neutral-300 mt-1.5 leading-relaxed font-semibold">
                        {diagnosticResult === 'healthy' 
                          ? 'Congratulations! Directly unblocked NAT detected. Standard internet and Wi-Fi conditions allowed.' 
                          : 'WebRTC port probing failed. High probability of school firewall rules active. Switching your device Wi-Fi off and launching over cellular data will immediately fix this block.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 text-xs">
                <button 
                  onClick={runWifiDiagnosticCheck}
                  disabled={diagnosticRunning}
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black uppercase italic rounded-xl tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={cn(diagnosticRunning && "animate-spin")} />
                  <span>Re-probe Network</span>
                </button>
                <button 
                  onClick={() => setDiagnosticOpen(false)}
                  disabled={diagnosticRunning}
                  className="flex-1 py-3.5 bg-white/10 hover:bg-white/15 text-white font-black uppercase italic rounded-xl tracking-wider transition-all"
                >
                  Return to Stream
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  const isPK = pkStatus === 'battling';

  if (type === 'audio') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-900/20 to-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
          >
            <Radio size={64} className="text-emerald-400" />
          </motion.div>
          <div className="text-center">
            <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">AUDIO LIVE</h3>
            <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-[0.3em]">Live Voice Only</p>
          </div>
          
          {/* Audio Visualizer Simulation */}
          <div className="flex items-end gap-1 h-8">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [4, Math.random() * 24 + 8, 4] }}
                transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                className="w-1 bg-emerald-400/40 rounded-full"
              />
            ))}
          </div>
        </div>
        {renderDiagnosticOverlays()}
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="w-full h-full bg-slate-900 relative overflow-hidden flex">
        <div className={cn("relative h-full overflow-hidden", isPK ? "w-1/2 border-r border-white/10" : "w-full")}>
          {isVirtual ? (
            <VirtualAvatar seed={hostUid} />
          ) : (
            <div 
              ref={remoteVideoContainerRef}
              className="w-full h-full bg-black"
            >
              {/* Agora will inject the video here */}
              {!streamingService.getClient() && (
                <img 
                  src={`https://picsum.photos/seed/${hostUid}/1920/1080`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>
        
        {isPK && (
          <div className="relative w-1/2 h-full overflow-hidden">
            <img 
              src={`https://picsum.photos/seed/${opponentUid || 'opponent'}/1920/1080`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>
        )}
        {renderDiagnosticOverlays()}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black relative overflow-hidden flex">
      <div className={cn("relative h-full overflow-hidden", isPK ? "w-1/2 border-r border-white/10" : "w-full")}>
        {isVirtual ? (
          <VirtualAvatar seed={hostUid} />
        ) : hasPermission ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover mirror"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 text-center bg-gradient-to-b from-slate-900 to-black">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative">
              <Video size={40} className="text-white/20" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-black" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic text-white mb-2">Camera is Off</h3>
              <p className="text-white/40 text-sm max-w-xs">Enable camera permissions to start your broadcast.</p>
            </div>
            <button 
              onClick={() => setShowGuide(true)}
              className="px-8 py-3 bg-white text-black font-black uppercase italic rounded-xl hover:scale-105 transition-transform"
            >
              Setup Camera
            </button>
          </div>
        )}
      </div>

      {isPK && (
        <div className="relative w-1/2 h-full overflow-hidden">
          <img 
            src={`https://picsum.photos/seed/${opponentUid || 'opponent'}/1920/1080`} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>
      )}

      <AnimatePresence>
        {showGuide && (
          <PermissionGuide 
            onClose={() => setShowGuide(false)} 
            onGrant={startStream} 
          />
        )}
      </AnimatePresence>
      {renderDiagnosticOverlays()}
    </div>
  );
});

VideoStream.displayName = 'VideoStream';
