# Chiang Mai 3D Interactive Map & Voting System 🗺️✨

เว็บแอปพลิเคชันแผนที่ 3 มิติเชิงโต้ตอบ (Interactive 3D Map) สำหรับสำรวจโซนและย่านต่าง ๆ ในจังหวัดเชียงใหม่ พร้อมระบบปักหมุดสถานที่จริง และระบบโหวตสถานที่ยอดนิยมแบบ Real-time พร้อม Leaderboard

---

## 🌟 จุดเด่นและฟีเจอร์หลัก (Core Features)

### 1. Interactive 3D Map
- **แผนที่ 3 มิติเต็มรูปแบบ**: ขับเคลื่อนด้วย **MapLibre GL JS** และ OpenFreeMap Vector Tiles (OpenStreetMap) ไม่ต้องพึ่งพา API Key ภายนอก
- **3D Building Extrusions**: แสดงอาคารแบบ 3 มิติโดยอ้างอิงความสูงจริง (`render_height` / `fill-extrusion`) ในพื้นที่ที่มีข้อมูล
- **2D / 3D Toggle**: สลับมุมมองระหว่าง 2D (Top-down) และ 3D (Tilted Perspective) พร้อมแอนิเมชันมุมกล้องที่ลื่นไหล
- **Camera Controls**: ซูมเข้า/ออก, แพน, หมุนมุมมอง (Bearing), ก้มเงย (Pitch), และปุ่ม Reset Camera กลับสู่ภาพรวมเมืองเชียงใหม่

### 2. Chiang Mai Zone System (ระบบโซนตามภูมิศาสตร์จริง)
- ครอบคลุม **16 โซน** ทั่วเชียงใหม่ ทั้งระดับแขวง/ตำบล (Subdistrict), อำเภอ (District) และย่านประวัติศาสตร์/ย่านเศรษฐกิจ (Neighborhood / Historic District):
  1. **คูเมืองเชียงใหม่ (Old City / Moat)** - ขอบเขตคูเมืองสี่เหลี่ยมผืนผ้าประวัติศาสตร์
  2. **นิมมานเหมินท์ (Nimman)** - ย่านเศรษฐกิจและไลฟ์สไตล์ (ห้วยแก้ว - ศิริมังคลาจารย์ - สุเทพ - เลียบคลองชลประทาน)
  3. **สันติธรรม (Santitham)** - ย่านที่พักอาศัยและร้านค้า
  4. **เจ็ดยอด (Jed Yod)** - ย่านชุมชนวัดเจ็ดยอด
  5. **ช้างเผือก (Chang Phueak)** - ขอบเขตทางการระดับตำบล (OSM Admin Level 8)
  6. **ช้างคลาน (Chang Khlan)** - ขอบเขตทางการระดับตำบล (OSM Admin Level 8)
  7. **วัดเกต (Wat Ket)** - ขอบเขตทางการระดับตำบล (OSM Admin Level 8)
  8. **แม่เหียะ (Mae Hia)** - ขอบเขตทางการระดับตำบล (OSM Admin Level 8)
  9. **สุเทพ (Suthep)** - ขอบเขตทางการระดับตำบล (OSM Admin Level 8)
  10. **ฟ้าฮ่าม (Fa Ham)** - ขอบเขตทางการระดับตำบล (OSM Admin Level 8)
  11. **สันทราย (San Sai)** - ขอบเขตทางการระดับอำเภอ (OSM Admin Level 6)
  12. **หางดง (Hang Dong)** - ขอบเขตทางการระดับอำเภอ (OSM Admin Level 6)
  13. **แม่ริม (Mae Rim)** - ขอบเขตทางการระดับอำเภอ (OSM Admin Level 6)
  14. **สารภี (Saraphi)** - ขอบเขตทางการระดับอำเภอ (OSM Admin Level 6)
  15. **สันกำแพง (San Kamphaeng)** - ขอบเขตทางการระดับอำเภอ (OSM Admin Level 6)
  16. **ดอยสะเก็ด (Doi Saket)** - ขอบเขตทางการระดับอำเภอ (OSM Admin Level 6)
