import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Place, Vote, VotingSession } from '../types';
import { initialPlaces, initialSession, mookataZoneIds } from '../data/initialData';

const EXCLUDED_PLACE_IDS = new Set([
  'place-chumphae-chang-khlan',
  'place-chang-phueak-mahidol',
  'place-big-big-shabu-old-city',
  'place-pp-moo-jum-old-city',
]);
const EXCLUDED_ZONE_IDS = new Set(['zone-jed-yod']);
const MAP_LINK_PLACE_IDS = new Set([
  'place-jinbe-shabu-sushi-buffet',
  'place-kin-mookata-chiang-mai',
  'place-suki-tee-noi-maya-chiang-mai',
  'place-yukata-shabu-chang-phueak',
]);

const isMookataPlace = (place: Place) =>
  !EXCLUDED_PLACE_IDS.has(place.id) &&
  !EXCLUDED_ZONE_IDS.has(place.zone_id) &&
  mookataZoneIds.includes(place.zone_id) &&
  (place.category?.includes('อาหาร') ||
    place.category?.includes('หมูกระทะ') ||
    place.name.includes('หมูกระทะ') ||
    place.name_en?.toLowerCase().includes('mookata'));

const includeMapLinkedPlaces = (places: Place[]) => {
  const mergedPlaces = new Map<string, Place>();
  places.filter(isMookataPlace).forEach(place => mergedPlaces.set(place.id, place));
  initialPlaces
    .filter(place => MAP_LINK_PLACE_IDS.has(place.id) && isMookataPlace(place))
    .forEach(place => {
      const currentPlace = mergedPlaces.get(place.id);
      mergedPlaces.set(place.id, currentPlace ? { ...place, ...currentPlace } : place);
    });
  initialPlaces
    .filter(place => place.review_url || place.price)
    .forEach(place => {
      const currentPlace = mergedPlaces.get(place.id);
      if (currentPlace) {
        mergedPlaces.set(place.id, {
          ...currentPlace,
          review_url: place.review_url ?? currentPlace.review_url,
          price: place.price ?? currentPlace.price,
        });
      }
    });
  return [...mergedPlaces.values()].sort((a, b) => a.name.localeCompare(b.name, 'th'));
};

// Storage keys for local atomic fallback
const LOCAL_VOTES_KEY = 'cm_map_local_votes_v1';
const LOCAL_PLACES_KEY = 'cm_map_local_places_v1';
const LOCAL_SESSION_KEY = 'cm_map_local_session_v1';

// Cross-tab real-time sync channel
let broadcastChannel: BroadcastChannel | null = null;
let activeRealtimeCleanup: (() => void) | null = null;
let activeBroadcastCleanup: (() => void) | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel('chiangmai_voting_realtime_channel');
}

export interface VoteResult {
  success: boolean;
  action: 'VOTE_CAST' | 'VOTE_CHANGED' | 'NO_CHANGE';
  session_id: string;
  place_id: string;
  user_id?: string;
  previous_place_id?: string;
  message?: string;
}

