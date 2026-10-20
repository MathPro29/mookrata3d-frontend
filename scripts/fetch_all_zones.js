import fs from 'fs';
import path from 'path';

// Real administrative queries
const administrativeZones = [
  {
    id: 'zone-chang-phueak',
    name_th: 'ช้างเผือก',
    name_en: 'Chang Phueak',
    zone_type: 'Subdistrict',
    query: 'ตำบลช้างเผือก อำเภอเมืองเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 8'
  },
  {
    id: 'zone-chang-khlan',
    name_th: 'ช้างคลาน',
    name_en: 'Chang Khlan',
    zone_type: 'Subdistrict',
    query: 'ตำบลช้างคลาน อำเภอเมืองเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 8'
  },
  {
    id: 'zone-wat-ket',
    name_th: 'วัดเกต',
    name_en: 'Wat Ket',
    zone_type: 'Subdistrict',
    query: 'ตำบลวัดเกต อำเภอเมืองเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 8'
  },
  {
    id: 'zone-mae-hia',
    name_th: 'แม่เหียะ',
    name_en: 'Mae Hia',
    zone_type: 'Subdistrict',
    query: 'ตำบลแม่เหียะ อำเภอเมืองเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 8'
  },
  {
    id: 'zone-suthep',
    name_th: 'สุเทพ',
    name_en: 'Suthep',
    zone_type: 'Subdistrict',
    query: 'ตำบลสุเทพ อำเภอเมืองเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 8'
  },
  {
    id: 'zone-fa-ham',
    name_th: 'ฟ้าฮ่าม',
    name_en: 'Fa Ham',
    zone_type: 'Subdistrict',
    query: 'ตำบลฟ้าฮ่าม อำเภอเมืองเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 8'
  },
  {
    id: 'zone-san-sai',
    name_th: 'สันทราย',
    name_en: 'San Sai',
    zone_type: 'District',
    query: 'อำเภอสันทราย จังหวัดเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 6'
  },
  {
    id: 'zone-hang-dong',
    name_th: 'หางดง',
    name_en: 'Hang Dong',
    zone_type: 'District',
    query: 'อำเภอหางดง จังหวัดเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 6'
  },
  {
    id: 'zone-mae-rim',
    name_th: 'แม่ริม',
    name_en: 'Mae Rim',
    zone_type: 'District',
    query: 'อำเภอแม่ริม จังหวัดเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 6'
  },
  {
    id: 'zone-saraphi',
    name_th: 'สารภี',
    name_en: 'Saraphi',
    zone_type: 'District',
    query: 'อำเภอสารภี จังหวัดเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 6'
  },
  {
    id: 'zone-san-kamphaeng',
    name_th: 'สันกำแพง',
    name_en: 'San Kamphaeng',
    zone_type: 'District',
    query: 'อำเภอสันกำแพง จังหวัดเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 6'
  },
  {
    id: 'zone-doi-saket',
    name_th: 'ดอยสะเก็ด',
    name_en: 'Doi Saket',
    zone_type: 'District',
    query: 'อำเภอดอยสะเก็ด จังหวัดเชียงใหม่',
    is_approximate: false,
    boundary_source: 'Royal Thai Government / OpenStreetMap Administrative Boundary Level 6'
  }
];

