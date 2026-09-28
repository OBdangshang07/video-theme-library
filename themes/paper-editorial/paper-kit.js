// Shared seek-safe material kit for paper-editorial.
// Everything here is generated once from a seed at timeline-build time;
// nothing reads clocks, input or Math.random, so any frame can be rebuilt.
import { clamp, mix, seeded, smooth } from "./material-utils.js";

export const hasDOM = typeof document !== "undefined";
export const INK = "#20262c", RED = "#b83b2f", PAPER = "#efe5ce";

export function hash2(seed) {
  const s = (Number(seed) >>> 0) * 0.000123 + 17.17;
  return (x, y) => {
    let h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
    return h - Math.floor(h);
  };
}

/** 2D value noise in [0,1]. */
export function valueNoise(seed = 1) {
  const h = hash2(seed);
  return (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    let fx = x - ix, fy = y - iy;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = h(ix, iy), b = h(ix + 1, iy), c = h(ix, iy + 1), d = h(ix + 1, iy + 1);
    return mix(mix(a, b, fx), mix(c, d, fx), fy);
  };
}

/** Fractal noise in [0,1]. */
export function fbm(seed = 1, octaves = 4) {
  const n = valueNoise(seed);
  return (x, y) => {
    let v = 0, a = .5, f = 1, norm = 0;
    for (let i = 0; i < octaves; i++) {
      v += a * n(x * f + i * 17.3, y * f - i * 9.1);
      norm += a; a *= .5; f *= 2.03;
    }
    return v / norm;
  };
}

export function makeCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

const cache = new Map();
/** Memoise expensive generated textures by key (same key → same pixels). */
export function cached(key, build) {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
}

/**
 * Soft ink "soak" blob used as a CSS mask: opaque core, fibrous feathered rim.
 * Grow it with mask-size to make ink appear to wick outward through paper.
 */
export function soakMaskURL(seed = 7, size = 256) {
  return cached(`soak:${seed}:${size}`, () => {
    const canvas = makeCanvas(size, size);
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(size, size);
    const edge = fbm(seed, 4), fiber = fbm(seed + 91, 3);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const u = x / size - .5, v = y / size - .5;
      const r = Math.hypot(u, v), a = Math.atan2(v, u);
      // Rim radius wobbles by angle (coarse) and along fibres (fine, stretched).
      const rim = .34 + (edge(Math.cos(a) * 2.2 + 3, Math.sin(a) * 2.2 + 3) - .5) * .16;
      const streak = (fiber(x / size * 38, y / size * 6) - .5) * .09;
      const alpha = smooth((rim + streak - r) / .075);
      const i = (y * size + x) * 4;
      img.data[i + 3] = Math.round(alpha * 255);
    }
    ctx.putImageData(img, 0, 0);
    return `url("${canvas.toDataURL("image/png")}")`;
  });
}

let defsRoot = null, filterSerial = 0;
function svgEl(name, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}
function ensureDefs() {
  if (defsRoot && defsRoot.isConnected) return defsRoot;
  const svg = svgEl("svg", { width: 0, height: 0, "aria-hidden": "true" });
  svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
  defsRoot = svgEl("defs");
  svg.appendChild(defsRoot);
  document.body.appendChild(svg);
  return defsRoot;
}

/**
 * Per-target wet-ink filter. Returned nodes are tweened with GSAP's attr plugin:
 *   soft.stdDeviation            puddle size: glyphs blur together …
 *   gooAlpha.slope / .intercept  … and an alpha contrast re-hardens them into merged ink blobs
 *   warp.scale                   fibre displacement of the wet edges
 *   haloBlur.stdDeviation / haloAlpha.slope   the bleed halo wicking into paper
 * At soft=0, slope=1, intercept=0, warp=0, halo=0 the filter is an identity.
 */
