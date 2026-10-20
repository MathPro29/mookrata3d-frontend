import rawZones from './zones.json';
import type { Place, VotingSession, Zone } from '../types';

const zoneColors: Record<string, string> = {
  'zone-old-city': '#f59e0b',
  'zone-nimman': '#8b5cf6',
  'zone-santitham': '#06b6d4',
  'zone-jed-yod': '#10b981',
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

export const mookataZoneIds = ['zone-jed-yod', 'zone-old-city', 'zone-chang-khlan'];

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
    verification_status: 'verified',
    created_at: '2026-10-21T00:00:00.000Z'
  },
  {
    id: 'place-big-big-shabu-old-city',
    zone_id: 'zone-old-city',
    name: 'Big Big Shabu คูเมือง',
    name_en: 'Big Big Shabu Old City',
    category: 'ร้านอาหาร & หมูกระทะ',
    description: 'ร้านหมูกระทะและชาบูบุฟเฟต์ในคูเมือง มีทั้งเตาย่างและหม้อชาบู',
    address: '2 ถนนศรีภูมิ ตำบลศรีภูมิ อำเภอเมืองเชียงใหม่ เชียงใหม่',
    latitude: 18.7952167,
    longitude: 98.9886458,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=18.7952167,98.9886458',
    verification_status: 'verified',
    created_at: '2026-10-21T00:00:00.000Z'
  },
  {
    id: 'place-pp-moo-jum-old-city',
    zone_id: 'zone-old-city',
    name: 'PP หมูจุ่ม & กระทะร้อน คูเมือง',
    name_en: 'PP Moo Jum & Hot Pan Old City',
    category: 'ร้านอาหาร & หมูกระทะ',
    description: 'ร้านหมูกระทะและหมูจุ่มในคูเมืองด้านใน ใกล้ประตูสวนดอก',
    address: '31/2 ถนนอารักษ์ ตำบลศรีภูมิ อำเภอเมืองเชียงใหม่ เชียงใหม่',
    latitude: 18.7894924712,
    longitude: 98.9784599067,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=18.7894924712,98.9784599067',
    verification_status: 'verified',
    created_at: '2026-10-21T00:00:00.000Z'
  },
  {
    id: 'place-kobori-jed-yod',
    zone_id: 'zone-jed-yod',
    name: 'โกโบริหมูกระทะ สาขาเจ็ดยอด',
    name_en: 'Kobori Mookata Jed Yod',
    category: 'ร้านอาหาร & หมูกระทะ',
    description: 'บุฟเฟต์หมูกระทะและซีฟู้ดย่านเจ็ดยอด มีของทานเล่นให้เลือกหลายอย่าง',
    address: '11/21 ถนนรอบเมืองเชียงใหม่ ตำบลช้างเผือก อำเภอเมืองเชียงใหม่ เชียงใหม่ 50300',
    latitude: 18.8110055,
    longitude: 98.9634693,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=18.8110055,98.9634693',
    verification_status: 'verified',
    created_at: '2026-10-21T00:00:00.000Z'
  },
  {
    id: 'place-fifa-mookata-jed-yod',
    zone_id: 'zone-jed-yod',
    name: 'ฟีฟ่า หมูกระทะ เจ็ดยอด',
    name_en: 'FIFA Mookata Jed Yod',
    category: 'ร้านอาหาร & หมูกระทะ',
    description: 'บุฟเฟต์หมูกระทะเตาถ่านพร้อมซีฟู้ด อยู่ข้างสนามหญ้าเทียมเจ็ดยอด–อยู่เย็น',
    address: 'สนามหญ้าเทียมเจ็ดยอด–อยู่เย็น ซอย 7 ตำบลช้างเผือก อำเภอเมืองเชียงใหม่ เชียงใหม่ 50230',
    latitude: 18.8100203,
    longitude: 98.9752197,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=18.8100203,98.9752197',
    verification_status: 'verified',
    created_at: '2026-10-21T00:00:00.000Z'
  },
  {
    id: 'place-chang-phueak-jed-yod-4',
    zone_id: 'zone-jed-yod',
    name: 'หมูกระทะช้างเผือก สาขา 4 เจ็ดยอด',
    name_en: 'Chang Phueak Mookata Branch 4 Jed Yod',
    category: 'ร้านอาหาร & หมูกระทะ',
    description: 'ร้านหมูกระทะสาขาเจ็ดยอด อยู่ถนนคันคลองชลประทานหน้าโรงแรมบายสิริมายา',
    address: '11/14 ถนนคันคลองชลประทาน ตำบลช้างเผือก อำเภอเมืองเชียงใหม่ เชียงใหม่',
    latitude: 18.8095501246,
    longitude: 98.9631698158,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=18.8095501246,98.9631698158',
    verification_status: 'verified',
    created_at: '2026-10-21T00:00:00.000Z'
  },
  {
    id: 'place-chang-phueak-mahidol',
    zone_id: 'zone-chang-khlan',
    name: 'หมูกระทะช้างเผือก สาขามหิดล',
    name_en: 'Chang Phueak Mookata Mahidol',
    category: 'ร้านอาหาร & หมูกระทะ',
    description: 'บุฟเฟต์หมูกระทะสาขาถนนมหิดล ตรงข้ามศูนย์มาสด้า',
    address: '146 ถนนมหิดล ตำบลป่าแดด อำเภอเมืองเชียงใหม่ เชียงใหม่',
    latitude: 18.765631606,
    longitude: 98.989500124,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=18.765631606,98.989500124',
    verification_status: 'verified',
    created_at: '2026-10-21T00:00:00.000Z'
  },
  {
    id: 'place-chumphae-chang-khlan',
    zone_id: 'zone-chang-khlan',
    name: 'ชุมแพเนื้อกระทะ เชียงใหม่แลนด์',
    name_en: 'Chum Phae Grilled Pan Chiang Mai Land',
    category: 'ร้านอาหาร & หมูกระทะ',
    description: 'ร้านเนื้อกระทะและหมูกระทะแบบสั่งเป็นชุด อยู่ในโครงการเชียงใหม่แลนด์ ซอย 4',
    address: 'เชียงใหม่แลนด์ ซอย 4 ตำบลช้างคลาน อำเภอเมืองเชียงใหม่ เชียงใหม่',
    latitude: 18.7673128148,
    longitude: 98.9962089876,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=18.7673128148,98.9962089876',
    verification_status: 'verified',
    created_at: '2026-10-21T00:00:00.000Z'
  }
];

export const initialSession: VotingSession = {
  id: 'session-cm-trip-2026',
  title: 'โหวตร้านหมูกระทะเชียงใหม่',
  status: 'active',
  starts_at: '2026-10-01T00:00:00.000Z',
  ends_at: '2026-11-30T23:59:59.000Z',
  created_at: '2026-10-20T00:00:00.000Z'
};
