import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, FileText, Heart, Play, Share2, MessageCircle, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface Post {
  id: string;
  thumbnail: string;
  user: string;
  likes: number;
}

const MOCK_POSTS: Post[] = [
  { id: '1', thumbnail: 'https://picsum.photos/seed/post1/300/500', user: '@LovieDovie', likes: 51 },
  { id: '2', thumbnail: 'https://picsum.photos/seed/post2/300/500', user: '@LovieDovie', likes: 43 },
  { id: '3', thumbnail: 'https://picsum.photos/seed/post3/300/500', user: '@LovieDovie', likes: 41 },
  { id: '4', thumbnail: 'https://picsum.photos/seed/post4/300/500', user: '@Bigbaby', likes: 16 },
  { id: '5', thumbnail: 'https://picsum.photos/seed/post5/300/500', user: '@My woman', likes: 3 },
  { id: '6', thumbnail: 'https://picsum.photos/seed/post6/300/500', user: '@Ella', likes: 11 },
];

export default function PostsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Mine' | 'Favorite'>('Mine');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden select-none">
      {/* Header */}
      <header className="bg-[#1a1a1a] pt-12 pb-2 px-4 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-1 active:scale-90 transition-transform">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div className="flex gap-8">
            {['Mine', 'Favorite'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "text-sm font-bold transition-all relative pb-2",
                  activeTab === tab ? "text-white" : "text-white/40"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="postTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-1">
        {activeTab === 'Mine' ? (
          <div className="grid grid-cols-2 gap-1">
            {MOCK_POSTS.map((post) => (
              <motion.div 
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="aspect-[3/4] relative overflow-hidden group cursor-pointer"
              >
                <img src={post.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/80">{post.user}</span>
                  <div className="flex items-center gap-1">
                    <Heart size={10} className="text-white/60" />
                    <span className="text-[10px] font-bold text-white/80">{post.likes}</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <Play size={14} className="text-white/60" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-10 text-center opacity-40">
            <FileText size={64} className="mb-4" />
            <p className="text-sm font-bold">You don't have any favorite posts yet</p>
          </div>
        )}
      </div>

      {/* Full Screen Player */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[500] bg-black flex flex-col"
          >
            <div className="absolute top-12 left-4 z-10">
              <button onClick={() => setSelectedPost(null)} className="p-2 bg-black/40 rounded-full text-white">
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="flex-1 relative">
              <img src={selectedPost.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              
              {/* Overlay Controls */}
              <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center relative">
                    <Plus size={20} className="text-white" />
                    <div className="absolute -bottom-2 bg-red-500 rounded-full p-0.5">
                      <Plus size={10} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Heart size={28} className="text-white" fill="white" />
                  <span className="text-xs font-bold text-white">{selectedPost.likes}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <MessageCircle size={28} className="text-white" />
                  <span className="text-xs font-bold text-white">Tip</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Share2 size={28} className="text-white" />
                  <span className="text-xs font-bold text-white">Share</span>
                </div>
              </div>

              <div className="absolute bottom-10 left-4 right-20">
                <h3 className="text-lg font-black text-white mb-1">{selectedPost.user}</h3>
                <p className="text-sm text-white/80 line-clamp-2">Check out my latest performance! ✨ #BingoLive #Performance</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
