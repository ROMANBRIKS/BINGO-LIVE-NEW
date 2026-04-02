import React from 'react';
import { 
  X, Camera, Sparkles, Smile, Columns2, RotateCw, ZoomIn, 
  Zap, Key, Mic2, Youtube, MonitorUp, Megaphone, Music,
  Video, Newspaper, UserPlus, Gift, Gamepad2, Phone, Dog,
  CalendarHeart, Heart, Ticket, Share2, Minimize2, Wrench,
  Siren, Ban, Trash2, Monitor, Share, Video as RecorderIcon, 
  Settings, Flag, ShieldAlert, Ghost, Wrench as OptimizationIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface RoomToolsModalProps {
  onClose: () => void;
  isHost?: boolean;
  initialSection?: 'tools' | 'management' | 'games';
  onAction?: (action: string) => void;
  currentQuality?: string;
  isCleanMode?: boolean;
  isRecording?: boolean;
  isLowLatency?: boolean;
}

const HdIcon = () => (
  <div className="w-6 h-6 border-2 border-current rounded-[6px] flex items-center justify-center text-[8px] font-black leading-none">
    HD
  </div>
);

export const RoomToolsModal: React.FC<RoomToolsModalProps> = ({ 
  onClose, 
  isHost = false, 
  initialSection,
  onAction,
  currentQuality = 'HD',
  isCleanMode = false,
  isRecording = false,
  isLowLatency = false
}) => {
  // Viewer Tools Grid - EXACT REPLICATION OF THE IMAGE
  const viewerTools: { icon: any, label: string, color?: string, subLabel?: string, badge?: number }[] = [
    { icon: Share, label: 'Share' },
    { icon: RecorderIcon, label: isRecording ? 'Stop Rec' : 'Recorder', color: isRecording ? 'text-red-500' : '' },
    { icon: Minimize2, label: 'Minimize' },
    { icon: HdIcon, label: 'Quality' },
    { icon: OptimizationIcon, label: 'Watching Optimization' },
    { icon: Gift, label: 'Gift Settings' },
    { icon: Flag, label: 'REPORT' },
    { icon: Ban, label: 'Block' },
    { icon: Ghost, label: isCleanMode ? 'Exit Clean' : 'Clean Mode' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      {/* Semi-transparent Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
      />
      
      {/* Bottom Sheet Modal */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full bg-white rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh] pb-12"
      >
        {/* Drag Handle Indicator */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />

        {/* Modal Header */}
        <div className="px-8 py-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Room Tools</h2>
        </div>

        {/* Tools Grid - Replicating the image exactly */}
        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
          <div className="grid grid-cols-5 gap-y-10 gap-x-3">
            {viewerTools.map((tool, i) => (
              <button 
                key={i} 
                onClick={() => {
                  if (onAction) {
                    const action = tool.label === 'Exit Clean' ? 'Clean Mode' : 
                                 (tool.label === 'Stop Rec' ? 'Recorder' : tool.label);
                    onAction(action);
                  }
                  onClose();
                }}
                className="flex flex-col items-center gap-3 group active:scale-95 transition-transform"
              >
                <div className={cn(
                  "relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-sm",
                  "bg-slate-50 text-slate-600 border border-slate-100/50 group-active:bg-slate-100"
                )}>
                  <tool.icon size={28} strokeWidth={1.5} className={tool.color} />
                  {tool.badge && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {tool.badge}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-400 text-center leading-tight group-active:text-slate-900 transition-colors h-8 flex items-start justify-center px-1">
                  {tool.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
