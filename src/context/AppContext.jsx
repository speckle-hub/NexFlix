import React, { createContext, useContext, useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdb';
import useWatchlistStore from '../stores/watchlistStore';
import useRatingsStore from '../stores/ratingsStore';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tmdbKey, setTmdbKey] = useState(() => {
    return localStorage.getItem('nexflix_tmdb_key') || '3fd2be6f0c70a2a598f084ddfb75487c';
  });

  const watchlist = useWatchlistStore(s => s.items);
  const addToWatchlist = useWatchlistStore(s => s.add);
  const removeFromWatchlist = useWatchlistStore(s => s.remove);
  const toggleWatchlist = useWatchlistStore(s => s.toggle);
  const initWatchlist = useWatchlistStore(s => s.init);

  const [watchHistory, setWatchHistory] = useState(() => {
    const saved = localStorage.getItem('nexflix_watch_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('nexflix_profile');
    const parsed = saved ? JSON.parse(saved) : null;
    
    const historySaved = localStorage.getItem('nexflix_watch_history');
    const parsedHistory = historySaved ? JSON.parse(historySaved) : [];
    
    const defaultProfile = {
      username: 'Movie Lover',
      avatar: '🎬',
      favoriteGenres: ['Action', 'Sci-Fi'],
      hoursStreamed: 0
    };
    
    if (parsed) {
      if (parsedHistory.length === 0) {
        parsed.hoursStreamed = 0;
      }
      return parsed;
    }
    return defaultProfile;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('nexflix_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [seenContentIds, setSeenContentIds] = useState(() => {
    const saved = localStorage.getItem('nexflix_seen_ids');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    initWatchlist();
    useRatingsStore.getState().init();
  }, []);

  useEffect(() => {
    localStorage.setItem('nexflix_tmdb_key', tmdbKey);
  }, [tmdbKey]);

  useEffect(() => {
    localStorage.setItem('nexflix_watch_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    localStorage.setItem('nexflix_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nexflix_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nexflix_seen_ids', JSON.stringify(seenContentIds));
  }, [seenContentIds]);

  // Auto-check for new trending/new release content on mount
  useEffect(() => {
    const checkNewContent = async () => {
      const storedSeen = JSON.parse(localStorage.getItem('nexflix_seen_ids') || '[]');

      try {
        const [trendingRes, nowPlayingRes, popularTvRes] = await Promise.all([
          tmdbService.request('/trending/all/week'),
          tmdbService.request('/movie/now_playing'),
          tmdbService.request('/tv/popular'),
        ]);

        const trendingItems = trendingRes.results || [];
        const nowPlayingItems = nowPlayingRes.results || [];
        const popularTvItems = popularTvRes.results || [];

        const allCurrentIds = [
          ...trendingItems.map(i => i.id),
          ...nowPlayingItems.map(i => i.id),
          ...popularTvItems.map(i => i.id),
        ];

        const newTrending = trendingItems.filter(i => !storedSeen.includes(i.id)).slice(0, 3);
        const newNowPlaying = nowPlayingItems.filter(i => !storedSeen.includes(i.id)).slice(0, 2);

        const newNotifications = [];

        newTrending.forEach((item, idx) => {
          const titles = ['🔥', '⚡', '📈'];
          newNotifications.push({
            id: Date.now() + idx,
            title: `${titles[idx] || '🔥'} Trending Now`,
            message: `${item.title || item.name} is trending this week on NexFlix — watch it before it drops!`,
            time: 'Just now',
            unread: true
          });
        });

        newNowPlaying.forEach((item, idx) => {
          newNotifications.push({
            id: Date.now() + 10 + idx,
            title: '🆕 New Release',
            message: `${item.title || item.name} just arrived on NexFlix. Start streaming now!`,
            time: 'Just now',
            unread: true
          });
        });

        // Also check if any watchlist items are trending
        const watchlistTrending = watchlist.filter(w =>
          trendingItems.some(t => t.id === w.id) && !storedSeen.includes(w.id)
        ).slice(0, 2);

        watchlistTrending.forEach((item, idx) => {
          newNotifications.push({
            id: Date.now() + 100 + idx,
            title: '📺 In Your List & Trending',
            message: `${item.title || item.name} is in your watchlist and trending now. Great time to watch!`,
            time: 'Just now',
            unread: true
          });
        });

        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev]);
        }

        const updatedSeen = [...new Set([...storedSeen, ...allCurrentIds])].slice(-500);
        setSeenContentIds(updatedSeen);

      } catch (err) {
        console.error("Notification auto-check failed:", err);
      }
    };

    checkNewContent();
  }, [tmdbKey]);

  const updateTmdbKey = (key) => {
    setTmdbKey(key.trim());
  };

  const addToWatchlistWithNotif = (item) => {
    if (!watchlist.some(w => w.id === item.id)) {
      addToWatchlist(item);
      addNotification('🎬 Added to Watchlist', `"${item.title || item.name}" has been saved to your watchlist.`, 'Just now');
    }
  };

  const toggleWatchlistWithNotif = (item) => {
    if (watchlist.some(w => w.id === item.id)) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlistWithNotif(item);
    }
  };

  const addToHistory = (item, extraInfo = {}) => {
    setWatchHistory(prev => {
      const filtered = prev.filter(h => h.id !== item.id);
      
      const newEntry = {
        id: item.id,
        title: item.title || item.name,
        posterPath: item.poster_path || item.posterPath,
        backdropPath: item.backdrop_path || item.backdropPath,
        type: item.title ? 'movie' : 'tv',
        timestamp: Date.now(),
        ...extraInfo
      };

      const additionalHours = extraInfo.runtime ? parseFloat((extraInfo.runtime / 60).toFixed(1)) : 0.7;
      setProfile(prevProf => ({
        ...prevProf,
        hoursStreamed: parseFloat((prevProf.hoursStreamed + additionalHours).toFixed(1))
      }));

      return [newEntry, ...filtered];
    });
  };

  const clearHistory = () => {
    setWatchHistory([]);
    setProfile(prev => ({
      ...prev,
      hoursStreamed: 0
    }));
  };

  const updateProfile = (fields) => {
    setProfile(prev => ({
      ...prev,
      ...fields
    }));
  };

  const addNotification = (title, message, time = 'Just now') => {
    setNotifications(prev => [
      { id: Date.now(), title, message, time, unread: true },
      ...prev
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const [quickViewItem, setQuickViewItem] = useState(null);

  const openQuickView = (item) => {
    setQuickViewItem(item);
  };

  const closeQuickView = () => {
    setQuickViewItem(null);
  };

  return (
    <AppContext.Provider value={{
      tmdbKey,
      updateTmdbKey,
      watchlist,
      addToWatchlist: addToWatchlistWithNotif,
      removeFromWatchlist,
      toggleWatchlist: toggleWatchlistWithNotif,
      watchHistory,
      addToHistory,
      clearHistory,
      profile,
      updateProfile,
      notifications,
      addNotification,
      markAllNotificationsRead,
      deleteNotification,
      quickViewItem,
      openQuickView,
      closeQuickView
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
