import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CheckCircle2, Navigation, Search, Compass, Clock3 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { VotingSessionControls } from './VotingSessionControls';

export const VotingResultsView: React.FC = () => {
  const {
    getLeaderboard,
    activeSession,
    zones,
    hiddenZoneIds,
    places,
    selectPlace,
    selectZone,
    setCurrentView,
    castVote,
    getUserVotedPlaceId,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [votingPlaceId, setVotingPlaceId] = useState<string | null>(null);
  const [voteMessage, setVoteMessage] = useState('');
  const [isSessionControlsOpen, setIsSessionControlsOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const leaderboard = getLeaderboard();
  const userVotedPlaceId = getUserVotedPlaceId();
  const totalVotes = leaderboard.reduce((total, entry) => total + entry.votes_count, 0);
  const isSessionActive = Boolean(activeSession &&
    activeSession.status === 'active' &&
    now >= Date.parse(activeSession.starts_at) &&
    now <= Date.parse(activeSession.ends_at));
  const startsAt = activeSession ? Date.parse(activeSession.starts_at) : NaN;
  const endsAt = activeSession ? Date.parse(activeSession.ends_at) : NaN;
  const countdownLabel = activeSession?.status === 'completed' || (Number.isFinite(endsAt) && endsAt <= now)
    ? 'ปิดโหวตแล้ว'
    : activeSession?.status === 'active' && Number.isFinite(startsAt) && startsAt > now
      ? `เริ่มใน ${Math.ceil((startsAt - now) / 60_000)} นาที`
      : isSessionActive && Number.isFinite(endsAt)
        ? `เหลือ ${Math.ceil((endsAt - now) / 60_000)} นาที`
        : null;

  const handleVote = async (placeId: string) => {
    setVotingPlaceId(placeId);
    setVoteMessage('');
    const result = await castVote(placeId);
    setVoteMessage(result.success
      ? result.action === 'NO_CHANGE' ? 'คุณโหวตร้านนี้ไว้แล้ว' : result.action === 'VOTE_CHANGED' ? 'เปลี่ยนคะแนนโหวตแล้ว' : 'บันทึกคะแนนโหวตแล้ว'
      : result.action === 'NO_SESSION' ? 'ขณะนี้ยังไม่มีรอบโหวตที่เปิดอยู่' : result.message || 'บันทึกคะแนนไม่สำเร็จ กรุณาลองอีกครั้ง');
    setVotingPlaceId(null);
  };

  const filteredEntries = leaderboard.filter(e => {
    if (selectedZone !== 'all' && e.place.zone_id !== selectedZone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return e.place.name.toLowerCase().includes(q) || (e.place.name_en?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });


  const handleInspectOnMap = (placeId: string) => {
    selectZone(null, false);
    setCurrentView('map');
    window.setTimeout(() => selectPlace(placeId), 350);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 text-zinc-100 pt-20 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {isSessionActive ? 'ผลโหวตแบบเรียลไทม์' : activeSession ? 'การโหวตยังไม่เปิดหรือสิ้นสุดแล้ว' : 'ยังไม่มีรอบโหวต'}
            </span>
            {countdownLabel && (
              <span role="timer" aria-live="off" className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isSessionActive ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'}`}>
                <Clock3 className="h-3 w-3" />
                {countdownLabel}
              </span>
            )}
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-zinc-400 text-xs">ร้านหมูกระทะ · เจ็ดยอด · คูเมือง · ช้างคลาน</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            {activeSession?.title || 'ผลโหวตร้านหมูกระทะเชียงใหม่'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 m-0">
            เลือกร้านที่อยากไปได้ 1 ร้านต่อรอบ และเปลี่ยนคะแนนได้ตลอดช่วงโหวต
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsSessionControlsOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800"
          >
            <Clock3 className="h-4 w-4 text-amber-300" />
            <span>ตั้งค่าโหวต</span>
          </button>
          <button
            onClick={() => setCurrentView('map')}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-md transition hover:bg-amber-400 active:scale-95"
          >
            <Compass className="h-4 w-4 text-zinc-950" />
            <span>กลับไปแผนที่ 3D</span>
          </button>
        </div>
      </div>

      <section className="my-6 max-w-4xl mx-auto">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <p className="text-xs text-zinc-400 m-0">คะแนนโหวตทั้งหมด</p>
            <p className="text-3xl font-bold text-white tabular-nums mt-1 mb-0">{totalVotes}</p>
          </div>
          <p className="text-xs text-zinc-500 m-0">{places.length} ร้าน</p>
        </div>
        <p className="text-[11px] text-zinc-500 mt-3 mb-0">
          {isSupabaseConfigured
            ? 'คะแนนบันทึกบนระบบกลางและอัปเดตให้ผู้ใช้ทุกคน'
            : 'โหมดนี้บันทึกคะแนนในเบราว์เซอร์นี้ หากต้องการโหวตร่วมกันหลายเครื่องให้ตั้งค่า Supabase'}
        </p>

        {!isSessionActive && (
          <p className="mt-4 mb-0 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200" role="status">
            {!activeSession ? 'ยังไม่มีรอบโหวตในฐานข้อมูล กรุณาตั้งค่ารอบโหวตก่อนเริ่มใช้งาน' : 'ขณะนี้ไม่อยู่ในช่วงเวลาที่เปิดโหวต'}
          </p>
        )}
        {voteMessage && <p className="mt-3 mb-0 text-xs text-emerald-300" role="status" aria-live="polite">{voteMessage}</p>}

        {filteredEntries.every(entry => entry.votes_count === 0) && filteredEntries.length > 0 && (
          <p className="my-4 text-sm text-zinc-400" role="status">ยังไม่มีคะแนนโหวต เลือกร้านที่อยากไปแล้วกดโหวตได้เลย</p>
        )}

        {filteredEntries[0]?.votes_count > 0 && (
          <div className="py-5 border-b border-zinc-800">
            <p className="text-[11px] text-amber-400 font-semibold mb-2">อันดับ 1{filteredEntries[0].votes_count > 0 ? ' · ผู้นำขณะนี้' : ''}</p>
            <div className="flex items-center gap-4">
              <img src={filteredEntries[0].place.image_url} alt="" className="w-16 h-16 rounded-xl object-cover bg-zinc-900" />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate m-0">{filteredEntries[0].place.name}</h2>
                <p className="text-xs text-zinc-400 mt-1 mb-0">{filteredEntries[0].zone?.name_th || 'เชียงใหม่'} · {filteredEntries[0].votes_count} โหวต ({filteredEntries[0].percentage}%)</p>
              </div>
              <button onClick={() => handleInspectOnMap(filteredEntries[0].place.id)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900" title="ดูบนแผนที่">
                <Navigation className="w-4 h-4" />
              </button>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${filteredEntries[0].percentage}%` }} />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
          <h2 className="text-sm font-semibold text-white m-0">อันดับร้านทั้งหมด <span className="text-zinc-500 font-normal">({filteredEntries.length})</span></h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="ค้นหาร้านหมูกระทะ" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-zinc-900 text-zinc-200 text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-zinc-600 w-40" />
            </div>
            <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="bg-zinc-900 text-zinc-300 text-xs px-2.5 py-2 rounded-lg border border-zinc-800 focus:outline-none">
              <option value="all">ทุกโซน</option>
              {zones.filter(z => !hiddenZoneIds.includes(z.id)).map(z => <option key={z.id} value={z.id}>{z.name_th}</option>)}
            </select>
          </div>
        </div>

        <div className="divide-y divide-zinc-800/80 border-y border-zinc-800">
          {filteredEntries.map(entry => {
            const isUserChoice = userVotedPlaceId === entry.place.id;
            return (
              <div key={entry.place.id} className="flex items-center gap-3 py-3">
                <span className={`w-8 text-center text-sm font-semibold tabular-nums ${entry.votes_count > 0 && entry.rank === 1 ? 'text-amber-400' : 'text-zinc-500'}`}>{entry.votes_count > 0 ? entry.rank : '—'}</span>
                <img src={entry.place.image_url} alt="" className="w-11 h-11 rounded-lg object-cover bg-zinc-900" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-zinc-100 truncate">{entry.place.name}</span>
                    {entry.place.verification_status === 'verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5 mb-0">{entry.zone?.name_th} · {entry.place.category}</p>
                </div>
                <div className="text-right w-20 flex-shrink-0">
                  <p className="text-sm font-semibold text-zinc-200 tabular-nums m-0">{entry.votes_count}</p>
                  <p className="text-[10px] text-zinc-500 m-0">{entry.percentage}%</p>
                </div>
                <button onClick={() => handleInspectOnMap(entry.place.id)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900" title="ดูบนแผนที่">
                  <Navigation className="w-4 h-4" />
                </button>
                <button
                  onClick={() => void handleVote(entry.place.id)}
                  disabled={!isSessionActive || votingPlaceId !== null}
                  aria-pressed={isUserChoice}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed ${isUserChoice ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-300 hover:bg-zinc-900'}`}
                >
                  {votingPlaceId === entry.place.id ? 'กำลังบันทึก…' : isUserChoice ? 'โหวตแล้ว' : 'โหวต'}
                </button>
              </div>
            );
          })}
          {filteredEntries.length === 0 && (
            <p className="py-10 text-center text-sm text-zinc-500">
              {places.length === 0 ? 'ยังไม่มีร้านในรอบโหวตนี้ กรุณาตั้งค่าร้านและตัวเลือกโหวตใน Supabase' : 'ไม่พบร้านหมูกระทะจากตัวกรองนี้'}
            </p>
          )}
        </div>
      </section>
      <VotingSessionControls isOpen={isSessionControlsOpen} onClose={() => setIsSessionControlsOpen(false)} />
    </div>
  );
};
