// Map looks, all from OpenFreeMap (free, no key):
//  - "soft":     OpenFreeMap Liberty recoloured in warm scrapbook tones
//  - "standard": OpenFreeMap Liberty as-is
//  - night mode: OpenFreeMap Dark
const BASE = 'https://tiles.openfreemap.org/styles/';

// [layer id pattern, paint changes]. First match wins.
const SOFT = [
  [/^background$/, { 'background-color': '#f3ecdf' }],
  [/^water$/, { 'fill-color': '#bcd5d4' }],
  [/^waterway/, { 'line-color': '#a9c8c7' }],
  [/^water_name|^waterway_line_label/, { 'text-color': '#55787a', 'text-halo-color': 'rgba(243,236,223,.8)' }],
  [/^park$/, { 'fill-color': '#d7e1c1', 'fill-outline-color': 'rgba(0,0,0,0)' }],
  [/^park_outline$/, { 'line-color': 'rgba(0,0,0,0)' }],
  [/^landcover_wood$/, { 'fill-color': 'hsla(80,28%,68%,0.55)' }],
  [/^landcover_grass$/, { 'fill-color': '#d6e0c0' }],
  [/^landcover_sand$/, { 'fill-color': '#f1e6c8' }],
  [/^landuse_residential$/, { 'fill-color': 'rgba(236,224,204,0.55)' }],
  [/^landuse_/, { 'fill-color': '#e9e2cd' }],
  [/^aeroway_fill$/, { 'fill-color': '#e7dfcf' }],
  [/^building/, { 'fill-color': '#e2d6c2', 'fill-extrusion-color': '#e2d6c2', 'fill-outline-color': '#d6c8b0' }],
  [/motorway.*casing|trunk_primary_casing|secondary_tertiary_casing|link_casing/, { 'line-color': '#d8b48c' }],
  [/casing/, { 'line-color': '#dccfb9' }],
  [/motorway/, { 'line-color': '#efc596' }],
  [/trunk_primary|secondary_tertiary|_link$/, { 'line-color': '#f6e2bd' }],
  [/minor|service_track|street|path_pedestrian/, { 'line-color': '#fbf6ec' }],
  [/rail/, { 'line-color': '#c9bca6' }],
  [/^boundary/, { 'line-color': '#b9ab95' }],
];

function recolour(style) {
  for (const layer of style.layers) {
    if (layer.type === 'symbol') {
      const p = (layer.paint ||= {});
      if (p['text-color'] && !/^water/.test(layer.id)) p['text-color'] = /label_(city|country|town|village)/.test(layer.id) ? '#3d362e' : '#6f6455';
      if (p['text-halo-color'] && !/^water/.test(layer.id)) p['text-halo-color'] = 'rgba(246,239,227,.9)';
      continue;
    }
    const rule = SOFT.find(([re]) => re.test(layer.id));
    if (!rule) continue;
    const p = (layer.paint ||= {});
    for (const [k, v] of Object.entries(rule[1])) {
      // Only set paint keys that belong to this layer type (e.g. line-* on line layers).
      const ok = layer.type === 'fill-extrusion'
        ? k.startsWith('fill-extrusion-')
        : k.startsWith(layer.type + '-') && !k.startsWith('fill-extrusion-');
      if (ok) p[k] = v;
    }
  }
  return style;
}

let softCache;
// Returns a style URL or style object for MapLibre.
export async function mapStyle(look, theme) {
  if (theme === 'dark') return BASE + 'dark';
  if (look === 'standard') return BASE + 'liberty';
  softCache ||= fetch(BASE + 'liberty').then((r) => r.json()).then(recolour).catch(() => null);
  return (await softCache) || BASE + 'liberty';
}
