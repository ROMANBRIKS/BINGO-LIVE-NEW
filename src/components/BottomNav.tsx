import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Home as HomeIcon, Users, Video, MessageCircle, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
// @ts-ignore
import partyHornImg from '../assets/images/party_horn_icon_1781205987775.jpg';

export const BottomNav = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [transparentPartySrc, setTransparentPartySrc] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = partyHornImg;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Remove the pitch black background
            if (r < 28 && g < 28 && b < 28) {
              data[i + 3] = 0;
            } else {
              // Edge feathering to eliminate blocky black pixels
              const maxVal = Math.max(r, g, b);
              if (maxVal < 55) {
                const alpha = (maxVal - 28) / 27;
                data[i + 3] = Math.max(0, Math.min(255, Math.floor(alpha * 255)));
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
          setTransparentPartySrc(canvas.toDataURL());
        } catch (e) {
          console.error("Failsafe: fallback to default image if tainted canvas/CORS triggers inside bottom nav", e);
          setTransparentPartySrc(partyHornImg);
        }
      }
    };
  }, []);

  const isStreamPage = location.pathname.startsWith('/room/') || location.pathname === '/go-live';
  if (isStreamPage) return null;

  return (
    <>
      <div className={cn(
        "fixed bottom-0 left-0 right-0 h-12 flex items-center justify-around px-2 z-50 sm:hidden transition-colors duration-300",
        isLight ? "bg-white border-t border-black/5" : "bg-[#1a1a1a] border-t border-white/5"
      )}>
        <button 
          onClick={() => navigate('/')}
          className={cn(
            "flex flex-col items-center gap-0 transition-colors", 
            location.pathname === '/' 
              ? (isLight ? "text-black" : "text-white") 
              : (isLight ? "text-black/30" : "text-white/40")
          )}
        >
          <HomeIcon size={20} />
          <span className="text-[8px] font-bold">Live</span>
        </button>
        <button 
          onClick={() => navigate('/party')}
          className={cn(
            "flex flex-col items-center gap-0 px-2 transition-colors", 
            location.pathname === '/party' 
              ? "text-amber-500 font-extrabold" 
              : (isLight ? "text-black/40" : "text-white/40")
          )}
        >
          <motion.div 
            animate={{ 
              scale: location.pathname === '/party' ? 1.25 : 1,
              rotate: location.pathname === '/party' ? [0, -6, 6, -3, 3, 0] : 0
            }}
            transition={{
              scale: { type: 'spring', stiffness: 300, damping: 18 },
              rotate: { duration: 0.5, ease: 'easeInOut' }
            }}
            className="w-[28px] h-[28px] relative shrink-0 transition-all duration-300"
          >
            <img 
              src={transparentPartySrc || partyHornImg} 
              alt="Party" 
              className={cn(
                "w-full h-full object-contain transition-all duration-300",
                location.pathname === '/party' ? "brightness-115 saturate-115" : "opacity-75"
              )}
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <span className="text-[8px] font-bold mt-[-1px]">Party</span>
        </button>
        <button 
          onClick={() => navigate('/go-live')}
          className="relative -mt-5"
        >
          <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-black shadow-lg shadow-cyan-400/20 active:scale-95 transition-transform">
            <Video size={22} />
          </div>
        </button>
        <button 
          onClick={() => navigate('/chats')}
          className={cn(
            "flex flex-col items-center gap-0 relative transition-colors", 
            (location.pathname === '/chats' || location.pathname === '/messages') 
              ? (isLight ? "text-black" : "text-white") 
              : (isLight ? "text-black/30" : "text-white/40")
          )}
        >
          <div className="relative">
            <MessageCircle size={20} className={cn((location.pathname === '/chats' || location.pathname === '/messages') && (isLight ? "fill-black" : "fill-white"))} />
            <div className={cn(
              "absolute -top-1 -right-2 bg-pink-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full border",
              isLight ? "border-white" : "border-[#1a1a1a]"
            )}>
              24
            </div>
          </div>
          <span className="text-[8px] font-bold">Chats</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className={cn(
            "flex flex-col items-center gap-0 relative transition-colors", 
            location.pathname === '/profile' 
              ? (isLight ? "text-black" : "text-white") 
              : (isLight ? "text-black/30" : "text-white/40")
          )}
        >
          <div className="relative">
            <UserIcon size={20} />
            <div className={cn(
              "absolute top-0 right-0 w-1 h-1 bg-pink-500 rounded-full border",
              isLight ? "border-white" : "border-[#1a1a1a]"
            )} />
          </div>
          <span className="text-[8px] font-bold">Me</span>
        </button>
      </div>
    </>
  );
});

BottomNav.displayName = 'BottomNav';
