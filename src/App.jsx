import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages imports
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import TVDetail from './pages/TVDetail';
import Search from './pages/Search';
import Browse from './pages/Browse';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import SearchModal from './components/SearchModal';

// Premium page transition animation config
const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4
};

// Animated route wrapper
const AnimatedLayout = () => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F] text-white">
      <Navbar />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
                <Home />
              </motion.div>
            } />
            <Route path="/movie/:id" element={
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
                <MovieDetail />
              </motion.div>
            } />
            <Route path="/tv/:id" element={
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
                <TVDetail />
              </motion.div>
            } />
            <Route path="/search" element={
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen px-6 md:px-12 max-w-7xl mx-auto">
                <Search />
              </motion.div>
            } />
            <Route path="/browse" element={
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen">
                <Browse />
              </motion.div>
            } />
            <Route path="/watchlist" element={
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen px-6 md:px-12 max-w-7xl mx-auto">
                <Watchlist />
              </motion.div>
            } />
            <Route path="/profile" element={
              <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen px-6 md:px-12 max-w-7xl mx-auto">
                <Profile />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />

      {/* Global Ctrl+K Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AnimatedLayout />
      </Router>
    </AppProvider>
  );
}
