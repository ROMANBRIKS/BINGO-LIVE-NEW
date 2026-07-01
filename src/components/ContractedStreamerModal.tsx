import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ContractedStreamerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContractedStreamerModal: React.FC<ContractedStreamerModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] cursor-pointer"
          />

          {/* Modal Container: Low height, approx 33-36% of screen, rounded top */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-[24px] sm:rounded-[24px] overflow-hidden shadow-2xl z-10 flex flex-col font-sans border border-slate-100/80 pb-8"
          >
            {/* Header with Title and Close button on Right */}
            <div className="flex items-center justify-between px-6 py-5 shrink-0 relative">
              <div className="flex-1 flex justify-center pl-6">
                <h3 className="text-gray-950 font-black text-[17px] tracking-tight leading-snug select-none text-center max-w-[80%]">
                  Platform Contracted Streamer Badge
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 transition-all flex items-center justify-center text-slate-500 cursor-pointer shrink-0"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* List and Explanatory Content area with low density and exact text sizing */}
            <div className="px-7 space-y-4 select-none text-left">
              {/* Bold benefits header */}
              <p className="text-gray-800 font-extrabold text-[13px] tracking-tight">
                Benefits of becoming a signed host:
              </p>

              {/* Exact four points from user screenshot */}
              <ul className="space-y-1.5 text-slate-500 font-semibold text-[13px] leading-relaxed pl-1">
                <li className="flex items-start">
                  <span className="mr-1.5 text-slate-400">1.</span>
                  <span>Earn additional commission income</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-1.5 text-slate-400">2.</span>
                  <span>Gain more supportive traffic</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-1.5 text-slate-400">3.</span>
                  <span>Unlock all live streaming tools</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-1.5 text-slate-400">4.</span>
                  <span>Receive more official guidance</span>
                </li>
              </ul>

              {/* Bottom Path guidance text */}
              <div className="pt-4 text-slate-400 font-medium text-[12.5px]">
                <span>Visit </span>
                <span className="text-emerald-500 font-bold">Me </span>
                <span className="text-[#a1a1aa]">&gt; </span>
                <span className="text-[#0ea5e9] font-bold">Creator Center </span>
                <span className="text-[#a1a1aa]">&gt; </span>
                <span className="text-[#0ea5e9] font-bold">Live </span>
                <span>for more info.</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
