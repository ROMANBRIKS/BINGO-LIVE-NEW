import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Send, Smile, Plus, Phone, Video } from 'lucide-react';

export default function ChatDetailPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="flex-none px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
              <img src={`https://picsum.photos/seed/${chatId}/200`} alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-sm font-bold">User {chatId}</h2>
              <span className="text-[10px] text-green-500">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Phone size={20} className="text-white/70" />
          <Video size={20} className="text-white/70" />
          <MoreVertical size={20} className="text-white/70" />
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-center">
          <span className="text-[10px] text-white/20 bg-white/5 px-2 py-1 rounded-full uppercase tracking-widest">Today</span>
        </div>
        
        <div className="flex flex-col items-start max-w-[80%]">
          <div className="bg-[#222222] p-3 rounded-2xl rounded-tl-none text-sm">
            Hey! How are you doing today?
          </div>
          <span className="text-[9px] text-white/20 mt-1 ml-1">10:30 AM</span>
        </div>

        <div className="flex flex-col items-end ml-auto max-w-[80%]">
          <div className="bg-cyan-500 text-black p-3 rounded-2xl rounded-tr-none text-sm font-medium">
            I'm doing great! Just checking out the new app layout.
          </div>
          <span className="text-[9px] text-white/20 mt-1 mr-1">10:32 AM</span>
        </div>
      </div>

      {/* Input Area */}
      <footer className="flex-none p-4 bg-[#1a1a1a] border-t border-white/5">
        <div className="flex items-center gap-3 bg-[#222222] rounded-full px-4 py-2">
          <Plus size={20} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Say something..." 
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-white/20"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Smile size={20} className="text-white/40" />
          <button className={cn("p-1 rounded-full transition-colors", message ? "text-cyan-400" : "text-white/20")}>
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
