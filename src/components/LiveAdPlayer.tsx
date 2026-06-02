import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, VolumeX, ExternalLink, Settings, ShieldAlert, Sparkles, RefreshCw, Globe, ShieldCheck, X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { registerAdImpression, detectViewerLocation, LocationData, REGIONAL_CPM_TABLE } from '../services/adTrackerService';

interface LiveAdPlayerProps {
  roomId: string;
  hostUid: string;
  isHost: boolean;
}

interface AdCampaign {
  id: string;
  brand: string;
  headline: string;
  category: string;
  visualIcon: string;
  bgGradient: string;
  description: string;
  companyUrl: string;
}

const SPONSOR_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'campaign_alpha',
    brand: 'GOOGLE Cloud',
    headline: 'Powering Live Media Systems',
    category: 'Sponsor Content',
    visualIcon: '🌐',
    bgGradient: 'from-blue-950/90 via-slate-900/95 to-slate-950/90 border-blue-500/20',
    description: 'Scalable infrastructure for real-time video streaming with microsecond latencies.',
    companyUrl: 'https://cloud.google.com'
  },
  {
    id: 'campaign_beta',
    brand: 'NVIDIA STREAM',
    headline: 'AI Beauty Broadcast SDK',
    category: 'Premium Ads Space',
    visualIcon: '⚡',
    bgGradient: 'from-emerald-950/90 via-slate-900/95 to-slate-950/90 border-emerald-500/20',
    description: 'Unlocking next-gen virtual backgrounds, noise removal, and custom avatars.',
    companyUrl: 'https://nvidia.com'
  },
  {
    id: 'campaign_gamma',
    brand: 'VESPER RACING',
    headline: 'Virtual Premium Simulator',
    category: 'Corporate Partner',
    visualIcon: '🏎️',
    bgGradient: 'from-purple-950/90 via-slate-900/95 to-slate-950/90 border-purple-500/20',
    description: 'Virtual premium lobby features and immersive visual effects for VIP top-ups.',
    companyUrl: 'https://vesper.io'
  }
];