export class VotingService {
  /**
   * Retrieves active voting session
   */
  static async getActiveSession(): Promise<VotingSession | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('voting_sessions')
        .select('*')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const cloudSession = data as VotingSession;
        // Keep the seeded poll open until an admin closes it.
        if (cloudSession.id === initialSession.id && cloudSession.status === 'active' &&
          Date.parse(cloudSession.ends_at) < Date.now()) {
          return { ...cloudSession, ends_at: initialSession.ends_at };
        }
        return cloudSession;
      }
      if (error) throw new Error(error.message);
      return null;
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

  static async getCurrentUserVote(sessionId: string, userId: string): Promise<string | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.functions.invoke('current-vote', {
        body: { session_id: sessionId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data?.place_id ?? null;
    }

    const votes = await this.getVotes(sessionId);
    return votes.find(vote => vote.user_id === userId)?.place_id ?? null;
  }

  static async manageVotingSession(
    adminKey: string,
    sessionId: string,
    action: 'set_end_time' | 'close_now' | 'reopen',
    endsAt?: string
  ): Promise<VotingSession> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('การตั้งค่าเวลาปิดและจำกัด IP ต้องเชื่อมต่อ Supabase');
    }

    const { data, error } = await supabase.functions.invoke('manage-voting', {
      body: { session_id: sessionId, action, ends_at: endsAt },
      headers: { 'x-admin-key': adminKey },
    });
    if (error) {
      let message = error.message;
      const response = error.context;
      if (response instanceof Response) {
        try {
          const payload = await response.clone().json();
          if (typeof payload?.error === 'string') message = payload.error;
        } catch {
          // Retain the Supabase error message when its response is not JSON.
        }
      }
      throw new Error(message);
    }
    if (data?.error) throw new Error(data.error);
    return data.session as VotingSession;
  }

  /**
   * Retrieves all places
   */
  static async getPlaces(sessionId?: string): Promise<Place[]> {
    if (isSupabaseConfigured && supabase) {
      if (sessionId) {
        const { data: candidates, error: candidateError } = await supabase
          .from('voting_session_places')
          .select('place_id')
          .eq('session_id', sessionId);
        if (candidateError) throw new Error(candidateError.message);
        const candidateIds = (candidates || []).map(candidate => candidate.place_id);
        if (candidateIds.length === 0) {
          return includeMapLinkedPlaces(initialPlaces.filter(isMookataPlace));
        }

        const { data, error } = await supabase
          .from('places')
          .select('*')
          .in('id', candidateIds)
          .order('name', { ascending: true });
        if (error) throw new Error(error.message);
        return includeMapLinkedPlaces((data || []) as Place[]);
      }

      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);
      return includeMapLinkedPlaces((data || []) as Place[]);
    }

    const saved = localStorage.getItem(LOCAL_PLACES_KEY);
    if (saved) {
      try {
        const places = new Map(initialPlaces.map(place => [place.id, place]));
        (JSON.parse(saved) as Place[]).filter(isMookataPlace).forEach(place => places.set(place.id, place));
        return includeMapLinkedPlaces([...places.values()]);
      } catch (e) {
        // fallback
      }
    }
    return initialPlaces.filter(isMookataPlace);
  }

  /**
   * Retrieves all votes for session
   */
  static async getVotes(sessionId: string): Promise<Vote[]> {
    const candidateIds = new Set((await this.getPlaces(sessionId)).map(place => place.id));
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('session_id', sessionId);

      if (!error && data) {
        return (data as Vote[]).filter(vote => candidateIds.has(vote.place_id));
      }
      if (error) throw new Error(error.message);
    }

    const saved = localStorage.getItem(LOCAL_VOTES_KEY);
    if (saved) {
      try {
        const allVotes: Vote[] = JSON.parse(saved);
        const sampleVoteIds = new Set(['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7']);
        const realVotes = allVotes.filter(v => !sampleVoteIds.has(v.id));
        if (realVotes.length !== allVotes.length) {
          localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(realVotes));
        }
        return realVotes.filter(v => v.session_id === sessionId && candidateIds.has(v.place_id));
      } catch (e) {
        return [];
      }
    }

    return [];
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
      const { data, error } = await supabase.functions.invoke('cast-vote', {
        body: { session_id: sessionId, place_id: placeId },
      });

      if (error) {
        throw new Error(error.message);
      }
      if (data?.error) throw new Error(data.error);
      return data as VoteResult;
    }

    // 2. Standalone Atomic Local Store
    const session = await this.getActiveSession();
    const now = Date.now();
    if (!session || session.id !== sessionId || session.status !== 'active' ||
      now < Date.parse(session.starts_at) || now > Date.parse(session.ends_at)) {
      throw new Error('Voting session is not active');
    }
    const candidates = await this.getPlaces(sessionId);
    if (!candidates.some(place => place.id === placeId)) {
      throw new Error('Place is not a registered candidate for this voting session');
    }

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

    if (!isMookataPlace(place)) {
      throw new Error('เพิ่มได้เฉพาะร้านหมูกระทะในโซนเจ็ดยอด คูเมือง และช้างคลาน');
    }

    if (isSupabaseConfigured && supabase) {
      const session = await this.getActiveSession();
      if (!session) throw new Error('ยังไม่มีรอบโหวตที่เปิดใช้งาน');
      const { error } = await supabase.from('places').insert(place);
      if (error) throw new Error(error.message);
      const { error: candidateError } = await supabase
        .from('voting_session_places')
        .insert({ session_id: session.id, place_id: place.id });
      if (candidateError) throw new Error(candidateError.message);
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
    const client = supabase;
    if (isSupabaseConfigured && client) {
      if (!activeRealtimeCleanup) {
        // Use a fresh topic after hot reload so Supabase never returns an already-subscribed channel.
        client.getChannels()
          .filter(channel => channel.topic.startsWith('realtime:realtime_votes_and_places'))
          .forEach(channel => { void client.removeChannel(channel); });

        const channel = client
          .channel(`realtime_votes_and_places_${crypto.randomUUID()}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, payload => {
            onUpdate({ type: 'VOTE_UPDATE', payload });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, payload => {
            onUpdate({ type: 'PLACES_UPDATE', payload });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'voting_session_places' }, payload => {
            onUpdate({ type: 'PLACES_UPDATE', payload });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'voting_sessions' }, payload => {
            onUpdate({ type: 'SESSION_UPDATE', payload });
          })
          .subscribe();

        activeRealtimeCleanup = () => {
          void client.removeChannel(channel);
          activeRealtimeCleanup = null;
        };
      }
      cleanups.push(() => activeRealtimeCleanup?.());
    }

    // 2. BroadcastChannel (for multi-tab real-time in demo mode)
    if (broadcastChannel && !activeBroadcastCleanup) {
      const handler = (event: MessageEvent) => {
        onUpdate(event.data);
      };
      broadcastChannel.addEventListener('message', handler);
      activeBroadcastCleanup = () => {
        broadcastChannel?.removeEventListener('message', handler);
        activeBroadcastCleanup = null;
      };
    }
    if (broadcastChannel) cleanups.push(() => activeBroadcastCleanup?.());

    return () => {
      cleanups.forEach(c => c());
    };
  }
}
