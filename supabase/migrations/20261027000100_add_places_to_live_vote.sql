-- New restaurants become candidates in the current round without changing votes.
DROP POLICY IF EXISTS "Public can add mookata candidates outside live voting"
ON public.voting_session_places;
DROP POLICY IF EXISTS "Public can add mookata candidates to active session"
ON public.voting_session_places;

CREATE POLICY "Public can add mookata candidates to voting session"
ON public.voting_session_places FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.voting_sessions s
    JOIN public.places p ON p.id = place_id
    WHERE s.id = voting_session_places.session_id
      AND s.status IN ('active', 'completed', 'draft')
      AND p.zone_id IN ('zone-jed-yod', 'zone-old-city', 'zone-chang-khlan', 'zone-nimman', 'zone-chang-phueak')
      AND p.category ILIKE '%หมูกระทะ%'
  )
);
