# Chiang Mai 3D Interactive Map & Voting System 🗺️✨

เว็บแอปพลิเคชันแผนที่ 3 มิติเชิงโต้ตอบ (Interactive 3D Map) สำหรับสำรวจโซนและย่านต่าง ๆ ในจังหวัดเชียงใหม่ พร้อมระบบปักหมุดสถานที่จริง และระบบโหวตสถานที่ยอดนิยมแบบ Real-time พร้อม Leaderboard

---

## 🌟 จุดเด่นและฟีเจอร์หลัก (Core Features)

### 1. Interactive 3D Map
- **แผนที่ 3 มิติเต็มรูปแบบ**: ขับเคลื่อนด้วย **MapLibre GL JS** และ OpenFreeMap Vector Tiles (OpenStreetMap) ไม่ต้องพึ่งพา API Key ภายนอก
- **3D Building Extrusions**: แสดงอาคารแบบ 3 มิติโดยอ้างอิงความสูงจริง (`render_height` / `fill-extrusion`) ในพื้นที่ที่มีข้อมูล
- **2D / 3D Toggle**: สลับมุมมองระหว่าง 2D (Top-down) และ 3D (Tilted Perspective) พร้อมแอนิเมชันมุมกล้องที่ลื่นไหล
- **Camera Controls**: ซูมเข้า/ออก, แพน, หมุนมุมมอง (Bearing), ก้มเงย (Pitch), และปุ่ม Reset Camera กลับสู่ภาพรวมเมืองเชียงใหม่

### 2. Mookata Zones (ระบบโซนร้านหมูกระทะ)
- แสดงเฉพาะ **เจ็ดยอด, คูเมืองเชียงใหม่ และช้างคลาน**
- **Interactive Highlight**: นำเมาส์ไปวาง (Hover) เพื่อไฮไลต์ขอบเขตโซน หรือคลิกเพื่อ FlyTo ไปยังขอบเขตโซนนั้นทันที
- **Zone Filtering**: กรองหมุดสถานที่และคะแนนโหวตตามโซนที่เลือก พร้อมปุ่มกลับไปดูทุกโซน

### 3. ร้านหมูกระทะ
- แสดงร้านหมูกระทะพร้อมพิกัดและลิงก์ Google Maps ในสามโซนที่กำหนด
- หน้าผลโหวตจัดอันดับร้านตามคะแนนจริง และตัดโซนที่ซ่อนออกจากแผนที่กับรายการ

### 4. Place Detail Panel
- **Desktop**: Slide-in Right Panel กึ่งโปร่งแสง ดีไซน์เรียบหรู Minimal
- **Mobile**: Bottom Sheet ใช้งานสะดวกด้วยนิ้วมือเดียว
- แสดงรูปภาพสถานที่, ชื่อภาษาไทยและอังกฤษ, ป้ายกำกับโซน, ที่อยู่, คำอธิบาย, พิกัดละติจูด/ลองจิจูดพร้อมปุ่มคัดลอก, ลิงก์ตรงเปิด Google Maps, และปุ่มแชร์สถานที่

### 5. Real-time Voting & Leaderboard System
- **หนึ่งคะแนนต่อ IP address** ต่อรอบ และเปลี่ยนร้านที่โหวตได้ก่อนปิดโหวต
- **ตั้งวันเวลาปิดโหวต** และปิดโหวตทันทีได้จากหน้าผลโหวตด้วยรหัสผู้ดูแล
- เก็บเฉพาะ HMAC ของ IP ในตารางส่วนตัว ไม่บันทึก IP ดิบ
- **รองรับการเปลี่ยนใจย้ายคะแนน (Change Vote)**: เมื่อเปลี่ยนโหวต ระบบจะถอนคะแนนจากสถานที่เดิมและเพิ่มให้สถานที่ใหม่อย่างถูกต้อง (Atomic Database Transaction / RPC Function)
- **ป้องกันการโหวตซ้ำ (Anti-Duplicate)**: ฐานข้อมูลล็อก HMAC ของ IP ต่อรอบ และปิดช่องทางเขียนคะแนนตรงจาก public API
- **Leaderboard แบบ Real-time**: แสดงอันดับคะแนน, เปอร์เซ็นต์, และไฮไลต์อันดับ 1 พร้อมการตรวจจับผลเสมอ (Tie) หากสิ้นสุดรอบการโหวต
- **Dual Execution Engine**:
  - **Supabase Cloud Mode**: เชื่อมต่อ PostgreSQL, Realtime และ Edge Functions สำหรับตรวจ IP และจัดการรอบโหวต
  - **โหมดในเบราว์เซอร์**: ใช้สาธิตบนอุปกรณ์นี้และซิงค์ข้ามแท็บ โดยไม่สามารถจำกัด IP ระหว่างเครื่องได้
  - **โหมด Supabase**: บันทึกคะแนนส่วนกลางและซิงค์ข้ามผู้ใช้แบบเรียลไทม์

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

