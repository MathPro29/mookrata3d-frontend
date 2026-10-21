import { useEffect, useRef, useState } from 'react';
import { Clock3, Trophy, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Place, Vote } from '../types';

export const formatRemaining = (milliseconds: number) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const clock = [hours, minutes, remainder].map(value => String(value).padStart(2, '0')).join(':');
  return days ? `${days} วัน ${clock}` : clock;
};

export const getWinningPlaces = (votes: Vote[], places: Place[], sessionId: string) => {
  const counts = new Map<string, number>();
  const placeIds = new Set(places.map(place => place.id));
  for (const vote of votes) {
    if (vote.session_id === sessionId && placeIds.has(vote.place_id)) {
      counts.set(vote.place_id, (counts.get(vote.place_id) || 0) + 1);
    }
  }
  const highestCount = Math.max(0, ...counts.values());
  return {
    highestCount,
    winners: highestCount > 0 ? places.filter(place => counts.get(place.id) === highestCount) : [],
  };
};

export const VotingCountdown = () => {
  const { activeSession, votes, places, isLoading, loadError, setCurrentView, finalizeVotingSession } = useAppStore();
  const [now, setNow] = useState(Date.now());
  const [showWinner, setShowWinner] = useState(false);
  const finalizingKey = useRef('');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const endTime = activeSession ? Date.parse(activeSession.ends_at) : NaN;
  const startTime = activeSession ? Date.parse(activeSession.starts_at) : NaN;
  const finished = Boolean(activeSession && (activeSession.status === 'completed' || (Number.isFinite(endTime) && now >= endTime)));
  const eventKey = activeSession ? `mookata-winner-${activeSession.id}-${activeSession.ends_at}` : '';

  useEffect(() => {
    if (!finished || !activeSession || activeSession.final_results || isLoading || loadError || finalizingKey.current === eventKey) return;
    finalizingKey.current = eventKey;
    void finalizeVotingSession().catch(error => console.warn('Could not finalize voting session:', error));
  }, [activeSession, eventKey, finalizeVotingSession, finished, isLoading, loadError]);

  useEffect(() => {
    if (!activeSession || isLoading || loadError || !finished) {
      setShowWinner(false);
      return;
    }
    if (sessionStorage.getItem(eventKey) !== 'seen') setShowWinner(true);
  }, [activeSession, eventKey, finished, isLoading, loadError]);

  if (!activeSession || !Number.isFinite(endTime) || isLoading) return null;

  const isOpenEnded = endTime >= Date.UTC(2099, 0, 1);
  const untilStart = Number.isFinite(startTime) && now < startTime;
  const countdown = finished
    ? 'หมดเวลาโหวต'
    : untilStart
      ? `เริ่มใน ${formatRemaining(startTime - now)}`
      : isOpenEnded
        ? 'ยังไม่กำหนดเวลาปิด'
        : `เหลือ ${formatRemaining(endTime - now)}`;

  const liveResult = getWinningPlaces(votes, places, activeSession.id);
  const highestCount = activeSession.final_results?.winning_vote_count ?? liveResult.highestCount;
  const winners = activeSession.final_results
    ? activeSession.final_results.winners.map(winner => ({ id: winner.place_id, name: winner.name }))
    : liveResult.winners;

  const closeWinner = () => {
    sessionStorage.setItem(eventKey, 'seen');
    setShowWinner(false);
  };

  return <>
    <button
      type="button"
      onClick={() => { if (finished) setShowWinner(true); else setCurrentView('results'); }}
      title={finished ? 'ดูผลโหวต' : `เวลาปิดโหวต: ${new Date(endTime).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' })}`}
      className="fixed left-1/2 top-[calc(8.5rem+env(safe-area-inset-top))] z-30 flex min-h-11 max-w-[calc(100vw-7rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-950 shadow-lg transition duration-200 hover:scale-105 hover:shadow-2xl sm:top-20 sm:text-sm"
    >
      {finished ? <Trophy className="h-4 w-4 shrink-0 text-amber-500" /> : <Clock3 className="h-4 w-4 shrink-0 text-amber-500" />}
      <span className="truncate tabular-nums">{countdown}</span>
    </button>

    {showWinner && <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeWinner(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="winner-title" className="winner-popup relative w-full max-w-md rounded-3xl bg-white px-6 pb-6 pt-8 text-center text-zinc-950 shadow-2xl sm:px-8">
        <button onClick={closeWinner} aria-label="ปิดผลโหวต" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100"><X className="h-5 w-5" /></button>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600"><Trophy className="h-8 w-8" /></div>
        <p className="m-0 text-sm font-semibold text-zinc-500">หมดเวลาโหวตแล้ว</p>
        <h2 id="winner-title" className="mb-0 mt-2 text-2xl font-black">{winners.length > 1 ? 'ผู้ชนะร่วม' : winners.length === 1 ? 'ร้านที่ชนะ' : 'ยังไม่มีผู้ชนะ'}</h2>
        {winners.length > 0 ? <div className="mt-5 space-y-2">
          {winners.map(place => <div key={place.id} className="rounded-xl bg-zinc-100 px-4 py-3 text-lg font-bold">{place.name}</div>)}
          <p className="mb-0 mt-3 text-sm text-zinc-600">{highestCount.toLocaleString('th-TH')} โหวต{winners.length > 1 ? ' ต่อร้าน' : ''}</p>
        </div> : <p className="mb-0 mt-4 text-sm text-zinc-600">รอบนี้ยังไม่มีคะแนนโหวต</p>}
        <button onClick={() => { closeWinner(); setCurrentView('results'); }} className="mt-7 h-12 w-full rounded-xl bg-zinc-950 text-sm font-bold text-white hover:bg-zinc-800">ดูรายการร้าน</button>
      </section>
    </div>}
  </>;
};
