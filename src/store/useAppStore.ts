import { create } from 'zustand';
import type { LeaderboardEntry, Place, Vote, VotingSession, Zone } from '../types';
import { initialZones, mookataZoneIds } from '../data/initialData';
import { VotingService } from '../services/votingService';
import { getOrCreateUserId } from '../services/identityService';

const HIDDEN_ZONE_IDS_KEY = 'cm_map_hidden_zones_v1';
let unsubscribeFromUpdates: (() => void) | null = null;
const initialHiddenZoneIds: string[] = (() => {
  try {
    return (JSON.parse(localStorage.getItem(HIDDEN_ZONE_IDS_KEY) || '[]') as string[])
      .filter(zoneId => mookataZoneIds.includes(zoneId));
  } catch {
    return [];
  }
})();

interface AppState {
  // State
  zones: Zone[];
  hiddenZoneIds: string[];
  places: Place[];
  votes: Vote[];
  activeSession: VotingSession | null;
  myVotePlaceId: string | null;
  userId: string;
  selectedZoneId: string | null;
  hoveredZoneId: string | null;
  selectedPlaceId: string | null;
  is3D: boolean;
  showZones: boolean;
  isLeaderboardOpen: boolean;
  isAddPlaceOpen: boolean;
  isSidebarOpen: boolean;
  searchQuery: string;
  selectedCategory: string;
  isLoading: boolean;
  loadError: string | null;
  mapInstance: any | null;
  currentView: 'map' | 'results';
  isQrModalOpen: boolean;
  qrTargetPlaceId: string | null;

