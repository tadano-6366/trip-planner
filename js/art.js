// Default cover: a soft illustrated dusk mountain scene (used until a cover photo is added).
export function defaultCover() {
  return `<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrated mountain at dusk">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8f93d8"/><stop offset=".45" stop-color="#d9a3c2"/><stop offset=".75" stop-color="#f4c6b4"/><stop offset="1" stop-color="#f7e3cf"/>
    </linearGradient>
    <linearGradient id="mt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5d6aa3"/><stop offset="1" stop-color="#3c4a78"/>
    </linearGradient>
    <linearGradient id="snow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cdd3ef"/>
    </linearGradient>
    <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a7a6d6"/><stop offset="1" stop-color="#e8cfd2"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="rough"><feTurbulence baseFrequency=".03" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="9"/></filter>
  </defs>
  <rect width="1200" height="800" fill="url(#sky)"/>
  <circle cx="860" cy="330" r="70" fill="#fff1da" opacity=".85" filter="url(#soft)"/>
  <g fill="#b7a6dc" opacity=".55" filter="url(#soft)">
    <ellipse cx="260" cy="150" rx="210" ry="26"/><ellipse cx="900" cy="120" rx="260" ry="22"/><ellipse cx="640" cy="230" rx="170" ry="16"/>
  </g>
  <g fill="#f7b7b3" opacity=".55" filter="url(#soft)">
    <ellipse cx="380" cy="260" rx="200" ry="20"/><ellipse cx="1010" cy="250" rx="180" ry="18"/>
  </g>
  <g filter="url(#rough)">
    <path d="M90 560 L540 215 Q600 180 660 215 L1120 560 Z" fill="url(#mt)"/>
    <path d="M455 282 L540 215 Q600 180 660 215 L748 282 L712 300 L688 278 L655 312 L622 280 L594 318 L566 284 L534 310 L506 286 L480 304 Z" fill="url(#snow)"/>
    <path d="M600 200 L585 330 M600 200 L625 340 M600 200 L560 300 M600 200 L650 300" stroke="#b9c0e4" stroke-width="3" opacity=".6"/>
  </g>
  <rect y="555" width="1200" height="245" fill="url(#lake)"/>
  <g opacity=".35" transform="translate(0 1110) scale(1 -1)" filter="url(#soft)">
    <path d="M90 560 L540 215 Q600 180 660 215 L1120 560 Z" fill="#5d6aa3"/>
  </g>
  <g fill="#fff" opacity=".5"><rect x="380" y="610" width="140" height="3" rx="2"/><rect x="640" y="640" width="200" height="3" rx="2"/><rect x="250" y="690" width="110" height="3" rx="2"/></g>
  <g fill="#34406a" filter="url(#rough)">
    <path d="M0 600 Q120 520 240 570 T470 590 L470 800 L0 800 Z"/>
    <path d="M760 600 Q880 530 1010 560 T1200 540 L1200 800 L760 800 Z"/>
  </g>
  <g fill="#283258">
    <path d="M70 600 l22 -70 l22 70 Z M120 610 l18 -55 l18 55 Z M1030 590 l24 -80 l24 80 Z M1090 600 l18 -60 l18 60 Z"/>
  </g>
  <g fill="none" stroke="#4a4f78" stroke-width="3" stroke-linecap="round" opacity=".7">
    <path d="M300 300 q10 -10 20 0 q10 -10 20 0"/><path d="M350 330 q7 -7 14 0 q7 -7 14 0"/><path d="M1000 300 q8 -8 16 0 q8 -8 16 0"/>
  </g>
</svg>`;
}
