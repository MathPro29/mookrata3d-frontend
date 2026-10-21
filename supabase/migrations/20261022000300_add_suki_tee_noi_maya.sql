-- Add the MAYA branch in its correct Nimman zone.
INSERT INTO public.zones (
  id, name_th, name_en, zone_type, boundary_geojson, boundary_source,
  is_approximate, center, boundingbox, color
)
VALUES (
  'zone-nimman', 'นิมมานเหมินท์', 'Nimman', 'Neighborhood',
  '{"type":"Polygon","coordinates":[[[98.962,18.8035],[98.9705,18.801],[98.974,18.793],[98.9725,18.7885],[98.965,18.789],[98.9625,18.794],[98.962,18.8035]]]}'::jsonb,
  'Urban neighborhood bounded by Huay Kaew Rd (North), Suthep Rd (South), Canal Rd (West), Sirimangkalajarn/Canal (East)',
  true, '[98.968,18.796]'::jsonb, '["18.7875","18.8040","98.9610","98.9740"]'::jsonb, '#8b5cf6'
)
ON CONFLICT (id) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  name_en = EXCLUDED.name_en,
  zone_type = EXCLUDED.zone_type,
  boundary_geojson = EXCLUDED.boundary_geojson,
  boundary_source = EXCLUDED.boundary_source,
  is_approximate = EXCLUDED.is_approximate,
  center = EXCLUDED.center,
  boundingbox = EXCLUDED.boundingbox,
  color = EXCLUDED.color;

INSERT INTO public.places (
  id, zone_id, name, name_en, category, description, address,
  latitude, longitude, image_url, google_maps_url, verification_status, created_at
)
VALUES (
  'place-suki-tee-noi-maya-chiang-mai', 'zone-nimman',
  'สุกี้ตี๋น้อย เมญ่า เชียงใหม่ (ชั้น 6)', 'Suki Tee Noi Maya Chiang Mai',
  'ร้านอาหาร & สุกี้', 'สาขาเมญ่า เชียงใหม่ ชั้น 6 เพิ่มจากตำแหน่งใน Google Maps',
  'ศูนย์การค้าเมญ่า เชียงใหม่ ชั้น 6', 18.8020591, 98.9672691,
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  'https://maps.app.goo.gl/z3AnrS7LazWoox7b9', 'verified', now()
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
WHERE id = 'place-suki-tee-noi-maya-chiang-mai'
ON CONFLICT (session_id, place_id) DO NOTHING;
