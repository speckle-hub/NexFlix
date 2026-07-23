import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import Particles from './components/Particles';
import QuickViewModal from './components/QuickViewModal';
import CustomCursor from './components/CustomCursor';
import Onboarding from './components/Onboarding';
import CommandPalette from './components/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const TVDetail = lazy(() => import('./pages/TVDetail'));
const Search = lazy(() => import('./pages/Search'));
const Browse = lazy(() => import('./pages/Browse'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const Profile = lazy(() => import('./pages/Profile'));
const MoodMatcher = lazy(() => import('./pages/MoodMatcher'));
const MyList = lazy(() => import('./pages/MyList'));
const SearchModal = lazy(() => import('./components/SearchModal'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-t-[#E50914] border-white/10 rounded-full animate-spin" />
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.35
};

function withErrorBoundary(Component) {
  return (
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  );
}

const AnimatedLayout = () => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
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

  const wrapPage = (Component) => (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F] text-white relative grain-overlay">
      <div className="fixed inset-0 mesh-bg pointer-events-none z-[1]" />
      <Particles count={30} />
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <Navbar />
      <CustomCursor />
      
      <main className="flex-grow relative z-10">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={wrapPage(Home)} />
              <Route path="/movie/:id" element={<motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><ErrorBoundary><MovieDetail /></ErrorBoundary></motion.div>} />
              <Route path="/tv/:id" element={<motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><ErrorBoundary><TVDetail /></ErrorBoundary></motion.div>} />
              <Route path="/search" element={<motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen px-6 md:px-12 max-w-7xl mx-auto"><ErrorBoundary><Search /></ErrorBoundary></motion.div>} />
              <Route path="/browse" element={<motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen"><ErrorBoundary><Browse /></ErrorBoundary></motion.div>} />
              <Route path="/watchlist" element={<motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen px-6 md:px-12 max-w-7xl mx-auto"><ErrorBoundary><Watchlist /></ErrorBoundary></motion.div>} />
              <Route path="/profile" element={<motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen px-6 md:px-12 max-w-7xl mx-auto"><ErrorBoundary><Profile /></ErrorBoundary></motion.div>} />
              <Route path="/mood-matcher" element={<motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen px-6 md:px-12 max-w-7xl mx-auto"><ErrorBoundary><MoodMatcher /></ErrorBoundary></motion.div>} />
              <Route path="/my-list" element={<motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="pt-24 min-h-screen px-6 md:px-12 max-w-7xl mx-auto"><ErrorBoundary><MyList /></ErrorBoundary></motion.div>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QuickViewModal />
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <Onboarding />
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
