import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MapContainer } from './components/MapContainer';
import { PlaceDetailPanel } from './components/PlaceDetailPanel';
import { AddPlaceModal } from './components/AddPlaceModal';
import { QrCodeModal } from './components/QrCodeModal';
import { VotingResultsView } from './components/VotingResultsView';
import { VotingCountdown } from './components/VotingCountdown';
import { Compass, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    init, 
    isLoading, 
    places, 
    votes,
    loadError,
    currentView,
    setCurrentView,
    selectPlace 
  } = useAppStore();

  useEffect(() => {
    init().then(() => {
      // Open a shared place link on the map.
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'results') setCurrentView('results');
        const placeParam = params.get('place');

        if (placeParam) {
          selectPlace(placeParam);
        }
      }
    });
  }, [init, selectPlace, setCurrentView]);

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md text-white">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-zinc-950 shadow-xl mb-3.5">
            <Compass className="w-6 h-6 text-zinc-950" />
          </div>
          <h2 className="text-sm font-bold tracking-tight">Chiang Mai 3D Interactive Map</h2>
          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            กำลังโหลดข้อมูลระบบและแผนที่ 3 มิติ...
          </p>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar />
      <VotingCountdown />

      {loadError && (
        <div role="alert" className="fixed top-20 left-1/2 z-50 flex w-[min(92vw,36rem)] -translate-x-1/2 items-center justify-between gap-4 rounded-xl border border-rose-400/30 bg-zinc-950 px-4 py-3 text-xs text-rose-200 shadow-xl">
          <div className="min-w-0">
            <p className="m-0 font-semibold">โหลดข้อมูลไม่สำเร็จ</p>
            <p className="mb-0 mt-1 break-words text-rose-200/75">{loadError}</p>
          </div>
          <button onClick={() => void init()} disabled={isLoading} className="shrink-0 rounded-lg bg-rose-400/15 px-3 py-1.5 font-semibold text-rose-100 hover:bg-rose-400/25 disabled:cursor-wait disabled:opacity-60">
            {isLoading ? 'กำลังโหลด…' : 'ลองอีกครั้ง'}
          </button>
        </div>
      )}

      <main className={`h-full w-full ${currentView === 'map' ? '' : 'hidden'}`}><MapContainer /></main>
      {currentView === 'map' ? <>
        <Sidebar />
        <PlaceDetailPanel />
        <div className="absolute bottom-3 left-4 z-20 hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/85 px-3 py-1.5 text-[10px] text-zinc-400 shadow-lg backdrop-blur-md sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-medium text-zinc-300">แผนที่ร้านหมูกระทะ</span>
        </div>
        <span className="text-zinc-600">|</span>
        <span>{places.length} สถานที่</span>
        <span className="text-zinc-600">|</span>
        <span>{votes.length} โหวต</span>
        </div>
      </> : <main className="h-full w-full"><VotingResultsView /></main>}
      <AddPlaceModal />
      <QrCodeModal />
    </div>
  );
};

export default App;
