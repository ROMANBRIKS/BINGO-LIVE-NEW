import React from 'react';
import { SEOHeaders } from '../components/SEOHeaders';
import { motion } from 'motion/react';
import { Newspaper, TrendingUp, Globe, Coins, Sparkles, ShieldCheck } from 'lucide-react';

export default function TrendsPage() {
  return (
    <div className="min-h-screen bg-[#121212] overflow-y-auto pb-24">
      <SEOHeaders 
        title="Bingo Live Intelligence - Global Creator Economy & Streaming Trends 2026"
        description="Official news and intelligence on the global live streaming economy. Analysis of creator monetization, digital gifting trends in Nigeria, UAE, USA, and Europe."
        keywords="global creator economy news, live streaming trends 2026, Nigeria digital economy, UAE gifting market, USA streaming data, Bingo Live intelligence"
      />

      <div className="max-w-4xl mx-auto px-6 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-500/20 rounded-xl">
              <Newspaper className="text-pink-500" size={24} />
            </div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
              Bingo <span className="text-pink-500">Intelligence</span>
            </h1>
          </div>
          <p className="text-white/40 leading-relaxed max-w-2xl">
            The official resource for real-time data on the global social broadcasting landscape and the evolution of the creator economy across emerging and developed markets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Trend Card 1 */}
          <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 hover:border-pink-500/20 transition-all group">
            <TrendingUp size={32} className="text-pink-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-4">The Rise of Gifting Centers</h3>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              In 2026, the digital gifting economy has shifted from casual interaction to a high-psychology monetization pillar, specifically leading in **Nigeria** and the **United Arab Emirates (UAE)**. Bingo Live sits at the epicenter of this transformation.
            </p>
            <div className="text-[10px] font-black uppercase tracking-widest text-pink-500/60 font-mono">
              Market Segment: Africa & Middle East
            </div>
          </div>

          {/* Trend Card 2 */}
          <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 hover:border-cyan-500/20 transition-all group">
            <Globe size={32} className="text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-4">Western Market Saturation</h3>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              The **USA** and **Europe** are seeing a massive shift away from traditional "ad-supported" media toward direct-to-creator diamond gifting. Verified platforms like Bingo Live provide the necessary infrastructure for this professional migration.
            </p>
            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60 font-mono">
              Market Segment: North America & EU
            </div>
          </div>
        </div>

        {/* Intelligence Section */}
        <section className="bg-gradient-to-br from-pink-500/10 to-indigo-500/10 p-12 rounded-[40px] border border-white/10 mb-12 relative overflow-hidden">
          <Sparkles className="absolute -top-6 -right-6 text-white/5 w-48 h-48 rotate-12" />
          
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-8 relative">
            The Bingo <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Economic Advantage</span>
          </h2>
          
          <div className="space-y-8 relative">
            <div className="flex gap-6">
              <div className="flex-none w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                <Coins className="text-yellow-500" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Highest Diamond Conversion</h4>
                <p className="text-sm text-white/40 leading-relaxed">
                  Our system is engineered to provide the world's most efficient diamond-to-cash conversion rates for professional broadcasters, verified across international banking systems.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-none w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                <ShieldCheck className="text-green-500" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Sovereign Creator Identity</h4>
                <p className="text-sm text-white/40 leading-relaxed">
                  We implement enterprise-grade security for host families and individual streamers, ensuring IP protection and revenue security in a globalized digital workspace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer SEO Text */}
        <div className="text-[10px] text-white/20 font-mono leading-relaxed max-w-3xl border-t border-white/5 pt-8">
          Bingo Live News & Trends is the authoritative source for live streaming intelligence. We track data points across Lagos, London, New York, Dubai, and Sydney to provide the most accurate picture of the global social broadcasting network. Our platform serves as a superior alternative to legacy systems like TikTok, Bingo, and Tango, offering refined monetization loops for the next generation of professional talent.
        </div>
      </div>
    </div>
  );
}