- **Interactive Highlight**: นำเมาส์ไปวาง (Hover) เพื่อไฮไลต์ขอบเขตโซน หรือคลิกเพื่อ FlyTo ไปยังขอบเขตโซนนั้นทันที
- **Zone Filtering**: กรองหมุดสถานที่และคะแนนโหวตตามโซนที่เลือก พร้อมปุ่มกลับไปดูทุกโซน

### 3. ตรวจสอบพิกัดจริงของสถานที่เริ่มต้น (Verified Locations)
ข้อมูลสถานที่เริ่มต้นถูกตรวจสอบและดึงพิกัดจริงจาก Google Maps Short Links:

| สถานที่ | พิกัดจริง (Lat, Lng) | ที่อยู่และโซนจริง | สถานะการตรวจสอบ |
| :--- | :--- | :--- | :--- |
| **Location 1:** [Cool Cool หมูกระทะ](https://maps.app.goo.gl/JyUKKvj5a78ZZfuS9) | `18.7816622, 98.9932611` | 111/4-5 ถ.คชสาร แขวงเม็งราย ต.ช้างคลาน อ.เมืองเชียงใหม่ (โซนช้างคลาน ติดแจ่งขะต๊ำ) | `verified` |
| **Location 2:** [ไฮโซหมูกระทะ](https://maps.app.goo.gl/gQAidmtbzKyt416x8) | `18.8237072, 99.0074443` | โครงการ Golden Town ต.ฟ้าฮ่าม อ.เมืองเชียงใหม่ (โซนฟ้าฮ่าม ใกล้ซุปเปอร์ไฮเวย์และแยกรวมโชค) | `verified` |

*(และสถานที่แลนด์มาร์กเพิ่มเติม เช่น วัดพระสิงห์วรมหาวิหาร, One Nimman, บ้านข้างวัด, อ่างแก้ว มช.)*

### 4. Place Detail Panel
- **Desktop**: Slide-in Right Panel กึ่งโปร่งแสง ดีไซน์เรียบหรู Minimal
- **Mobile**: Bottom Sheet ใช้งานสะดวกด้วยนิ้วมือเดียว
- แสดงรูปภาพสถานที่, ชื่อภาษาไทยและอังกฤษ, ป้ายกำกับโซน, ที่อยู่, คำอธิบาย, พิกัดละติจูด/ลองจิจูดพร้อมปุ่มคัดลอก, ลิงก์ตรงเปิด Google Maps, และปุ่มแชร์สถานที่

### 5. Real-time Voting & Leaderboard System
- **กฎการโหวตแบบ 1 คน 1 สิทธิ์ (One Vote Per User)** ต่อ Session การโหวต
- **รองรับการเปลี่ยนใจย้ายคะแนน (Change Vote)**: เมื่อเปลี่ยนโหวต ระบบจะถอนคะแนนจากสถานที่เดิมและเพิ่มให้สถานที่ใหม่อย่างถูกต้อง (Atomic Database Transaction / RPC Function)
- **ป้องกันการโหวตซ้ำ (Anti-Duplicate)**: มี Unique Constraint `(session_id, user_id)` ในฐานข้อมูล
- **Leaderboard แบบ Real-time**: แสดงอันดับคะแนน, เปอร์เซ็นต์, และไฮไลต์อันดับ 1 พร้อมการตรวจจับผลเสมอ (Tie) หากสิ้นสุดรอบการโหวต
- **Dual Execution Engine**:
  - **Supabase Cloud Mode**: เชื่อมต่อ Supabase PostgreSQL, Realtime WebSocket และ Stored Procedure `cast_or_change_vote`
  - **Standalone Demo Mode**: ทำงานได้ทันทีแบบไม่ต้องต่อเน็ตหรือยังไม่ตั้งค่า Supabase โดยมี Local Atomic Store และ BroadcastChannel ซิงค์ข้อมูลข้ามแท็บเบราว์เซอร์แบบ Real-time ทันที

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Zero-config, Modern Utility CSS)
- **Map Engine**: MapLibre GL JS + OpenFreeMap Vector Tiles + GeoJSON Polygon Layers
- **State Management**: Zustand
- **Icons**: Lucide React
- **Backend & Database**: Supabase PostgreSQL + PostGIS + Supabase Realtime

---

## 🚀 วิธีการติดตั้งและรันระบบ (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:5173/`

### 3. บิลด์สำหรับ Production
```bash
npm run build
npm run preview
```

---

## 🗄️ การตั้งค่า Supabase (Optional for Cloud Mode)

หากต้องการเชื่อมต่อฐานข้อมูล Supabase PostgreSQL ของคุณเอง:

1. สร้างโปรเจกต์ใหม่ใน [Supabase Dashboard](https://supabase.com)
2. ไปที่ **SQL Editor** แล้วรันโค้ด SQL จากไฟล์:
   ```text
   supabase/schema.sql
   ```
3. คัดลอก Project URL และ Anon Key มาใส่ในไฟล์ `.env`:
   ```bash
   cp .env.example .env
   ```
   แก้ไขค่า:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. ระบบจะสลับเข้าสู่โหมด **Supabase Connected** โดยอัตโนมัติ

---

## 📂 โครงสร้างโฟลเดอร์ (Project Structure)

```text
3dmaps/
├── index.html                  # HTML entry point with Google Fonts (Prompt, Plus Jakarta Sans)
├── package.json
├── vite.config.ts              # Vite config with @tailwindcss/vite plugin
├── tsconfig.json
├── .env.example
├── supabase/
│   └── schema.sql              # Supabase PostgreSQL schema, RLS, Indexes, & Atomic RPC
├── scripts/
│   └── fetch_all_zones.js      # Script to extract official Chiang Mai zone polygons
└── src/
    ├── types/
    │   └── index.ts            # TypeScript interfaces for Zone, Place, Vote, Session
    ├── lib/
    │   └── supabase.ts         # Supabase client initialization & fallback check
    ├── services/
    │   ├── identityService.ts  # Anonymous session identity management
    │   └── votingService.ts    # Atomic voting RPC & Realtime broadcast channel
    ├── store/
    │   └── useAppStore.ts      # Zustand global state (Map, Zones, Voting, Filters)
    ├── data/
    │   ├── zones.json          # Authentic Chiang Mai GeoJSON boundary polygons
    │   └── initialData.ts      # Verified places (Cool Cool & Hiso Mookata) & Sessions
    ├── components/
    │   ├── MapContainer.tsx    # MapLibre GL 3D Map, Extrusions, Zones & Custom Markers
    │   ├── Navbar.tsx          # Top header with zone picker, 2D/3D toggle & controls
    │   ├── Sidebar.tsx         # Zones list, place directory, search & category filters
    │   ├── PlaceDetailPanel.tsx# Slide-in drawer / Bottom sheet with voting actions
    │   ├── LeaderboardModal.tsx# Voting rankings, percentage bars & tie handling
    │   └── AddPlaceModal.tsx   # Add place form with coordinate parsing & verification
    ├── App.tsx                 # Main layout assembly
    ├── main.tsx                # React root mount
    └── index.css               # Tailwind CSS v4 & custom animations
```

---

## 🛡️ Acceptance Criteria Verification Checklist

- [x] แผนที่เชียงใหม่แสดงผลได้จริง พร้อมข้อมูลแผนที่และถนนครบถ้วน
- [x] รองรับการสลับมุมมอง 2D / 3D พร้อม 3D Building Extrusion
- [x] รองรับการนำทางไปยัง 16 โซนเชียงใหม่ พร้อมขอบเขต GeoJSON อ้างอิงแหล่งข้อมูลจริง (OSM Admin Level 8/6)
- [x] หมุดสถานที่เริ่มต้นทั้ง 2 แห่งได้รับการถอดรหัสและตรวจสอบพิกัดจริง (`Cool Cool หมูกระทะ` & `ไฮโซหมูกระทะ`)
- [x] คลิกหมุดเพื่อเปิด Place Detail Panel (Desktop Drawer / Mobile Bottom Sheet)
- [x] ระบบโหวตทำงานได้จริง 1 คน 1 สิทธิ์ และรองรับการเปลี่ยนสถานที่โหวตอย่างปลอดภัย
- [x] Leaderboard แสดงผลคะแนนและอันดับแบบ Real-time พร้อมการตรวจจับผู้ชนะและผลเสมอ (Tie)
- [x] รองรับ Responsive Design ทั้ง Desktop และ Mobile
- [x] ไม่มี API Keys ลับฝังอยู่ในโค้ด พร้อม `.env.example` และ `supabase/schema.sql`
