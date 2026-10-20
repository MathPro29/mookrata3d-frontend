import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  PlusCircle, 
  Menu, 
  Compass, 
  ChevronDown,
  QrCode,
  BarChart3,
  Map as MapIcon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    zones,
    selectedZoneId,
    selectZone,
    is3D,
    toggle3D,
    toggleAddPlace,
    toggleSidebar,
    currentView,
    setCurrentView,
    toggleQrModal,
    votes
  } = useAppStore();

  return (
    <header className="absolute top-0 left-0 right-0 h-16 z-30 px-3 sm:px-6 flex items-center justify-between pointer-events-none">
      {/* Left: Brand & Mobile Menu Toggle */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Mobile Sidebar Toggle (Only in Map View) */}
        {currentView === 'map' && (
          <button
            onClick={() => toggleSidebar()}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900/90 text-zinc-200 border border-zinc-800 shadow-lg backdrop-blur-md hover:bg-zinc-800 transition"
            title="เปิดเมนูโซน"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Brand */}
        <div 
          onClick={() => setCurrentView('map')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 border border-zinc-800/90 shadow-xl backdrop-blur-md cursor-pointer hover:border-zinc-700 transition"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-black shadow">
            <Compass className="w-4 h-4 text-zinc-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-extrabold tracking-tight text-white">Chiang Mai 3D</span>
              <span className="text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                Poll & Map
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block m-0 mt-0.5">
              แผนที่สามมิติและระบบโหวตสถานที่
            </p>
          </div>
        </div>
      </div>

      {/* Center: View Switcher (Map vs Results) */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-md pointer-events-auto">
        <button
          onClick={() => setCurrentView('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            currentView === 'map'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>แผนที่ 3D</span>
        </button>

        <button
          onClick={() => setCurrentView('results')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            currentView === 'results'
              ? 'bg-amber-500 text-zinc-950 shadow-sm font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>ผลคะแนนโหวต</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            currentView === 'results' ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-800 text-zinc-300'
          }`}>
            {votes.length}
          </span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* QR Code Trigger Button */}
        <button
          onClick={() => toggleQrModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 shadow-lg backdrop-blur-md text-xs font-semibold transition active:scale-95"
          title="สแกน QR Code เพื่อโหวตผ่านมือถือ"
        >
          <QrCode className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">สแกน QR โหวต</span>
        </button>

        {/* Zone Selector (Only in Map View on larger screens) */}
        {currentView === 'map' && (
          <div className="hidden xl:block relative">
            <select
              value={selectedZoneId || 'all'}
              onChange={(e) => selectZone(e.target.value === 'all' ? null : e.target.value)}
              className="appearance-none bg-zinc-950/90 hover:bg-zinc-900 text-zinc-200 text-xs font-medium pl-3 pr-7 py-1.5 rounded-xl border border-zinc-800 shadow-lg backdrop-blur-md cursor-pointer transition focus:outline-none"
            >
              <option value="all">เลือกโซน (16 โซน)</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name_th} ({z.name_en})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* 2D / 3D Toggle (Only in Map View) */}
        {currentView === 'map' && (
          <button
            onClick={toggle3D}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 text-xs font-bold text-zinc-200 border border-zinc-800 shadow-lg backdrop-blur-md transition active:scale-95"
            title="สลับ 2D / 3D"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${is3D ? 'bg-amber-400' : 'bg-zinc-600'}`} />
            <span>{is3D ? '3D' : '2D'}</span>
          </button>
        )}

        {/* Add Place */}
        <button
          onClick={() => toggleAddPlace(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 text-xs font-medium text-zinc-200 border border-zinc-800 shadow-lg backdrop-blur-md transition active:scale-95"
          title="เพิ่มสถานที่"
        >
          <PlusCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">เพิ่มหมุด</span>
        </button>
      </div>
    </header>
  );
};