// Real geographic polygons for specific historical and urban neighborhoods
const neighborhoodZones = [
  {
    id: 'zone-old-city',
    name_th: 'คูเมืองเชียงใหม่',
    name_en: 'Old City / Moat',
    zone_type: 'Historic District',
    is_approximate: false,
    boundary_source: 'Physical historic moat boundary (Moon Mueang, Arak, Manee Nopparat, Bumrung Buri Roads)',
    center: [98.9860, 18.7885],
    boundingbox: ['18.7812', '18.7962', '98.9780', '98.9938'],
    geojson: {
      type: 'Polygon',
      coordinates: [[
        [98.9780, 18.7962],
        [98.9858, 18.7960],
        [98.9936, 18.7958],
        [98.9938, 18.7886],
        [98.9935, 18.7812],
        [98.9858, 18.7814],
        [98.9782, 18.7817],
        [98.9780, 18.7890],
        [98.9780, 18.7962]
      ]]
    }
  },
  {
    id: 'zone-nimman',
    name_th: 'นิมมานเหมินท์',
    name_en: 'Nimman',
    zone_type: 'Neighborhood',
    is_approximate: true,
    boundary_source: 'Urban neighborhood bounded by Huay Kaew Rd (North), Suthep Rd (South), Canal Rd (West), Sirimangkalajarn/Canal (East)',
    center: [98.9680, 18.7960],
    boundingbox: ['18.7875', '18.8040', '98.9610', '98.9740'],
    geojson: {
      type: 'Polygon',
      coordinates: [[
        [98.9620, 18.8035],
        [98.9705, 18.8010],
        [98.9740, 18.7930],
        [98.9725, 18.7885],
        [98.9650, 18.7890],
        [98.9625, 18.7940],
        [98.9620, 18.8035]
      ]]
    }
  },
  {
    id: 'zone-santitham',
    name_th: 'สันติธรรม',
    name_en: 'Santitham',
    zone_type: 'Neighborhood',
    is_approximate: true,
    boundary_source: 'Urban neighborhood bounded by Superhighway (North), Hussadhisaewee / Old Moat (South), Chotana (East), Huay Kaew (West)',
    center: [98.9780, 18.8020],
    boundingbox: ['18.7965', '18.8090', '98.9720', '98.9850'],
    geojson: {
      type: 'Polygon',
      coordinates: [[
        [98.9725, 18.8020],
        [98.9770, 18.8090],
        [98.9840, 18.8070],
        [98.9835, 18.7975],
        [98.9778, 18.7970],
        [98.9725, 18.8020]
      ]]
    }
  },
  {
    id: 'zone-jed-yod',
    name_th: 'เจ็ดยอด',
    name_en: 'Jed Yod',
    zone_type: 'Neighborhood',
    is_approximate: true,
    boundary_source: 'Community perimeter around Wat Chet Yot, Superhighway, and Canal Rd',
    center: [98.9690, 18.8080],
    boundingbox: ['18.8020', '18.8150', '98.9620', '98.9760'],
    geojson: {
      type: 'Polygon',
      coordinates: [[
        [98.9630, 18.8070],
        [98.9660, 18.8145],
        [98.9745, 18.8120],
        [98.9730, 18.8030],
        [98.9670, 18.8035],
        [98.9630, 18.8070]
      ]]
    }
  }
];

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
      osm_id: data[0].osm_id,
      geojson: data[0].geojson,
      boundingbox: data[0].boundingbox,
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  }
  return null;
}

// Function to simplify coordinates if too huge for fast rendering
function simplifyPolygon(geojson, maxPoints = 300) {
  if (geojson.type === 'Polygon') {
    const coords = geojson.coordinates[0];
    if (coords.length <= maxPoints) return geojson;
    const step = Math.ceil(coords.length / maxPoints);
    const simplified = coords.filter((_, idx) => idx % step === 0 || idx === coords.length - 1);
    // ensure closed
    if (simplified[0][0] !== simplified[simplified.length - 1][0] || simplified[0][1] !== simplified[simplified.length - 1][1]) {
      simplified.push(simplified[0]);
    }
    return { type: 'Polygon', coordinates: [simplified] };
  } else if (geojson.type === 'MultiPolygon') {
    const simplifiedCoords = geojson.coordinates.map(polygon => {
      const ring = polygon[0];
      if (ring.length <= maxPoints) return polygon;
      const step = Math.ceil(ring.length / maxPoints);
      const simp = ring.filter((_, idx) => idx % step === 0 || idx === ring.length - 1);
      if (simp[0][0] !== simp[simp.length - 1][0] || simp[0][1] !== simp[simp.length - 1][1]) {
        simp.push(simp[0]);
      }
      return [simp];
    });
    return { type: 'MultiPolygon', coordinates: simplifiedCoords };
  }
  return geojson;
}

async function main() {
  const allZones = [];

  // Add neighborhood zones first
  for (const nz of neighborhoodZones) {
    allZones.push({
      ...nz,
      created_at: new Date().toISOString()
    });
  }

  // Fetch administrative zones
  for (const az of administrativeZones) {
    try {
      const res = await fetchFromNominatim(az.query);
      if (res) {
        allZones.push({
          id: az.id,
          name_th: az.name_th,
          name_en: az.name_en,
          zone_type: az.zone_type,
          is_approximate: az.is_approximate,
          boundary_source: az.boundary_source,
          center: [res.lon, res.lat],
          boundingbox: res.boundingbox,
          geojson: simplifyPolygon(res.geojson, 250),
          created_at: new Date().toISOString()
        });
        console.log(`✓ Fetched ${az.name_th} (${az.name_en})`);
      } else {
        console.warn(`✗ Not found: ${az.query}`);
      }
    } catch (err) {
      console.error(`Error fetching ${az.name_th}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 1200));
  }

  const outDir = path.resolve('src/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const jsonPath = path.join(outDir, 'zones.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allZones, null, 2), 'utf-8');
  console.log(`Saved ${allZones.length} zones to ${jsonPath}`);
}

main().catch(console.error);
