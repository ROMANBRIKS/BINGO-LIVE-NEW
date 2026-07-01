import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Music, Radio, Sparkles } from 'lucide-react';

interface CategoryTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryTagsModal: React.FC<CategoryTagsModalProps> = ({ isOpen, onClose }) => {
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
            className="absolute inset-0 bg-black/50 backdrop-blur-[1.5px] cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-[24px] sm:rounded-[24px] overflow-hidden shadow-2xl z-10 flex flex-col font-sans border border-slate-100"
          >
            {/* Soft turquoise/greenish gradient background at top left */}
            <div className="absolute top-0 left-0 w-36 h-36 bg-gradient-to-br from-[#ccfbf1]/60 via-[#f0fdfa]/40 to-transparent rounded-br-full -z-10" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0">
              <h3 className="text-gray-900 font-black text-base tracking-tight select-none">
                Category Tags
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-100/70 hover:bg-slate-200/80 active:scale-95 transition-all flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={15} strokeWidth={3} />
              </button>
            </div>

            {/* Content List Area */}
            <div className="px-5 pb-5 space-y-4">
              {/* Soft teal container box */}
              <div className="bg-[#f2faf9]/90 border border-[#ccfbf1]/40 rounded-[16px] p-4 space-y-3 shadow-inner">
                {/* Row 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10b981]/15 border border-[#10b981]/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles size={14} className="text-[#0e9f6e] stroke-[2.5]" />
                  </div>
                  <div className="pt-0.5 text-left">
                    <p className="text-[#102a27] font-bold text-[11.5px] leading-normal">
                      Multiple styles including singing & dancing, street dance, etc.
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#0e9f6e]/10 w-full" />

                {/* Row 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Music size={14} className="text-[#7c3aed] stroke-[2.5]" />
                  </div>
                  <div className="pt-0.5 text-left">
                    <p className="text-[#2e1065] font-bold text-[11.5px] leading-normal">
                      Musical talents such as singing, DJing, instrumental performance, etc.
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#7c3aed]/10 w-full" />

                {/* Row 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ec4899]/15 border border-[#ec4899]/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Radio size={14} className="text-[#db2777] stroke-[2.5]" />
                  </div>
                  <div className="pt-0.5 text-left">
                    <p className="text-[#50072b] font-bold text-[11.5px] leading-normal">
                      Officially certified multi-talent live broadcasts
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements & Info */}
              <div className="space-y-1 px-0.5 select-none text-left">
                <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">
                  How to Obtain
                </span>
                <p className="text-gray-500 font-medium text-[11px] leading-normal">
                  Display talents repeatedly during live streams and receive the label after meeting platform criteria.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
