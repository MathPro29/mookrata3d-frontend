import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  X, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  Heart, 
  Trophy, 
  Share2, 
  Navigation, 
  ShieldCheck, 
  Clock, 
  ArrowRightLeft,
  QrCode
} from 'lucide-react';

export const PlaceDetailPanel: React.FC = () => {
  const {
    places,
    zones,
    selectedPlaceId,
    selectPlace,
    selectZone,
    castVote,
    getUserVotedPlaceId,
    getLeaderboard,
    toggleQrModal,
    activeSession
  } = useAppStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!selectedPlaceId) return null;

  const place = places.find(p => p.id === selectedPlaceId);
  if (!place) return null;

  const zone = zones.find(z => z.id === place.zone_id);
  const userVotedPlaceId = getUserVotedPlaceId();
  const isVotedByMe = userVotedPlaceId === place.id;
  const hasVotedOther = userVotedPlaceId && userVotedPlaceId !== place.id;
  const isVotingOpen = Boolean(activeSession && activeSession.status === 'active' &&
    now >= Date.parse(activeSession.starts_at) && now <= Date.parse(activeSession.ends_at));

  const leaderboard = getLeaderboard();
  const placeEntry = leaderboard.find(e => e.place.id === place.id);
  const votesCount = placeEntry ? placeEntry.votes_count : 0;
  const percentage = placeEntry ? placeEntry.percentage : 0;
  const rank = placeEntry ? placeEntry.rank : '-';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(place.google_maps_url);
    setCopiedLink(true);
    showToast('คัดลอกลิงก์ Google Maps แล้ว');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${place.latitude}, ${place.longitude}`);
    setCopiedCoords(true);
    showToast('คัดลอกพิกัด Latitude, Longitude แล้ว');
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleVote = async () => {
    if (isVoting) return;
    setIsVoting(true);
    const res = await castVote(place.id);
    setIsVoting(false);

    if (res.success) {
      if (res.action === 'VOTE_CAST') {
        showToast('🎉 โหวตสถานที่นี้สำเร็จแล้ว!');
      } else if (res.action === 'VOTE_CHANGED') {
        showToast('🔄 เปลี่ยนคะแนนโหวตมาสถานที่นี้เรียบร้อย!');
      }
    } else {
      showToast('❌ ไม่สามารถโหวตได้ในขณะนี้');
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/95 text-amber-300 border border-amber-500/40 shadow-2xl backdrop-blur-md text-xs font-semibold animate-in fade-in zoom-in-95 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Panel: Right Drawer on Desktop, Bottom Sheet on Mobile */}
      <div className="fixed lg:absolute bottom-0 right-0 left-0 lg:left-auto lg:top-18 lg:bottom-4 lg:right-4 w-full lg:w-[420px] max-h-[85vh] lg:max-h-none rounded-t-3xl lg:rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 lg:slide-in-from-right-6 duration-300">
        
        {/* Mobile Drag Indicator */}
        <div className="lg:hidden w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Hero Image Container */}
        <div className="relative h-48 sm:h-56 w-full flex-shrink-0 overflow-hidden bg-zinc-900">
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

          {/* Close Button */}
          <button
            onClick={() => selectPlace(null)}
            className="absolute top-3 right-3 p-2 rounded-full bg-zinc-950/70 hover:bg-zinc-950 text-zinc-300 hover:text-white backdrop-blur-md border border-zinc-700 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Rank Badge on Image */}
          {rank === 1 && votesCount > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 font-black text-xs shadow-lg ring-2 ring-amber-300">
              <Trophy className="w-3.5 h-3.5" />
              <span>อันดับ 1 ในโพล</span>
            </div>
          )}

          {/* Place Category & Verification Badge */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900/80 backdrop-blur-md text-[11px] font-medium text-amber-400 border border-zinc-700">
              {place.category}
            </span>

            {place.verification_status === 'verified' ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                พิกัดจริง Google Maps
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 text-[11px] font-semibold border border-amber-500/30 backdrop-blur-md">
                <Clock className="w-3.5 h-3.5" />
                รอตรวจสอบพิกัด
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Title & Zone */}
          <div>
            <h2 className="text-xl font-extrabold text-white leading-tight">
              {place.name}
            </h2>
            {place.name_en && (
              <p className="text-xs text-zinc-400 font-normal mt-0.5">{place.name_en}</p>
            )}

            {/* Zone Tag */}
            {zone && (
              <button
                onClick={() => selectZone(zone.id)}
                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 border border-zinc-800 transition"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                <span>โซน: {zone.name_th} ({zone.name_en})</span>
                <span className="text-[10px] text-zinc-500">• {zone.zone_type}</span>
              </button>
            )}
          </div>

          {/* Voting Live Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">อันดับที่ #{rank}</div>
                  <div className="text-[11px] text-zinc-400">จากตัวเลือกทั้งหมดในเดือนนี้</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-400">{votesCount} โหวต</div>
                <div className="text-[10px] text-zinc-400">{percentage}% ของคะแนนทั้งหมด</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Vote Action Button */}
            {!isVotingOpen ? (
              <div className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700 text-center text-xs font-semibold">
                รอบโหวตยังไม่เปิดหรือปิดแล้ว
              </div>
            ) : isVotedByMe ? (
              <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-center text-xs font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                คุณได้โหวตให้สถานที่นี้แล้ว
              </div>
            ) : hasVotedOther ? (
              <button
                onClick={handleVote}
                disabled={isVoting}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-center text-xs font-bold transition flex items-center justify-center gap-2 active:scale-98"
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                เปลี่ยนคะแนนโหวตมาสถานที่นี้
              </button>
            ) : (
              <button
                onClick={handleVote}
                disabled={isVoting}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-center text-xs font-extrabold transition shadow-lg flex items-center justify-center gap-2 active:scale-98"
              >
                <Heart className="w-4 h-4 text-zinc-950 fill-zinc-950" />
                โหวตให้สถานที่นี้เลย
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              เกี่ยวกับสถานที่
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
              {place.description}
            </p>
          </div>

          {/* Address & Coordinates */}
          <div className="space-y-2 pt-1 border-t border-zinc-900">
            {/* Address */}
            <div className="flex items-start gap-2.5 text-xs text-zinc-300">
              <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{place.address}</span>
            </div>

            {/* Coordinates */}
            <div className="flex items-center justify-between text-[11px] bg-zinc-900/70 px-3 py-2 rounded-lg border border-zinc-800 text-zinc-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>{place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}</span>
              </div>
              <button
                onClick={handleCopyCoords}
                className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                {copiedCoords ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCoords ? 'คัดลอกแล้ว' : 'คัดลอกพิกัด'}</span>
              </button>
            </div>
          </div>

          {/* QR Code & External Links */}
          <button
            onClick={() => toggleQrModal(true, place.id)}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-amber-300 text-xs font-semibold border border-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>สร้าง QR Code สำหรับโหวตสถานที่นี้</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={place.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>เปิด Google Maps</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>แชร์สถานที่</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
