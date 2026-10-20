-- Safe data migration for the mookata voting app.
-- Run once after supabase/schema.sql has been applied to an empty project.
-- Never rerun the base schema against live data because it drops and recreates tables.
-- This file does not drop tables or delete votes. It replaces only this session's candidate list.

INSERT INTO public.zones (id, name_th, name_en, zone_type, boundary_geojson, boundary_source, is_approximate, center, boundingbox, color)
VALUES('zone-old-city', 'คูเมืองเชียงใหม่', 'Old City / Moat', 'Historic District', '{"type":"Polygon","coordinates":[[[98.978,18.7962],[98.9858,18.796],[98.9936,18.7958],[98.9938,18.7886],[98.9935,18.7812],[98.9858,18.7814],[98.9782,18.7817],[98.978,18.789],[98.978,18.7962]]]}'::jsonb, 'Physical historic moat boundary (Moon Mueang, Arak, Manee Nopparat, Bumrung Buri Roads)', false, '[98.986,18.7885]'::jsonb, '["18.7812","18.7962","98.9780","98.9938"]'::jsonb, '#f59e0b'),
('zone-jed-yod', 'เจ็ดยอด', 'Jed Yod', 'Neighborhood', '{"type":"Polygon","coordinates":[[[98.963,18.807],[98.966,18.8145],[98.9745,18.812],[98.973,18.803],[98.967,18.8035],[98.963,18.807]]]}'::jsonb, 'Community perimeter around Wat Chet Yot, Superhighway, and Canal Rd', true, '[98.969,18.808]'::jsonb, '["18.8020","18.8150","98.9620","98.9760"]'::jsonb, '#10b981'),
('zone-chang-khlan', 'ช้างคลาน', 'Chang Khlan', 'Subdistrict', '{"type":"Polygon","coordinates":[[[98.9773319,18.7691254],[99.0039056,18.7630326],[99.0040305,18.7634743],[99.0041555,18.763916],[99.0041383,18.7644931],[99.0040096,18.7649563],[99.0025505,18.7672968],[99.0022286,18.7679876],[99.0020484,18.7688693],[99.0020398,18.7697795],[99.0022587,18.771096],[99.0026964,18.7719005],[99.0036019,18.7732211],[99.004443,18.7740094],[99.0061124,18.7754152],[99.0065588,18.7759678],[99.0069107,18.7767764],[99.0070094,18.777394],[99.0069064,18.7779709],[99.0065502,18.7789583],[99.005679,18.7804413],[99.0047907,18.7821843],[99.0045761,18.7828994],[99.0044945,18.783452],[99.0046319,18.7845774],[99.0046319,18.7850081],[99.0047048,18.7864423],[99.0046405,18.7869217],[99.0044199,18.7876167],[99.0033182,18.7875239],[99.0030235,18.7875239],[99.0026748,18.7875495],[99.0020584,18.7876647],[99.0017069,18.7877364],[99.0011013,18.7879027],[99.0006931,18.7879949],[98.9992738,18.7882406],[98.9988655,18.7883071],[98.997722,18.7882764],[98.9973327,18.7882329],[98.9970109,18.7882227],[98.9964865,18.788151],[98.9936446,18.7877786],[98.993684,18.7876678],[98.9937078,18.7875808],[98.9937044,18.7874389],[98.9936295,18.7871132],[98.9935103,18.786823],[98.99347,18.7866979],[98.9931476,18.7818347],[98.9930919,18.7813837],[98.9929889,18.7809937],[98.9929575,18.7805191],[98.9929964,18.7804856],[98.9933928,18.7803516],[98.993545,18.7802477],[98.9936547,18.7801204],[98.993998,18.7794536],[98.9941715,18.7791386],[98.9947767,18.7783947],[98.9951412,18.7780194],[98.9953323,18.7777782],[98.9955411,18.7775202],[98.9954668,18.777423],[98.9954562,18.7773526],[98.9954597,18.777299],[98.995619,18.7770946],[98.9949287,18.7764073],[98.994681,18.7760186],[98.994412,18.7755227],[98.9943342,18.7754221],[98.9942068,18.7753685],[98.9940086,18.7751139],[98.9938033,18.7749731],[98.9937183,18.7748793],[98.9935485,18.7747051],[98.9931733,18.7745174],[98.9929751,18.7743029],[98.9927628,18.7740349],[98.9925504,18.7738874],[98.9922106,18.77374],[98.9919487,18.773559],[98.9917152,18.7733647],[98.9915311,18.7732575],[98.9911276,18.7730899],[98.9906392,18.7728487],[98.9903349,18.7727481],[98.9902358,18.7726744],[98.9900689,18.7726714],[98.9895404,18.7727868],[98.9892314,18.7728831],[98.9886988,18.7729062],[98.9881215,18.7728484],[98.9876174,18.772833],[98.9872068,18.7729139],[98.9869181,18.7729292],[98.9860603,18.7728869],[98.9855318,18.7729485],[98.9850887,18.7730101],[98.9847147,18.7730255],[98.9843447,18.7730293],[98.984113,18.7730486],[98.9832104,18.7734142],[98.9827185,18.7735644],[98.9822754,18.7736952],[98.9819379,18.7737684],[98.981694,18.7738646],[98.9814013,18.7740494],[98.9810598,18.7741225],[98.9808606,18.7741225],[98.9806898,18.7741533],[98.9806085,18.7741687],[98.9804825,18.7737953],[98.980328,18.7734604],[98.9793726,18.7719477],[98.9775879,18.7694803],[98.9773319,18.7691254]]]}'::jsonb, 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 8', false, '[99.0004559,18.7757453]'::jsonb, '["18.7630326","18.7883071","98.9773319","99.0070094"]'::jsonb, '#ec4899')
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

INSERT INTO public.voting_sessions (id, title, status, starts_at, ends_at)
VALUES ('session-cm-trip-2026', 'โหวตร้านหมูกระทะเชียงใหม่', 'active', now() - interval '1 day', now() + interval '30 days')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title;

INSERT INTO public.places (id, zone_id, name, name_en, category, description, address, latitude, longitude, image_url, google_maps_url, verification_status, created_at)
VALUES
('place-cool-cool-mookata', 'zone-chang-khlan', 'Cool Cool หมูกระทะ', 'Cool Cool Mookata', 'ร้านอาหาร & หมูกระทะ', 'ร้านหมูกระทะและปิ้งย่างขวัญใจคนเชียงใหม่ ตั้งอยู่บนถนนคชสาร ใกล้คูเมืองแจ่งขะต๊ำ วัตถุดิบคุณภาพดี น้ำจิ้มสูตรเด็ด บรรยากาศโปร่งสบาย เหมาะกับการสังสรรค์ยามค่ำคืน', '111/4-5 ถนนคชสาร แขวงเม็งราย ตำบลพระสิงห์/ช้างคลาน อำเภอเมืองเชียงใหม่ เชียงใหม่ 55520', 18.7816622, 98.9932611, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://maps.app.goo.gl/JyUKKvj5a78ZZfuS9', 'verified', now()),
('place-moo-ood-old-city', 'zone-old-city', 'หมูอู๊ดหมูกระทะ คูเมือง', 'Moo Ood BBQ Old City', 'ร้านอาหาร & หมูกระทะ', 'บุฟเฟต์หมูกระทะพร้อมอาหารทะเลและของทานเล่น อยู่ฝั่งในคูเมืองบริเวณแจ่งหัวริน', '197 ถนนศรีภูมิ ตำบลศรีภูมิ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200', 18.795279, 98.980787, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://maps.google.com/?q=18.795279,98.980787', 'verified', now()),
('place-big-big-shabu-old-city', 'zone-old-city', 'Big Big Shabu คูเมือง', 'Big Big Shabu Old City', 'ร้านอาหาร & หมูกระทะ', 'ร้านหมูกระทะและชาบูบุฟเฟต์ในคูเมือง มีทั้งเตาย่างและหม้อชาบู', '2 ถนนศรีภูมิ ตำบลศรีภูมิ อำเภอเมืองเชียงใหม่ เชียงใหม่', 18.7952167, 98.9886458, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://maps.google.com/?q=18.7952167,98.9886458', 'verified', now()),
('place-pp-moo-jum-old-city', 'zone-old-city', 'PP หมูจุ่ม & กระทะร้อน คูเมือง', 'PP Moo Jum & Hot Pan Old City', 'ร้านอาหาร & หมูกระทะ', 'ร้านหมูกระทะและหมูจุ่มในคูเมืองด้านใน ใกล้ประตูสวนดอก', '31/2 ถนนอารักษ์ ตำบลศรีภูมิ อำเภอเมืองเชียงใหม่ เชียงใหม่', 18.7894924712, 98.9784599067, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://maps.google.com/?q=18.7894924712,98.9784599067', 'verified', now()),
('place-kobori-jed-yod', 'zone-jed-yod', 'โกโบริหมูกระทะ สาขาเจ็ดยอด', 'Kobori Mookata Jed Yod', 'ร้านอาหาร & หมูกระทะ', 'บุฟเฟต์หมูกระทะและซีฟู้ดย่านเจ็ดยอด มีของทานเล่นให้เลือกหลายอย่าง', '11/21 ถนนรอบเมืองเชียงใหม่ ตำบลช้างเผือก อำเภอเมืองเชียงใหม่ เชียงใหม่ 50300', 18.8110055, 98.9634693, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://maps.google.com/?q=18.8110055,98.9634693', 'verified', now()),
('place-fifa-mookata-jed-yod', 'zone-jed-yod', 'ฟีฟ่า หมูกระทะ เจ็ดยอด', 'FIFA Mookata Jed Yod', 'ร้านอาหาร & หมูกระทะ', 'บุฟเฟต์หมูกระทะเตาถ่านพร้อมซีฟู้ด อยู่ข้างสนามหญ้าเทียมเจ็ดยอด–อยู่เย็น', 'สนามหญ้าเทียมเจ็ดยอด–อยู่เย็น ซอย 7 ตำบลช้างเผือก อำเภอเมืองเชียงใหม่ เชียงใหม่ 50230', 18.8100203, 98.9752197, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://maps.google.com/?q=18.8100203,98.9752197', 'verified', now()),
('place-chang-phueak-jed-yod-4', 'zone-jed-yod', 'หมูกระทะช้างเผือก สาขา 4 เจ็ดยอด', 'Chang Phueak Mookata Branch 4 Jed Yod', 'ร้านอาหาร & หมูกระทะ', 'ร้านหมูกระทะสาขาเจ็ดยอด อยู่ถนนคันคลองชลประทานหน้าโรงแรมบายสิริมายา', '11/14 ถนนคันคลองชลประทาน ตำบลช้างเผือก อำเภอเมืองเชียงใหม่ เชียงใหม่', 18.8095501246, 98.9631698158, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://maps.google.com/?q=18.8095501246,98.9631698158', 'verified', now()),
('place-chang-phueak-mahidol', 'zone-chang-khlan', 'หมูกระทะช้างเผือก สาขามหิดล', 'Chang Phueak Mookata Mahidol', 'ร้านอาหาร & หมูกระทะ', 'บุฟเฟต์หมูกระทะสาขาถนนมหิดล ตรงข้ามศูนย์มาสด้า', '146 ถนนมหิดล ตำบลป่าแดด อำเภอเมืองเชียงใหม่ เชียงใหม่', 18.765631606, 98.989500124, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://maps.google.com/?q=18.765631606,98.989500124', 'verified', now()),
('place-chumphae-chang-khlan', 'zone-chang-khlan', 'ชุมแพเนื้อกระทะ เชียงใหม่แลนด์', 'Chum Phae Grilled Pan Chiang Mai Land', 'ร้านอาหาร & หมูกระทะ', 'ร้านเนื้อกระทะและหมูกระทะแบบสั่งเป็นชุด อยู่ในโครงการเชียงใหม่แลนด์ ซอย 4', 'เชียงใหม่แลนด์ ซอย 4 ตำบลช้างคลาน อำเภอเมืองเชียงใหม่ เชียงใหม่', 18.7673128148, 98.9962089876, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://maps.google.com/?q=18.7673128148,98.9962089876', 'verified', now())
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

DELETE FROM public.voting_session_places
WHERE session_id = 'session-cm-trip-2026'
  AND place_id NOT IN (
    'place-cool-cool-mookata', 'place-moo-ood-old-city', 'place-big-big-shabu-old-city',
    'place-pp-moo-jum-old-city', 'place-kobori-jed-yod', 'place-fifa-mookata-jed-yod',
    'place-chang-phueak-jed-yod-4', 'place-chang-phueak-mahidol', 'place-chumphae-chang-khlan'
  );

INSERT INTO public.voting_session_places (session_id, place_id)
SELECT 'session-cm-trip-2026', id FROM public.places
WHERE id IN (
  'place-cool-cool-mookata', 'place-moo-ood-old-city', 'place-big-big-shabu-old-city',
  'place-pp-moo-jum-old-city', 'place-kobori-jed-yod', 'place-fifa-mookata-jed-yod',
  'place-chang-phueak-jed-yod-4', 'place-chang-phueak-mahidol', 'place-chumphae-chang-khlan'
)
ON CONFLICT (session_id, place_id) DO NOTHING;

DROP POLICY IF EXISTS "Public can add mookata candidates to active session" ON public.voting_session_places;
CREATE POLICY "Public can add mookata candidates to active session"
ON public.voting_session_places FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.voting_sessions s
    JOIN public.places p ON p.id = place_id
    WHERE s.id = voting_session_places.session_id
      AND s.status = 'active' AND now() BETWEEN s.starts_at AND s.ends_at
      AND p.zone_id IN ('zone-jed-yod', 'zone-old-city', 'zone-chang-khlan')
      AND p.category ILIKE '%หมูกระทะ%'
  )
);

-- Store only a keyed hash of each requester's IP in a private table.
-- Raw IP addresses are never written to the database.
CREATE TABLE IF NOT EXISTS public.vote_ip_locks (
  session_id TEXT NOT NULL REFERENCES public.voting_sessions(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  vote_id UUID NOT NULL UNIQUE REFERENCES public.votes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, ip_hash)
);
ALTER TABLE public.vote_ip_locks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.vote_ip_locks FROM anon, authenticated;
GRANT ALL ON public.vote_ip_locks TO service_role;

-- Close the permissive legacy REST policies/RPC so public clients cannot
-- bypass the IP lock by writing votes or supplying an arbitrary user id.
DROP POLICY IF EXISTS "Users can insert own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can update own votes" ON public.votes;
REVOKE INSERT, UPDATE, DELETE ON public.votes FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cast_or_change_vote(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.cast_or_change_vote_by_ip(
  p_session_id TEXT,
  p_place_id TEXT,
  p_ip_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.voting_sessions%ROWTYPE;
  v_vote_id UUID;
  v_previous_place_id TEXT;
  v_action TEXT;
BEGIN
  -- Serialize votes within this poll to prevent two first-time requests from the
  -- same IP creating duplicate rows at the same moment.
  SELECT * INTO v_session
  FROM public.voting_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND OR v_session.status <> 'active'
    OR now() < v_session.starts_at OR now() > v_session.ends_at THEN
    RAISE EXCEPTION 'Voting session is not active or has ended';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.voting_session_places
    WHERE session_id = p_session_id AND place_id = p_place_id
  ) THEN
    RAISE EXCEPTION 'Place is not a registered candidate for this voting session';
  END IF;

  SELECT l.vote_id, v.place_id INTO v_vote_id, v_previous_place_id
  FROM public.vote_ip_locks l
  JOIN public.votes v ON v.id = l.vote_id
  WHERE l.session_id = p_session_id AND l.ip_hash = p_ip_hash
  FOR UPDATE OF v;

  IF FOUND THEN
    IF v_previous_place_id = p_place_id THEN
      v_action := 'NO_CHANGE';
    ELSE
      UPDATE public.votes SET place_id = p_place_id, updated_at = now()
      WHERE id = v_vote_id;
      v_action := 'VOTE_CHANGED';
    END IF;
  ELSE
    INSERT INTO public.votes (session_id, place_id, user_id, created_at, updated_at)
    VALUES (p_session_id, p_place_id, 'ip-voter-' || gen_random_uuid()::text, now(), now())
    RETURNING id INTO v_vote_id;

    INSERT INTO public.vote_ip_locks (session_id, ip_hash, vote_id)
    VALUES (p_session_id, p_ip_hash, v_vote_id);
    v_action := 'VOTE_CAST';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'action', v_action,
    'session_id', p_session_id,
    'place_id', p_place_id,
    'previous_place_id', v_previous_place_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cast_or_change_vote_by_ip(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cast_or_change_vote_by_ip(TEXT, TEXT, TEXT) TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'voting_session_places'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.voting_session_places;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'voting_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.voting_sessions;
  END IF;
END;
$$;

