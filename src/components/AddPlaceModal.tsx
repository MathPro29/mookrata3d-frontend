import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { VotingService } from '../services/votingService';
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
    activeSession,
    addPlace,
    selectPlace
  } = useAppStore();

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [zoneId, setZoneId] = useState(zones[0]?.id || 'zone-old-city');
  const [category, setCategory] = useState('ร้านอาหาร & หมูกระทะ');
  const [price, setPrice] = useState('');
  const [isThaiHelpsThai, setIsThaiHelpsThai] = useState(false);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'verified' | 'pending_verification'>('verified');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolvingLink, setIsResolvingLink] = useState(false);

  if (!isAddPlaceOpen) return null;

  // Auto-parse coordinates from Google Maps URLs like @18.7816,98.9932 or ?q=18.7816,98.9932
  const handleUrlChange = (val: string) => {
    setGoogleMapsUrl(val);
    try {
      const pathName = new URL(val).pathname.match(/\/maps\/place\/([^/]+)/)?.[1];
      if (pathName && !name) setName(decodeURIComponent(pathName.replaceAll('+', ' ')));
    } catch {
      // Let the user finish pasting an incomplete URL.
    }
    const atMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const googleCoordinates = val.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    const reversedGoogleCoordinates = val.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
    const coordinates = atMatch || googleCoordinates;
    if (coordinates || reversedGoogleCoordinates) {
      setLatitude(coordinates ? coordinates[1] : reversedGoogleCoordinates![2]);
      setLongitude(coordinates ? coordinates[2] : reversedGoogleCoordinates![1]);
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

  const handleUrlBlur = async () => {
    if (!googleMapsUrl || latitude || longitude || !/https:\/\/(maps\.app\.goo\.gl|goo\.gl)\//i.test(googleMapsUrl)) return;
    const requestedUrl = googleMapsUrl;
    setIsResolvingLink(true);
    try {
      const resolved = await VotingService.resolveGoogleMapsLink(requestedUrl);
      if (googleMapsUrl !== requestedUrl) return;
      setGoogleMapsUrl(resolved.url);
      setLatitude(String(resolved.latitude));
      setLongitude(String(resolved.longitude));
      if (resolved.name && !name) setName(resolved.name);
      setStatus('verified');
    } catch (err) {
      setError(err instanceof Error ? `${err.message} (กรอกพิกัดเองได้)` : 'ถอดลิงก์ไม่สำเร็จ กรุณากรอกพิกัดเอง');
    } finally {
      setIsResolvingLink(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('กรุณาระบุชื่อร้านหมูกระทะ');
      return;
    }
    if (!googleMapsUrl.trim()) {
      setError('กรุณาวางลิงก์ Google Maps ของร้าน');
      return;
    }
    if (!price.trim()) {
      setError('กรุณาระบุราคา');
      return;
    }

    let lat = parseFloat(latitude);
    let lng = parseFloat(longitude);

    if (googleMapsUrl.trim() && (!Number.isFinite(lat) || !Number.isFinite(lng))) {
      setError('อ่านพิกัดจากลิงก์ไม่ได้ กรุณาใช้ลิงก์ Google Maps ที่มีพิกัดหรือกรอกพิกัดเอง');
      return;
    }

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
        price: price.trim(),
        is_thai_helps_thai: isThaiHelpsThai,
        google_maps_url: googleMapsUrl.trim() || `https://maps.google.com/?q=${lat},${lng}`,
        latitude: lat,
        longitude: lng,
        address: address.trim() || 'อำเภอเมือง จังหวัดเชียงใหม่',
        description: description.trim() || `ร้านหมูกระทะในโซน ${zones.find(z => z.id === zoneId)?.name_th}`,
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
      <div className="w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[90dvh] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white m-0">เพิ่มร้านหมูกระทะ</h2>
              <p className="text-[11px] text-zinc-400 m-0">{activeSession?.status === 'active' && Date.now() >= Date.parse(activeSession.starts_at) && Date.now() <= Date.parse(activeSession.ends_at) ? 'หมุดจะแสดงบนแผนที่และเข้าโหวตรอบถัดไป' : 'เพิ่มหมุดและใส่เป็นตัวเลือกโหวตได้ทันที'}</p>
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
              placeholder="เช่น ร้านหมูกระทะ..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="place-price" className="mb-1 block font-semibold text-zinc-300">ราคา *</label>
              <input id="place-price" type="text" required value={price} onChange={event => setPrice(event.target.value)} placeholder="เช่น 199 บาท / เริ่มต้น 199 บาท" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" />
            </div>
            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-1 font-semibold text-zinc-300">เข้าร่วมโครงการไทยช่วยไทยไหม?</legend>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="การเข้าร่วมโครงการไทยช่วยไทย">
                <button type="button" aria-pressed={isThaiHelpsThai} onClick={() => setIsThaiHelpsThai(true)} className={`rounded-xl border px-3 py-2 font-bold ${isThaiHelpsThai ? 'border-emerald-400 bg-emerald-400 text-zinc-950' : 'border-zinc-700 bg-zinc-900 text-zinc-200'}`}>มี</button>
                <button type="button" aria-pressed={!isThaiHelpsThai} onClick={() => setIsThaiHelpsThai(false)} className={`rounded-xl border px-3 py-2 font-bold ${!isThaiHelpsThai ? 'border-zinc-400 bg-zinc-700 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-200'}`}>ไม่มี</button>
              </div>
            </fieldset>
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
                <option value="ร้านอาหาร & หมูกระทะ">ร้านหมูกระทะ</option>
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
              onBlur={() => void handleUrlBlur()}
              className="w-full bg-zinc-900 text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
            />
            {isResolvingLink && <p className="mb-0 mt-1 text-[10px] text-amber-300" role="status">กำลังอ่านพิกัดจากลิงก์…</p>}
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
              disabled={isSubmitting || isResolvingLink}
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
