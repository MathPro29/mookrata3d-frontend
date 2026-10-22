import React, { useEffect, useState } from 'react';
import { Clock3, Compass, MapPin, Search, Settings2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { VotingSessionControls } from './VotingSessionControls';

export const VotingResultsView: React.FC = () => {
  const { getLeaderboard, getUserVotedPlaceId, activeSession, zones, hiddenZoneIds, places, selectPlace, selectZone, setCurrentView, castVote, removeVote } = useAppStore();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [isVoting, setIsVoting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSessionControlsOpen, setIsSessionControlsOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get('place');
    if (target && places.some(place => place.id === target)) setSelectedPlaceId(target);
  }, [places]);

  const leaderboard = getLeaderboard();
  const myVotePlaceId = getUserVotedPlaceId();
  const selectedPlace = places.find(place => place.id === selectedPlaceId);
  const totalVotes = leaderboard.reduce((sum, entry) => sum + entry.votes_count, 0);
  const isSessionActive = Boolean(activeSession && activeSession.status === 'active' && now >= Date.parse(activeSession.starts_at) && now <= Date.parse(activeSession.ends_at));
  const filteredEntries = leaderboard.filter(entry =>
    (selectedZone === 'all' || entry.place.zone_id === selectedZone) &&
    (!searchQuery.trim() || `${entry.place.name} ${entry.place.name_en ?? ''}`.toLowerCase().includes(searchQuery.trim().toLowerCase()))
  );
  const topThree = leaderboard.slice(0, 3);

  const handleVote = async (placeId = selectedPlaceId) => {
    if (!placeId || !isSessionActive || isVoting) return;
    setSelectedPlaceId(placeId);
    setIsVoting(true);
    setMessage('');
    try {
      const result = await castVote(placeId);
      setMessage(result.success
        ? result.action === 'NO_CHANGE' ? 'คุณโหวตร้านนี้ไว้แล้ว' : 'บันทึกคะแนนโหวตแล้ว'
        : result.message || 'บันทึกคะแนนไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setIsVoting(false);
    }
  };

  const handleRemoveVote = async (placeId: string) => {
    if (!isSessionActive || isVoting || myVotePlaceId !== placeId) return;
    setIsVoting(true);
    setMessage('');
    try {
      const result = await removeVote(placeId);
      setMessage(result.success ? 'ถอนโหวตแล้ว' : result.message || 'ถอนโหวตไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setIsVoting(false);
    }
  };

  const handleInspectOnMap = (placeId: string) => {
    selectZone(null, false);
    setCurrentView('map');
    window.setTimeout(() => selectPlace(placeId), 350);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f7f7f5] text-zinc-950">
      <div className="mx-auto max-w-6xl px-4 pb-40 pt-[calc(12rem+env(safe-area-inset-top))] sm:px-6 sm:pt-36 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-zinc-300 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white px-3 py-1.5 text-zinc-700 ring-1 ring-zinc-300">{isSessionActive ? 'เปิดโหวตอยู่' : 'ปิดโหวต'}</span>
              {activeSession && <span className="flex items-center gap-1 text-zinc-600"><Clock3 className="h-3.5 w-3.5" />{isSessionActive ? `ถึง ${new Date(activeSession.ends_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' })}` : 'คะแนนรอบนี้ถูกล้างแล้ว'}</span>}
            </div>
            <h1 className="m-0 text-3xl font-black tracking-tight sm:text-4xl">ผลโหวตร้านหมูกระทะ</h1>
            <p className="mb-0 mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">ดูอันดับร้านที่คนเลือก แล้วเลือกร้านที่คุณอยากไปได้หนึ่งร้าน เปลี่ยนใจได้ระหว่างเปิดโหวต</p>
          </div>
          <div className="flex items-end justify-between gap-5 md:justify-end">
            <div className="text-right"><div className="text-xs text-zinc-600">คะแนนทั้งหมด</div><div className="text-3xl font-black tabular-nums">{totalVotes.toLocaleString('th-TH')}</div></div>
            <button onClick={() => setIsSessionControlsOpen(true)} aria-label="ตั้งค่าโหวต" className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"><Settings2 className="h-5 w-5" /></button>
          </div>
        </div>

        {!isSessionActive && <p role="status" className="mt-5 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700">{activeSession ? 'รอบโหวตสิ้นสุดแล้ว คะแนนถูกล้างก่อนเริ่มรอบใหม่ ดูร้านที่ชนะได้จากตัวนับเวลาด้านบน' : 'ยังไม่มีรอบโหวตที่เปิดอยู่'}</p>}
        {message && <p role="status" aria-live="polite" className="mt-5 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900">{message}</p>}

        <section className="mt-9" aria-labelledby="top-three-title">
          <div className="mb-4 flex items-end justify-between gap-3"><h2 id="top-three-title" className="m-0 text-xl font-black sm:text-2xl">อันดับ 1 · 2 · 3</h2><span className="text-xs text-zinc-500">เรียงตามคะแนนโหวต</span></div>
          <div className="grid gap-3 md:grid-cols-3">
            {topThree.map((entry, index) => {
              const selected = selectedPlaceId === entry.place.id;
              const voted = myVotePlaceId === entry.place.id;
              return <div key={entry.place.id} className={`flex min-h-64 flex-col rounded-2xl border bg-white p-5 shadow-sm ${selected ? 'border-zinc-950 ring-2 ring-zinc-950' : index === 0 ? 'border-amber-400' : 'border-zinc-200'}`}>
                <div className="flex items-start justify-between gap-3"><span className={`text-6xl font-black leading-none tabular-nums ${index === 0 ? 'text-amber-500' : 'text-zinc-200'}`}>{index + 1}</span><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700">{entry.votes_count} โหวต</span></div>
                <div className="mt-4 flex-1"><h3 className="m-0 text-lg font-bold leading-snug text-zinc-950">{entry.place.name}</h3><p className="mb-0 mt-1 flex items-center gap-1 text-xs text-zinc-500"><MapPin className="h-3.5 w-3.5" />{entry.zone?.name_th || 'เชียงใหม่'} · {entry.percentage}%{entry.is_tied ? ' · คะแนนเท่ากัน' : ''}</p></div>
                <div className="mt-5 flex gap-2">
                  {voted ? (
                    <button onClick={() => void handleRemoveVote(entry.place.id)} disabled={!isSessionActive || isVoting} className="h-12 flex-1 rounded-xl border border-rose-300 bg-white text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">{isVoting ? 'กำลังดำเนินการ…' : 'ถอนโหวตของฉัน'}</button>
                  ) : (
                    <button onClick={() => void handleVote(entry.place.id)} disabled={!isSessionActive || isVoting} aria-pressed={selected} className={`h-12 flex-1 rounded-xl text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200'}`}>{isVoting && selected ? 'กำลังบันทึก…' : selected ? 'เลือกแล้ว' : 'โหวตร้านนี้'}</button>
                  )}
                  <button onClick={() => handleInspectOnMap(entry.place.id)} aria-label={`ดู ${entry.place.name} บนแผนที่`} className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100"><Compass className="h-5 w-5" /></button>
                </div>
              </div>;
            })}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="all-results-title">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><h2 id="all-results-title" className="m-0 text-xl font-black">ร้านทั้งหมด <span className="text-base font-normal text-zinc-500">({filteredEntries.length})</span></h2><div className="flex gap-2"><label className="relative min-w-0 flex-1 sm:w-52"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><span className="sr-only">ค้นหาร้าน</span><input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="ค้นหาร้าน" className="h-11 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-zinc-950" /></label><select value={selectedZone} onChange={event => setSelectedZone(event.target.value)} aria-label="เลือกโซน" className="h-11 max-w-32 rounded-xl border border-zinc-300 bg-white px-2 text-sm sm:max-w-none"><option value="all">ทุกโซน</option>{zones.filter(zone => !hiddenZoneIds.includes(zone.id)).map(zone => <option key={zone.id} value={zone.id}>{zone.name_th}</option>)}</select></div></div>
          <div className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {filteredEntries.map(entry => {
              const voted = myVotePlaceId === entry.place.id;
              return <div key={entry.place.id} className={`flex items-center gap-3 p-3 sm:p-4 ${selectedPlaceId === entry.place.id ? 'bg-amber-50' : ''}`}>
                <span className="w-8 shrink-0 text-center text-xl font-black tabular-nums text-zinc-400">{entry.rank}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-zinc-950">{entry.place.name}</div>
                  <div className="truncate text-xs text-zinc-500">{entry.zone?.name_th || 'เชียงใหม่'} · {entry.votes_count} โหวต</div>
                </div>
                {voted ? <button onClick={() => void handleRemoveVote(entry.place.id)} disabled={!isSessionActive || isVoting} className="h-11 shrink-0 rounded-xl border border-rose-300 px-3 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">ถอนโหวต</button>
                  : <button onClick={() => void handleVote(entry.place.id)} disabled={!isSessionActive || isVoting} aria-pressed={selectedPlaceId === entry.place.id} className={`h-11 shrink-0 rounded-xl px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${selectedPlaceId === entry.place.id ? 'bg-zinc-950 text-white' : 'border border-zinc-300 text-zinc-800'}`}>{isVoting && selectedPlaceId === entry.place.id ? 'กำลังบันทึก…' : selectedPlaceId === entry.place.id ? 'เลือกแล้ว' : 'โหวต'}</button>}
              </div>;
            })}
            {filteredEntries.length === 0 && <p className="m-0 px-4 py-10 text-center text-sm text-zinc-500">ไม่พบร้านจากตัวกรองนี้</p>}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-5"><div className="min-w-0 flex-1"><div className="text-[11px] font-semibold text-zinc-500">ร้านที่เลือก</div><div className="truncate text-sm font-bold text-zinc-950">{selectedPlace?.name || 'เลือกร้านจากอันดับด้านบน'}</div></div><button onClick={() => void handleVote()} disabled={!selectedPlaceId || !isSessionActive || isVoting || myVotePlaceId === selectedPlaceId} className="h-14 w-full rounded-xl bg-zinc-950 px-8 text-base font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 sm:w-72">{isVoting ? 'กำลังบันทึก…' : myVotePlaceId === selectedPlaceId && selectedPlaceId ? 'โหวตแล้ว' : 'โหวตร้านนี้'}</button></div>
      </div>
      <VotingSessionControls isOpen={isSessionControlsOpen} onClose={() => setIsSessionControlsOpen(false)} />
    </div>
  );
};
