import { create } from 'zustand';
import supabase from '../lib/supabase';
import { getDeviceId } from '../lib/deviceId';

const LOCAL_KEY = 'nexflix_watchlist';

function loadLocal() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocal(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

const useWatchlistStore = create((set, get) => ({
  items: [],
  isLoaded: false,
  isSyncing: false,

  init: async () => {
    if (get().isLoaded) return;

    if (supabase) {
      const deviceId = getDeviceId();
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('device_id', deviceId)
        .order('added_at', { ascending: false });

      if (!error && data) {
        const items = data.map(row => ({
          id: row.movie_id,
          media_type: row.media_type,
          added_at: row.added_at,
        }));
        set({ items, isLoaded: true });
        saveLocal(items);
        return;
      }
    }

    const items = loadLocal();
    set({ items, isLoaded: true });
  },

  add: async (item) => {
    const { items } = get();
    if (items.some(i => i.id === item.id)) return;

    const entry = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      vote_average: item.vote_average,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      media_type: item.title ? 'movie' : 'tv',
      genres: item.genres,
      tag: item.tag,
      added_at: new Date().toISOString(),
    };

    const updated = [entry, ...items];
    set({ items: updated });
    saveLocal(updated);

    if (supabase) {
      const deviceId = getDeviceId();
      const { error } = await supabase.from('watchlist').upsert(
        {
          device_id: deviceId,
          movie_id: item.id,
          media_type: entry.media_type,
          added_at: entry.added_at,
        },
        { onConflict: 'device_id,movie_id' }
      );
      if (error) console.error('Supabase watchlist insert failed:', error);
    }
  },

  remove: async (itemId) => {
    const { items } = get();
    const updated = items.filter(i => i.id !== itemId);
    set({ items: updated });
    saveLocal(updated);

    if (supabase) {
      const deviceId = getDeviceId();
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('device_id', deviceId)
        .eq('movie_id', itemId);
      if (error) console.error('Supabase watchlist delete failed:', error);
    }
  },

  toggle: async (item) => {
    const { items, add, remove } = get();
    if (items.some(i => i.id === item.id)) {
      await remove(item.id);
    } else {
      await add(item);
    }
  },

  isInList: (itemId) => {
    return get().items.some(i => i.id === itemId);
  },
}));

export default useWatchlistStore;
