import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, HelpCircle, FileText, Megaphone } from 'lucide-react';
import { cn } from '../lib/utils';

export default function WithdrawalHistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E2022] font-sans antialiased flex flex-col pb-32">
      {/* Pristine Header precisely centered as per Screenshot 3 */}
      <header className="bg-white border-b border-gray-100 flex-none sticky top-0 z-50 px-4 pt-10 pb-3 shadow-sm">
        <div className="relative flex items-center justify-center w-full h-10">
          <button 
            onClick={() => navigate(-1)} 
            className="absolute left-0 p-2 text-[#1D2124] active:scale-95 transition-transform"
            id="back-withdrawal-history-btn"
          >
            <ChevronLeft size={24} className="stroke-[2.5]" />
          </button>
          
          <span className="text-lg font-bold text-[#1D2124]">Withdrawal History</span>
        </div>

        {/* Tab Selection Row & Help Trigger exactly as Bingo layout */}
        <div className="flex items-center justify-between mt-2 px-2 relative">
          <div className="flex gap-8">
            {(['Pending', 'Completed'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-1 text-[15px] font-bold transition-all relative",
                  activeTab === tab ? "text-[#1E2022] font-extrabold" : "text-[#909399]"
                )}
                id={`history-tab-${tab.toLowerCase()}`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="withdrawTabIndicator" 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[4px] bg-[#1E2022] rounded-full" 
                  />
                )}
              </button>
            ))}
          </div>

          <button 
            onClick={() => navigate('/earnings-dashboard')}
            className="p-1 text-[#909399] hover:text-[#1E2022] transition-colors"
            title="Help & FAQ"
          >
            <HelpCircle size={20} className="stroke-[2]" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        
        {/* Soft Peach/Orange Alert Banner exactly matching Screenshot 3 */}
        <div className="bg-[#FFF3EC] border border-[#FFE2D1]/70 rounded-2xl p-4 flex items-start gap-3 shadow-xs animate-in slide-in-from-top-2 duration-300">
          <div className="text-[#FF7A28] shrink-0 mt-0.5">
            <Megaphone size={18} className="stroke-[2.5]" />
          </div>
          <p className="text-[12px] text-[#A05225] font-semibold leading-relaxed">
            Withdrawals take 1-7 business days, thank you for being patient!
          </p>
        </div>

        {/* Tabbed content list or Empty State */}
        <div className="pt-12 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center"
            >
              {/* Aesthetic light cyan empty container box cloned from Bingo layout */}
              <div className="w-24 h-24 bg-[#E0FCF6] rounded-[2rem] flex items-center justify-center mb-4 border border-[#CEF8ED] shadow-sm relative overflow-hidden">
                {/* Visual grid inside box */}
                <div className="absolute inset-0 grid grid-cols-5 opacity-10 pointer-events-none">
                  <div className="border-r border-[#00E5FF]"></div>
                  <div className="border-r border-[#00E5FF]"></div>
                  <div className="border-r border-[#00E5FF]"></div>
                  <div className="border-r border-[#00E5FF]"></div>
                </div>

                {/* White checklist file container representational element */}
                <div className="w-11 h-13 bg-white rounded-lg shadow-sm border border-slate-100 flex flex-col p-2 gap-1.5 relative z-10">
                  <div className="w-7 h-1.5 bg-slate-100 rounded-sm"></div>
                  <div className="w-7 h-1 bg-slate-100 rounded-sm"></div>
                  <div className="w-5 h-1 bg-slate-100 rounded-sm"></div>
                </div>
              </div>

              {/* Text label */}
              <span className="text-sm font-bold text-[#A3ADB4] tracking-wide">No data yet!</span>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