export function wetInkFilter({ seed = 3, color = INK, frequency = "0.042 0.058" } = {}) {
  const defs = ensureDefs();
  const id = `pe-wet-ink-${++filterSerial}`;
  const [r, g, b] = hexRGB(color).map((c) => (c / 255).toFixed(4));
  const filter = svgEl("filter", { id, x: "-25%", y: "-60%", width: "150%", height: "220%",
    "color-interpolation-filters": "sRGB" });
  const soft = svgEl("feGaussianBlur", { in: "SourceGraphic", stdDeviation: 0, result: "soft" });
  const goo = svgEl("feComponentTransfer", { in: "soft", result: "goo" });
  const gooAlpha = svgEl("feFuncA", { type: "linear", slope: 1, intercept: 0 });
  goo.appendChild(gooAlpha);
  const noise = svgEl("feTurbulence", { type: "fractalNoise", baseFrequency: frequency,
    numOctaves: 3, seed: (seed % 997) + 1, result: "noise" });
  const warp = svgEl("feDisplacementMap", { in: "goo", in2: "noise", scale: 0,
    xChannelSelector: "R", yChannelSelector: "G", result: "warp" });
  const haloBlur = svgEl("feGaussianBlur", { in: "warp", stdDeviation: 0, result: "haloSoft" });
  const tint = svgEl("feColorMatrix", { in: "haloSoft", type: "matrix", result: "haloTint",
    values: `0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0` });
  const transfer = svgEl("feComponentTransfer", { in: "haloTint", result: "halo" });
  const haloAlpha = svgEl("feFuncA", { type: "linear", slope: 0, intercept: 0 });
  transfer.appendChild(haloAlpha);
  const merge = svgEl("feMerge");
  merge.append(svgEl("feMergeNode", { in: "halo" }), svgEl("feMergeNode", { in: "warp" }));
  filter.append(soft, goo, noise, warp, haloBlur, tint, transfer, merge);
  defs.appendChild(filter);
  return { id, url: `url(#${id})`, soft, gooAlpha, warp, haloBlur, haloAlpha };
}

function alphaImageURL(key, w, h, fn) {
  return cached(key, () => {
    const canvas = makeCanvas(w, h), ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      img.data[(y * w + x) * 4 + 3] = Math.round(clamp(fn(x / w, y / h)) * 255);
    }
    ctx.putImageData(img, 0, 0);
    return `url("${canvas.toDataURL("image/png")}")`;
  });
}

/**
 * Fibrous reveal edge for CSS masks. `direction` names the side that is opaque first:
 * ltr → opaque on the left, ttb → opaque on top, etc. The edge sits at the image middle;
 * use with mask-size 300% along the travel axis and tween mask-position 100% ↔ 0%.
 */
export function edgeMaskURL(direction = "ltr", seed = 1, fibres = 1) {
  const horizontal = direction === "ltr" || direction === "rtl";
  const along = edgeProfile(seed * 13 + 7, 5, 70), fibre = valueNoise(seed * 7 + 3);
  const [w, h] = horizontal ? [960, 128] : [128, 960];
  return alphaImageURL(`edge:${direction}:${seed}:${fibres}`, w, h, (x, y) => {
    const s = horizontal ? y : x;
    let u = horizontal ? x : y;
    if (direction === "rtl" || direction === "btt") u = 1 - u;
    const edge = .5 + along(s) * .024;
    let a = smooth((edge - u) / .016 + .5);
    // Loose fibres trail past the edge like a torn / wicking sheet.
    const reach = u - edge;
    if (fibres && reach > 0 && reach < .028 && fibre(s * 190, reach * 50) > 1 - .2 * fibres) a = Math.max(a, (1 - reach / .028) * .7);
    return a;
  });
}

/**
 * Brush stroke silhouette (horizontal, head at the left): 顿笔 bulge, pressure wobble,
 * and a dry-brush 飞白 tail that breaks into bristle streaks. Stretch to the element box.
 */
export function brushShapeURL(seed = 1, { dry = .26, flip = false } = {}) {
  const grain = valueNoise(seed * 5 + 1), streak = valueNoise(seed * 5 + 2), wob = fbm(seed * 5 + 3, 3);
  return alphaImageURL(`brush:${seed}:${dry}:${flip}`, 1024, 96, (x0, y) => {
    const x = flip ? 1 - x0 : x0;
    const head = 1 + .24 * Math.exp(-(((x - .035) / .04) ** 2));
    const lift = 1 - .28 * smooth((x - (1 - dry)) / dry);
    const half = .44 * head * lift * (.94 + .12 * wob(x * 6, .3));
    const centre = .5 + (wob(x * 3, 2.7) - .5) * .06;
    const d = Math.abs(y - centre);
    let a = smooth((half - d) / .05 + .5);
    a *= smooth(x / .018);                      // rounded start
    a *= 1 - smooth((x - .985) / .015);         // clean finish
    const dryness = smooth((x - (1 - dry)) / dry);
    if (dryness > 0 && streak(y * 46, x * 2.2) < dryness * .62) a *= .06;
    return a * (.86 + .14 * grain(x * 180, y * 40));
  });
}

