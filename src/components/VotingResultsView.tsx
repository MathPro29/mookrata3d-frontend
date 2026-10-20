import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '../store/useAppStore';
import { 
  Trophy, 
  Crown, 
  CheckCircle2, 
  MapPin, 
  QrCode, 
  Navigation, 
  Search, 
  Users, 
  Compass, 
  Equal
} from 'lucide-react';

export const VotingResultsView: React.FC = () => {
  const {
    getLeaderboard,
    activeSession,
    votes,
    zones,
    places,
    selectPlace,
    setCurrentView,
    castVote,
    getUserVotedPlaceId,
    toggleQrModal
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  const leaderboard = getLeaderboard();
  const userVotedPlaceId = getUserVotedPlaceId();
  const totalVotes = votes.length;
  const isSessionEnded = activeSession?.status === 'completed';

  const filteredEntries = leaderboard.filter(e => {
    if (selectedZone !== 'all' && e.place.zone_id !== selectedZone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return e.place.name.toLowerCase().includes(q) || (e.place.name_en?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  const topRankEntries = leaderboard.filter(e => e.rank === 1 && e.votes_count > 0);
  const isTied = topRankEntries.length > 1;

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  const handleVote = async (placeId: string) => {
    await castVote(placeId);
  };

  const handleInspectOnMap = (placeId: string) => {
    setCurrentView('map');
    selectPlace(placeId);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 text-zinc-100 pt-20 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {isSessionEnded ? 'การโหวตสิ้นสุดลงแล้ว' : 'ผลการโหวตแบบ Real-time'}
            </span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-zinc-400 text-xs">Chiang Mai Destination Poll</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            {activeSession?.title || 'ผลคะแนนสถานที่ยอดนิยมเชียงใหม่'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 m-0">
            สถิติลำดับสถานที่และส่วนแบ่งคะแนนโหวตทั้งหมด อัปเดตสดแบบเรียลไทม์
          </p>
        </div>

        {/* Quick Back to Map & QR Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => toggleQrModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>QR Code โหวตผ่านมือถือ</span>
          </button>

          <button
            onClick={() => setCurrentView('map')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md transition active:scale-95"
          >
            <Compass className="w-4 h-4 text-zinc-950" />
            <span>กลับไปแผนที่ 3D</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards & QR Code Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-6">
        {/* Total Votes */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">คะแนนโหวตทั้งหมด</div>
            <div className="text-2xl font-black text-white mt-1 tabular-nums">{totalVotes}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">1 คน = 1 คะแนนเสียง</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Places Competing */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">สถานที่ที่เข้าร่วม</div>
            <div className="text-2xl font-black text-white mt-1 tabular-nums">{places.length}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">ผ่านการตรวจสอบพิกัดจริง</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* Leading Place */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">อันดับ 1 ในขณะนี้</div>
            <div className="text-base font-extrabold text-amber-400 mt-1 truncate">
              {top1 ? top1.place.name : '-'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {top1 ? `${top1.votes_count} โหวต (${top1.percentage}%)` : 'ยังไม่มีคะแนน'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        {/* QR Code Quick Scan Card */}
        <div
          onClick={() => toggleQrModal(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-zinc-900 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-400 transition group"
        >
          <div>
            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">โหวตผ่านสมาร์ตโฟน</div>
            <div className="text-xs font-bold text-white mt-0.5 group-hover:text-amber-200">สแกนเพื่อโหวต</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">เปิดกล้องมือถือสแกนได้เลย</div>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg p-1 shadow flex items-center justify-center flex-shrink-0">
            <QRCodeSVG value="http://172.16.10.163:5173/?view=results" size={40} />
          </div>
        </div>
      </div>

      {/* Winner / Tie Announcement Banner */}
      {isSessionEnded && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 my-4">
          {isTied ? (
            <>
              <Equal className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">ผลคะแนนสิ้นสุดเสมอกัน (Tie)</div>
                <div className="text-xs text-amber-300/80">
                  มีสถานที่ที่ได้คะแนนสูงสุดร่วมกันจำนวน {topRankEntries.length} แห่ง ได้แก่ {topRankEntries.map(e => e.place.name).join(', ')}
                </div>
              </div>
            </>
          ) : top1 && top1.votes_count > 0 ? (
            <>
              <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">ประกาศผลผู้ชนะประจำรอบนี้ (Winner)</div>
                <div className="text-xs text-amber-300/80">
                  ขอแสดงความยินดีกับ <strong>{top1.place.name}</strong> ได้รับคะแนนโหวตสูงสุด {top1.votes_count} เสียง ({top1.percentage}%)
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Top 3 Showcase (Podium Cards) */}
      <div className="my-8">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>3 อันดับยอดนิยม (Top 3 Leaders)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 1 (Center on mobile, 1st position) */}
          {top1 && (
            <div className="relative rounded-2xl bg-gradient-to-b from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/40 p-5 shadow-xl flex flex-col justify-between order-1">
              <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 font-black text-xs flex items-center gap-1 shadow-md">
                <Crown className="w-3.5 h-3.5" />
                <span>อันดับ 1 (Top Choice)</span>
              </div>

              <div>
                <div className="h-44 rounded-xl overflow-hidden mt-2 mb-3 bg-zinc-950">
                  <img src={top1.place.image_url} alt={top1.place.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-white truncate">{top1.place.name}</h3>
                  <span className="text-base font-black text-amber-400">{top1.votes_count} โหวต</span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{top1.place.description}</p>
                
                {/* Progress bar */}
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${top1.percentage}%` }} />
                </div>
                <div className="text-right text-[10px] text-zinc-400 mt-1">{top1.percentage}% ของคะแนนทั้งหมด</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                <button
                  onClick={() => handleInspectOnMap(top1.place.id)}
                  className="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>ดูบนแผนที่</span>
                </button>

                <button
                  onClick={() => handleVote(top1.place.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    userVotedPlaceId === top1.place.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                  }`}
                >
                  {userVotedPlaceId === top1.place.id ? 'โหวตแล้ว' : 'โหวตให้ที่นี่'}
                </button>
              </div>
            </div>
          )}

          {/* Rank 2 */}
          {top2 && (
            <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 flex flex-col justify-between order-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    อันดับ #2
                  </span>
                  <span className="text-sm font-bold text-white">{top2.votes_count} โหวต</span>
                </div>
                <div className="h-36 rounded-xl overflow-hidden mb-3 bg-zinc-950">
                  <img src={top2.place.image_url} alt={top2.place.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm font-bold text-white truncate">{top2.place.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{top2.place.description}</p>
                
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-zinc-400 h-full rounded-full transition-all duration-500" style={{ width: `${top2.percentage}%` }} />
                </div>
                <div className="text-right text-[10px] text-zinc-500 mt-1">{top2.percentage}%</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                <button
                  onClick={() => handleInspectOnMap(top2.place.id)}
                  className="py-1.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1 transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>ดูพิกัด</span>
                </button>
                <button
                  onClick={() => handleVote(top2.place.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    userVotedPlaceId === top2.place.id
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400'
                  }`}
                >
                  {userVotedPlaceId === top2.place.id ? 'โหวตแล้ว' : 'โหวตที่นี่'}
                </button>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {top3 && (
            <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 flex flex-col justify-between order-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    อันดับ #3
                  </span>
                  <span className="text-sm font-bold text-white">{top3.votes_count} โหวต</span>
                </div>
                <div className="h-36 rounded-xl overflow-hidden mb-3 bg-zinc-950">
                  <img src={top3.place.image_url} alt={top3.place.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm font-bold text-white truncate">{top3.place.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{top3.place.description}</p>
                
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-amber-700 h-full rounded-full transition-all duration-500" style={{ width: `${top3.percentage}%` }} />
                </div>
                <div className="text-right text-[10px] text-zinc-500 mt-1">{top3.percentage}%</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                <button
                  onClick={() => handleInspectOnMap(top3.place.id)}
                  className="py-1.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1 transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>ดูพิกัด</span>
                </button>
                <button
                  onClick={() => handleVote(top3.place.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    userVotedPlaceId === top3.place.id
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400'
                  }`}
                >
                  {userVotedPlaceId === top3.place.id ? 'โหวตแล้ว' : 'โหวตที่นี่'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Leaderboard Table Section */}
      <div className="my-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-white m-0">ตารางจัดอันดับสถานที่ทั้งหมด ({filteredEntries.length})</h2>

          {/* Search & Zone Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อสถานที่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 text-zinc-200 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-500 w-40 sm:w-48"
              />
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-zinc-900 text-zinc-300 text-xs px-2.5 py-1.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-amber-500"
            >
              <option value="all">ทุกโซน</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name_th}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table / Cards List */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 divide-y divide-zinc-800/80 overflow-hidden">
          {filteredEntries.map((entry) => {
            const isUserChoice = userVotedPlaceId === entry.place.id;

            return (
              <div
                key={entry.place.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/80 transition"
              >
                {/* Left: Rank, Image & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                    entry.rank === 1 ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    #{entry.rank}
                  </div>

                  <img
                    src={entry.place.image_url}
                    alt={entry.place.name}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white truncate">{entry.place.name}</span>
                      {entry.place.verification_status === 'verified' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span className="text-amber-400/90 font-medium">{entry.zone?.name_th}</span>
                      <span>•</span>
                      <span>{entry.place.category}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Vote Progress & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-right sm:w-36">
                    <div className="text-xs font-bold text-white">
                      {entry.votes_count} <span className="text-[11px] font-normal text-zinc-400">โหวต</span>
                    </div>
                    <div className="w-24 sm:w-36 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${entry.percentage}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{entry.percentage}% ของทั้งหมด</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleInspectOnMap(entry.place.id)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                      title="ดูบนแผนที่ 3D"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleQrModal(true, entry.place.id)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition"
                      title="QR Code โหวตสถานที่นี้"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleVote(entry.place.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isUserChoice
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      {isUserChoice ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>โหวตแล้ว</span>
                        </>
                      ) : (
                        <span>โหวต</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
