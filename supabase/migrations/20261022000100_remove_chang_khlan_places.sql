-- Remove excluded restaurants from the map and voting data.
-- Foreign keys cascade this removal to session candidates and votes.
DELETE FROM public.places
WHERE id IN (
  'place-chumphae-chang-khlan',
  'place-chang-phueak-mahidol',
  'place-big-big-shabu-old-city'
);
