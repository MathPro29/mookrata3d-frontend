ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS price TEXT,
  ADD COLUMN IF NOT EXISTS is_thai_helps_thai BOOLEAN NOT NULL DEFAULT false;

UPDATE public.places
SET is_thai_helps_thai = true
WHERE id IN (
  'place-jinbe-shabu-sushi-buffet',
  'place-moo-ood-old-city',
  'place-yukata-shabu-chang-phueak'
);
