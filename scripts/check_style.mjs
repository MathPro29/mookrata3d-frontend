async function test() {
  const res = await fetch('https://tiles.openfreemap.org/styles/liberty');
  const json = await res.json();
  console.log('Style sources:', Object.keys(json.sources));
  const buildingLayers = json.layers.filter(l => l.id.includes('building') || (l['source-layer'] && l['source-layer'].includes('building')));
  console.log('Building layers count:', buildingLayers.length);
  if (buildingLayers.length > 0) {
    console.log('First building layer:', JSON.stringify(buildingLayers[0], null, 2));
  }
}
test().catch(console.error);
