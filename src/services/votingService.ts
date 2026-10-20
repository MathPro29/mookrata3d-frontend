import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Place, Vote, VotingSession } from '../types';
import { initialPlaces, initialSession } from '../data/initialData';

// Storage keys for local atomic fallback
const LOCAL_VOTES_KEY = 'cm_map_local_votes_v1';
const LOCAL_PLACES_KEY = 'cm_map_local_places_v1';
const LOCAL_SESSION_KEY = 'cm_map_local_session_v1';

// Cross-tab real-time sync channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel('chiangmai_voting_realtime_channel');
}

export interface VoteResult {
  success: boolean;
  action: 'VOTE_CAST' | 'VOTE_CHANGED' | 'NO_CHANGE';
  session_id: string;
  place_id: string;
  user_id: string;
  previous_place_id?: string;
  message?: string;
}

export class VotingService {
  /**
   * Retrieves active voting session
   */
  static async getActiveSession(): Promise<VotingSession> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('voting_sessions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        return data as VotingSession;
      }
    }

    // Local fallback
    const saved = localStorage.getItem(LOCAL_SESSION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use initial
      }
    }
    return initialSession;
  }

  /**
   * Retrieves all places
   */
  static async getPlaces(): Promise<Place[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Place[];
      }
    }

    const saved = localStorage.getItem(LOCAL_PLACES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return initialPlaces;
  }

  /**
   * Retrieves all votes for session
   */
  static async getVotes(sessionId: string): Promise<Vote[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('session_id', sessionId);

      if (!error && data) {
        return data as Vote[];
      }
    }

    const saved = localStorage.getItem(LOCAL_VOTES_KEY);
    if (saved) {
      try {
        const allVotes: Vote[] = JSON.parse(saved);
        return allVotes.filter(v => v.session_id === sessionId);
      } catch (e) {
        return [];
      }
    }

    // Provide default initial votes to show real leaderboard immediately
    const defaultVotes: Vote[] = [
      { id: 'v1', session_id: sessionId, place_id: 'place-cool-cool-mookata', user_id: 'sample_usr_1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'v2', session_id: sessionId, place_id: 'place-cool-cool-mookata', user_id: 'sample_usr_2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'v3', session_id: sessionId, place_id: 'place-cool-cool-mookata', user_id: 'sample_usr_3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'v4', session_id: sessionId, place_id: 'place-hiso-mookata', user_id: 'sample_usr_4', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'v5', session_id: sessionId, place_id: 'place-hiso-mookata', user_id: 'sample_usr_5', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'v6', session_id: sessionId, place_id: 'place-one-nimman', user_id: 'sample_usr_6', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'v7', session_id: sessionId, place_id: 'place-wat-phra-singh', user_id: 'sample_usr_7', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
    localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(defaultVotes));
    return defaultVotes;
  }

  /**
   * Casts or switches vote safely (Atomic Transaction)
   */
  static async castOrChangeVote(
    sessionId: string,
    placeId: string,
    userId: string
  ): Promise<VoteResult> {
    // 1. Supabase Cloud Execution
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('cast_or_change_vote', {
        p_session_id: sessionId,
        p_place_id: placeId,
        p_user_id: userId
      });

      if (error) {
        throw new Error(error.message);
      }
      return data as VoteResult;
    }

    // 2. Standalone Atomic Local Store
    const saved = localStorage.getItem(LOCAL_VOTES_KEY);
    let votes: Vote[] = saved ? JSON.parse(saved) : [];

    const existingIndex = votes.findIndex(
      v => v.session_id === sessionId && v.user_id === userId
    );

    let action: 'VOTE_CAST' | 'VOTE_CHANGED' | 'NO_CHANGE' = 'VOTE_CAST';
    let previous_place_id: string | undefined;

    if (existingIndex >= 0) {
      if (votes[existingIndex].place_id === placeId) {
        return {
          success: true,
          action: 'NO_CHANGE',
          session_id: sessionId,
          place_id: placeId,
          user_id: userId,
          previous_place_id: placeId
        };
      } else {
        previous_place_id = votes[existingIndex].place_id;
        votes[existingIndex].place_id = placeId;
        votes[existingIndex].updated_at = new Date().toISOString();
        action = 'VOTE_CHANGED';
      }
    } else {
      votes.push({
        id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        session_id: sessionId,
        place_id: placeId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      action = 'VOTE_CAST';
    }

    localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(votes));

    const result: VoteResult = {
      success: true,
      action,
      session_id: sessionId,
      place_id: placeId,
      user_id: userId,
      previous_place_id
    };

    // Broadcast change across tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'VOTE_UPDATE', payload: result });
    }

    return result;
  }

  /**
   * Add a new place with pending_verification / verified status
   */
  static async addPlace(newPlace: Omit<Place, 'id' | 'created_at'>): Promise<Place> {
    const place: Place = {
      ...newPlace,
      id: `place-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('places').insert(place);
    } else {
      const places = await this.getPlaces();
      places.push(place);
      localStorage.setItem(LOCAL_PLACES_KEY, JSON.stringify(places));
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'PLACES_UPDATE', payload: place });
      }
    }

    return place;
  }

  /**
   * Subscribe to real-time vote updates
   */
  static subscribeToUpdates(onUpdate: (event: any) => void): () => void {
    const cleanups: (() => void)[] = [];

    // 1. Supabase Realtime
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('realtime_votes_and_places')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, payload => {
          onUpdate({ type: 'VOTE_UPDATE', payload });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, payload => {
          onUpdate({ type: 'PLACES_UPDATE', payload });
        })
        .subscribe();

      cleanups.push(() => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      });
    }

    // 2. BroadcastChannel (for multi-tab real-time in demo mode)
    if (broadcastChannel) {
      const handler = (event: MessageEvent) => {
        onUpdate(event.data);
      };
      broadcastChannel.addEventListener('message', handler);
      cleanups.push(() => {
        broadcastChannel?.removeEventListener('message', handler);
      });
    }

    return () => {
      cleanups.forEach(c => c());
    };
  }
}