export function LiveAdPlayer({ roomId, hostUid, isHost }: LiveAdPlayerProps) {
  const { showToast } = useToast();
  const [currentCampaignIdx, setCurrentCampaignIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showTools, setShowTools] = useState(false);
  const [adTimeProgress, setAdTimeProgress] = useState(100);
  
  // Geolocation & VPN states
  const [simulateVpn, setSimulateVpn] = useState(false);
  const [geoData, setGeoData] = useState<LocationData | null>(null);
  const [isRefreshingGeo, setIsRefreshingGeo] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);

  const campaign = SPONSOR_CAMPAIGNS[currentCampaignIdx];

  // Load geo on mount / mode toggle
  useEffect(() => {
    let active = true;
    const fetchGeo = async () => {
      setIsRefreshingGeo(true);
      const data = await detectViewerLocation(simulateVpn);
      if (active) {
        setGeoData(data);
        setIsRefreshingGeo(false);
      }
    };
    fetchGeo();
    return () => {
      active = false;
    };
  }, [simulateVpn]);

  // Main ad timing cycle
  useEffect(() => {
    setAdTimeProgress(100);
    const interval = setInterval(() => {
      setAdTimeProgress(prev => {
        if (prev <= 2) {
          // Switch campaign and log impression!
          setCurrentCampaignIdx(current => (current + 1) % SPONSOR_CAMPAIGNS.length);
          triggerAdImpression();
          return 100;
        }
        return prev - 2.5; // Loop runs approx every ~16 seconds
      });
    }, 400);

    return () => clearInterval(interval);
  }, [currentCampaignIdx, simulateVpn, hostUid]);

  // Execute actual ad impression logger
  const triggerAdImpression = async (forceImpression = false) => {
    // If the streamer themselves is watching, do not reward (no self-farming)
    if (isHost && !forceImpression) {
      return; 
    }

    const currentCampaign = SPONSOR_CAMPAIGNS[currentCampaignIdx];
    const res = await registerAdImpression({
      hostUid,
      campaignId: currentCampaign.id,
      campaignBrand: currentCampaign.brand,
      simulateVpn: simulateVpn
    });

    if (res.success) {
      const logsLimit = 6;
      setSessionLogs(prev => [
        {
          id: `log_${Date.now()}`,
          campaign: currentCampaign.brand,
          country: res.data.countryCode,
          isVpn: res.data.isVpnDetected,
          earned: res.earned,
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, logsLimit - 1)
      ]);

      // Only show toast alerts if explicitly forced or simulated to avoid user banner fatigue
      if (forceImpression) {
        if (res.data.isVpnDetected) {
          showToast("⚠️ Ad view flagged: VPN blocked. 0 Ad Beans credited to prevent fraudulent clicks.", "error");
        } else if (res.earned > 0) {
          showToast(`💥 Ad Impression Cleared! Earned +${res.earned.toFixed(3)} Ad Beans (${res.data.countryCode})`, "success");
        }
      }
    }
  };

  const handleCtaClick = () => {
    showToast(`Opening Campaign Portal (${campaign.brand})... 🚀`, 'info');
    triggerAdImpression(true); // Force extra test impression on CTA interaction
  };

  return (
    <>
      <div className="absolute z-[100] top-[calc(env(safe-area-inset-top,0px)+125px)] md:top-[85px] right-1.5 w-[94px] md:w-[110px] transition-all duration-300 ease-out pointer-events-auto">
        <motion.div 
          layout
          className="bg-gradient-to-br from-[#1b1408] via-[#241c0e] to-[#120e06] border-2 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)] rounded-2xl p-2 overflow-hidden relative group"
        >
          {/* Golden Crown Icon & Header */}
          <div className="flex items-center justify-between gap-1 mb-1 z-10 relative border-b border-amber-500/20 pb-1">
            <div className="flex items-center gap-0.5 text-amber-400 font-extrabold text-[6px] md:text-[7px] uppercase tracking-wider">
              <span>👑 AD LIVE</span>
            </div>

            <div className="flex items-center gap-1">
              {/* Dev Gear Tool Button */}
              <button 
                onClick={() => setShowTools(true)}
                className="text-amber-500 hover:text-amber-300 transition-colors cursor-pointer"
                title="CPM/VPN Guard Settings"
              >
                <Settings size={8} />
              </button>

              <button 
                onClick={() => {
                  setCurrentCampaignIdx(current => (current + 1) % SPONSOR_CAMPAIGNS.length);
                  showToast("Cycled Sponsor Space", 'info');
                }}
                className="px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[5px] font-black text-amber-300 hover:bg-amber-500/20 transition-all uppercase tracking-wider cursor-pointer"
              >
                NEXT
              </button>
            </div>
          </div>

          {/* Sponsor Content Body */}
          <div className="flex flex-col gap-1 my-1 text-center">
            <div className="w-5.5 h-5.5 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs shrink-0 mx-auto shadow-inner animate-pulse">
              {campaign.visualIcon}
            </div>

            <div className="min-w-0">
              <span className="text-[6.5px] font-bold text-amber-400 tracking-wider truncate uppercase block leading-none">
                {campaign.brand}
              </span>
              <h3 className="text-[8px] font-black uppercase tracking-tight text-stone-200 mt-0.5 leading-tight truncate">
                {campaign.headline}
              </h3>
            </div>
          </div>

          {/* Micro CPM Region Indicator Badge */}
          {geoData && (
            <div className={`mt-0.5 mb-1 py-0.5 px-1 rounded flex items-center justify-center gap-0.5 border text-[5px] font-bold uppercase tracking-widest ${
              geoData.isVpnDetected 
                ? 'bg-rose-950/40 text-rose-400 border-rose-500/20' 
                : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
            }`}>
              <Globe size={5} />
              <span>{geoData.countryCode} {geoData.isVpnDetected ? '• VPN' : ''}</span>
            </div>
          )}

          {/* Bottom Control Actions (Mute & support trigger) */}
          <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-amber-500/20">
            <div className="flex items-center gap-0.5 shrink-0">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-amber-500/70 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX size={8} /> : <Volume2 size={8} />}
              </button>
            </div>

            <button 
              onClick={handleCtaClick}
              className="px-1 py-0.5 bg-amber-500 text-black font-extrabold rounded text-[5px] uppercase tracking-wider hover:bg-amber-400 transition-all flex items-center gap-0.5 cursor-pointer"
            >
              CTA Payout
            </button>
          </div>

          {/* Symmetrical golden bottom reload status bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-950/40">
            <div 
              style={{ width: `${adTimeProgress}%` }}
              className="h-full bg-amber-400 transition-all duration-300"
            />
          </div>
        </motion.div>
      </div>

      {/* Dev / Auditor Config Modal */}
      <AnimatePresence>
        {showTools && (
          <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b0c0d] border border-white/10 rounded-[2.5rem] w-full max-w-md p-6 relative overflow-hidden text-white"
            >
              {/* Background amber glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tight text-amber-400 flex items-center gap-1.5">
                    👑 CPM Tracker & VPN Shield Control
                  </h3>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Demolabs Live Traffic Regulator</p>
                </div>
                <button 
                  onClick={() => setShowTools(false)}
                  className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Geolocation Audit Desk */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-zinc-400 uppercase tracking-wider">Estimated Client Geolocation</span>
                    {isRefreshingGeo ? (
                      <RefreshCw size={12} className="animate-spin text-amber-500" />
                    ) : (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 font-extrabold px-1.5 py-0.5 rounded uppercase">ACTIVE GPS</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest">Detected IP Country</span>
                      <span className="font-bold text-white uppercase">{geoData?.countryName || 'Detecting...'} ({geoData?.countryCode || 'XX'})</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest">Network IP Address</span>
                      <span className="font-mono text-zinc-300">{geoData?.ip || '0.0.0.0'}</span>
                    </div>
                  </div>

                  {/* VPN Guard Shield Alert */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    geoData?.isVpnDetected 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      {geoData?.isVpnDetected ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {geoData?.isVpnDetected ? 'VPN SECURE INTERCEPT ACTIVE' : 'CLEAN ORGANIC TRAFFIC VERIFIED'}
                      </span>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest">
                      {geoData?.isVpnDetected ? 'Fraud Shielded' : '100% Eligible'}
                    </span>
                  </div>
                </div>

                {/* Simulated Geolocation & VPN Toggle Controls */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Simulation Control Deck</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSimulateVpn(prev => !prev);
                        showToast(`Simulated VPN Route turned ${!simulateVpn ? 'ON' : 'OFF'}! 🛡️`, 'info');
                      }}
                      className={`flex-1 py-3 text-[10px] font-black uppercase italic tracking-wider rounded-xl transition-all border ${
                        simulateVpn 
                          ? 'bg-rose-500 text-black border-rose-400 shadow-lg shadow-rose-500/20' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                      }`}
                    >
                      {simulateVpn ? 'Disable Mock VPN' : 'Simulate Proxy/VPN Routing'}
                    </button>

                    <button 
                      onClick={() => triggerAdImpression(true)}
                      className="px-4 bg-amber-500 text-black rounded-xl font-black text-[10px] uppercase italic tracking-wider hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={12} fill="currentColor" />
                      Mock Ad View
                    </button>
                  </div>
                </div>

                {/* CPM Matrix Grid Table */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Platform Geotargeting List (CPM)</span>
                  <div className="max-h-[110px] overflow-y-auto no-scrollbar border-t border-white/5 pt-2 text-[10px] space-y-1">
                    {Object.entries(REGIONAL_CPM_TABLE).map(([code, m]) => (
                      <div key={code} className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="font-semibold text-zinc-400">{m.label} ({code})</span>
                        <div className="font-extrabold flex gap-3 text-right">
                          <span className="text-cyan-400">cpm: ${m.cpm.toFixed(2)}</span>
                          <span className="text-amber-400">+{m.beansPerImp.toFixed(2)}b / view</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Viewer Stream Logs */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.15em] ml-1">Session Impression History</div>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
                    {sessionLogs.map(log => (
                      <div key={log.id} className="p-2.5 bg-[#080809] border border-white/5 rounded-xl flex items-center justify-between text-[10px]">
                        <div>
                          <p className="font-black text-stone-200 uppercase">{log.campaign}</p>
                          <p className="text-[8px] text-zinc-500 uppercase mt-0.5">{log.timestamp} • Location: {log.country}</p>
                        </div>
                        <div className="text-right">
                          {log.isVpn ? (
                            <span className="text-[8px] text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">BLOCKED (VPN)</span>
                          ) : (
                            <span className="text-emerald-400 font-extrabold">+{log.earned.toFixed(3)} ad beans</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {sessionLogs.length === 0 && (
                      <div className="py-6 text-center border border-dashed border-white/5 rounded-xl text-zinc-500 font-bold uppercase italic text-[9px] tracking-widest uppercase">
                        Pending impression broadcast data...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