  // Actions
  init: () => Promise<void>;
  setVotingSession: (session: VotingSession) => void;
  finalizeVotingSession: () => Promise<void>;
  setCurrentView: (view: 'map' | 'results') => void;
  toggleQrModal: (open?: boolean, placeId?: string | null) => void;
  setMapInstance: (map: any) => void;
  selectZone: (zoneId: string | null, shouldFly?: boolean) => void;
  toggleZoneVisibility: (zoneId: string) => void;
  setHoveredZone: (zoneId: string | null) => void;
  selectPlace: (placeId: string | null, shouldFly?: boolean) => void;
  toggle3D: () => void;
  toggleZones: () => void;
  toggleLeaderboard: (open?: boolean) => void;
  toggleAddPlace: (open?: boolean) => void;
  toggleSidebar: (open?: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  castVote: (placeId: string) => Promise<{ success: boolean; action: string; message?: string }>;
  removeVote: (placeId: string) => Promise<{ success: boolean; message?: string }>;
  addPlace: (newPlace: Omit<Place, 'id' | 'created_at'>) => Promise<Place>;
  resetCamera: () => void;

  // Computed helpers
  getLeaderboard: () => LeaderboardEntry[];
  getUserVotedPlaceId: () => string | null;
  getFilteredPlaces: () => Place[];
  getZoneStats: (zoneId: string) => { placesCount: number; votesCount: number };
}

export const useAppStore = create<AppState>((set, get) => ({
  zones: initialZones,
  hiddenZoneIds: initialHiddenZoneIds,
  places: [],
  votes: [],
  activeSession: null,
  myVotePlaceId: null,
  userId: getOrCreateUserId(),
  selectedZoneId: null,
  hoveredZoneId: null,
  selectedPlaceId: null,
  is3D: true,
  showZones: true,
  isLeaderboardOpen: false,
  isAddPlaceOpen: false,
  isSidebarOpen: false,
  searchQuery: '',
  selectedCategory: 'all',
  isLoading: true,
  loadError: null,
  mapInstance: null,
  currentView: 'map',
  isQrModalOpen: false,
  qrTargetPlaceId: null,

  init: async () => {
    try {
      set({ isLoading: true, loadError: null });
      const session = await VotingService.getActiveSession();
      const sessionPlaces = await VotingService.getPlaces(session?.id);
      const votes = session && !session.final_results ? await VotingService.getVotes(session.id) : [];
      let myVotePlaceId: string | null = null;
      if (session && !session.final_results) {
        try {
          myVotePlaceId = await VotingService.getCurrentUserVote(session.id, get().userId);
        } catch (error) {
          // A missing/unavailable Edge Function should not prevent the map and
          // leaderboard from loading. The vote can still be cast by the server.
          console.warn('Could not load this device vote status:', error);
        }
      }

      set({
        activeSession: session,
        places: sessionPlaces,
        votes,
        myVotePlaceId,
        isLoading: false
      });

      // Subscribe to real-time events
      unsubscribeFromUpdates ??= VotingService.subscribeToUpdates(async () => {
        const session = await VotingService.getActiveSession();
        const sessionId = session?.id;
        if (!sessionId) {
          set({ activeSession: null, places: [], votes: [], myVotePlaceId: null });
          return;
        }
        const [updatedPlaces, updatedVotes] = await Promise.all([
          VotingService.getPlaces(sessionId),
          session.final_results ? Promise.resolve([]) : VotingService.getVotes(sessionId)
        ]);
        let myVotePlaceId: string | null = null;
        if (!session.final_results) {
          try {
            myVotePlaceId = await VotingService.getCurrentUserVote(sessionId, get().userId);
          } catch (error) {
            console.warn('Could not refresh this device vote status:', error);
          }
        }
        set({ activeSession: session, places: updatedPlaces, votes: updatedVotes, myVotePlaceId });
      });
    } catch (err) {
      console.error('Initialization error:', err);
      set({
        isLoading: false,
        loadError: err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'
      });
    }
  },

  setCurrentView: (view) => set({ currentView: view }),
  setVotingSession: (session) => set(state => ({
    activeSession: session,
    ...(session.final_results || state.activeSession?.status === 'completed'
      ? { votes: [], myVotePlaceId: null }
      : {}),
  })),
  finalizeVotingSession: async () => {
    const session = get().activeSession;
    if (!session || session.final_results) return;
    const completed = await VotingService.finalizeSession(session.id);
    set({ activeSession: completed, votes: [], myVotePlaceId: null });
  },
  toggleQrModal: (open, placeId = null) => {
    set((state) => ({
      isQrModalOpen: open !== undefined ? open : !state.isQrModalOpen,
      qrTargetPlaceId: placeId !== undefined ? placeId : state.qrTargetPlaceId
    }));
  },

  setMapInstance: (map) => set({ mapInstance: map }),

  selectZone: (zoneId, shouldFly = true) => {
    set({ selectedZoneId: zoneId });
    const { mapInstance, zones } = get();
    if (!mapInstance) return;

    if (!zoneId) {
      // Fly to Chiang Mai whole overview
      if (shouldFly) {
        mapInstance.flyTo({
          center: [98.986, 18.789],
          zoom: 12.2,
          pitch: get().is3D ? 45 : 0,
          bearing: get().is3D ? -15 : 0,
          duration: 1500,
          essential: true
        });
      }
      return;
    }

    const zone = zones.find(z => z.id === zoneId);
    if (zone && shouldFly) {
      if (zone.boundingbox) {
        // [minLat, maxLat, minLon, maxLon]
        const south = parseFloat(zone.boundingbox[0]);
        const north = parseFloat(zone.boundingbox[1]);
        const west = parseFloat(zone.boundingbox[2]);
        const east = parseFloat(zone.boundingbox[3]);
        mapInstance.fitBounds([[west, south], [east, north]], {
          padding: window.innerWidth < 1024
            ? { top: 110, bottom: 90, left: 32, right: 32 }
            : { top: 100, bottom: 100, left: 340, right: 100 },
          maxZoom: 15.5,
          pitch: get().is3D ? 45 : 0,
          duration: 1400
        });
      } else {
        mapInstance.flyTo({
          center: zone.center,
          zoom: 14,
          pitch: get().is3D ? 45 : 0,
          duration: 1400,
          essential: true
        });
      }
    }
  },

  setHoveredZone: (zoneId) => set({ hoveredZoneId: zoneId }),

  toggleZoneVisibility: (zoneId) => {
    const hiddenZoneIds = get().hiddenZoneIds.includes(zoneId)
      ? get().hiddenZoneIds.filter(id => id !== zoneId)
      : [...get().hiddenZoneIds, zoneId];
    localStorage.setItem(HIDDEN_ZONE_IDS_KEY, JSON.stringify(hiddenZoneIds));
    set({
      hiddenZoneIds,
      ...(get().selectedZoneId === zoneId ? { selectedZoneId: null } : {}),
      ...(get().places.some(place => place.id === get().selectedPlaceId && place.zone_id === zoneId)
        ? { selectedPlaceId: null }
        : {})
    });
  },

  selectPlace: (placeId, shouldFly = true) => {
    set({ selectedPlaceId: placeId, isSidebarOpen: false });
    const { mapInstance, places } = get();
    if (!placeId || !mapInstance) return;

    const place = places.find(p => p.id === placeId);
    if (place && shouldFly) {
      mapInstance.flyTo({
        center: [place.longitude, place.latitude],
        zoom: 16.5,
        pitch: get().is3D ? 52 : 0,
        bearing: get().is3D ? -20 : 0,
        duration: 1600,
        offset: [0, 50], // Offset so panel doesn't completely block pin
        essential: true
      });
    }
  },

  toggle3D: () => {
    const next3D = !get().is3D;
    set({ is3D: next3D });
    const map = get().mapInstance;
    if (map) {
      map.easeTo({
        pitch: next3D ? 48 : 0,
        bearing: next3D ? -15 : 0,
        duration: 1000
      });

      // Update 3D buildings layer if present
      if (map.getLayer('3d-buildings')) {
        map.setLayoutProperty('3d-buildings', 'visibility', next3D ? 'visible' : 'none');
      }
    }
  },

  toggleZones: () => {
    const nextShow = !get().showZones;
    set({ showZones: nextShow });
    const map = get().mapInstance;
    if (map) {
      const visibility = nextShow ? 'visible' : 'none';
      ['chiangmai-zones-fill', 'chiangmai-zones-line', 'chiangmai-zones-labels'].forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', visibility);
        }
      });
    }
  },

