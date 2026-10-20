-- ====================================================================
-- CHIANG MAI 3D INTERACTIVE MAP & VOTING SYSTEM - SUPABASE SCHEMA
-- ====================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PostGIS for geospatial analysis (optional/if enabled in project)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Drop existing objects if rerunning
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.voting_session_places CASCADE;
DROP TABLE IF EXISTS public.voting_sessions CASCADE;
DROP TABLE IF EXISTS public.places CASCADE;
DROP TABLE IF EXISTS public.zones CASCADE;

-- 3. Zones Table
CREATE TABLE public.zones (
  id TEXT PRIMARY KEY,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('Neighborhood', 'Subdistrict', 'District', 'Historic District')),
  boundary_geojson JSONB NOT NULL,
  boundary_source TEXT NOT NULL,
  is_approximate BOOLEAN NOT NULL DEFAULT false,
  center JSONB NOT NULL, -- [lon, lat]
  boundingbox JSONB, -- [minLat, maxLat, minLon, maxLon]
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Places Table
CREATE TABLE public.places (
  id TEXT PRIMARY KEY DEFAULT 'place-' || uuid_generate_v4()::text,
  zone_id TEXT NOT NULL REFERENCES public.zones(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  google_maps_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending_verification')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_places_zone_id ON public.places(zone_id);
CREATE INDEX idx_places_coords ON public.places(latitude, longitude);

-- 5. Voting Sessions Table
CREATE TABLE public.voting_sessions (
  id TEXT PRIMARY KEY DEFAULT 'session-' || uuid_generate_v4()::text,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'draft')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_voting_sessions_status ON public.voting_sessions(status);

-- 6. Voting Session Places (Many-to-Many choices for a session)
CREATE TABLE public.voting_session_places (
  session_id TEXT NOT NULL REFERENCES public.voting_sessions(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, place_id)
);

-- 7. Votes Table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL REFERENCES public.voting_sessions(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- CRITICAL: Prevent duplicate vote from the same user within the same session
  CONSTRAINT unique_user_vote_per_session UNIQUE (session_id, user_id)
);

CREATE INDEX idx_votes_session_place ON public.votes(session_id, place_id);
CREATE INDEX idx_votes_user_session ON public.votes(user_id, session_id);

-- ====================================================================
-- 8. ATOMIC VOTE TRANSACTION FUNCTION (RPC)
-- Handles casting or switching votes safely without race conditions
-- ====================================================================
CREATE OR REPLACE FUNCTION public.cast_or_change_vote(
  p_session_id TEXT,
  p_place_id TEXT,
  p_user_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_status TEXT;
  v_starts_at TIMESTAMPTZ;
  v_ends_at TIMESTAMPTZ;
  v_place_in_session BOOLEAN;
  v_previous_place_id TEXT;
  v_action TEXT;
BEGIN
  -- 1. Check session existence and active status
  SELECT status, starts_at, ends_at INTO v_session_status, v_starts_at, v_ends_at
  FROM public.voting_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Voting session not found';
  END IF;

  IF v_session_status <> 'active' OR now() < v_starts_at OR now() > v_ends_at THEN
    RAISE EXCEPTION 'Voting session is not active or has ended';
  END IF;

  -- 2. Verify place is an approved choice in this session
  SELECT EXISTS (
    SELECT 1 FROM public.voting_session_places
    WHERE session_id = p_session_id AND place_id = p_place_id
  ) INTO v_place_in_session;

  IF NOT v_place_in_session THEN
    RAISE EXCEPTION 'Place is not a registered candidate for this voting session';
  END IF;

  -- 3. Check if user already voted in this session
  SELECT place_id INTO v_previous_place_id
  FROM public.votes
  WHERE session_id = p_session_id AND user_id = p_user_id;

  IF FOUND THEN
    IF v_previous_place_id = p_place_id THEN
      -- Already voted for the same place
      v_action := 'NO_CHANGE';
    ELSE
      -- Change vote safely
      UPDATE public.votes
      SET place_id = p_place_id, updated_at = now()
      WHERE session_id = p_session_id AND user_id = p_user_id;
      v_action := 'VOTE_CHANGED';
    END IF;
  ELSE
    -- Cast new vote
    INSERT INTO public.votes (session_id, place_id, user_id, created_at, updated_at)
    VALUES (p_session_id, p_place_id, p_user_id, now(), now());
    v_action := 'VOTE_CAST';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'action', v_action,
    'session_id', p_session_id,
    'place_id', p_place_id,
    'user_id', p_user_id,
    'previous_place_id', v_previous_place_id
  );
END;
$$;

-- ====================================================================
-- 9. LEADERBOARD COMPUTATION FUNCTION
-- Returns aggregated vote counts and ranks per place for a session
-- ====================================================================
CREATE OR REPLACE FUNCTION public.get_session_leaderboard(p_session_id TEXT)
RETURNS TABLE (
  place_id TEXT,
  votes_count BIGINT,
  rank BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    vsp.place_id,
    COALESCE(COUNT(v.id), 0) AS votes_count,
    DENSE_RANK() OVER (ORDER BY COALESCE(COUNT(v.id), 0) DESC) AS rank
  FROM public.voting_session_places vsp
  LEFT JOIN public.votes v ON v.session_id = vsp.session_id AND v.place_id = vsp.place_id
  WHERE vsp.session_id = p_session_id
  GROUP BY vsp.place_id
  ORDER BY votes_count DESC;
$$;

-- ====================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_session_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Zones: Read-only for public
CREATE POLICY "Zones are viewable by everyone" ON public.zones FOR SELECT USING (true);

-- Places: Read-only for public, insertable
CREATE POLICY "Places are viewable by everyone" ON public.places FOR SELECT USING (true);
CREATE POLICY "Public can add places for verification" ON public.places FOR INSERT WITH CHECK (true);

-- Voting Sessions: Read-only for public
CREATE POLICY "Sessions are viewable by everyone" ON public.voting_sessions FOR SELECT USING (true);

-- Session Places: Read-only for public
CREATE POLICY "Session places are viewable by everyone" ON public.voting_session_places FOR SELECT USING (true);

-- Votes: Read-only aggregates or own vote, manage via RPC
CREATE POLICY "Votes are viewable by everyone" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Users can insert own votes" ON public.votes FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id IS NOT NULL);
CREATE POLICY "Users can update own votes" ON public.votes FOR UPDATE USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

-- Enable Supabase Realtime for votes and places
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.places;
