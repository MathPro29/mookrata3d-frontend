import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Trophy, 
  X, 
  Crown, 
  CheckCircle2, 
  Users, 
  Filter, 
  ChevronRight, 
  Sparkles, 
  Equal
} from 'lucide-react';

export const LeaderboardModal: React.FC = () => {
  const {
    isLeaderboardOpen,
    toggleLeaderboard,
    getLeaderboard,
    zones,
    activeSession,
    selectPlace,
    votes
  } = useAppStore();

  const [zoneFilter, setZoneFilter] = useState<string>('all');

  if (!isLeaderboardOpen) return null;

  const allEntries = getLeaderboard();
  const filteredEntries = zoneFilter === 'all'
    ? allEntries
    : allEntries.filter(e => e.place.zone_id === zoneFilter);

  const totalVotes = votes.length;
  const isSessionEnded = activeSession?.status === 'completed';

  // Check top rank status
  const topRankEntries = allEntries.filter(e => e.rank === 1 && e.votes_count > 0);
  const isTied = topRankEntries.length > 1;

  const handlePlaceClick = (placeId: string) => {
    toggleLeaderboard(false);
    selectPlace(placeId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-start justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white m-0">Voting Leaderboard</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSessionEnded ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {isSessionEnded ? 'สิ้นสุดการโหวต' : 'โหวตสด Real-time'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 m-0 mt-0.5">
                {activeSession?.title || 'จัดอันดับสถานที่ยอดนิยมเชียงใหม่'}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleLeaderboard(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Winner / Tie Banner */}
        {isSessionEnded && (
          <div className="p-4 bg-amber-500/15 border-b border-amber-500/30 flex items-center gap-3">
            {isTied ? (
              <>
                <Equal className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="text-xs text-amber-200 font-medium">
                  <strong>ผลคะแนนเสมอกัน (Tie):</strong> มีสถานที่ที่ได้คะแนนอันดับ 1 ร่วมกันจำนวน {topRankEntries.length} แห่ง
                </div>
              </>
            ) : topRankEntries.length === 1 ? (
              <>
                <Crown className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="text-xs text-amber-200 font-medium">
                  <strong>ผู้ชนะ (Winner):</strong> {topRankEntries[0].place.name} ได้รับคะแนนโหวตสูงสุดในรอบนี้!
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Stats & Zone Filter Bar */}
        <div className="px-5 py-3 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Users className="w-4 h-4 text-amber-400" />
            <span>คะแนนรวมทั้งหมด: <strong className="text-white">{totalVotes}</strong> โหวต</span>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="bg-zinc-900 text-zinc-300 text-xs px-2.5 py-1 rounded-lg border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">ทุกโซน ({allEntries.length})</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name_th} ({z.name_en})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ranked Places List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => {
              const isFirst = entry.rank === 1 && entry.votes_count > 0;
              const isSecond = entry.rank === 2 && entry.votes_count > 0;
              const isThird = entry.rank === 3 && entry.votes_count > 0;

              return (
                <div
                  key={entry.place.id}
                  onClick={() => handlePlaceClick(entry.place.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-3.5 group ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-zinc-900/50 border-amber-500/50 hover:border-amber-400'
                      : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  {/* Rank Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-inner ${
                      isFirst
                        ? 'bg-amber-500 text-zinc-950 ring-2 ring-amber-300'
                        : isSecond
                        ? 'bg-zinc-300 text-zinc-950'
                        : isThird
                        ? 'bg-amber-700/80 text-amber-100'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isFirst ? <Crown className="w-4 h-4" /> : `#${entry.rank}`}
                  </div>

                  {/* Thumbnail */}
                  <img
                    src={entry.place.image_url}
                    alt={entry.place.name}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
                  />

                  {/* Details & Progress Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                          {entry.place.name}
                        </span>
                        {entry.place.verification_status === 'verified' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-amber-400">
                          {entry.votes_count} <span className="text-[10px] font-normal text-zinc-400">โหวต</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                      <span className="truncate">{entry.zone?.name_th || 'เชียงใหม่'}</span>
                      <span className="font-mono text-[10px]">{entry.percentage}%</span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFirst ? 'bg-amber-400' : 'bg-zinc-500'
                        }`}
                        style={{ width: `${entry.percentage}%` }}
                      />
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition flex-shrink-0" />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs">
              ไม่พบสถานที่ในโซนที่เลือก
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-900/40 text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>คลิกที่สถานที่เพื่อบินกล้อง 3D ไปยังหมุดบนแผนที่และดูรายละเอียด</span>
        </div>
      </div>
    </div>
  );
};
