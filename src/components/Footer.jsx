import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Tv, Globe, Heart, Shield, Radio } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0F] border-t border-white/5 pt-16 pb-8 px-6 md:px-12 mt-20 relative overflow-hidden">
      
      {/* Background Subtle Gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        
        {/* Brand Segment */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#E50914] font-extrabold text-3xl font-display tracking-tighter drop-shadow-[0_0_10px_rgba(229,9,20,0.3)]">N</span>
            <span className="text-white font-bold text-xl font-display tracking-widest">exFlix</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
            NexFlix is a premium, high-definition cinematic streaming frontend powered by TMDB, VidKing, VidSrc and Embed.su embeds. Explore films, television shows, and your customized telemetry logs in an elegant dark interface.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">EXPLORE</h4>
          <div className="flex flex-col gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-red-500" /> Movies
            </Link>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Tv className="w-3.5 h-3.5 text-red-500" /> TV Shows
            </Link>
            <Link to="/browse" className="hover:text-white transition-colors flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-red-500" /> Category Browser
            </Link>
          </div>
        </div>

        {/* Legal Stuff */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">CLIENT DETAILS</h4>
          <div className="flex flex-col gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-yellow-500" /> Secure Sandbox</span>
            <span className="flex items-center gap-1">🍿 No Auth Required</span>
            <span className="flex items-center gap-1">🎬 VidKing, VidSrc & Embed.su</span>
          </div>
        </div>

        {/* Development links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono">CONNECT</h4>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-red-950/20 hover:text-[#E50914] rounded-xl transition-all duration-300">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            </a>
            <a href="https://google.com" target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-red-950/20 hover:text-[#E50914] rounded-xl transition-all duration-300">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4 relative z-10">
        <p>&copy; {new Date().getFullYear()} NexFlix. Built with React, Tailwind CSS and Framer Motion.</p>
        <p className="flex items-center gap-1">
          Made for cinema lovers with <Heart className="w-3 h-3 text-[#E50914] fill-[#E50914]" />
        </p>
      </div>

    </footer>
  );
}
