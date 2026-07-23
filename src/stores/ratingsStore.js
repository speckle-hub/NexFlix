import { create } from 'zustand';
import supabase from '../lib/supabase';
import { getDeviceId } from '../lib/deviceId';

const LOCAL_KEY = 'nexflix_ratings';

function makeKey(id, type) {
  return `${id}-${type}`;
}

function loadLocal() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveLocal(ratings) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ratings));
}

function computeAggregates(ratings) {
  const agg = {};
  for (const [key, rating] of Object.entries(ratings)) {
    if (!agg[key]) agg[key] = { up_count: 0, down_count: 0, total: 0 };
    if (rating === 'up') agg[key].up_count++;
    if (rating === 'down') agg[key].down_count++;
    agg[key].total++;
  }
  return agg;
}

const useRatingsStore = create((set, get) => ({
  userRatings: {},
  aggregates: {},
  isLoaded: false,

  init: async () => {
    if (get().isLoaded) return;
    const deviceId = getDeviceId();
    let userRatings = loadLocal();
    let aggregates = {};

    if (supabase) {
      try {
        const { data } = await supabase
          .from('ratings')
          .select('*')
          .eq('device_id', deviceId);

        if (data) {
          userRatings = {};
          for (const row of data) {
            userRatings[makeKey(row.movie_id, row.media_type)] = row.rating;
          }
          saveLocal(userRatings);
        }

        const { data: aggData } = await supabase
          .from('rating_aggregates')
          .select('*');

        if (aggData) {
          aggregates = {};
          for (const row of aggData) {
            const key = makeKey(row.movie_id, row.media_type);
            aggregates[key] = {
              up_count: row.up_count,
              down_count: row.down_count,
              total: row.up_count + row.down_count,
            };
          }
        }
      } catch (e) {
        console.error('Supabase ratings fetch failed, using local:', e);
        aggregates = computeAggregates(userRatings);
      }
    } else {
      aggregates = computeAggregates(userRatings);
    }

    set({ userRatings, aggregates, isLoaded: true });
  },

  rate: async (movieId, mediaType, rating) => {
    const key = makeKey(movieId, mediaType);
    const { userRatings } = get();

    const updated = { ...userRatings, [key]: rating };
    set({ userRatings: updated });
    saveLocal(updated);

    const newAgg = computeAggregates(updated);
    set(state => ({ aggregates: { ...state.aggregates, [key]: newAgg[key] || { up_count: 0, down_count: 0, total: 0 } } }));

    if (supabase) {
      const deviceId = getDeviceId();
      await supabase.from('ratings').upsert(
        {
          device_id: deviceId,
          movie_id: movieId,
          media_type: mediaType,
          rating,
          rated_at: new Date().toISOString(),
        },
        { onConflict: 'device_id,movie_id,media_type' }
      );
    }
  },

  clearRating: async (movieId, mediaType) => {
    const key = makeKey(movieId, mediaType);
    const { userRatings } = get();

    const updated = { ...userRatings };
    delete updated[key];
    set({ userRatings: updated });
    saveLocal(updated);

    const newAgg = computeAggregates(updated);
    set(state => ({ aggregates: { ...state.aggregates, [key]: newAgg[key] || { up_count: 0, down_count: 0, total: 0 } } }));

    if (supabase) {
      const deviceId = getDeviceId();
      await supabase
        .from('ratings')
        .delete()
        .eq('device_id', deviceId)
        .eq('movie_id', movieId)
        .eq('media_type', mediaType);
    }
  },

  getUserRating: (movieId, mediaType) => {
    return get().userRatings[makeKey(movieId, mediaType)] || null;
  },

  getAggregate: (movieId, mediaType) => {
    const agg = get().aggregates[makeKey(movieId, mediaType)];
    if (!agg || agg.total < 3) return null;
    const likedPct = Math.round((agg.up_count / agg.total) * 100);
    return { ...agg, likedPct };
  },
}));

export default useRatingsStore;
