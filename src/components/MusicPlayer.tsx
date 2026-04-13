import React from 'react';
import { motion } from 'framer-motion';
import { X, Music, Play, Pause, SkipForward, SkipBack } from 'lucide-react';

interface MusicPlayerProps {
  song: { title: string, artist: string };
  onClose?: () => void;
  isHost?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ song, onClose, isHost }) => {
  const [isPlaying, setIsPlaying] = React.useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute top-40 left-4 bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3 z-30 min-w-[200px]"
    >
      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
        <Music size={20} className="text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{song.title}</p>
        <p className="text-[8px] font-bold text-white/40 truncate uppercase">{song.artist}</p>
      </div>

      <div className="flex items-center gap-2">
        {isHost && (
          <>
            <button onClick={() => setIsPlaying(!isPlaying)} className="text-white/60 hover:text-white">
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={onClose} className="text-white/20 hover:text-white/60">
              <X size={14} />
            </button>
          </>
        )}
      </div>

      {/* Visualizer bars */}
      <div className="absolute -bottom-1 left-4 right-4 flex items-end gap-0.5 h-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <motion.div
            key={i}
            animate={{ height: isPlaying ? [2, 8, 4, 6, 2] : 2 }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            className="flex-1 bg-pink-500/40 rounded-t-sm"
          />
        ))}
      </div>
    </motion.div>
  );
};
