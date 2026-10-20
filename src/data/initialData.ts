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

export const initialZones: Zone[] = (rawZones as any[]).map(z => ({
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
    id: 'place-hiso-mookata',
    zone_id: 'zone-fa-ham',
    name: 'ไฮโซหมูกระทะ',
    name_en: 'Hiso Mookata',
    category: 'ร้านอาหาร & บุฟเฟต์หมูกระทะ',
    description: 'บุฟเฟต์หมูกระทะและอาหารทะเลสดใหม่ระดับพรีเมียมในโครงการ Golden Town ฟ้าฮ่าม ติดถนนซุปเปอร์ไฮเวย์และแยกรวมโชค กุ้งตัวโต หอยนางรมสด และไลน์อาหารทานเล่นหลากหลายพร้อมที่จอดรถสะดวกสบาย',
    address: 'โครงการ Golden Town ถนนเชียงใหม่-แม่โจ้ ตำบลฟ้าฮ่าม อำเภอเมืองเชียงใหม่ เชียงใหม่ 50300',
    latitude: 18.8237072,
    longitude: 99.0074443,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.app.goo.gl/gQAidmtbzKyt416x8',
    verification_status: 'verified',
    created_at: '2026-10-20T07:16:00.000Z'
  },
  {
    id: 'place-one-nimman',
    zone_id: 'zone-nimman',
    name: 'วัน นิมมาน (One Nimman)',
    name_en: 'One Nimman',
    category: 'คอมมูนิตี้มอลล์ & ไลฟ์สไตล์',
    description: 'ศูนย์รวมศิลปะ วัฒนธรรม สถาปัตยกรรมอิฐแดงสไตล์ยุโรปผสมล้านนา ร้านกาแฟ คราฟต์ช็อป และตลาดนัดกลางคืนใจกลางย่านนิมมานเหมินท์',
    address: '1 ถนนนิมมานเหมินท์ ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200',
    latitude: 18.7999,
    longitude: 98.9682,
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=One+Nimman+Chiang+Mai',
    verification_status: 'verified',
    created_at: '2026-10-20T07:17:00.000Z'
  },
  {
    id: 'place-wat-phra-singh',
    zone_id: 'zone-old-city',
    name: 'วัดพระสิงห์วรมหาวิหาร',
    name_en: 'Wat Phra Singh Woramahawihan',
    category: 'วัด & โบราณสถาน',
    description: 'พระอารามหลวงชั้นเอกคู่บ้านคู่เมืองเชียงใหม่ ประดิษฐานพระพุทธสิหิงค์ สถาปัตยกรรมล้านนาอันวิจิตร และจิตรกรรมฝาผนังลายคำอันทรงคุณค่า',
    address: 'ถนนสามล้าน ตำบลพระสิงห์ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200',
    latitude: 18.7885,
    longitude: 98.9818,
    image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=Wat+Phra+Singh+Chiang+Mai',
    verification_status: 'verified',
    created_at: '2026-10-20T07:18:00.000Z'
  },
  {
    id: 'place-bann-kang-wat',
    zone_id: 'zone-suthep',
    name: 'บ้านข้างวัด (Baan Kang Wat)',
    name_en: 'Baan Kang Wat Craft Village',
    category: 'ชุมชนศิลปะ & คาเฟ่',
    description: 'คอมมูนิตี้หมู่บ้านศิลปะใต้ร่มไม้ร่มรื่นย่านร่ำเปิง-วัดอุโมงค์ รวมสตูดิโองานปั้น เซรามิก สมุดทำมือ กาแฟดริป และวิถีชีวิตสโลว์ไลฟ์',
    address: '191 ถนนบ้านร่ำเปิง ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200',
    latitude: 18.7766,
    longitude: 98.9507,
    image_url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=Baan+Kang+Wat+Chiang+Mai',
    verification_status: 'verified',
    created_at: '2026-10-20T07:19:00.000Z'
  },
  {
    id: 'place-ang-kaew',
    zone_id: 'zone-suthep',
    name: 'อ่างแก้ว มหาวิทยาลัยเชียงใหม่',
    name_en: 'Ang Kaew Reservoir',
    category: 'ธรรมชาติ & จุดชมวิว',
    description: 'อ่างเก็บน้ำยอดนิยมของมหาวิทยาลัยเชียงใหม่ วิวดอยสุเทพสะท้อนผิวน้ำสวยงาม บรรยากาศเงียบสงบเหมาะแก่การวิ่งออกกำลังกายและชมพระอาทิตย์ตกดิน',
    address: 'มหาวิทยาลัยเชียงใหม่ 239 ถนนห้วยแก้ว ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200',
    latitude: 18.8062,
    longitude: 98.9525,
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    google_maps_url: 'https://maps.google.com/?q=Ang+Kaew+Chiang+Mai+University',
    verification_status: 'verified',
    created_at: '2026-10-20T07:20:00.000Z'
  }
];

export const initialSession: VotingSession = {
  id: 'session-cm-trip-2026',
  title: 'Chiang Mai Spot of the Month: โหวตแลนด์มาร์กและร้านเด็ดที่อยากไปที่สุด',
  status: 'active',
  starts_at: '2026-10-01T00:00:00.000Z',
  ends_at: '2026-11-30T23:59:59.000Z',
  created_at: '2026-10-20T00:00:00.000Z'
};
