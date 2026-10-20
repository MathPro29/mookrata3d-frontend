import fs from 'fs';

async function fetchFromNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&polygon_geojson=1&limit=1`;
  console.log('Fetching:', query);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ChiangMai3DMap/1.0 (contact: student@internship.local)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data && data.length > 0 && data[0].geojson) {
    return {
      name: data[0].name,
      display_name: data[0].display_name,
      osm_id: data[0].osm_id,
      geojson: data[0].geojson,
      boundingbox: data[0].boundingbox,
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  }
  return null;
}

async function run() {
  const test1 = await fetchFromNominatim('ตำบลช้างเผือก อำเภอเมืองเชียงใหม่');
  console.log('Chang Phueak:', test1 ? 'Found ' + test1.geojson.type : 'Not found');
  await new Promise(r => setTimeout(r, 1200));
  const test2 = await fetchFromNominatim('ตำบลสุเทพ อำเภอเมืองเชียงใหม่');
  console.log('Suthep:', test2 ? 'Found ' + test2.geojson.type : 'Not found');
}

run().catch(console.error);
