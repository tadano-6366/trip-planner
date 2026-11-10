// Turns a photo into an illustration, entirely in the browser.
// Pipeline: Kuwahara smoothing (flat painted areas) → colour grading →
// ink outlines (Sobel edges) → paper grain and watercolour blotches.

export const STYLES = {
  original:   { label: 'Original' },
  watercolor: { label: 'Watercolor', radius: 4, sat: 0.85, contrast: 1.0, pastel: 0.16, levels: 0,
                edge: 0.55, lo: 35, hi: 150, ink: [62, 72, 104], grain: 9, blotch: 0.14, tint: [255, 244, 228] },
  sketch:     { label: 'Pencil sketch', radius: 2, sat: 0.22, contrast: 1.05, pastel: 0.32, levels: 0,
                edge: 0.95, lo: 18, hi: 85, ink: [48, 46, 52], grain: 14, blotch: 0.05, tint: [250, 244, 232] },
  anime:      { label: 'Anime', radius: 3, sat: 1.35, contrast: 1.12, pastel: 0.04, levels: 7,
                edge: 0.85, lo: 45, hi: 130, ink: [28, 30, 50], grain: 2, blotch: 0, tint: [255, 250, 245] },
};

export async function fileToImage(file) {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch {}
  }
  return new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = URL.createObjectURL(file);
  });
}

function drawScaled(img, max) {
  const w0 = img.width, h0 = img.height;
  const s = Math.min(1, max / Math.max(w0, h0));
  const c = document.createElement('canvas');
  c.width = Math.round(w0 * s); c.height = Math.round(h0 * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c;
}

// Returns a JPEG data URL.
export function stylize(img, styleKey = 'watercolor', max = 1100) {
  const canvas = drawScaled(img, max);
  const st = STYLES[styleKey];
  if (!st || styleKey === 'original') return canvas.toDataURL('image/jpeg', 0.82);

  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  const smooth = kuwahara(px, w, h, st.radius);
  const lum = new Float32Array(w * h);
  for (let i = 0, p = 0; i < lum.length; i++, p += 4) lum[i] = 0.299 * smooth[p] + 0.587 * smooth[p + 1] + 0.114 * smooth[p + 2];

  const noise = st.blotch ? valueNoise(w, h) : null;
  const lv = st.levels;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x, p = i * 4;
      let r = smooth[p], g = smooth[p + 1], b = smooth[p + 2];
      const L = lum[i];

      // saturation + contrast
      r = L + (r - L) * st.sat; g = L + (g - L) * st.sat; b = L + (b - L) * st.sat;
      r = (r - 128) * st.contrast + 128; g = (g - 128) * st.contrast + 128; b = (b - 128) * st.contrast + 128;

      // flat cel shading
      if (lv) {
        const q = 255 / (lv - 1);
        r = Math.round(r / q) * q; g = Math.round(g / q) * q; b = Math.round(b / q) * q;
      }

      // soft pastel wash toward warm paper
      r += (st.tint[0] - r) * st.pastel; g += (st.tint[1] - g) * st.pastel; b += (st.tint[2] - b) * st.pastel;

      // watercolour pigment pooling
      if (noise) { const f = 1 - st.blotch * noise[i]; r *= f; g *= f; b *= f; }

      // ink outlines
      if (x > 0 && y > 0 && x < w - 1 && y < h - 1) {
        const gx = -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1] + lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1];
        const gy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1];
        const m = Math.sqrt(gx * gx + gy * gy);
        const t = Math.min(1, Math.max(0, (m - st.lo) / (st.hi - st.lo))) * st.edge;
        r += (st.ink[0] - r) * t; g += (st.ink[1] - g) * t; b += (st.ink[2] - b) * t;
      }

      // paper grain
      const n = (Math.random() - 0.5) * st.grain;
      px[p] = r + n; px[p + 1] = g + n; px[p + 2] = b + n;
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.82);
}

// Kuwahara filter using summed-area tables, so cost doesn't grow with radius.
function kuwahara(src, w, h, r) {
  const W = w + 1, n = W * (h + 1);
  const SR = new Float64Array(n), SG = new Float64Array(n), SB = new Float64Array(n);
  const SL = new Float64Array(n), SL2 = new Float64Array(n);
  for (let y = 1; y <= h; y++) {
    let rr = 0, gg = 0, bb = 0, ll = 0, l2 = 0;
    for (let x = 1; x <= w; x++) {
      const p = ((y - 1) * w + (x - 1)) * 4;
      const R = src[p], G = src[p + 1], B = src[p + 2], L = 0.299 * R + 0.587 * G + 0.114 * B;
      rr += R; gg += G; bb += B; ll += L; l2 += L * L;
      const k = y * W + x, u = k - W;
      SR[k] = SR[u] + rr; SG[k] = SG[u] + gg; SB[k] = SB[u] + bb; SL[k] = SL[u] + ll; SL2[k] = SL2[u] + l2;
    }
  }
  const out = new Float32Array(w * h * 4);
  const sum = (S, x0, y0, x1, y1) => S[(y1 + 1) * W + x1 + 1] - S[y0 * W + x1 + 1] - S[(y1 + 1) * W + x0] + S[y0 * W + x0];
  const quads = [[-1, -1], [0, -1], [-1, 0], [0, 0]];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let best = Infinity, br = 0, bg = 0, bb = 0;
      for (const [qx, qy] of quads) {
        const x0 = Math.max(0, qx ? x - r : x), x1 = Math.min(w - 1, qx ? x : x + r);
        const y0 = Math.max(0, qy ? y - r : y), y1 = Math.min(h - 1, qy ? y : y + r);
        const c = (x1 - x0 + 1) * (y1 - y0 + 1);
        const mL = sum(SL, x0, y0, x1, y1) / c;
        const v = sum(SL2, x0, y0, x1, y1) / c - mL * mL;
        if (v < best) {
          best = v;
          br = sum(SR, x0, y0, x1, y1) / c; bg = sum(SG, x0, y0, x1, y1) / c; bb = sum(SB, x0, y0, x1, y1) / c;
        }
      }
      const p = (y * w + x) * 4;
      out[p] = br; out[p + 1] = bg; out[p + 2] = bb;
    }
  }
  return out;
}

// Smooth 2-octave value noise in [0,1], for watercolour blotches.
function valueNoise(w, h) {
  const out = new Float32Array(w * h);
  for (const [cell, amp] of [[90, 0.65], [28, 0.35]]) {
    const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2;
    const g = new Float32Array(gw * gh).map(() => Math.random());
    for (let y = 0; y < h; y++) {
      const fy = y / cell, iy = fy | 0, ty = fy - iy, sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < w; x++) {
        const fx = x / cell, ix = fx | 0, tx = fx - ix, sx = tx * tx * (3 - 2 * tx);
        const a = g[iy * gw + ix], b = g[iy * gw + ix + 1], c = g[(iy + 1) * gw + ix], d = g[(iy + 1) * gw + ix + 1];
        out[y * w + x] += amp * ((a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy);
      }
    }
  }
  return out;
}
