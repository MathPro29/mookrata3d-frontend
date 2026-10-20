import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  X, 
  PlusCircle, 
  Link as LinkIcon, 
  AlertCircle
} from 'lucide-react';

export const AddPlaceModal: React.FC = () => {
  const {
    isAddPlaceOpen,
    toggleAddPlace,
    zones,
    addPlace,
    selectPlace
  } = useAppStore();

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [zoneId, setZoneId] = useState(zones[0]?.id || 'zone-old-city');
  const [category, setCategory] = useState('ร้านอาหาร & หมูกระทะ');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'verified' | 'pending_verification'>('verified');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddPlaceOpen) return null;

  // Auto-parse coordinates from Google Maps URLs like @18.7816,98.9932 or ?q=18.7816,98.9932
  const handleUrlChange = (val: string) => {
    setGoogleMapsUrl(val);
    const atMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      setLatitude(atMatch[1]);
      setLongitude(atMatch[2]);
      setStatus('verified');
      return;
    }
    const qMatch = val.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      setLatitude(qMatch[1]);
      setLongitude(qMatch[2]);
      setStatus('verified');
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('กรุณาระบุชื่อสถานที่');
      return;
    }

    let lat = parseFloat(latitude);
    let lng = parseFloat(longitude);

    // If coordinates are missing, set status to pending_verification and fallback to zone center
    let finalStatus: 'verified' | 'pending_verification' = status;
    if (isNaN(lat) || isNaN(lng)) {
      const selectedZone = zones.find(z => z.id === zoneId);
      if (selectedZone) {
        lat = selectedZone.center[1];
        lng = selectedZone.center[0];
        finalStatus = 'pending_verification';
      } else {
        setError('กรุณาระบุพิกัด Latitude และ Longitude ที่ถูกต้อง');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const created = await addPlace({
        name: name.trim(),
        name_en: nameEn.trim() || undefined,
        zone_id: zoneId,
        category,
        google_maps_url: googleMapsUrl.trim() || `https://maps.google.com/?q=${lat},${lng}`,
        latitude: lat,
        longitude: lng,
        address: address.trim() || 'อำเภอเมือง จังหวัดเชียงใหม่',
        description: description.trim() || `สถานที่น่าสนใจในโซน ${zones.find(z => z.id === zoneId)?.name_th}`,
        image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        verification_status: finalStatus
      });

      setIsSubmitting(false);
      toggleAddPlace(false);
      selectPlace(created.id);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white m-0">เพิ่มสถานที่ใหม่ในเชียงใหม่</h2>
              <p className="text-[11px] text-zinc-400 m-0">ปักหมุดพร้อมตรวจสอบพิกัดจริงเพื่อเข้าร่วมระบบโหวต</p>
            </div>
          </div>

          <button
            onClick={() => toggleAddPlace(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Place Name */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              ชื่อสถานที่ (ภาษาไทย) *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น หมูกระทะช้างเผือก, วัดอุโมงค์..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* English Name */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              ชื่อภาษาอังกฤษ (ถ้ามี)
            </label>
            <input
              type="text"
              placeholder="e.g. Wat Umong, Chang Phueak Mookata..."
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Zone & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                โซนที่ตั้ง (Zone) *
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500"
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name_th} ({z.name_en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                หมวดหมู่สถานที่ *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500"
              >
                <option value="ร้านอาหาร & หมูกระทะ">ร้านอาหาร & หมูกระทะ</option>
                <option value="คอมมูนิตี้มอลล์ & ไลฟ์สไตล์">คอมมูนิตี้มอลล์ & ไลฟ์สไตล์</option>
                <option value="วัด & โบราณสถาน">วัด & โบราณสถาน</option>
                <option value="ชุมชนศิลปะ & คาเฟ่">ชุมชนศิลปะ & คาเฟ่</option>
                <option value="ธรรมชาติ & จุดชมวิว">ธรรมชาติ & จุดชมวิว</option>
                <option value="สถานบันเทิง & บาร์">สถานบันเทิง & บาร์</option>
              </select>
            </div>
          </div>

          {/* Google Maps URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Maps URL หรือ Short Link</span>
              </label>
              <span className="text-[10px] text-zinc-400">ระบบถอดพิกัดอัตโนมัติ</span>
            </div>
            <input
              type="url"
              placeholder="https://maps.app.goo.gl/... หรือ https://www.google.com/maps/place/..."
              value={googleMapsUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
            />
          </div>

          {/* Coordinates Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Latitude (ละติจูด)
              </label>
              <input
                type="text"
                placeholder="18.7885"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Longitude (ลองจิจูด)
              </label>
              <input
                type="text"
                placeholder="98.9818"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">ที่อยู่</label>
            <input
              type="text"
              placeholder="ถนน, แขวง, ตำบล..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">คำอธิบาย</label>
            <textarea
              rows={2}
              placeholder="จุดเด่น เมนูแนะนำ หรือบรรยากาศ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">ลิงก์รูปภาพ (Image URL)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500 text-[11px]"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg flex items-center justify-center gap-2 active:scale-98"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกและปักหมุดบนแผนที่ 3D'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
