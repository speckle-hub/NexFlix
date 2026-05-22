import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const MOCK_NOTIFICATIONS = [
  { id: 1, title: '🔥 Trending Movie Alert', message: 'Inception is trending #1 worldwide today. Watch now!', time: '2h ago', unread: true },
  { id: 2, title: '📺 New Episode Released', message: 'Stranger Things Season 4 Episode 1 is now available for streaming!', time: '5h ago', unread: true },
  { id: 3, title: '🎬 Watchlist Update', message: 'You have 5 unwatched titles remaining in your Watchlist.', time: '1d ago', unread: false }
];

export const AppProvider = ({ children }) => {
  // TMDB API Key Management
  const [tmdbKey, setTmdbKey] = useState(() => {
    return localStorage.getItem('nexflix_tmdb_key') || '3fd2be6f0c70a2a598f084ddfb75487c';
  });

  // Watchlist Management
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('nexflix_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Watch History Management
  // Tracks items streamed, including TV episode progress (last-watched season/episode) and runtime
  const [watchHistory, setWatchHistory] = useState(() => {
    const saved = localStorage.getItem('nexflix_watch_history');
    return saved ? JSON.parse(saved) : [];
  });

  // User Profile Preferences & Presets
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

  // Notifications Panel
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('nexflix_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  // Write changes to localStorage
  useEffect(() => {
    localStorage.setItem('nexflix_tmdb_key', tmdbKey);
  }, [tmdbKey]);

  useEffect(() => {
    localStorage.setItem('nexflix_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('nexflix_watch_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    localStorage.setItem('nexflix_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nexflix_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Actions
  const updateTmdbKey = (key) => {
    setTmdbKey(key.trim());
  };

  const addToWatchlist = (item) => {
    if (!watchlist.find(w => w.id === item.id)) {
      setWatchlist(prev => [item, ...prev]);
      addNotification('🍿 Added to Watchlist', `"${item.title || item.name}" has been saved to your watchlist.`, 'Just now');
    }
  };

  const removeFromWatchlist = (itemId) => {
    setWatchlist(prev => prev.filter(w => w.id !== itemId));
  };

  const toggleWatchlist = (item) => {
    if (watchlist.find(w => w.id === item.id)) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  // Log item to Watch History
  // Handles both movies and TV shows
  const addToHistory = (item, extraInfo = {}) => {
    // extraInfo for TV: { season, episode, episodeName, progressPercent }
    setWatchHistory(prev => {
      // Remove any existing entry for the same item to bring it to the top
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

      // Calculate incremental hour increments
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

  return (
    <AppContext.Provider value={{
      tmdbKey,
      updateTmdbKey,
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      watchHistory,
      addToHistory,
      clearHistory,
      profile,
      updateProfile,
      notifications,
      addNotification,
      markAllNotificationsRead,
      deleteNotification
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
