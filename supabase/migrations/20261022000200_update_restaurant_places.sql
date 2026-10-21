-- Remove all restaurants assigned to Jed Yod and add the two user-provided places.
-- Place deletion cascades to voting candidates and votes.
DELETE FROM public.places
WHERE zone_id = 'zone-jed-yod';

INSERT INTO public.places (
  id, zone_id, name, name_en, category, description, address,
  latitude, longitude, image_url, google_maps_url, verification_status, created_at
)
VALUES
  (
    'place-jinbe-shabu-sushi-buffet', 'zone-old-city', 'จินเบชาบูซูชิ บุฟเฟ่ต์',
    'Jinbe Shabu Sushi Buffet', 'ร้านอาหาร & ชาบู',
    'ร้านชาบูและซูชิบุฟเฟ่ต์ เพิ่มจากตำแหน่งใน Google Maps', 'เชียงใหม่',
    18.7895667, 98.9784433,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://maps.app.goo.gl/6BUjWRjehGxaZKxLA', 'verified', now()
  ),
  (
    'place-kin-mookata-chiang-mai', 'zone-old-city', 'กินหมูกระทะ สาขาเชียงใหม่',
    'Kin Mookata Chiang Mai', 'ร้านอาหาร & หมูกระทะ',
    'ร้านหมูกระทะ เพิ่มจากตำแหน่งใน Google Maps', 'เชียงใหม่',
    18.7999469, 98.9914715,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://maps.app.goo.gl/AxXAy1itoNdc9eBK6', 'verified', now()
  )
ON CONFLICT (id) DO UPDATE SET
  zone_id = EXCLUDED.zone_id,
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  image_url = EXCLUDED.image_url,
  google_maps_url = EXCLUDED.google_maps_url,
  verification_status = EXCLUDED.verification_status;

INSERT INTO public.voting_session_places (session_id, place_id)
SELECT 'session-cm-trip-2026', id
FROM public.places
WHERE id IN ('place-jinbe-shabu-sushi-buffet', 'place-kin-mookata-chiang-mai')
ON CONFLICT (session_id, place_id) DO NOTHING;
