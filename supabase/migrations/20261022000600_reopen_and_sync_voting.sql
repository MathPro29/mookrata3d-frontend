-- Reopen the existing Chiang Mai restaurant poll and sync its current choices.
-- Existing votes are preserved. The poll remains open until an admin closes it.
UPDATE public.voting_sessions
SET status = 'active',
    starts_at = now(),
    ends_at = '2099-12-31T23:59:59Z'::timestamptz
WHERE id = 'session-cm-trip-2026'
  AND status = 'completed';

INSERT INTO public.voting_session_places (session_id, place_id)
SELECT 'session-cm-trip-2026', id
FROM public.places
WHERE id IN (
  'place-cool-cool-mookata',
  'place-moo-ood-old-city',
  'place-jinbe-shabu-sushi-buffet',
  'place-kin-mookata-chiang-mai',
  'place-suki-tee-noi-maya-chiang-mai',
  'place-yukata-shabu-chang-phueak'
)
ON CONFLICT (session_id, place_id) DO NOTHING;
