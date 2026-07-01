import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface FamilyCreationCriteriaProps {
  onClose: () => void;
}

// Highly detailed golden lion head matching the screenshot
const MajesticLionHead = ({ size = 110, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={cn("drop-shadow-[0_4px_12px_rgba(238,189,65,0.3)]", className)}
  >
    {/* Inner golden shield background */}
    <polygon 
      points="50,5 88,27 88,73 50,95 12,73 12,27" 
      fill="url(#goldGrad)" 
      fillOpacity="0.12" 
      stroke="url(#goldGrad)" 
      strokeWidth="2"
    />
    
    {/* Majestic lion face geometric paths */}
    <g transform="translate(18, 18) scale(0.64)">
      {/* Crown/Mane fluff top */}
      <path 
        d="M50 5 L65 18 L82 14 L74 34 L88 40 L78 52 L73 72 L50 82 L27 72 L22 52 L12 40 L26 34 L18 14 L35 18 Z" 
        fill="url(#goldGrad)" 
        stroke="url(#goldGrad)" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Eyes & Brow bridge */}
      <path 
        d="M34 46 C38 40, 62 40, 66 46" 
        stroke="#111215" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      <path 
        d="M34 46 C37 43, 47 43, 49 48" 
        stroke="#111215" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <path 
        d="M66 46 C63 43, 53 43, 51 48" 
        stroke="#111215" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />

      {/* Pupils */}
      <circle cx="39" cy="48" r="2.5" fill="#fef08a" />
      <circle cx="61" cy="48" r="2.5" fill="#fef08a" />

      {/* Nose bridge & snouth detail */}
      <path 
        d="M50 48 L46 56 L54 56 Z" 
        fill="url(#goldGradDark)" 
      />
      <path 
        d="M50 56 L50 64" 
        stroke="#111215" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />
      <path 
        d="M42 62 C46 64, 54 64, 58 62" 
        stroke="#111215" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />

      {/* Whiskers accent lines */}
      <line x1="28" y1="58" x2="38" y2="58" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.6" />
      <line x1="72" y1="58" x2="62" y2="58" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.6" />
    </g>

    {/* Definitions */}
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eebd41" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="goldGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#eebd41" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
    </defs>
  </svg>
);

// High-fidelity blue Shiny Diamond SVG helper
const BlueDiamondIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="text-[#38bdf8] inline-block align-middle ml-1 mr-0.5 drop-shadow-[0_1.5px_4px_rgba(56,189,248,0.5)]"
  >
    <path d="M6 3h12l4 6-10 12L2 9z" />
    {/* Shininess vectors */}
    <path d="M6 3l4 6h4l4-6z" fill="#7dd3fc" />
    <path d="M10 9l2 12 2-12z" fill="#0284c7" />
  </svg>
);

export default function FamilyCreationCriteria({ onClose }: FamilyCreationCriteriaProps) {
  return (
    <div className="fixed inset-0 bg-[#0d0e12] z-[100] flex flex-col font-sans select-none overflow-y-auto">
      
      {/* 1. White Header bar matching screenshots */}
      <header className="bg-white px-4 py-3.5 flex items-center border-b border-gray-200 sticky top-0 z-50">
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-800"
          aria-label="Back"
        >
          <ChevronLeft size={28} strokeWidth={2.4} />
        </button>
        <span className="ml-4 text-[17px] font-black text-slate-900 tracking-tight">
          Criteria of family creation
        </span>
      </header>

      {/* 2. Main content container - luxury dark presentation */}
      <div className="flex-1 flex flex-col items-center justify-start py-8 px-5 relative bg-gradient-to-b from-[#16171d] via-[#0d0e12] to-[#07080a]">
        
        {/* Subtle patterned mesh graphics background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e202a_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        {/* Outer stylized mechanical/golden bracket frames */}
        <div className="w-full max-w-[420px] mx-auto mt-2 relative flex flex-col items-center">
          
          {/* Top symmetrical chevron border layout */}
          <div className="w-full h-24 border-t-2 border-x-2 border-[#eebd41]/25 rounded-t-[32px] absolute top-0 inset-x-0 pointer-events-none flex justify-center">
            <div className="w-1/3 h-1 bg-gradient-to-r from-transparent via-[#eebd41]/55 to-transparent -top-[2px] absolute" />
          </div>

          <div className="w-[300px] h-[130px] border-b-2 border-dashed border-white/5 absolute top-12 pointer-events-none" />

          {/* Central hexagon golden Lion head badge */}
          <div className="mt-8 z-10 bg-[#16171d] p-3 rounded-full border border-white/5 shadow-2xl relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-300/10 to-transparent blur-xl pointer-events-none" />
            <MajesticLionHead size={118} />
          </div>

          {/* Large display header text */}
          <h2 className="mt-8 text-[18px] font-black tracking-wide text-[#eebd41] uppercase text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            Criteria of family creation
          </h2>

          <div className="w-[120px] h-[1px] bg-gradient-to-r from-transparent via-[#eebd41]/40 to-transparent mt-2 mb-6" />

          {/* Rules structured list card container */}
          <div className="w-full bg-[#1b1c24]/55 border border-white/5 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            
            {/* Ambient neon backdrop */}
            <div className="absolute inset-0 rounded-3xl bg-yellow-405/5 opacity-5 blur-xl pointer-events-none" />

            <div className="flex items-start gap-3 text-[14px] leading-relaxed font-bold text-white/90">
              <span className="text-[#eebd41] font-black">1.</span>
              <span>User level ≥ 5</span>
            </div>

            <div className="flex items-start gap-3 text-[14px] leading-relaxed font-bold text-white/90">
              <span className="text-[#eebd41] font-black">2.</span>
              <span>Recharge amount in this month ≥ 20 USD</span>
            </div>

            <div className="flex items-start gap-3 text-[14px] leading-relaxed font-bold text-white/90">
              <span className="text-[#eebd41] font-black">3.</span>
              <span className="flex items-center flex-wrap">
                Gift sending amount in this month ≥ 2000
                <BlueDiamondIcon />
              </span>
            </div>

            <div className="flex items-start gap-3 text-[14px] leading-relaxed font-bold text-white/90">
              <span className="text-[#eebd41] font-black">4.</span>
              <span>Wallet-Diamonds or Beans balance ≥ 2000</span>
            </div>
          </div>

          {/* Symmetrical bracket lower bounds decoration */}
          <div className="w-full h-12 border-b-2 border-x-2 border-[#eebd41]/10 rounded-b-[32px] absolute bottom-20 inset-x-0 pointer-events-none" />

          {/* Explanatory footer description block */}
          <p className="mt-9 text-[11.5px] font-bold leading-relaxed text-zinc-400 text-center px-4 max-w-[360px]">
            Meet any one of above requirements, then you can create a family. If you have any questions, please contact Africa Official BIGO ID: <span className="text-[#eebd41] font-black tracking-wide">80015</span>
          </p>

        </div>
      </div>
    </div>
  );
}
