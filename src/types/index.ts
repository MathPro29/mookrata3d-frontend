import type { Polygon, MultiPolygon } from 'geojson';

export type ZoneType = 'Neighborhood' | 'Subdistrict' | 'District' | 'Historic District';

export interface Zone {
  id: string;
  name_th: string;
  name_en: string;
  zone_type: ZoneType;
  boundary_geojson: Polygon | MultiPolygon;
  boundary_source: string;
  is_approximate: boolean;
  center: [number, number]; // [lon, lat]
  boundingbox?: [string, string, string, string]; // [minLat, maxLat, minLon, maxLon]
  color: string;
  created_at?: string;
  places_count?: number;
  votes_count?: number;
}

export type VerificationStatus = 'verified' | 'pending_verification';

export interface Place {
  id: string;
  zone_id: string;
  name: string;
  name_en?: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  image_url: string;
  google_maps_url: string;
  review_url?: string;
  price?: string;
  category: string;
  verification_status: VerificationStatus;
  created_at: string;
  votes_count?: number;
}

export type SessionStatus = 'active' | 'completed' | 'draft';

export interface VotingSession {
  id: string;
  title: string;
  status: SessionStatus;
  starts_at: string;
  ends_at: string;
  created_at: string;
  final_results?: {
    winners: { place_id: string; name: string; votes_count: number }[];
    winning_vote_count: number;
    total_votes: number;
  } | null;
}

export interface VotingSessionPlace {
  session_id: string;
  place_id: string;
}

export interface Vote {
  id: string;
  session_id: string;
  place_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  place: Place;
  zone: Zone | undefined;
  votes_count: number;
  percentage: number;
  rank: number;
  is_winner: boolean;
  is_tied: boolean;
}

export interface VotingStats {
  totalVotes: number;
  totalVoters: number;
  activeSession: VotingSession | null;
  leaderboard: LeaderboardEntry[];
  userVotedPlaceId: string | null;
}
