import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Place } from '../types';

const promotionPlaceIds = new Set([
  'place-jinbe-shabu-sushi-buffet',
  'place-moo-ood-old-city',
  'place-yukata-shabu-chang-phueak',
]);

const getPlaceMapsUrl = (place: Pick<Place, 'google_maps_url' | 'name' | 'address'>) => {
  try {
    const url = new URL(place.google_maps_url);
    const query = url.searchParams.get('q') ?? '';
    if (/^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(query)) {
      const search = new URL('https://www.google.com/maps/search/');
      search.searchParams.set('api', '1');
      search.searchParams.set('query', `${place.name} ${place.address}`.trim());
      return search.toString();
    }
  } catch {
    // Keep the stored Maps link if it is not a valid URL.
  }
  return place.google_maps_url;
};

export const PlaceDetailPanel: React.FC = () => {
  const { places, selectedPlaceId, selectPlace } = useAppStore();
  if (!selectedPlaceId) return null;

  const place = places.find(item => item.id === selectedPlaceId);
  if (!place) return null;

  return (
    <div className="fixed lg:absolute bottom-0 right-0 left-0 lg:left-auto lg:top-18 lg:bottom-4 lg:right-4 w-full lg:w-[420px] max-h-[min(75dvh,640px)] lg:max-h-none rounded-t-3xl lg:rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 lg:slide-in-from-right-6 duration-300">
      <div className="relative h-40 sm:h-48 w-full flex-shrink-0 overflow-hidden bg-zinc-900">
        <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        <button
          onClick={() => selectPlace(null)}
          aria-label="ปิดรายละเอียดร้าน"
          className="absolute top-3 right-3 p-2 rounded-full bg-zinc-950/70 hover:bg-zinc-950 text-zinc-300 hover:text-white backdrop-blur-md border border-zinc-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="absolute bottom-3 left-4 right-14 m-0 text-xl font-extrabold text-white leading-tight drop-shadow-lg">
          {place.name}
        </h2>
      </div>

      <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5 space-y-3 overflow-y-auto">
        <div className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3">
          <span className="text-sm font-semibold text-zinc-300">ราคา</span>
          <span className="text-sm font-bold text-amber-300">{place.price || 'ยังไม่ระบุ'}</span>
        </div>

        <a
          href={getPlaceMapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-sm font-semibold border border-zinc-700 px-4 py-3 transition"
        >
          <ExternalLink className="w-4 h-4 text-amber-400" />
          <span>เปิด Google Maps</span>
        </a>

        {place.review_url ? (
          <a
            href={place.review_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-sm font-semibold border border-zinc-700 px-4 py-3 transition"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>ดูรีวิวร้าน</span>
          </a>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900/60 text-zinc-500 text-sm font-semibold border border-zinc-800 px-4 py-3">
            <span>ยังไม่มีลิงก์รีวิวร้าน</span>
          </div>
        )}

        {promotionPlaceIds.has(place.id) && (
          <img
            src={`${import.meta.env.BASE_URL}images/promotion-banner.jpg`}
            alt="ร้านนี้เข้าร่วมโครงการคนละครึ่งพลัส"
            loading="lazy"
            className="block h-auto w-full rounded-xl border border-zinc-800"
          />
        )}
      </div>
    </div>
  );
};
