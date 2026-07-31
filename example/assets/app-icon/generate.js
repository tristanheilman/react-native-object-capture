// Generates app-icon SVG concepts for react-native-object-capture example app.
// Theme: LiDAR / Object Capture / point cloud / "measured, not guessed".
const fs = require('fs');

const S = 1024; // master canvas
const C = S / 2;

// ---- isometric projection helpers ----
// edge length in lattice units -> screen scale
function iso(x, y, z, s) {
  return [(x - y) * 0.866 * s, (x + y) * 0.5 * s - z * s];
}

function dot(cx, cy, r, fill, op) {
  return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${fill}" opacity="${op}"/>`;
}

// build a point-cloud cube; returns svg fragment
function pointCloudCube({
  n = 8,
  s = 46,
  cx = C,
  cy = C + 40,
  topFill,
  leftFill,
  rightFill,
  r = 9,
}) {
  let out = '';
  const faces = [];
  // top face z = n
  for (let x = 0; x <= n; x++)
    for (let y = 0; y <= n; y++) faces.push([x, y, n, topFill, 1]);
  // left face y = n
  for (let x = 0; x <= n; x++)
    for (let z = 0; z <= n; z++) faces.push([x, n, z, leftFill, 1]);
  // right face x = n
  for (let y = 0; y <= n; y++)
    for (let z = 0; z <= n; z++) faces.push([n, y, z, rightFill, 1]);
  // center lattice roughly around origin: shift by n/2
  for (const [x, y, z, fill, op] of faces) {
    const [px, py] = iso(x - n / 2, y - n / 2, z - n / 2, s);
    // slight radius variance for a scanned feel based on position
    const rr = r * (0.72 + (0.28 * ((x + y + z) % 3)) / 2);
    out += dot(cx + px, cy + py, rr, fill, op);
  }
  return out;
}

// cube edges (wireframe) for definition
function cubeEdges({
  n = 8,
  s = 46,
  cx = C,
  cy = C + 40,
  stroke,
  w = 5,
  op = 0.5,
}) {
  const V = {};
  const corners = [
    [0, 0, 0],
    [n, 0, 0],
    [0, n, 0],
    [n, n, 0],
    [0, 0, n],
    [n, 0, n],
    [0, n, n],
    [n, n, n],
  ];
  corners.forEach((c, i) => {
    const [px, py] = iso(c[0] - n / 2, c[1] - n / 2, c[2] - n / 2, s);
    V[i] = [cx + px, cy + py];
  });
  const E = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [4, 5],
    [4, 6],
    [5, 7],
    [6, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  let out = '';
  for (const [a, b] of E)
    out += `<line x1="${V[a][0].toFixed(1)}" y1="${V[a][1].toFixed(1)}" x2="${V[b][0].toFixed(1)}" y2="${V[b][1].toFixed(1)}" stroke="${stroke}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/>`;
  return out;
}

// viewfinder corner brackets
function brackets({
  inset = 150,
  len = 120,
  w = 18,
  stroke = '#ffffff',
  op = 0.9,
  rad = 34,
}) {
  const a = inset,
    b = S - inset;
  const p = (x, y) => `${x} ${y}`;
  return `
    <path d="M ${a} ${a + len} L ${a} ${a + rad} Q ${a} ${a} ${a + rad} ${a} L ${a + len} ${a}" fill="none" stroke="${stroke}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/>
    <path d="M ${b - len} ${a} L ${b - rad} ${a} Q ${b} ${a} ${b} ${a + rad} L ${b} ${a + len}" fill="none" stroke="${stroke}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/>
    <path d="M ${b} ${b - len} L ${b} ${b - rad} Q ${b} ${b} ${b - rad} ${b} L ${b - len} ${b}" fill="none" stroke="${stroke}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/>
    <path d="M ${a + len} ${b} L ${a + rad} ${b} Q ${a} ${b} ${a} ${b - rad} L ${a} ${b - len}" fill="none" stroke="${stroke}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/>`;
}

function frame(inner, defs = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
<defs>${defs}</defs>
${inner}
</svg>`;
}

// ---------------- Concept A: Point-cloud cube (cool / indigo+cyan) ----------------
function conceptA() {
  const defs = `
    <linearGradient id="bgA" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#141B3C"/>
      <stop offset="0.55" stop-color="#0E1430"/>
      <stop offset="1" stop-color="#080B1E"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0.5" cy="0.45" r="0.6">
      <stop offset="0" stop-color="#3BE3D6" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#3BE3D6" stop-opacity="0"/>
    </radialGradient>`;
  const inner = `
    <rect width="${S}" height="${S}" fill="url(#bgA)"/>
    <rect width="${S}" height="${S}" fill="url(#glowA)"/>
    ${cubeEdges({ stroke: '#7FF6EC', w: 5, op: 0.35 })}
    ${pointCloudCube({ topFill: '#8BF7EC', leftFill: '#39B9F2', rightFill: '#2C7CE0' })}
    ${brackets({ stroke: '#EAF7FF', op: 0.85 })}`;
  return frame(inner, defs);
}

// ---------------- Concept B: Measured cube (warm brand rose, flat + calipers) --------
function conceptB() {
  const defs = `
    <linearGradient id="bgB" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2A2140"/>
      <stop offset="1" stop-color="#171226"/>
    </linearGradient>`;
  // solid iso cube faces
  const n = 8,
    s = 46,
    cx = C,
    cy = C + 30;
  const P = (x, y, z) => {
    const [px, py] = iso(x - n / 2, y - n / 2, z - n / 2, s);
    return [cx + px, cy + py];
  };
  const poly = (pts, fill) =>
    `<polygon points="${pts
      .map((p) =>
        P(...p)
          .map((v) => v.toFixed(1))
          .join(',')
      )
      .join(' ')}" fill="${fill}"/>`;
  const top = poly(
    [
      [0, 0, n],
      [n, 0, n],
      [n, n, n],
      [0, n, n],
    ],
    '#F2B8B0'
  );
  const left = poly(
    [
      [0, n, n],
      [n, n, n],
      [n, n, 0],
      [0, n, 0],
    ],
    '#CD8987'
  );
  const right = poly(
    [
      [n, 0, n],
      [n, n, n],
      [n, n, 0],
      [n, 0, 0],
    ],
    '#A85F5E'
  );
  // caliper dimension line down the right side
  const [rx1, ry1] = P(n, 0, n),
    [rx2, ry2] = P(n, 0, 0);
  const off = 70;
  const cal = `
    <line x1="${rx1 + off}" y1="${ry1}" x2="${rx2 + off}" y2="${ry2}" stroke="#FCE9D6" stroke-width="6"/>
    <line x1="${rx1 + off - 26}" y1="${ry1}" x2="${rx1 + off + 26}" y2="${ry1}" stroke="#FCE9D6" stroke-width="6"/>
    <line x1="${rx2 + off - 26}" y1="${ry2}" x2="${rx2 + off + 26}" y2="${ry2}" stroke="#FCE9D6" stroke-width="6"/>`;
  const inner = `
    <rect width="${S}" height="${S}" fill="url(#bgB)"/>
    ${top}${left}${right}
    ${cubeEdges({ n, s, cx, cy, stroke: '#FFE7DD', w: 4, op: 0.5 })}
    ${cal}
    ${brackets({ stroke: '#F2B8B0', op: 0.8 })}`;
  return frame(inner, defs);
}

