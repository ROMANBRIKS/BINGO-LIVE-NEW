import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Play, Users, Music, Gamepad2 } from 'lucide-react';

export default function PartyPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const partyRooms = [
    { id: '1', title: 'Friday Night Vibes 🎵', host: 'DJ Spark', viewers: '1.2k', type: 'Music' },
    { id: '2', title: 'Ludo Tournament 🎲', host: 'GameMaster', viewers: '850', type: 'Gaming' },
    { id: '3', title: 'Late Night Talk Show 🎙️', host: 'Queen B', viewers: '2.4k', type: 'Talk' },
    { id: '4', title: 'Karaoke Party! 🎤', host: 'SingWithMe', viewers: '1.5k', type: 'Music' },
  ];

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden select-none">
      {/* Fixed Top Navigation */}
      <header className="flex-none bg-[#1a1a1a] w-full border-b border-white/10">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-lg font-black text-white tracking-tighter uppercase">BINGO LIVE</h1>
          <button onClick={() => navigate(-1)} className="p-1.5 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-16 sm:pb-8">
        <h2 className="text-lg font-black italic uppercase tracking-tight mb-6">Party Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {partyRooms.map(room => (
          <div 
            key={room.id} 
            onClick={() => showToast(`Joining ${room.title}... 🥳`, 'info')}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                {room.type === 'Music' ? <Music size={32} /> : room.type === 'Gaming' ? <Gamepad2 size={32} /> : <Users size={32} />}
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">{room.title}</h3>
                <p className="text-xs text-white/40">Host: {room.host}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold">{room.type}</span>
                  <span className="text-[10px] text-white/60 flex items-center gap-1"><Users size={10} /> {room.viewers}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                showToast(`Joining ${room.title}... 🥳`, 'info');
              }}
              className="bg-cyan-400 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-cyan-400/20 active:scale-95 transition-all"
            >
              Join
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
