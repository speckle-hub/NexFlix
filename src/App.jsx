import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import Particles from './components/Particles';

// Route-level code splitting
const Home = lazy(() => import('./pages/Home'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const TVDetail = lazy(() => import('./pages/TVDetail'));
const Search = lazy(() => import('./pages/Search'));
const Browse = lazy(() => import('./pages/Browse'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const Profile = lazy(() => import('./pages/Profile'));
const MoodMatcher = lazy(() => import('./pages/MoodMatcher'));
const SearchModal = lazy(() => import('./components/SearchModal'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-t-[#E50914] border-white/10 rounded-full animate-spin" />
    </div>
  );
}

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

const AnimatedLayout = () => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F] text-white relative">
      <Particles count={30} />
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <Navbar />
      
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
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
              <Route path="/mood-matcher" element={
                <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen px-6 md:px-12 max-w-7xl mx-auto">
                  <MoodMatcher />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ToastContainer />
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
