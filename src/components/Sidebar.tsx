import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Search, 
  ChevronRight, 
  ChevronLeft,
  X, 
  CheckCircle2, 
  Globe2,
  Eye,
  EyeOff
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    zones,
    hiddenZoneIds,
    places,
    selectedZoneId,
    hoveredZoneId,
    selectedPlaceId,
    searchQuery,
    selectedCategory,
    isSidebarOpen,
    selectZone,
    setHoveredZone,
    selectPlace,
    setSearchQuery,
    setSelectedCategory,
    toggleSidebar,
    toggleZoneVisibility,
    getFilteredPlaces,
    getZoneStats
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'zones' | 'places'>('zones');

  const filteredPlaces = getFilteredPlaces();
  const currentZone = zones.find(z => z.id === selectedZoneId);

  const categories = [
    { id: 'all', label: 'ร้านหมูกระทะทั้งหมด' },
    { id: 'ร้านอาหาร & หมูกระทะ', label: 'หมูกระทะ' }
  ];

  return (
    <>
      {/* Desktop sidebar toggle remains visible when the panel is collapsed */}
      <button
        onClick={() => toggleSidebar()}
        aria-expanded={isSidebarOpen}
        title={isSidebarOpen ? 'ซ่อนแถบโซนและสถานที่' : 'แสดงแถบโซนและสถานที่'}
        className={`hidden lg:flex fixed top-20 z-40 items-center justify-center w-9 h-10 rounded-r-xl bg-zinc-950/95 text-zinc-200 border border-l-0 border-zinc-700 shadow-xl backdrop-blur-md hover:bg-zinc-800 transition-all duration-300 ${isSidebarOpen ? 'left-[calc(1rem+22rem)] sm:left-[calc(1.5rem+24rem)]' : 'left-0'}`}
      >
        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => toggleSidebar(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:absolute top-18 bottom-4 left-4 w-88 sm:w-96 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl z-30 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'
        }`}
      >
        {/* Header / Tabs */}
        <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 w-full mr-2">
            <button
              onClick={() => setActiveTab('zones')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'zones'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              โซนเชียงใหม่ ({zones.length})
            </button>
            <button
              onClick={() => setActiveTab('places')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'places'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ร้านหมูกระทะ ({places.length})
            </button>
          </div>

          <button
            onClick={() => toggleSidebar(false)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-3 border-b border-zinc-800/70 space-y-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาโซน ย่าน หรือสถานที่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 text-zinc-200 text-xs pl-9 pr-8 py-2 rounded-xl border border-zinc-700/60 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips (Only on Places tab) */}
          {activeTab === 'places' && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition font-medium ${
                    selectedCategory === c.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Zone Banner (If any) */}
        {selectedZoneId && currentZone && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentZone.color }}></span>
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  {currentZone.name_th} ({currentZone.name_en})
                </div>
                <div className="text-[10px] text-amber-300/80 flex items-center gap-1">
                  <span>{currentZone.zone_type}</span>
                  <span>•</span>
                  <span>{currentZone.is_approximate ? 'ขอบเขตโดยประมาณ' : 'ขอบเขตทางการ (OSM)'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => selectZone(null)}
              className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md border border-zinc-700 transition"
            >
              ดูทุกโซน
            </button>
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 p-2 space-y-1">
          {activeTab === 'zones' ? (
            // ZONES LIST
            zones
              .filter(z => !hiddenZoneIds.includes(z.id))
              .filter(z => 
                !searchQuery || 
                z.name_th.toLowerCase().includes(searchQuery.toLowerCase()) || 
                z.name_en.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(zone => {
                const isSelected = zone.id === selectedZoneId;
                const isHovered = zone.id === hoveredZoneId;
                const stats = getZoneStats(zone.id);

                return (
                  <div
                    key={zone.id}
                    onMouseEnter={() => setHoveredZone(zone.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                    className={`group p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/40 text-white'
                        : isHovered
                        ? 'bg-zinc-900/90 text-zinc-100'
                        : 'hover:bg-zinc-900/50 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/40 shadow-sm"
                        style={{ backgroundColor: zone.color }}
                      />
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-1.5">
                          <span>{zone.name_th}</span>
                          <span className="text-[11px] text-zinc-400 font-normal">({zone.name_en})</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                            {zone.zone_type}
                          </span>
                          <span>{stats.placesCount} ร้าน</span>
                          <span>•</span>
                          <span className="text-amber-400/90 font-medium">{stats.votesCount} โหวต</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => selectZone(isSelected ? null : zone.id)}
                        title="เลือกโซน"
                        className="p-1.5 rounded-lg hover:bg-zinc-800"
                      >
                        <ChevronRight className={`w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition ${isSelected ? 'rotate-90 text-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => toggleZoneVisibility(zone.id)}
                        title="ซ่อนโซนนี้"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-300 hover:bg-zinc-800"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
          ) : (
            // PLACES LIST
            filteredPlaces.length > 0 ? (
              filteredPlaces.map(place => {
                const isSelected = place.id === selectedPlaceId;
                const zone = zones.find(z => z.id === place.zone_id);

                return (
                  <div
                    key={place.id}
                    onClick={() => selectPlace(place.id)}
                    className={`group p-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/40 text-white'
                        : 'hover:bg-zinc-900/60 text-zinc-300'
                    }`}
                  >
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{place.name}</span>
                        {place.verification_status === 'verified' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">{place.category}</div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <span className="text-amber-400 font-semibold">{zone?.name_th}</span>
                        <span>•</span>
                        <span className="truncate">{place.address}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs">
                ไม่พบสถานที่ในหมวดหมู่หรือคำค้นหานี้
              </div>
            )
          )}

          {activeTab === 'zones' && hiddenZoneIds.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="px-2 text-[11px] text-zinc-500 mb-1">โซนที่ซ่อน ({hiddenZoneIds.length})</p>
              {zones.filter(zone => hiddenZoneIds.includes(zone.id)).map(zone => (
                <button
                  key={zone.id}
                  onClick={() => toggleZoneVisibility(zone.id)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  <span>{zone.name_th}</span>
                  <span className="flex items-center gap-1 text-[10px]"><Eye className="w-3.5 h-3.5" /> แสดง</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Geographical Source Info */}
        <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-900/40 text-[10px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Globe2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            <span className="truncate">ข้อมูลขอบเขต: OpenStreetMap & ผังเมืองเชียงใหม่</span>
          </div>
          <span className="text-zinc-400 font-mono">16 โซน</span>
        </div>
      </aside>
    </>
  );
};