  toggleLeaderboard: (open) => {
    set(state => ({
      isLeaderboardOpen: open !== undefined ? open : !state.isLeaderboardOpen
    }));
  },

  toggleAddPlace: (open) => {
    set(state => ({
      isAddPlaceOpen: open !== undefined ? open : !state.isAddPlaceOpen
    }));
  },

  toggleSidebar: (open) => {
    set(state => ({
      isSidebarOpen: open !== undefined ? open : !state.isSidebarOpen
    }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  castVote: async (placeId) => {
    const { activeSession, userId } = get();
    if (!activeSession) {
      return { success: false, action: 'NO_SESSION' };
    }

    try {
      const result = await VotingService.castOrChangeVote(
        activeSession.id,
        placeId,
        userId
      );

      // Refresh votes
      const votes = await VotingService.getVotes(activeSession.id);
      set({ votes, myVotePlaceId: placeId });

      return { success: true, action: result.action };
    } catch (err: any) {
      console.error('Vote failed:', err);
      return { success: false, action: 'ERROR', message: err instanceof Error ? err.message : undefined };
    }
  },

  removeVote: async (placeId) => {
    const { activeSession, userId, myVotePlaceId } = get();
    if (!activeSession || myVotePlaceId !== placeId) {
      return { success: false, message: 'ไม่พบคะแนนโหวตของคุณที่ร้านนี้' };
    }

    try {
      const result = await VotingService.removeVote(activeSession.id, placeId, userId);
      if (!result.success) return { success: false, message: 'ไม่พบคะแนนโหวตของคุณที่ร้านนี้' };
      set({ myVotePlaceId: null });
      try {
        set({ votes: await VotingService.getVotes(activeSession.id) });
      } catch (error) {
        console.warn('Could not refresh votes after removal:', error);
      }
      return { success: true };
    } catch (err) {
      console.error('Remove vote failed:', err);
      return { success: false, message: err instanceof Error ? err.message : 'ถอนโหวตไม่สำเร็จ กรุณาลองอีกครั้ง' };
    }
  },

  addPlace: async (newPlace) => {
    const created = await VotingService.addPlace(newPlace);
    set(state => ({ places: [...state.places, created] }));
    return created;
  },

  resetCamera: () => {
    const map = get().mapInstance;
    if (map) {
      set({ selectedZoneId: null });
      map.flyTo({
        center: [98.986, 18.789],
        zoom: 12.2,
        pitch: get().is3D ? 45 : 0,
        bearing: get().is3D ? -15 : 0,
        duration: 1500,
        essential: true
      });
    }
  },

  // COMPUTED
  getLeaderboard: () => {
    const { places, zones, votes, activeSession, hiddenZoneIds } = get();
    if (!activeSession) return [];

    const visiblePlaces = places.filter(place => !hiddenZoneIds.includes(place.zone_id));
    const visiblePlaceIds = new Set(visiblePlaces.map(place => place.id));
    const visibleVotes = votes.filter(vote =>
      vote.session_id === activeSession.id && visiblePlaceIds.has(vote.place_id)
    );

    const voteCountMap = new Map<string, number>();
    visiblePlaces.forEach(p => voteCountMap.set(p.id, 0));

    visibleVotes.forEach(v => {
      const current = voteCountMap.get(v.place_id) || 0;
      voteCountMap.set(v.place_id, current + 1);
    });

    const totalVotes = visibleVotes.length;

    const entries = visiblePlaces.map(p => {
      const count = voteCountMap.get(p.id) || 0;
      const zone = zones.find(z => z.id === p.zone_id);
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return {
        place: p,
        zone,
        votes_count: count,
        percentage,
        rank: 0,
        is_winner: false,
        is_tied: false
      };
    });

    // Sort descending by votes
    entries.sort((a, b) => b.votes_count - a.votes_count);

    // Calculate ranks and ties
    let currentRank = 1;
    for (let i = 0; i < entries.length; i++) {
      if (i > 0 && entries[i].votes_count < entries[i - 1].votes_count) {
        currentRank = i + 1;
      }
      entries[i].rank = currentRank;
    }

    // Check tie at rank 1
    if (entries.length > 0 && entries[0].votes_count > 0) {
      const topVotes = entries[0].votes_count;
      const topCount = entries.filter(e => e.votes_count === topVotes).length;
      entries.forEach(e => {
        if (e.votes_count === topVotes) {
          e.is_winner = activeSession.status === 'completed' && topCount === 1;
          e.is_tied = topCount > 1;
        }
      });
    }

    return entries;
  },

  getUserVotedPlaceId: () => {
    return get().myVotePlaceId;
  },

  getFilteredPlaces: () => {
    const { places, selectedZoneId, searchQuery, selectedCategory, hiddenZoneIds } = get();
    return places.filter(place => {
      if (hiddenZoneIds.includes(place.zone_id)) {
        return false;
      }
      // Zone match
      if (selectedZoneId && place.zone_id !== selectedZoneId) {
        return false;
      }
      // Category match
      if (selectedCategory !== 'all' && place.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = place.name.toLowerCase().includes(q) || (place.name_en?.toLowerCase().includes(q) ?? false);
        const matchesDesc = place.description.toLowerCase().includes(q);
        const matchesAddress = place.address.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesAddress) {
          return false;
        }
      }
      return true;
    });
  },

  getZoneStats: (zoneId: string) => {
    const { places, votes } = get();
    const zonePlaces = places.filter(p => p.zone_id === zoneId);
    const placeIdSet = new Set(zonePlaces.map(p => p.id));
    const votesCount = votes.filter(v => placeIdSet.has(v.place_id)).length;
    return {
      placesCount: zonePlaces.length,
      votesCount
    };
  }
}));