/** Horizontal band with ragged top and bottom edges, for vertical expansion (mask-size y). */
export function bandMaskURL(seed = 1) {
  const top = edgeProfile(seed * 3 + 1, 6, 80), bottom = edgeProfile(seed * 3 + 2, 6, 80);
  return alphaImageURL(`band:${seed}`, 512, 512, (x, y) => {
    const t = .28 + top(x) * .03, b = .72 + bottom(x) * .03;
    return smooth((y - t) / .02 + .5) * smooth((b - y) / .02 + .5);
  });
}

/** Tileable-looking material swatch as a CSS background (ink / vermilion / paper). */
export function materialURL(kind = "ink", seed = 1, size = 512) {
  return cached(`material:${kind}:${seed}:${size}`, () => {
    const base = { ink: [32, 38, 44], red: [184, 59, 47], paper: [239, 229, 206], paperDeep: [226, 214, 188] }[kind] || [32, 38, 44];
    const canvas = makeCanvas(size, size), ctx = canvas.getContext("2d");
    const img = ctx.createImageData(size, size);
    const dens = fbm(seed * 11 + 1, 4), fib = valueNoise(seed * 11 + 2), dot = hash2(seed * 11 + 3);
    const paper = kind.startsWith("paper");
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const d = dens(x / size * 6, y / size * 6), f = fib(x / size * 90, y / size * 14);
      const shade = paper ? (d - .5) * 14 + (f - .5) * 10 : (d - .5) * 26 + (f - .5) * 8;
      const speck = !paper && dot(x, y) > .996 ? 34 : 0;
      const i = (y * size + x) * 4;
      img.data[i] = clamp(base[0] + shade + speck, 0, 255);
      img.data[i + 1] = clamp(base[1] + shade + speck * .9, 0, 255);
      img.data[i + 2] = clamp(base[2] + shade * .9 + speck * .8, 0, 255);
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    if (paper) {
      const r = seeded(seed * 11 + 4);
      for (let i = 0; i < size * .9; i++) {
        const x = r() * size, y = r() * size, len = 4 + r() * 18, a = r() * Math.PI;
        ctx.strokeStyle = `rgba(120,98,66,${(.06 + r() * .1).toFixed(3)})`; ctx.lineWidth = .6 + r() * .7;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
      }
    }
    return `url("${canvas.toDataURL("image/png")}")`;
  });
}

/**
 * Seal-ink transfer filter: coverage comes from thresholded noise, so the imprint
 * fills in unevenly as pressure rises and keeps small voids like a real 印泥 impression.
 *   blur.stdDeviation            airborne softness before contact
 *   cover.slope / cover.intercept coverage threshold (intercept −8 ≈ none, −2.6 ≈ final, +1 = solid)
 *   haloBlur / haloAlpha          vermilion bleed into the paper
 */
