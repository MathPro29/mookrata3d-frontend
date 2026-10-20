import * as allExports from 'maplibre-gl';

console.log('allExports keys count:', Object.keys(allExports).length);
console.log('Map in allExports:', typeof allExports.Map);
console.log('Marker in allExports:', typeof allExports.Marker);
console.log('AttributionControl in allExports:', typeof allExports.AttributionControl);
console.log('Sample keys:', Object.keys(allExports).slice(0, 15));
