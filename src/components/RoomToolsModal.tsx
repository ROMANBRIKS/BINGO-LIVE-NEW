import React from 'react';
import { 
  X, Camera, Sparkles, Smile, Columns2, RotateCw, ZoomIn, 
  Zap, Key, Mic2, Youtube, MonitorUp, Megaphone, Music,
  Video, Newspaper, UserPlus, Gift, Gamepad2, Phone, Dog,
  CalendarHeart, Heart, Ticket, Share2, Minimize2, Wrench,
  Siren, Ban, Trash2, Monitor
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
  <div className="w-5 h-5 border-[1.5px] border-current rounded-[4px] flex items-center justify-center text-[7px] font-black leading-none">
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
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialSection && scrollRef.current) {
      const section = scrollRef.current.querySelector(`[data-section="${initialSection}"]`);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [initialSection]);

  const viewerTools: { icon: any, label: string, color?: string, subLabel?: string, badge?: number }[] = [
    { icon: Share2, label: 'Share' },
    { icon: Video, label: isRecording ? 'Stop Rec' : 'Recorder', color: isRecording ? 'text-red-500' : '' },
    { icon: Minimize2, label: 'Minimize' },
    { icon: HdIcon, label: 'Quality', subLabel: currentQuality },
    { icon: Wrench, label: 'Watching Optimization', subLabel: isLowLatency ? 'Low Latency' : 'Standard' },
    { icon: Gift, label: 'Gift Settings' },
    { icon: Siren, label: 'REPORT' },
    { icon: Ban, label: 'Block' },
    { icon: Trash2, label: isCleanMode ? 'Exit Clean' : 'Clean Mode' },
  ];

  const roomTools: { icon: any, label: string, color?: string, subLabel?: string, badge?: number }[] = [
    { icon: Camera, label: 'Camera' },
    { icon: Sparkles, label: 'Beauty' },
    { icon: Smile, label: 'Mask' },
    { icon: Columns2, label: 'Mirror' },
    { icon: RotateCw, label: 'Flip' },
    { icon: ZoomIn, label: 'Zoom in' },
    { icon: Zap, label: 'Flash' },
    { icon: Key, label: 'Key Settings' },
    { icon: Mic2, label: 'Singing Mode' },
    { icon: Youtube, label: 'Youtube' },
    { icon: MonitorUp, label: 'Share Screen' },
    { icon: Megaphone, label: 'DIY Notify', badge: 1 },
    { icon: Music, label: 'Music' },
    { icon: Phone, label: 'Line' },
    { icon: Dog, label: 'Pet' },
    { icon: CalendarHeart, label: 'Date' },
  ];

  const otherTools: { icon: any, label: string, color?: string, subLabel?: string, badge?: number }[] = [
    { icon: Video, label: 'Recorder' },
    { icon: Newspaper, label: 'Viewer\'s Info' },
    { icon: UserPlus, label: 'Newcomers' },
    { icon: Gift, label: 'Gift Sound' },
    { icon: Heart, label: 'Wish lists' },
    { icon: Ticket, label: 'Fan Lottery' },
    { icon: Smile, label: 'Sticker' },
  ];

  const games: { icon: any, label: string, color?: string, subLabel?: string, badge?: number }[] = [
    { icon: '🎨', label: 'Draw Guess', color: 'bg-blue-500/20 text-blue-400' },
    { icon: '🎡', label: 'Turntable', color: 'bg-indigo-500/20 text-indigo-400' },
    { icon: '🎰', label: 'Big Winner', color: 'bg-purple-500/20 text-purple-400' },
    { icon: '⚔️', label: 'Group PK', color: 'bg-pink-500/20 text-pink-400' },
    { icon: '🦖', label: 'Dino', color: 'bg-cyan-500/20 text-cyan-400' },
    { icon: '💰', label: 'Earn Money', color: 'bg-orange-500/20 text-orange-400' },
    { icon: '📘', label: 'Guide', color: 'bg-yellow-500/20 text-yellow-400' },
    { icon: '🏆', label: 'PK Qualifying', color: 'bg-slate-500/20 text-slate-400' },
    { icon: '🎁', label: 'Gift Wall', color: 'bg-violet-500/20 text-violet-400' },
    { icon: '🤝', label: 'Match', color: 'bg-cyan-500/20 text-cyan-400' },
    { icon: '🦀', label: 'Craw', color: 'bg-blue-600/20 text-blue-500' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-slate-900">Room Tools</h2>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 pb-8 space-y-8 no-scrollbar bg-white">
            {/* Main Tools Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-5 gap-y-6 gap-x-2">
                {viewerTools.map((tool, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (onAction) {
                        const action = tool.label === 'Exit Clean' ? 'Clean Mode' : 
                                     (tool.label === 'Stop Rec' ? 'Recorder' : tool.label);
                        onAction(action);
                      } else {
                        onClose();
                      }
                    }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={cn(
                      "relative w-14 h-14 rounded-full flex items-center justify-center transition-all",
                      tool.color ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-600 group-hover:bg-slate-100"
                    )}>
                      <tool.icon size={24} strokeWidth={1.5} />
                      {tool.badge && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                          {tool.badge}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 text-center leading-tight group-hover:text-slate-900 transition-colors h-8 flex items-start justify-center">
                      {tool.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Other Tools Section */}
            <div className="space-y-4" data-section="management">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1 h-3 bg-purple-500 rounded-full" />
                Other Tools
              </h3>
              <div className="grid grid-cols-5 gap-y-6 gap-x-2">
                {otherTools.map((tool, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (onAction) {
                        onAction(tool.label);
                      } else {
                        onClose();
                      }
                    }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-slate-100 transition-all">
                      <tool.icon size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 text-center leading-tight group-hover:text-slate-900 transition-colors h-8 flex items-start justify-center">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Play Center Section */}
            <div className="space-y-4" data-section="games">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1 h-3 bg-cyan-500 rounded-full" />
                Play Center
              </h3>
              <div className="grid grid-cols-5 gap-y-6 gap-x-2">
                {games.map((game, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (onAction) {
                        onAction(game.label);
                      } else {
                        onClose();
                      }
                    }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm group-hover:shadow-lg transition-all", game.color)}>
                      {game.icon}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 text-center leading-tight group-hover:text-slate-900 transition-colors h-8 flex items-start justify-center">{game.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Host Tools (Only if isHost) */}
            {isHost && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-3 bg-orange-500 rounded-full" />
                  Broadcast Tools
                </h3>
                <div className="grid grid-cols-5 gap-y-6 gap-x-2">
                  {roomTools.map((tool, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        if (onAction) {
                          onAction(tool.label);
                        } else {
                          onClose();
                        }
                      }}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-slate-100 transition-all">
                        <tool.icon size={24} strokeWidth={1.5} />
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 text-center leading-tight group-hover:text-slate-900 transition-colors h-8 flex items-start justify-center">{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all border border-slate-200"
            >
              Close Panel
            </button>
          </div>
        </motion.div>
      </div>
  );
};
