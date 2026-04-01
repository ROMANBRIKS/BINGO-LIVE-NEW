import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Users, Music, Gamepad2 } from 'lucide-react';

export default function PartyPage() {
  const navigate = useNavigate();
  
  const partyRooms = [
    { id: '1', title: 'Friday Night Vibes 🎵', host: 'DJ Spark', viewers: '1.2k', type: 'Music' },
    { id: '2', title: 'Ludo Tournament 🎲', host: 'GameMaster', viewers: '850', type: 'Gaming' },
    { id: '3', title: 'Late Night Talk Show 🎙️', host: 'Queen B', viewers: '2.4k', type: 'Talk' },
    { id: '4', title: 'Karaoke Party! 🎤', host: 'SingWithMe', viewers: '1.5k', type: 'Music' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black italic uppercase tracking-tight">Party Rooms</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partyRooms.map(room => (
          <div 
            key={room.id} 
            onClick={() => alert(`Joining ${room.title}... 🥳`)}
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
                alert(`Joining ${room.title}... 🥳`);
              }}
              className="bg-cyan-400 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-cyan-400/20 active:scale-95 transition-all"
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