export function sealInkFilter({ seed = 5, color = RED, frequency = .065, roughness = 2.4 } = {}) {
  const defs = ensureDefs();
  const id = `pe-seal-ink-${++filterSerial}`;
  const [r, g, b] = hexRGB(color).map((c) => (c / 255).toFixed(4));
  const filter = svgEl("filter", { id, x: "-30%", y: "-30%", width: "160%", height: "160%", "color-interpolation-filters": "sRGB" });
  const blur = svgEl("feGaussianBlur", { in: "SourceGraphic", stdDeviation: 0, result: "air" });
  const noise = svgEl("feTurbulence", { type: "fractalNoise", baseFrequency: frequency, numOctaves: 4, seed: (seed % 997) + 1, result: "noise" });
  const lum = svgEl("feColorMatrix", { in: "noise", type: "matrix", result: "lum",
    values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" });
  const coverT = svgEl("feComponentTransfer", { in: "lum", result: "cover" });
  const cover = svgEl("feFuncA", { type: "linear", slope: 8, intercept: 1 });
  coverT.appendChild(cover);
  const rough = svgEl("feDisplacementMap", { in: "air", in2: "noise", scale: roughness, xChannelSelector: "G", yChannelSelector: "B", result: "rough" });
  const inked = svgEl("feComposite", { in: "rough", in2: "cover", operator: "in", result: "inked" });
  const haloBlur = svgEl("feGaussianBlur", { in: "inked", stdDeviation: 0, result: "haloSoft" });
  const tint = svgEl("feColorMatrix", { in: "haloSoft", type: "matrix", result: "haloTint",
    values: `0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0` });
  const haloT = svgEl("feComponentTransfer", { in: "haloTint", result: "halo" });
  const haloAlpha = svgEl("feFuncA", { type: "linear", slope: 0, intercept: 0 });
  haloT.appendChild(haloAlpha);
  const merge = svgEl("feMerge");
  merge.append(svgEl("feMergeNode", { in: "halo" }), svgEl("feMergeNode", { in: "inked" }));
  filter.append(blur, noise, lum, coverT, rough, inked, haloBlur, tint, haloT, merge);
  defs.appendChild(filter);
  return { id, url: `url(#${id})`, blur, cover, haloBlur, haloAlpha };
}

/** Directional (vertical by default) motion-blur filter; set blur.stdDeviation = "0 N". */
export function motionBlurFilter() {
  const defs = ensureDefs();
  const id = `pe-motion-blur-${++filterSerial}`;
  const filter = svgEl("filter", { id, x: "-10%", y: "-40%", width: "120%", height: "180%" });
  const blur = svgEl("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "0 0" });
  filter.appendChild(blur);
  defs.appendChild(filter);
  return { id, url: `url(#${id})`, blur };
}

export function hexRGB(hex) {
  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(hex);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  const m = /^#?([\da-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`paper-kit expects six-digit hex colour, got ${hex}`);
  const v = parseInt(m[1], 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/** Ragged edge profile: returns f(u∈[0,1]) → offset in [-1,1], coarse wobble + fine fibre. */
export function edgeProfile(seed, coarse = 3.5, fine = 60) {
  const a = fbm(seed, 3), b = valueNoise(seed + 5);
  return (u) => (a(u * coarse, .5) - .5) * 1.6 + (b(u * fine, 2.5) - .5) * .5;
}

/**
 * Paint a pulled ink sheet (top → bottom travel) into a canvas:
 *   [dry-brush trailing streaks][solid ink body][wet leading edge + drips]
 * Heights are fractions of the frame height H; canvas height is H·(dry+body+wet).
 */
export function inkSheetCanvas({ width = 1280, frameHeight = 720, seed = 11,
  dry = .72, body = 1.4, wet = .16, color = INK, drips = true } = {}) {
  const key = `sheet:${width}:${frameHeight}:${seed}:${dry}:${body}:${wet}:${color}:${drips}`;
  return cached(key, () => {
    const H = frameHeight, W = width;
    const total = H * (dry + body + wet);
    const canvas = makeCanvas(W, total);
    const ctx = canvas.getContext("2d");
    const random = seeded(seed);
    const [ir, ig, ib] = hexRGB(color);
    const bodyTop = H * dry, bodyBottom = H * (dry + body);
    const topEdge = edgeProfile(seed + 1, 5, 90), bottomEdge = edgeProfile(seed + 2, 4, 70);

    // Body density: low-res fbm upscaled, stretched along the pull direction.
    const lowW = Math.ceil(W / 4), lowH = Math.ceil(total / 4);
    const low = makeCanvas(lowW, lowH), lctx = low.getContext("2d");
    const img = lctx.createImageData(lowW, lowH);
    const dens = fbm(seed + 3, 4), streak = valueNoise(seed + 4);
    for (let y = 0; y < lowH; y++) for (let x = 0; x < lowW; x++) {
      const d = dens(x / lowW * 4, y / lowH * 5) * .86 + streak(x / lowW * 46, y / lowH * 2.4) * .14;
      const shade = mix(-13, 11, d);
      const i = (y * lowW + x) * 4;
      img.data[i] = clamp(ir + shade, 0, 255); img.data[i + 1] = clamp(ig + shade, 0, 255);
      img.data[i + 2] = clamp(ib + shade * .9, 0, 255); img.data[i + 3] = 255;
    }
    lctx.putImageData(img, 0, 0);
    const bodyTex = makeCanvas(W, total), bctx = bodyTex.getContext("2d");
    bctx.imageSmoothingEnabled = true;
    bctx.drawImage(low, 0, 0, W, total);

    // Solid body with ragged top and wet bottom edge.
    const edgeAt = (u, base, profile, amp) => base + profile(u) * amp;
    const step = 4;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, edgeAt(0, bodyTop, topEdge, H * .035));
    for (let x = step; x <= W; x += step) ctx.lineTo(x, edgeAt(x / W, bodyTop, topEdge, H * .035));
    for (let x = W; x >= 0; x -= step) ctx.lineTo(x, edgeAt(x / W, bodyBottom, bottomEdge, H * .028));
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(bodyTex, 0, 0);
    ctx.restore();

    // Wet edge: pooled darker rim just inside, faint bleed just outside.
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    const trace = (offset) => {
      ctx.beginPath();
      for (let x = 0; x <= W; x += step) {
        const y = edgeAt(x / W, bodyBottom, bottomEdge, H * .028) + offset;
        if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
    };
    ctx.strokeStyle = `rgba(${ir * .45 | 0},${ig * .45 | 0},${ib * .45 | 0},.85)`;
    ctx.lineWidth = H * .007; trace(-H * .004); ctx.stroke();
    for (let k = 0; k < 5; k++) {
      ctx.strokeStyle = `rgba(${ir},${ig},${ib},${.09 - k * .015})`;
      ctx.lineWidth = H * (.006 + k * .006); trace(H * (.004 + k * .004)); ctx.stroke();
    }
    // Drips hanging off the leading edge.
    const dripCount = drips ? 7 + Math.floor(random() * 5) : 0;
    for (let i = 0; i < dripCount; i++) {
      const u = (i + .15 + random() * .7) / dripCount;
      const x = u * W, y0 = edgeAt(u, bodyBottom, bottomEdge, H * .028) - 2;
      const len = H * mix(.018, wet * .8, random() ** 1.6), w = H * mix(.005, .012, random());
      ctx.fillStyle = `rgb(${ir},${ig},${ib})`;
      ctx.beginPath();
      ctx.moveTo(x - w * 1.6, y0);
      ctx.quadraticCurveTo(x - w * .5, y0 + len * .55, x - w * .8, y0 + len);
      ctx.arc(x, y0 + len, w * .95, Math.PI, 0, true);
      ctx.quadraticCurveTo(x + w * .5, y0 + len * .55, x + w * 1.6, y0);
      ctx.closePath(); ctx.fill();
    }

    // Dry-brush trailing zone: bristles run in clumps that share a reach and break
    // into 飞白 together, the way a drying brush actually splits.
    const px = W / 1920;
    const gap = valueNoise(seed + 6), reach = fbm(seed + 7, 3);
    for (let x = 0; x < W;) {
      const clumpW = mix(10, 46, random()) * px, clumpReach = reach(x / W * 7, 1.3);
      const hairs = Math.max(3, Math.round(clumpW / (2.6 * px)));
      const clumpId = x * .013;
      for (let h = 0; h < hairs; h++) {
        const hx = x + (h + random() * .6) / hairs * clumpW;
        const base = edgeAt(hx / W, bodyTop, topEdge, H * .035) + 4;
        const length = H * dry * mix(.12, .98, clumpReach ** 1.2) * mix(.72, 1, random());
        ctx.lineWidth = mix(1.4, 4.6, random()) * px;
        const segs = 28;
        for (let s = 0; s < segs; s++) {
          const f0 = s / segs, f1 = (s + 1) / segs;
          // Gaps are mostly shared by the clump, with a little per-hair variation.
          const g = gap(clumpId, f0 * 7) * .75 + gap(hx * .21, f0 * 13) * .25;
          if (g < mix(.12, .66, f0 ** .8)) continue;
          const a = (1 - f0) ** 1.1 * mix(.7, 1, random());
          ctx.strokeStyle = `rgba(${ir},${ig},${ib},${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(hx + Math.sin(f0 * 2.4 + clumpId) * 2 * px, base - length * f0);
          ctx.lineTo(hx + Math.sin(f1 * 2.4 + clumpId) * 2 * px, base - length * f1);
          ctx.stroke();
        }
      }
      x += clumpW * mix(.85, 1.25, random());
    }
    // Fine paper tooth just behind the dry edge, where the brush starts to starve.
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < W * .5; i++) {
      const x = random() * W, y = bodyTop + (random() ** 1.8) * H * .12;
      ctx.globalAlpha = .12 + random() * .22;
      ctx.fillRect(x, y, (1 + random() * 3) * px, (.8 + random() * 5) * px);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    return { canvas, total: dry + body + wet, dry, body, wet };
  });
}

/**
 * The same pulled ink sheet, oriented for other travel directions.
 * rotate 90  → travels left→right (leading wet edge on the right); pass the frame WIDTH as
 *              `frameHeight` and the frame height as `width`.
 * rotate 180 → travels bottom→top (leading wet edge on top).
 */
export function orientedInkSheet({ rotate = 0, ...options } = {}) {
  const sheet = inkSheetCanvas(options);
  if (!rotate) return sheet;
  return cached(`oriented:${rotate}:${JSON.stringify(options)}`, () => {
    const src = sheet.canvas;
    const turned = rotate === 90 ? makeCanvas(src.height, src.width) : makeCanvas(src.width, src.height);
    const ctx = turned.getContext("2d");
    if (rotate === 90) { ctx.translate(0, src.width); ctx.rotate(-Math.PI / 2); }
    else { ctx.translate(src.width, src.height); ctx.rotate(Math.PI); }
    ctx.drawImage(src, 0, 0);
    return { ...sheet, canvas: turned };
  });
}

/**
 * Torn-edge strip that rides on an edgeMaskURL("ltr", seed) boundary: white pulp fibres on the
 * right (the torn page), a soft cast shadow on the left. Strip width = `span` × frame width,
 * the boundary runs down its centre using the exact same profile as the mask.
 */
export function tornEdgeStrip({ seed = 1, frameWidth = 1920, frameHeight = 1080, span = .2 } = {}) {
  return cached(`torn:${seed}:${frameWidth}:${frameHeight}:${span}`, () => {
    const W = Math.round(frameWidth * span), H = Math.round(frameHeight);
    const canvas = makeCanvas(W, H), ctx = canvas.getContext("2d");
    const along = edgeProfile(seed * 13 + 7, 5, 70);
    const amp = .024 * 3 * frameWidth, cx = W / 2, px = frameWidth / 1920;
    const edgeX = (y) => cx + along(y / H) * amp;
    const random = seeded(seed * 29 + 1);
    // Cast shadow on the revealed page, just left of the tear.
    for (let y = 0; y < H; y += 2) {
      const x = edgeX(y);
      const g = ctx.createLinearGradient(x - 46 * px, 0, x, 0);
      g.addColorStop(0, "rgba(30,24,16,0)"); g.addColorStop(1, "rgba(30,24,16,.3)");
      ctx.fillStyle = g; ctx.fillRect(x - 46 * px, y, 46 * px, 2);
    }
    // Pulp band: the torn page's exposed core.
    ctx.beginPath();
    for (let y = 0; y <= H; y += 3) ctx[y ? "lineTo" : "moveTo"](edgeX(y) - 1, y);
    for (let y = H; y >= 0; y -= 3) ctx.lineTo(edgeX(y) + (7 + 5 * Math.sin(y * .05 + seed)) * px, y);
    ctx.closePath();
    ctx.fillStyle = "#faf4e6"; ctx.fill();
    // Loose fibres sticking out over the revealed side.
    for (let i = 0; i < H * .5; i++) {
      const y = random() * H, x = edgeX(y) + random() * 4 * px, len = (4 + random() * 16) * px;
      const a = Math.PI + (random() - .5) * 1.4;
      ctx.strokeStyle = `rgba(250,244,230,${(.45 + random() * .5).toFixed(2)})`;
      ctx.lineWidth = (.5 + random() * .9) * px;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * len * .5, y + Math.sin(a) * len * .5 + 2 * px, x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
    // Thin inked line where the printed surface stops at the pulp.
    ctx.strokeStyle = "rgba(60,52,40,.35)"; ctx.lineWidth = 1.2 * px;
    ctx.beginPath();
    for (let y = 0; y <= H; y += 3) ctx[y ? "lineTo" : "moveTo"](edgeX(y) + (7 + 5 * Math.sin(y * .05 + seed)) * px, y);
    ctx.stroke();
    return { canvas, span, amp: amp / frameWidth };
  });
}
