import React from 'react';
import { motion } from 'framer-motion';
import { X, Youtube } from 'lucide-react';

interface YoutubePlayerProps {
  videoId: string;
  onClose?: () => void;
  isHost?: boolean;
}

export const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ videoId, onClose, isHost }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute top-24 left-4 right-4 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-30"
    >
      <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Youtube size={16} className="text-red-500" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Watching Together</span>
        </div>
        {isHost && (
          <button 
            onClick={onClose}
            className="p-1 bg-black/40 rounded-full text-white/60 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="pointer-events-none"
      />
      
      {/* Overlay to prevent interaction with iframe but allow viewing */}
      <div className="absolute inset-0 z-0" />
    </motion.div>
  );
};
