import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { PlusCircle, Menu, Compass, QrCode, Map as MapIcon, Trophy } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, toggleQrModal, toggleAddPlace, toggleSidebar, isSidebarOpen, votes } = useAppStore();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
      <div className="flex items-center justify-between gap-2">
        <div className="pointer-events-auto flex min-w-0 items-center gap-2">
          {currentView === 'map' && <button onClick={() => toggleSidebar()} aria-label="เปิดรายการโซนและร้าน" aria-expanded={isSidebarOpen} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/95 text-white shadow-lg lg:hidden"><Menu className="h-5 w-5" /></button>}
          <button onClick={() => setCurrentView('map')} className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/95 px-2.5 text-left text-white shadow-lg sm:px-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-zinc-950"><Compass className="h-4 w-4" /></span>
            <span className="truncate text-xs font-extrabold">Chiang Mai Mookata</span>
          </button>
        </div>

        <nav aria-label="มุมมองหลัก" className="pointer-events-auto hidden items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/95 p-1 shadow-lg sm:flex">
          <button onClick={() => setCurrentView('map')} aria-current={currentView === 'map' ? 'page' : undefined} className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${currentView === 'map' ? 'bg-white text-zinc-950' : 'text-zinc-300 hover:text-white'}`}><MapIcon className="h-4 w-4" />แผนที่ 3D</button>
          <button onClick={() => setCurrentView('results')} aria-current={currentView === 'results' ? 'page' : undefined} className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold ${currentView === 'results' ? 'bg-white text-zinc-950' : 'text-zinc-300 hover:text-white'}`}><Trophy className="h-4 w-4" />ผลโหวต <span className="tabular-nums opacity-70">{votes.length}</span></button>
        </nav>

        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          <button onClick={() => toggleQrModal(true)} aria-label="แสดง QR เพื่อโหวต" className="flex h-11 items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/95 px-3 text-xs font-semibold text-white shadow-lg"><QrCode className="h-4 w-4" /><span className="hidden lg:inline">QR โหวต</span></button>
          <button onClick={() => toggleAddPlace(true)} aria-label="เพิ่มหมุดร้าน" className="flex h-11 items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/95 px-3 text-xs font-semibold text-white shadow-lg"><PlusCircle className="h-4 w-4" /><span className="hidden lg:inline">เพิ่มหมุด</span></button>
        </div>
      </div>
      <nav aria-label="มุมมองหลัก" className="pointer-events-auto mt-2 grid grid-cols-2 gap-1 rounded-xl border border-zinc-800 bg-zinc-950/95 p-1 shadow-lg sm:hidden">
        <button onClick={() => setCurrentView('map')} aria-current={currentView === 'map' ? 'page' : undefined} className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${currentView === 'map' ? 'bg-white text-zinc-950' : 'text-zinc-300'}`}><MapIcon className="h-4 w-4" />แผนที่ 3D</button>
        <button onClick={() => setCurrentView('results')} aria-current={currentView === 'results' ? 'page' : undefined} className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${currentView === 'results' ? 'bg-white text-zinc-950' : 'text-zinc-300'}`}><Trophy className="h-4 w-4" />ผลโหวต</button>
      </nav>
    </header>
  );
};
