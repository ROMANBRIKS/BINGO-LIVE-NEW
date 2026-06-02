import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

interface OfficialHostGateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function OfficialHostGateModal({ onClose, onSuccess }: OfficialHostGateModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [applyStep, setApplyStep] = useState(0);

  const handleApply = () => {
    setIsApplying(true);
    setApplyStep(0);

    // Step 1
    const timer1 = setTimeout(() => {
      setApplyStep(1);
    }, 900);

    // Step 2
    const timer2 = setTimeout(() => {
      setApplyStep(2);
    }, 1800);

    // Step 3 (Success)
    const timer3 = setTimeout(() => {
      onSuccess();
    }, 2800);
  };

  const stepsList = [
    "Submitting application details to Bingo Agency...",
    "Reviewing streamer history and traffic rating...",
    "Verification complete! Securing host contract... 🎉"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 transition-colors duration-150">
      {/* Click outside to close instantly */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={isApplying ? undefined : onClose}
        title="Tap outside to close"
      />

      {/* Slide-up bottom sheet with highly accurate styling & squeezed spacing */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative w-full max-w-md bg-[#EFFDFD] rounded-t-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col pb-5"
        style={{ maxHeight: '85vh' }}
        id="official-host-bottom-sheet"
      >
        {/* Subtle top indicator bar */}
        <div className="w-10 h-1 bg-[#D2EDED] rounded-full mx-auto my-2.5 shrink-0" />

        {/* Header containing title and Close Icon X */}
        <div className="px-5 pb-3 pt-1 flex items-start justify-between">
          <h2 className="text-base font-extrabold text-[#113B3E] leading-snug max-w-[85%]">
            The service is only available to official hosts
          </h2>
          {!isApplying && (
            <button 
              onClick={onClose}
              className="p-1.5 -mr-1 text-[#22777D] hover:bg-[#E2FAF9] active:scale-95 rounded-full transition-all shrink-0"
              aria-label="Close"
              id="close-host-gate-btn"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Sheet Content Container (Squeezed to prevent unnecessary scrolling) */}
        <div className="px-4 pb-2">
          
          {/* Main Benefits card precisely cloned from Bingo layout */}
          <div className="bg-white rounded-[1.5rem] px-4 py-4 shadow-xs border border-[#E3F6F6] space-y-3.5 relative">
            
            {/* Sparkle Benefits Heading */}
            <div className="flex items-center gap-2 text-[#00818D] font-extrabold text-[13px] select-none">
              <Sparkles size={14} className="text-[#FFC200] fill-[#FFC200]" />
              <span>Benefits of becoming a signed host:</span>
            </div>

            {/* List Rows - Fully static as in Screenshot 1 */}
            <div className="space-y-3 pt-0.5">
              
              {/* Item 1 */}
              <div className="flex items-center gap-3 select-none">
                {/* Custom Sack of Money SVG */}
                <div className="w-10 h-10 rounded-full bg-[#E0FCFF] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#00CBD6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#1F3D40] leading-normal">
                  1. Earn additional commission income
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-3 select-none">
                {/* Custom User plus custom SVG */}
                <div className="w-10 h-10 rounded-full bg-[#E0FCFF] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#00CBD6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#1F3D40] leading-normal">
                  2. Gain more supportive traffic
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-3 select-none">
                {/* Custom streaming tools SVG */}
                <div className="w-10 h-10 rounded-full bg-[#E0FCFF] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#00CBD6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="2" y1="14" x2="6" y2="14" />
                    <line x1="10" y1="8" x2="14" y2="8" />
                    <line x1="18" y1="16" x2="22" y2="16" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#1F3D40] leading-normal">
                  3. Unlock all live streaming tools
                </span>
              </div>

              {/* Item 4 */}
              <div className="flex items-center gap-3 select-none">
                {/* Custom book SVG */}
                <div className="w-10 h-10 rounded-full bg-[#E0FCFF] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#00CBD6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#1F3D40] leading-normal">
                  4. Receive more official guidance
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom CTA Button exactly matching Screenshot 1 */}
        <div className="px-5 pt-1.5 pb-2.5 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {!isApplying ? (
              <motion.button
                key="apply-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleApply}
                className="w-full py-3.5 bg-[#00E5FF] hover:bg-[#00D4EC] text-white rounded-full font-extrabold text-sm tracking-wide shadow-sm active:scale-[0.98] transition-all text-center"
                id="apply-official-host-action"
              >
                Apply for official hosts
              </motion.button>
            ) : (
              <motion.div
                key="applying-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full bg-white border border-[#CEECEE] rounded-2xl p-4 flex flex-col items-center space-y-3 shadow-xs"
              >
                {/* Simulated Progress Pulse Circles */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${applyStep >= 0 ? "bg-[#00E5FF] animate-bounce" : "bg-gray-200"}`} />
                  <div className={`w-2 h-2 rounded-full ${applyStep >= 1 ? "bg-[#00E5FF] animate-bounce delay-100" : "bg-gray-200"}`} />
                  <div className={`w-2 h-2 rounded-full ${applyStep >= 2 ? "bg-[#00E5FF] animate-bounce delay-200" : "bg-gray-200"}`} />
                </div>
                
                <span className="text-[11px] font-bold text-[#005B60] text-center px-1.5">
                  {stepsList[applyStep]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
