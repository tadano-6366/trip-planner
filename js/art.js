// Default cover: a soft illustrated Penang sunset — hill pagoda, jetty stilt houses,
// palm and bridge (used until a cover photo is added).
// Key scenery sits in the middle (x≈380–820, y≈200–560) so it survives the
// narrow crop on phones; the sides add extra detail on wide screens.
export function defaultCover() {
  return `<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrated Penang sunset">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8f8fd2"/><stop offset=".35" stop-color="#e4a2b9"/><stop offset=".55" stop-color="#f7c39f"/><stop offset=".62" stop-color="#fbe2c2"/>
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f0c2aa"/><stop offset=".35" stop-color="#b3acd2"/><stop offset="1" stop-color="#8790c2"/>
    </linearGradient>
    <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7a6fa8"/><stop offset="1" stop-color="#5a5a8e"/>
    </linearGradient>
    <radialGradient id="sun" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#fff4dc"/><stop offset=".55" stop-color="#ffd9a8"/><stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="rough"><feTurbulence baseFrequency=".03" numOctaves="3" seed="7"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
  </defs>
  <rect width="1200" height="800" fill="url(#sky)"/>
  <circle cx="690" cy="370" r="140" fill="url(#sun)"/>
  <circle cx="690" cy="378" r="52" fill="#fff0d6"/>
  <g fill="#b9a5da" opacity=".55" filter="url(#soft)">
    <ellipse cx="300" cy="130" rx="230" ry="24"/><ellipse cx="880" cy="110" rx="260" ry="22"/><ellipse cx="620" cy="200" rx="160" ry="15"/>
  </g>
  <g fill="#f9b6ac" opacity=".6" filter="url(#soft)">
    <ellipse cx="500" cy="270" rx="200" ry="18"/><ellipse cx="980" cy="250" rx="170" ry="16"/>
  </g>

  <!-- distant bridge (right) -->
  <g stroke="#7b77ab" fill="none" opacity=".75">
    <path d="M760 445 Q980 425 1220 438" stroke-width="3"/>
    <path d="M930 440 V385 M990 437 V385 M930 390 L895 440 M930 390 L965 438 M990 390 L1025 436 M990 390 L955 438" stroke-width="2.5"/>
  </g>

  <!-- hill with Kek Lok Si-style pagoda -->
  <g filter="url(#rough)">
    <path d="M-40 455 Q120 330 280 300 Q400 270 500 330 Q580 380 640 455 Z" fill="url(#hill)"/>
  </g>
  <g fill="#4b4878" transform="translate(455 192)">
    <rect x="-14" y="20" width="28" height="86"/>
    <path d="M-30 106 h60 l-6 -9 h-48 Z M-26 88 h52 l-6 -9 h-40 Z M-23 70 h46 l-5 -9 h-36 Z M-20 52 h40 l-5 -9 h-30 Z M-17 34 h34 l-4 -9 h-26 Z M-14 20 h28 l-14 -26 Z"/>
    <rect x="-40" y="104" width="80" height="9"/>
  </g>

  <rect y="452" width="1200" height="348" fill="url(#sea)"/>
  <g fill="#fff3dc" opacity=".8">
    <rect x="630" y="470" width="120" height="4" rx="2"/><rect x="610" y="494" width="160" height="4" rx="2"/><rect x="650" y="522" width="90" height="4" rx="2"/>
  </g>

  <!-- jetty: walkway + stilt houses -->
  <g fill="#3f3d6b">
    <rect x="420" y="540" width="800" height="9"/>
    <path d="M440 540 v-48 l40 -28 l40 28 v48 Z"/>
    <path d="M770 540 v-58 l48 -34 l48 34 v58 Z"/>
    <path d="M880 540 v-44 l36 -26 l36 26 v44 Z"/>
    <path d="M980 540 v-62 l50 -36 l50 36 v62 Z"/>
    <path d="M1100 540 v-46 l38 -27 l38 27 v46 Z"/>
    <path d="M-10 560 v-40 l34 -24 l34 24 v40 Z M80 560 v-50 l40 -28 l40 28 v50 Z"/>
    <rect x="-10" y="558" width="200" height="8"/>
  </g>
  <g stroke="#3f3d6b" stroke-width="4">
    <path d="M450 548 v50 M480 548 v50 M510 548 v50 M560 548 v46 M620 548 v46 M680 548 v46 M740 548 v46 M780 548 v52 M818 548 v52 M856 548 v52 M900 548 v48 M940 548 v48 M990 548 v54 M1030 548 v54 M1070 548 v54 M1110 548 v48 M1160 548 v48 M0 566 v40 M40 566 v40 M90 566 v40 M140 566 v40"/>
  </g>
  <g fill="#ffd79a">
    <rect x="474" y="502" width="11" height="14" rx="2"/><rect x="810" y="494" width="11" height="15" rx="2"/>
    <rect x="1020" y="490" width="11" height="15" rx="2"/><rect x="1040" y="490" width="11" height="15" rx="2"/><rect x="910" y="504" width="10" height="13" rx="2"/>
  </g>
  <g fill="#3f3d6b" opacity=".18">
    <rect x="420" y="604" width="780" height="5"/><rect x="0" y="612" width="190" height="5"/>
  </g>

  <!-- palm -->
  <g fill="none" stroke="#2f2d55" stroke-linecap="round">
    <path d="M745 545 Q735 440 700 380" stroke-width="9"/>
    <g stroke-width="6">
      <path d="M700 380 q-55 -15 -100 20"/><path d="M700 380 q-30 -45 -85 -52"/><path d="M700 380 q18 -55 75 -62"/>
      <path d="M700 380 q55 -8 92 28"/><path d="M700 380 q8 30 -10 72"/>
    </g>
  </g>

  <!-- birds -->
  <g fill="none" stroke="#4a4f78" stroke-width="3" stroke-linecap="round" opacity=".7">
    <path d="M540 230 q10 -10 20 0 q10 -10 20 0"/><path d="M590 258 q7 -7 14 0 q7 -7 14 0"/><path d="M820 220 q8 -8 16 0 q8 -8 16 0"/>
  </g>
</svg>`;
}
