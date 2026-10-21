import rawZones from './zones.json';
import type { Place, VotingSession, Zone } from '../types';

const zoneColors: Record<string, string> = {
  'zone-old-city': '#f59e0b',
  'zone-nimman': '#8b5cf6',
  'zone-santitham': '#06b6d4',
  'zone-chang-phueak': '#3b82f6',
  'zone-chang-khlan': '#ec4899',
  'zone-wat-ket': '#f97316',
  'zone-mae-hia': '#14b8a6',
  'zone-suthep': '#6366f1',
  'zone-fa-ham': '#eab308',
  'zone-san-sai': '#84cc16',
  'zone-hang-dong': '#a855f7',
  'zone-mae-rim': '#10b981',
  'zone-saraphi': '#0ea5e9',
  'zone-san-kamphaeng': '#f43f5e',
  'zone-doi-saket': '#d946ef'
};

export const mookataZoneIds = ['zone-old-city', 'zone-chang-khlan', 'zone-nimman', 'zone-chang-phueak'];

export const initialZones: Zone[] = (rawZones as any[]).filter(z => mookataZoneIds.includes(z.id)).map(z => ({
  id: z.id,
  name_th: z.name_th,
  name_en: z.name_en,
  zone_type: z.zone_type,
  boundary_geojson: z.geojson,
  boundary_source: z.boundary_source,
  is_approximate: Boolean(z.is_approximate),
  center: z.center,
  boundingbox: z.boundingbox,
  color: zoneColors[z.id] || '#64748b',
  created_at: z.created_at || '2026-10-20T00:00:00.000Z'
}));

