import React, { useEffect, useRef } from 'react';
import { Map, Marker, AttributionControl, setWorkerUrl } from 'maplibre-gl';
import type { FeatureCollection, Feature } from 'geojson';
import { useAppStore } from '../store/useAppStore';
import { 
  Compass, 
  Layers, 
  Minus, 
  Plus, 
  RotateCcw
} from 'lucide-react';

// Configure Web Worker path so Vite dev server and production bundles serve it cleanly
try {
  setWorkerUrl('/maplibre-gl-worker.mjs');
} catch (err) {
  console.warn('Could not configure MapLibre worker URL:', err);
}

const MAP_STYLE = import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';

// Chiang Mai city center
const CHIANG_MAI_CENTER: [number, number] = [98.9860, 18.7890];
const DEFAULT_ZOOM = 12.3;
const DEFAULT_PITCH = 48;
const DEFAULT_BEARING = -15;

export const MapContainer: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<{ [placeId: string]: Marker }>({});

  const {
    zones,
    places,
    votes,
    selectedZoneId,
    hoveredZoneId,
    selectedPlaceId,
    is3D,
    showZones,
    setMapInstance,
    selectZone,
    setHoveredZone,
    selectPlace,
    toggle3D,
    toggleZones,
    resetCamera,
    getLeaderboard
  } = useAppStore();

  const leaderboard = getLeaderboard();
  const topPlaceId = leaderboard.length > 0 && leaderboard[0].votes_count > 0 ? leaderboard[0].place.id : null;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let map: Map;
    try {
      map = new Map({
        container: mapContainerRef.current,
        style: MAP_STYLE,
        center: CHIANG_MAI_CENTER,
        zoom: DEFAULT_ZOOM,
        pitch: DEFAULT_PITCH,
        bearing: DEFAULT_BEARING,
        maxPitch: 75,
        minZoom: 9,
        maxZoom: 19,
        attributionControl: false
      });
    } catch (err) {
      console.error('Failed to create MapLibre instance:', err);
      return;
    }

    // Custom attribution
    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: '© OpenStreetMap contributors, OpenFreeMap, Chiang Mai 3D'
      }),
      'bottom-right'
    );

    map.on('error', (e) => {
      console.warn('MapLibre event warning:', e);
    });

    map.on('load', () => {
      mapRef.current = map;
      setMapInstance(map);
      map.resize();

      // 1. Add 3D building extrusions layer
      try {
        if (!map.getLayer('3d-buildings') && map.getSource('openmaptiles')) {
          const layers = map.getStyle().layers;
          let labelLayerId: string | undefined;
          if (layers) {
            for (let i = 0; i < layers.length; i++) {
              if (layers[i].type === 'symbol' && (layers[i].layout as any)?.['text-field']) {
                labelLayerId = layers[i].id;
                break;
              }
            }
          }

          map.addLayer(
            {
              id: '3d-buildings',
              source: 'openmaptiles',
              'source-layer': 'building',
              type: 'fill-extrusion',
              minzoom: 13,
              paint: {
                'fill-extrusion-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'render_height'],
                  0, '#e2e8f0',
                  20, '#cbd5e1',
                  50, '#94a3b8'
                ],
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  13, 0,
                  14.5, ['coalesce', ['get', 'render_height'], ['get', 'height'], 8]
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  13, 0,
                  14.5, ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0]
                ],
                'fill-extrusion-opacity': 0.8
              }
            },
            labelLayerId
          );
        }
      } catch (err) {
        console.warn('Could not add 3D buildings extrusion layer:', err);
      }

      // 2. Add GeoJSON source for zones
      try {
        if (!map.getSource('chiangmai-zones')) {
          const zonesFeatureCollection: FeatureCollection = {
            type: 'FeatureCollection',
            features: zones.map((z, idx) => ({
              type: 'Feature',
              id: idx,
              properties: {
                id: z.id,
                name_th: z.name_th,
                name_en: z.name_en,
                zone_type: z.zone_type,
                color: z.color,
                is_approximate: z.is_approximate
              },
              geometry: z.boundary_geojson
            } as Feature))
          };

          map.addSource('chiangmai-zones', {
            type: 'geojson',
            data: zonesFeatureCollection,
            generateId: true
          });

          // Zone fill layer
          map.addLayer({
            id: 'chiangmai-zones-fill',
            type: 'fill',
            source: 'chiangmai-zones',
            paint: {
              'fill-color': ['get', 'color'],
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'selected'], false], 0.35,
                ['boolean', ['feature-state', 'hover'], false], 0.28,
                0.12
              ]
            }
          });

          // Zone border line layer
          map.addLayer({
            id: 'chiangmai-zones-line',
            type: 'line',
            source: 'chiangmai-zones',
            paint: {
              'line-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false], '#ffffff',
                ['boolean', ['feature-state', 'hover'], false], '#f59e0b',
                ['get', 'color']
              ],
              'line-width': [
                'case',
                ['boolean', ['feature-state', 'selected'], false], 3,
                ['boolean', ['feature-state', 'hover'], false], 2.5,
                1.5
              ],
              'line-opacity': 0.85
            }
          });

          // Zone symbol labels
          map.addLayer({
            id: 'chiangmai-zones-labels',
            type: 'symbol',
            source: 'chiangmai-zones',
            layout: {
              'text-field': ['get', 'name_th'],
              'text-font': ['Noto Sans Regular', 'Open Sans Regular'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 11,
                14, 15
              ],
              'text-anchor': 'center',
              'text-allow-overlap': false
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#09090b',
              'text-halo-width': 2.5,
              'text-halo-blur': 1
            }
          });

          // Zone Hover & Click interactions
          let hoveredFeatureId: string | number | null = null;

          map.on('mousemove', 'chiangmai-zones-fill', (e: any) => {
            if (e.features && e.features.length > 0) {
              map.getCanvas().style.cursor = 'pointer';
              const feature = e.features[0];
              if (hoveredFeatureId !== null) {
                map.setFeatureState({ source: 'chiangmai-zones', id: hoveredFeatureId }, { hover: false });
              }
              hoveredFeatureId = feature.id as number;
              map.setFeatureState({ source: 'chiangmai-zones', id: hoveredFeatureId }, { hover: true });
              setHoveredZone(feature.properties?.id);
            }
          });

          map.on('mouseleave', 'chiangmai-zones-fill', () => {
            map.getCanvas().style.cursor = '';
            if (hoveredFeatureId !== null) {
              map.setFeatureState({ source: 'chiangmai-zones', id: hoveredFeatureId }, { hover: false });
              hoveredFeatureId = null;
            }
            setHoveredZone(null);
          });

          map.on('click', 'chiangmai-zones-fill', (e: any) => {
            if (e.features && e.features.length > 0) {
              const zoneId = e.features[0].properties?.id;
              selectZone(zoneId);
            }
          });
        }
      } catch (err) {
        console.warn('Could not add zone layers:', err);
      }
    });

    const resizeTimer = setTimeout(() => {
      map.resize();
    }, 250);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update selected & hovered zone feature state
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource('chiangmai-zones')) return;

    zones.forEach((z, idx) => {
      const isSelected = z.id === selectedZoneId;
      const isHovered = z.id === hoveredZoneId;
      try {
        map.setFeatureState(
          { source: 'chiangmai-zones', id: idx },
          { selected: isSelected, hover: isHovered }
        );
      } catch (e) {
        // Safe check
      }
    });
  }, [selectedZoneId, hoveredZoneId, zones]);

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Filter places if a zone is selected
    const activePlaces = selectedZoneId
      ? places.filter(p => p.zone_id === selectedZoneId)
      : places;

    // Remove obsolete markers
    const currentPlaceIds = new Set(activePlaces.map(p => p.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!currentPlaceIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Create / Update markers
    activePlaces.forEach(place => {
      const isSelected = place.id === selectedPlaceId;
      const isTopLeader = place.id === topPlaceId;
      const placeVotes = votes.filter(v => v.place_id === place.id).length;

      // Category icon helper
      const getCategoryIconSvg = (cat: string) => {
        if (cat.includes('หมูกระทะ') || cat.includes('อาหาร')) {
          return `<svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.9 6.3-6.3"/></svg>`;
        }
        if (cat.includes('วัด') || cat.includes('โบราณสถาน')) {
          return `<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`;
        }
        if (cat.includes('คาเฟ่') || cat.includes('ศิลปะ')) {
          return `<svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
        }
        return `<svg class="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
      };

      if (!markersRef.current[place.id]) {
        // Build marker DOM element
        const el = document.createElement('div');
        el.className = `custom-marker-wrapper relative group`;
        
        el.innerHTML = `
          <div class="marker-container flex flex-col items-center cursor-pointer">
            <!-- Tooltip popup on hover -->
            <div class="opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none absolute -top-10 bg-zinc-900/95 text-white text-xs px-2.5 py-1 rounded-md shadow-xl border border-zinc-700 whitespace-nowrap z-50 flex items-center gap-1.5">
              <span class="font-medium">${place.name}</span>
              <span class="bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded text-[10px] font-semibold">${placeVotes} โหวต</span>
            </div>

            <!-- Pin Head -->
            <div class="relative flex items-center justify-center">
              <div class="pin-badge ${isTopLeader ? 'bg-amber-500 text-zinc-950 ring-2 ring-amber-300' : isSelected ? 'bg-white text-zinc-950 ring-2 ring-amber-500' : 'bg-zinc-900/90 text-white border border-zinc-700'} p-2 rounded-xl shadow-2xl flex items-center gap-1.5 backdrop-blur-md transition-all duration-200">
                ${getCategoryIconSvg(place.category)}
                <span class="text-xs font-bold leading-none">${placeVotes}</span>
              </div>
              ${isTopLeader ? `<div class="absolute -top-2 -right-2 bg-amber-400 text-zinc-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow border border-white">#1</div>` : ''}
              ${isSelected ? `<div class="absolute inset-0 rounded-xl marker-pulse pointer-events-none"></div>` : ''}
            </div>

            <!-- Pin Tail -->
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isTopLeader ? 'border-t-amber-500' : isSelected ? 'border-t-white' : 'border-t-zinc-900/90'} -mt-[1px]"></div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectPlace(place.id);
        });

        const marker = new Marker({ element: el })
          .setLngLat([place.longitude, place.latitude])
          .addTo(map);

        markersRef.current[place.id] = marker;
      } else {
        // Update DOM classes for existing marker
        const el = markersRef.current[place.id].getElement();
        const pinBadge = el.querySelector('.pin-badge');
        const countSpan = el.querySelector('.pin-badge span');
        const tooltipCount = el.querySelector('.group-hover\\:opacity-100 span:last-child');

        if (countSpan) countSpan.textContent = String(placeVotes);
        if (tooltipCount) tooltipCount.textContent = `${placeVotes} โหวต`;

        if (pinBadge) {
          if (isTopLeader) {
            pinBadge.className = 'pin-badge bg-amber-500 text-zinc-950 ring-2 ring-amber-300 p-2 rounded-xl shadow-2xl flex items-center gap-1.5 backdrop-blur-md transition-all duration-200';
          } else if (isSelected) {
            pinBadge.className = 'pin-badge bg-white text-zinc-950 ring-2 ring-amber-500 p-2 rounded-xl shadow-2xl flex items-center gap-1.5 backdrop-blur-md transition-all duration-200';
          } else {
            pinBadge.className = 'pin-badge bg-zinc-900/90 text-white border border-zinc-700 p-2 rounded-xl shadow-2xl flex items-center gap-1.5 backdrop-blur-md transition-all duration-200';
          }
        }
      }
    });
  }, [places, votes, selectedZoneId, selectedPlaceId, topPlaceId]);

  // Floating Controls Handlers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetCompass = () => mapRef.current?.resetNorthPitch({ duration: 800 });

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      {/* MapLibre DOM Node */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full absolute inset-0" 
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating Map Controls (Right Side) */}
      <div className="absolute right-4 top-20 flex flex-col gap-2 z-20">
        {/* 2D / 3D Toggle Button */}
        <button
          onClick={toggle3D}
          title={is3D ? 'สลับเป็นโหมด 2D (Switch to 2D)' : 'สลับเป็นโหมด 3D (Switch to 3D)'}
          className={`flex items-center justify-center w-11 h-11 rounded-xl shadow-xl backdrop-blur-md border transition-all active:scale-95 ${
            is3D 
              ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold' 
              : 'bg-zinc-900/85 text-zinc-200 border-zinc-700/60 hover:bg-zinc-800'
          }`}
        >
          <span className="text-xs font-black tracking-tight">{is3D ? '3D' : '2D'}</span>
        </button>

        {/* Show/Hide Zones Toggle */}
        <button
          onClick={toggleZones}
          title={showZones ? 'ซ่อนขอบเขตโซน (Hide Zones)' : 'แสดงขอบเขตโซน (Show Zones)'}
          className={`flex items-center justify-center w-11 h-11 rounded-xl shadow-xl backdrop-blur-md border transition-all active:scale-95 ${
            showZones
              ? 'bg-zinc-800/90 text-amber-400 border-zinc-600'
              : 'bg-zinc-900/80 text-zinc-500 border-zinc-800 hover:text-zinc-300'
          }`}
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Reset Camera Button */}
        <button
          onClick={resetCamera}
          title="รีเซ็ตมุมมองเชียงใหม่ (Reset Camera Overview)"
          className="flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900/85 text-zinc-200 border border-zinc-700/60 hover:bg-zinc-800 hover:text-white shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col rounded-xl bg-zinc-900/85 border border-zinc-700/60 shadow-xl backdrop-blur-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="ซูมเข้า (Zoom In)"
            className="flex items-center justify-center w-11 h-10 text-zinc-200 hover:bg-zinc-800 hover:text-white transition border-b border-zinc-800 active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="ซูมออก (Zoom Out)"
            className="flex items-center justify-center w-11 h-10 text-zinc-200 hover:bg-zinc-800 hover:text-white transition active:scale-95"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Reset Compass */}
        <button
          onClick={handleResetCompass}
          title="หมุนกลับทิศเหนือ (Reset North)"
          className="flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900/85 text-zinc-200 border border-zinc-700/60 hover:bg-zinc-800 hover:text-white shadow-xl backdrop-blur-md transition-all active:scale-95"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Zone Pill (Bottom Center) */}
      {selectedZoneId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-950/90 border border-zinc-700/80 shadow-2xl backdrop-blur-md text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-zinc-400">กำลังดูโซน:</span>
          <span className="font-semibold text-white">
            {zones.find(z => z.id === selectedZoneId)?.name_th} ({zones.find(z => z.id === selectedZoneId)?.name_en})
          </span>
          <button
            onClick={() => selectZone(null)}
            className="ml-2 text-xs text-amber-400 hover:text-amber-300 underline font-medium"
          >
            ดูทุกโซน
          </button>
        </div>
      )}
    </div>
  );
};