// ---------------- Concept C: Scan sweep (minimal dark + cyan point sweep) ----------
function conceptC() {
  const defs = `
    <linearGradient id="bgC" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0C1226"/><stop offset="1" stop-color="#05070F"/>
    </linearGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3BE3D6" stop-opacity="0"/>
      <stop offset="1" stop-color="#3BE3D6" stop-opacity="0.5"/>
    </linearGradient>`;
  // concentric dotted rings + a solid object dot cluster
  let rings = '';
  const cx = C,
    cy = C;
  for (let ring = 1; ring <= 5; ring++) {
    const rad = ring * 78;
    const count = ring * 10;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const px = cx + Math.cos(ang) * rad;
      const py = cy + Math.sin(ang) * rad;
      const op = 0.25 + 0.6 * (1 - ring / 6);
      rings += dot(
        px,
        py,
        8 - ring * 0.6,
        ring <= 2 ? '#8BF7EC' : '#39B9F2',
        op
      );
    }
  }
  const inner = `
    <rect width="${S}" height="${S}" fill="url(#bgC)"/>
    <path d="M ${cx} ${cy} L ${cx + 430} ${cy - 430} A 608 608 0 0 1 ${cx + 430} ${cy + 430} Z" fill="url(#sweep)" opacity="0.5"/>
    ${rings}
    <circle cx="${cx}" cy="${cy}" r="26" fill="#EAF7FF"/>
    ${brackets({ stroke: '#EAF7FF', op: 0.8 })}`;
  return frame(inner, defs);
}

// Circular variant of A (transparent corners) for Android ic_launcher_round.
function conceptARound() {
  const defs = `
    <linearGradient id="bgA" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#141B3C"/>
      <stop offset="0.55" stop-color="#0E1430"/>
      <stop offset="1" stop-color="#080B1E"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0.5" cy="0.45" r="0.6">
      <stop offset="0" stop-color="#3BE3D6" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#3BE3D6" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="circ"><circle cx="${C}" cy="${C}" r="${C}"/></clipPath>`;
  const inner = `
    <g clip-path="url(#circ)">
      <circle cx="${C}" cy="${C}" r="${C}" fill="url(#bgA)"/>
      <rect width="${S}" height="${S}" fill="url(#glowA)"/>
      ${cubeEdges({ stroke: '#7FF6EC', w: 5, op: 0.35 })}
      ${pointCloudCube({ topFill: '#8BF7EC', leftFill: '#39B9F2', rightFill: '#2C7CE0' })}
    </g>`;
  return frame(inner, defs);
}

const concepts = {
  A: conceptA(),
  B: conceptB(),
  C: conceptC(),
  A_round: conceptARound(),
};
for (const [k, svg] of Object.entries(concepts)) {
  fs.writeFileSync(`/tmp/rnoc-icon/concept${k}.svg`, svg);
  console.log(`wrote concept${k}.svg`);
}
