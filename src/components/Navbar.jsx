import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Bell, Menu, X, Key, User, Play, Film, Tv, Heart, Trash2, Check } from 'lucide-react';

export default function Navbar() {
  const { 
    tmdbKey, 
    updateTmdbKey, 
    notifications, 
    markAllNotificationsRead, 
    deleteNotification,
    profile 
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [keyInput, setKeyInput] = useState(tmdbKey);
  const [keySavedAlert, setKeySavedAlert] = useState(false);

  const notificationsRef = useRef();
  const settingsRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    updateTmdbKey(keyInput);
    setKeySavedAlert(true);
    setTimeout(() => {
      setKeySavedAlert(false);
      setIsSettingsOpen(false);
      window.location.reload();
    }, 1500);
  };

  const isActive = (path) => location.pathname === path;

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out py-4 px-6 md:px-12 ${
        isScrolled ? 'glass-nav backdrop-blur-md shadow-2xl py-3' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-[#E50914] font-extrabold text-4xl font-display tracking-tighter drop-shadow-[0_0_10px_rgba(229,9,20,0.4)] group-hover:scale-105 transition-all">N</span>
            <span className="text-white font-bold text-2xl font-display tracking-widest group-hover:text-gray-200 transition-colors">exFlix</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`nav-underline font-display tracking-widest text-lg ${isActive('/') ? 'text-[#E50914] active' : 'text-gray-300 hover:text-white'}`}>
              HOME
            </Link>
            <Link to="/browse" className={`nav-underline font-display tracking-widest text-lg ${isActive('/browse') ? 'text-[#E50914] active' : 'text-gray-300 hover:text-white'}`}>
              BROWSE
            </Link>
            <Link to="/watchlist" className={`nav-underline font-display tracking-widest text-lg ${isActive('/watchlist') ? 'text-[#E50914] active' : 'text-gray-300 hover:text-white'}`}>
              MY LIST
            </Link>
            <Link to="/profile" className={`nav-underline font-display tracking-widest text-lg ${isActive('/profile') ? 'text-[#E50914] active' : 'text-gray-300 hover:text-white'}`}>
              DASHBOARD
            </Link>
          </div>

          <div className="flex items-center gap-5">
            
            <button 
              onClick={() => navigate('/search')}
              className="text-gray-300 hover:text-[#E50914] transition-colors p-2 hover:scale-110 duration-200"
              title="Search Movies/TV (Ctrl+K)"
            >
              <Search className="w-5 h-5" />
            </button>

            <button 
              onClick={() => {
                setKeyInput(tmdbKey);
                setIsSettingsOpen(!isSettingsOpen);
              }}
              className={`p-2 rounded-full transition-all duration-300 ${
                tmdbKey 
                  ? 'text-[#F5C518] hover:bg-yellow-950/30' 
                  : 'text-red-500 bg-red-950/20 animate-pulse border border-red-500/20 hover:bg-red-900/40'
              }`}
              title={tmdbKey ? "TMDB API Live Active" : "Missing API Key - Demo Mode Active"}
            >
              <Key className="w-5 h-5" />
            </button>

            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  if (!isNotificationsOpen) markAllNotificationsRead();
                }}
                className="text-gray-300 hover:text-white transition-all p-2 hover:scale-115 relative duration-200"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#E50914] text-white text-[10px] w-4.5 h-4.5 flex items-center justify-center font-bold rounded-full animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-modal rounded-xl shadow-2xl p-4 border border-white/10 z-50 transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <h3 className="font-display tracking-wider text-base font-semibold text-white">NOTIFICATIONS</h3>
                    {unreadCount > 0 && <span className="text-xs text-[#E50914] font-semibold">{unreadCount} unread</span>}
                  </div>
                  <div className="max-h-64 overflow-y-auto scrollbar-hide flex flex-col gap-2">
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2.5 rounded-lg border transition-all ${
                          n.unread ? 'bg-white/5 border-[#E50914]/20' : 'bg-transparent border-white/5'
                        }`}>
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-xs text-white">{n.title}</span>
                            <button 
                              onClick={() => deleteNotification(n.id)}
                              className="text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-gray-400 text-[11px] mt-1 leading-normal">{n.message}</p>
                          <span className="text-[9px] text-gray-500 block mt-1">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link 
              to="/profile" 
              className="w-9 h-9 rounded-full bg-[#111117] border-2 border-white/10 hover:border-[#E50914] flex items-center justify-center text-lg hover:scale-105 transition-all duration-300 shadow-md"
              title="View Profile Dashboard"
            >
              {profile.avatar}
            </Link>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 glass-modal border border-white/10 p-5 rounded-2xl flex flex-col gap-4 animate-fadeIn">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-200 hover:text-white text-lg font-display tracking-widest"
            >
              HOME
            </Link>
            <Link 
              to="/browse" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-200 hover:text-white text-lg font-display tracking-widest"
            >
              BROWSE
            </Link>
            <Link 
              to="/watchlist" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-200 hover:text-white text-lg font-display tracking-widest"
            >
              MY LIST
            </Link>
            <Link 
              to="/profile" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-200 hover:text-white text-lg font-display tracking-widest"
            >
              DASHBOARD
            </Link>
          </div>
        )}
      </nav>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 px-4">
          <div 
            ref={settingsRef}
            className="w-full max-w-md glass-modal rounded-3xl p-6 md:p-8 border border-white/10 relative shadow-2xl animate-scaleIn"
          >
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-2xl text-red-500 mb-4 shadow-[0_0_15px_rgba(229,9,20,0.15)]">
                <Key className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold font-display tracking-widest text-white">TMDB CONFIGURATION</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Connect the streaming client to a live TMDB service, or use the premium built-in Demo Mode fallback.
              </p>
            </div>

            <form onSubmit={handleSaveKey} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-[11px] text-gray-400 uppercase font-mono tracking-wider">TMDB API Key (v3)</label>
                <div className="relative mt-1">
                  <input 
                    type="password"
                    placeholder="e.g. 5d5a8abf869fbc80ff12e..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] text-white text-sm px-4 py-3 rounded-xl outline-none font-mono transition-all duration-300"
                  />
                </div>
              </div>

              {keySavedAlert ? (
                <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold animate-pulse">
                  <Check className="w-4 h-4" /> Live Key Configured Successfully!
                </div>
              ) : (
                <button 
                  type="submit"
                  className="w-full bg-[#E50914] hover:bg-[#b0070f] text-white font-semibold py-3.5 rounded-xl glow-red tracking-wider transition-all duration-300 flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  SAVE KEY & SYNC
                </button>
              )}

              {!tmdbKey && !keySavedAlert && (
                <div className="bg-red-950/20 border border-red-500/10 text-red-300 p-3 rounded-xl text-[11px] leading-normal flex items-start gap-2">
                  <span className="text-base leading-none">i</span>
                  <span>Currently in Demo Mode. You are browsing high-fidelity custom mockup metadata representing standard movies and TV streams.</span>
                </div>
              )}

              {tmdbKey && (
                <button
                  type="button"
                  onClick={() => {
                    updateTmdbKey('');
                    setKeyInput('');
                    setIsSettingsOpen(false);
                    window.location.reload();
                  }}
                  className="w-full border border-white/10 hover:border-red-500/30 hover:bg-red-950/20 text-gray-400 hover:text-red-400 font-semibold py-3 rounded-xl transition-all duration-300 text-xs cursor-pointer"
                >
                  DISCONNECT LIVE API (BACK TO DEMO MODE)
                </button>
              )}

              <div className="text-center text-[10px] text-gray-500 mt-2">
                Need a key? Register a free account at{' '}
                <a 
                  href="https://www.themoviedb.org" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-gray-400 underline hover:text-white"
                >
                  themoviedb.org
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