export const initialPlaces: Place[] = [
  {
    id: 'place-cool-cool-mookata',
    zone_id: 'zone-chang-khlan',
    name: 'Cool Cool หมูกระทะ',
    name_en: 'Cool Cool Mookata',
    category: 'ร้านอาหาร & หมูกระทะ',
    description: 'ร้านหมูกระทะและปิ้งย่างขวัญใจคนเชียงใหม่ ตั้งอยู่บนถนนคชสาร ใกล้คูเมืองแจ่งขะต๊ำ วัตถุดิบคุณภาพดี น้ำจิ้มสูตรเด็ด บรรยากาศโปร่งสบาย เหมาะกับการสังสรรค์ยามค่ำคืน',
    address: '111/4-5 ถนนคชสาร แขวงเม็งราย ตำบลพระสิงห์/ช้างคลาน อำเภอเมืองเชียงใหม่ เชียงใหม่ 55520',
    latitude: 18.7816622,
    longitude: 98.9932611,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.app.goo.gl/JyUKKvj5a78ZZfuS9',
    review_url: 'https://www.tiktok.com/@somparkcnx/video/7698315868811382024?is_from_webapp=1&sender_device=pc&web_id=7663920732552955408',
    price: '289 บาท',
    verification_status: 'verified',
    created_at: '2026-10-20T07:15:00.000Z'
  },
  {
    id: 'place-moo-ood-old-city',
    zone_id: 'zone-old-city',
    name: 'หมูอู๊ดหมูกระทะ คูเมือง',
    name_en: 'Moo Ood BBQ Old City',
    category: 'ร้านอาหาร & หมูกระทะ',
    description: 'บุฟเฟต์หมูกระทะพร้อมอาหารทะเลและของทานเล่น อยู่ฝั่งในคูเมืองบริเวณแจ่งหัวริน',
    address: '197 ถนนศรีภูมิ ตำบลศรีภูมิ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200',
    latitude: 18.795279,
    longitude: 98.980787,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=18.795279,98.980787',
    review_url: 'https://www.tiktok.com/@framepwk/video/7678664036753411336?is_from_webapp=1&sender_device=pc&web_id=7663920732552955408',
    price: '269 บาท',
    verification_status: 'verified',
    created_at: '2026-10-21T00:00:00.000Z'
  },
  {
    id: 'place-jinbe-shabu-sushi-buffet',
    zone_id: 'zone-old-city',
    name: 'จินเบชาบูซูชิ บุฟเฟ่ต์',
    name_en: 'Jinbe Shabu Sushi Buffet',
    category: 'ร้านอาหาร & ชาบู',
    description: 'ร้านชาบูและซูชิบุฟเฟ่ต์ เพิ่มจากตำแหน่งใน Google Maps',
    address: 'เชียงใหม่',
    latitude: 18.7895667,
    longitude: 98.9784433,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.app.goo.gl/6BUjWRjehGxaZKxLA',
    review_url: 'https://www.tiktok.com/@bhamstoryy/video/7461227101052620037?is_from_webapp=1&sender_device=pc&web_id=7663920732552955408',
    price: '239 บาท',
    verification_status: 'verified',
    created_at: '2026-10-22T00:00:00.000Z'
  },
  {
    id: 'place-kin-mookata-chiang-mai',
    zone_id: 'zone-old-city',
    name: 'กินหมูกระทะ สาขาเชียงใหม่',
    name_en: 'Kin Mookata Chiang Mai',
    category: 'ร้านอาหาร & หมูกระทะ',
    description: 'ร้านหมูกระทะ เพิ่มจากตำแหน่งใน Google Maps',
    address: 'เชียงใหม่',
    latitude: 18.7999469,
    longitude: 98.9914715,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.app.goo.gl/AxXAy1itoNdc9eBK6',
    review_url: 'https://www.tiktok.com/@kongpobsorreview/video/7508383801559633159?is_from_webapp=1&sender_device=pc&web_id=7663920732552955408',
    price: '286.76 บาท',
    verification_status: 'verified',
    created_at: '2026-10-22T00:00:00.000Z'
  },
  {
    id: 'place-suki-tee-noi-maya-chiang-mai',
    zone_id: 'zone-nimman',
    name: 'สุกี้ตี๋น้อย เมญ่า เชียงใหม่ (ชั้น 6)',
    name_en: 'Suki Tee Noi Maya Chiang Mai',
    category: 'ร้านอาหาร & สุกี้',
    description: 'สาขาเมญ่า เชียงใหม่ ชั้น 6 เพิ่มจากตำแหน่งใน Google Maps',
    address: 'ศูนย์การค้าเมญ่า เชียงใหม่ ชั้น 6',
    latitude: 18.8020591,
    longitude: 98.9672691,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.app.goo.gl/z3AnrS7LazWoox7b9',
    review_url: 'https://www.tiktok.com/@brew.beaw/photo/7685753865974631687?is_from_webapp=1&sender_device=pc&web_id=7663920732552955408',
    price: '273.33 บาท',
    verification_status: 'verified',
    created_at: '2026-10-22T00:00:00.000Z'
  },
  {
    id: 'place-yukata-shabu-chang-phueak',
    zone_id: 'zone-chang-phueak',
    name: 'ยูกาตะ ชาบู',
    name_en: 'Yukata Shabu',
    category: 'ร้านอาหาร & ชาบู',
    description: 'ร้าน Yukata Shabu เพิ่มจากตำแหน่งใน Google Maps',
    address: 'เชียงใหม่',
    latitude: 18.8008052,
    longitude: 98.9840583,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.app.goo.gl/wprut9vTwc5KLmSFA',
    review_url: 'https://www.tiktok.com/@brew.beaw/photo/7685753865974631687?is_from_webapp=1&sender_device=pc&web_id=7663920732552955408',
    price: '249 บาท',
    verification_status: 'verified',
    created_at: '2026-10-22T00:00:00.000Z'
  },
];

export const initialSession: VotingSession = {
  id: 'session-cm-trip-2026',
  title: 'โหวตร้านหมูกระทะเชียงใหม่',
  status: 'active',
  starts_at: '2026-10-01T00:00:00.000Z',
  ends_at: '2099-12-31T23:59:59.000Z',
  created_at: '2026-10-20T00:00:00.000Z'
};