1. สร้างโปรเจกต์ใน [Supabase Dashboard](https://supabase.com)
2. หากเป็นโปรเจกต์ว่าง ให้รัน `supabase/schema.sql` หนึ่งครั้ง แล้วรัน `supabase/mookata_voting_setup.sql` เพื่อเพิ่มโซน ร้าน และรอบโหวต
3. คัดลอก Project URL และ Anon Key มาใส่ในไฟล์ `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   แก้ไขค่า:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. ตั้งค่า secrets สำหรับ Edge Functions ใน Supabase:
   ```bash
   supabase secrets set VOTE_IP_HASH_SECRET="ใส่ค่าสุ่มยาวและเก็บให้คงเดิมตลอดรอบโหวต" VOTE_ADMIN_KEY="ตั้งรหัสผู้ดูแลที่คาดเดายาก"
   ```
   เก็บทั้งสองค่านี้เป็นความลับ และอย่าใส่ไว้ใน `.env.local` หรือ frontend
5. Deploy ฟังก์ชันจากโฟลเดอร์โปรเจกต์:
   ```bash
   supabase functions deploy cast-vote
   supabase functions deploy current-vote
   supabase functions deploy manage-voting
   ```
6. รีสตาร์ตแอปเพื่อเริ่มโหวตออนไลน์ แล้วเปิด “ตั้งเวลาปิดโหวต” ในหน้าผลโหวตเพื่อใส่ `VOTE_ADMIN_KEY`

> `schema.sql` ลบและสร้างตารางใหม่ จึงให้รันเฉพาะกับโปรเจกต์ว่างครั้งแรกเท่านั้น ห้ามรันซ้ำบนฐานข้อมูลที่มีคะแนนจริง
> `mookata_voting_setup.sql` สร้างตารางล็อก IP และ RPC สำหรับระบบโหวตนี้ ให้รันหลัง schema ก่อนเปิดใช้ Edge Functions
> การจำกัดตาม IP ใช้ IP สาธารณะของเครือข่าย เครื่องหลายเครื่องบน Wi-Fi เดียวกันจึงใช้สิทธิ์ร่วมกัน และการเปลี่ยน IP อาจถูกนับเป็นอุปกรณ์ใหม่

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
│   ├── schema.sql              # Database schema (first setup only)
│   ├── mookata_voting_setup.sql # Seed shops/session and private IP vote locks
│   └── functions/              # Server-side vote and session management
├── scripts/
│   └── fetch_all_zones.js      # Script to extract official Chiang Mai zone polygons
└── src/
    ├── types/
    │   └── index.ts            # TypeScript interfaces for Zone, Place, Vote, Session
    ├── lib/
    │   └── supabase.ts         # Supabase client initialization & fallback check
    ├── services/
    │   ├── identityService.ts  # Anonymous session identity management
    │   └── votingService.ts    # Voting Edge Functions & Realtime channel
    ├── store/
    │   └── useAppStore.ts      # Zustand global state (Map, Zones, Voting, Filters)
    ├── data/
    │   ├── zones.json          # Authentic Chiang Mai GeoJSON boundary polygons
    │   └── initialData.ts      # Mookata shops and the local vote session
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
- [x] ระบบโหวตออนไลน์จำกัดหนึ่งสิทธิ์ต่อ IP ต่อรอบ พร้อมเปลี่ยนโหวตได้ก่อนปิด
- [x] ผู้ดูแลตั้งเวลาปิดโหวตหรือปิดทันทีได้เมื่อ deploy Supabase Edge Functions
- [x] Leaderboard แสดงผลคะแนนและอันดับแบบ Real-time พร้อมการตรวจจับผู้ชนะและผลเสมอ (Tie)
- [x] รองรับ Responsive Design ทั้ง Desktop และ Mobile
- [x] ไม่มี API Keys ลับฝังอยู่ในโค้ด พร้อม `.env.example` และ `supabase/schema.sql`
