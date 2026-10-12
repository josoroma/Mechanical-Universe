import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as O from "./model.mjs";

export const VIEW_WIDTH = 1000;
export const VIEW_HEIGHT = 730;
export const PROJECTION = K.fitProjection(
  [...K.boxCorners({ x: -286, y: -272, w: 572, d: 544, r: 38 }, -121, 0), [0, 0, 178]],
  VIEW_WIDTH, VIEW_HEIGHT, { pad: 44, azimuth: 43, elevation: 38 },
);
const sphereCache = new Map();
const carrierCache = new Map();
const path = (points, z, P, close = true) => K.onTop(points, z, P, close);
const wrap = (svg, material = "brass") => `<g class="material-${material}">${svg}</g>`;
const solid = (paths, material = "brass", inner = "") => wrap(K.solidSvg(paths, { tone: "hi", inner }), material);
const line = (d, tone = "lo") => K.lineSvg(d, { tone });
const pointDepth = (item, P) => K.depthOf(item.at, P);

function paintOrder(items, P) {
  const bounds = (item) => {
    const s = item.shape;
    let corners;
    let low;
    let high;
    if (s.type === "ball") {
      low = item.carrier ? item.carrier.z : s.at[2] - s.r;
      high = s.at[2] + s.r;
      corners = K.boxCorners({ x: s.at[0] - s.r, y: s.at[1] - s.r, w: s.r * 2, d: s.r * 2 }, low, high);
    } else {
      low = s.z;
      high = s.z + s.h;
      const polygon = s.type === "extruded" ? s.polygon : K.circleRing(s.x, s.y, s.r, 20);
      corners = polygon.flatMap(([x, y]) => [[x, y, low], [x, y, high]]);
    }
    const screen = corners.map((point) => K.iso(point, P));
    return { low, high, x0: Math.min(...screen.map((p) => p[0])), x1: Math.max(...screen.map((p) => p[0])), y0: Math.min(...screen.map((p) => p[1])), y1: Math.max(...screen.map((p) => p[1])) };
  };
  const sorted = items.sort((a, b) => pointDepth(a, P) - pointDepth(b, P));
  const boxes = sorted.map(bounds);
  const edges = sorted.map(() => []);
  const incoming = sorted.map(() => 0);
  for (let i = 0; i < sorted.length; i++) for (let j = i + 1; j < sorted.length; j++) {
    const a = boxes[i];
    const b = boxes[j];
    if (a.x1 < b.x0 || b.x1 < a.x0 || a.y1 < b.y0 || b.y1 < a.y0) continue;
    const from = a.high <= b.low + 1e-8 ? i : b.high <= a.low + 1e-8 ? j : -1;
    if (from === -1) continue;
    const to = from === i ? j : i;
    edges[from].push(to);
    incoming[to]++;
  }
  const result = [];
  const used = new Set();
  while (result.length < sorted.length) {
    const index = incoming.findIndex((n, i) => n === 0 && !used.has(i));
    if (index < 0) throw new Error("Cyclic carrier heights");
    used.add(index);
    result.push(sorted[index]);
    for (const next of edges[index]) incoming[next]--;
  }
  return result;
}

function sphereTemplate(planet, P) {
  const key = `${planet.id}:${planet.globe}`;
  if (sphereCache.has(key)) return sphereCache.get(key);
  const z = 8 + planet.globe;
  let svg = solid(G.sphereOf([0, 0, z], planet.globe, P, { steps: 44 }), planet.material);
  const [sx, sy] = K.iso([0, 0, z], P);
  if (planet.id === "earth") {
    const radius = planet.globe * G.scaleOf(P);
    svg += `<g class="earth-land" transform="translate(${sx} ${sy}) scale(${radius})"><path d="M-.55-.55Q-.2-.82 .06-.46L-.08-.12 .2.03 .04.43-.19.59-.28.19-.53-.02Z"/><path d="M.38-.33L.72-.11 .64.37 .39.58 .21.25Z"/></g>`;
  }
  if (planet.id === "jupiter") {
    svg += wrap(line(K.sideArc(0, 0, planet.globe * Math.sqrt(1 - 0.25 ** 2), z - planet.globe * 0.25, P, 60), "mid"), planet.material);
  }
  sphereCache.set(key, svg);
  return svg;
}

function carrierTemplate(planet, P) {
  const key = `${planet.id}:${planet.globe}`;
  if (carrierCache.has(key)) return carrierCache.get(key);
  const svg = solid(K.cylinder(0, 0, 3.5, 0, 2, P, 20), "brass")
    + solid(K.cylinder(0, 0, 1.65, 2, 6, P, 16), "brass")
    + sphereTemplate(planet, P);
  carrierCache.set(key, svg);
  return svg;
}

function beamPieces(from, to, z, P, name, width = 3) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  if (length < 0.1) return [];
  const ux = dx / length;
  const uy = dy / length;
  const count = Math.max(1, Math.ceil(length / 24));
  const items = [];
  for (let i = 0; i < count; i++) {
    const a = [from[0] + dx * i / count, from[1] + dy * i / count];
    const b = [from[0] + dx * (i + 1) / count, from[1] + dy * (i + 1) / count];
    const polygon = [[a[0] - uy * width / 2, a[1] + ux * width / 2], [b[0] - uy * width / 2, b[1] + ux * width / 2], [b[0] + uy * width / 2, b[1] - ux * width / 2], [a[0] + uy * width / 2, a[1] - ux * width / 2]];
    items.push({ name: `${name}.${i}`, at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z + 1], svg: solid(K.extrude(polygon, z, 2, P), "brass"), shape: { type: "extruded", polygon, z, h: 2 } });
  }
  return items;
}

function ringPieces(cx, cy, r0, r1, z, h, P, name, count = 32) {
  const [vx, vy] = K.towardViewer(P);
  return Array.from({ length: count }, (_, i) => {
    const angles = Array.from({ length: 7 }, (_, j) => O.TAU * (i + j / 6) / count);
    const arc = (r) => angles.map((angle) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    const outer = arc(r1);
    const inner = arc(r0);
    const polygon = [...outer, ...inner.slice().reverse()];
    const angle = O.TAU * (i + 0.5) / count;
    const front = Math.cos(angle) * vx + Math.sin(angle) * vy > 0;
    const paths = K.extrude(polygon, z, h, P, { convex: false });
    paths.outline = K.onTop(outer, z + h, P) + K.onTop(inner, z + h, P) + K.onTop(front ? outer : inner, z, P);
    paths.crease = "";
    return { name: `${name}.${i}`, at: [cx + (r0 + r1) / 2 * Math.cos(angle), cy + (r0 + r1) / 2 * Math.sin(angle), z + h / 2], svg: solid(paths), shape: { type: "extruded", polygon, z, h } };
  });
}

export function orbitTracks(mode, eccentricity = 0.094, P = PROJECTION) {
  const tracks = [];
  if (mode === 0) {
    for (const radius of [30, 58, 85, 119, 198, 231]) tracks.push(line(K.ring(0, 0, radius, 3.1, P, 160), "lo"));
    return wrap(tracks.join(""), "enamel");
  }
  for (const planet of O.PLANETS) {
    const e = mode === 1 ? 0 : planet.id === "mars" ? eccentricity : planet.e;
    const points = Array.from({ length: 181 }, (_, index) => {
      const theta = O.TAU * index / 180;
      return [planet.radius * (Math.cos(theta) - e), planet.radius * Math.sqrt(1 - e * e) * Math.sin(theta)];
    });
    tracks.push(`<g data-orbit="${planet.id}" class="orbit-track">${line(path(points, 3.2, P), planet.id === "mars" ? "mid" : "lo")}</g>`);
  }
  return wrap(tracks.join(""), "enamel");
}

export function areaSectors(time, eccentricity, P = PROJECTION) {
  const planet = O.PLANETS[3];
  return [time, time + O.period(planet) / 2].map((start) => {
    const points = [[0, 0], ...Array.from({ length: 21 }, (_, i) => {
      const s = O.orbit(planet, start + 0.12 * i / 20, eccentricity);
      return [s.x / planet.a * planet.radius, s.y / planet.a * planet.radius];
    })];
    return `<path class="swept-area" d="${path(points, 3.4, P)}"/>`;
  }).join("");
}

export function mechanismItems(mode, time, eccentricity = 0.094, P = PROJECTION) {
  const items = [];
  const bodies = O.bodyPositions(mode, time, eccentricity);
  const cylinder = (name, x, y, r, z, h, material = "brass", extra = "") => {
    items.push({ name, at: [x, y, z + h / 2], svg: solid(K.cylinder(x, y, r, z, h, P, 40, 0.3), material, extra), shape: { type: "cylinder", x, y, r, z, h } });
  };
  cylinder("center.cup", 0, 0, 23, 3, 6, "brass");
  cylinder("center.lower", 0, 0, 16, 9, 6, "brass");
  const levels = [...new Set([15, ...bodies.flatMap((planet) => [planet.z, planet.z + 2]), 39, 100, 106, 134])].sort((a, b) => a - b);
  for (let i = 0; i < levels.length - 1; i++) {
    const z = levels[i];
    const h = levels[i + 1] - z;
    if (bodies.some((planet) => z >= planet.z && z < planet.z + 2)) continue;
    cylinder(`center.shaft.${i}`, 0, 0, z < 39 ? 10 : 3.7, z, h, "brass");
  }
  cylinder("center.crown", 0, 0, 6.5, 134, 4, "brass", line(K.knurl(0, 0, 6.5, 134, 138, 30, P), "mid"));
  const central = { id: mode === 0 ? "earth" : "sun", globe: mode === 0 ? 12 : 16, material: mode === 0 ? "earth" : "sun" };
  const centerZ = 138 + central.globe;
  items.push({ name: "center.globe", at: [0, 0, centerZ], svg: `<g transform="${K.translateAlong(P, [0, 0, 130])}">${sphereTemplate(central, P)}</g>`, shape: { type: "ball", at: [0, 0, centerZ], r: central.globe } });
  for (const planet of bodies) {
    const main = planet.id === "mars" && mode === 0 ? [planet.cx, planet.cy] : [planet.x, planet.y];
    const radius = Math.hypot(...main);
    const direction = main.map((n) => n / radius);
    cylinder(`hub.${planet.id}`, 0, 0, 13, planet.z, 2, "brass");
    items.push(...beamPieces(direction.map((n) => n * 13), main.map((n, i) => n - direction[i] * 3.5), planet.z, P, `arm.${planet.id}`));
    let carrierZ = planet.z;
    if (planet.id === "mars" && mode === 0) {
      cylinder("epicycle.pivot", planet.cx, planet.cy, 3.5, planet.z, 6, "brass");
      items.push(...ringPieces(planet.cx, planet.cy, 71, 73, 104, 2, P, "epicycle.ring"));
      for (let spoke = 0; spoke < 3; spoke++) {
        const angle = spoke * O.TAU / 3 + planet.angular;
        const direction = [Math.cos(angle), Math.sin(angle)];
        items.push(...beamPieces([planet.cx + direction[0] * 3.5, planet.cy + direction[1] * 3.5], [planet.cx + direction[0] * 71, planet.cy + direction[1] * 71], 104, P, `epicycle.spoke.${spoke}`, 1.7));
      }
      const epicycleDirection = [(planet.x - planet.cx) / 72, (planet.y - planet.cy) / 72];
      items.push(...beamPieces([planet.cx + epicycleDirection[0] * 3.5, planet.cy + epicycleDirection[1] * 3.5], [planet.x - epicycleDirection[0] * 3.5, planet.y - epicycleDirection[1] * 3.5], 106, P, "epicycle.arm"));
      carrierZ = 108;
    }
    const globeZ = carrierZ + 8 + planet.globe;
    if (planet.id === "saturn") items.push(...ringPieces(planet.x, planet.y, planet.globe, planet.globe * 1.62, globeZ - 0.3, 0.6, P, "saturn.ring", 16));
    const translate = K.translateAlong(P, [planet.x, planet.y, carrierZ]);
    const extra = planet.id === "mars" ? `<circle class="selection-halo" cx="${K.iso([0, 0, 8 + planet.globe], P)[0]}" cy="${K.iso([0, 0, 8 + planet.globe], P)[1]}" r="${(planet.globe + 4) * G.scaleOf(P)}"/>` : "";
    items.push({ name: `planet.${planet.id}`, id: planet.id, at: [planet.x, planet.y, globeZ], svg: `<g class="planet-object" data-body="${planet.id}" transform="${translate}">${carrierTemplate(planet, P)}${extra}<circle class="planet-hit" cx="${K.iso([0, 0, 8 + planet.globe], P)[0]}" cy="${K.iso([0, 0, 8 + planet.globe], P)[1]}" r="${Math.max(14, (planet.globe + 5) * G.scaleOf(P))}"/></g>`, shape: { type: "ball", at: [planet.x, planet.y, globeZ], r: planet.globe }, carrier: { x: planet.x, y: planet.y, z: carrierZ } });
  }
  return paintOrder(items, P);
}

export function mechanismSvg(mode, time, eccentricity = 0.094, P = PROJECTION) {
  return mechanismItems(mode, time, eccentricity, P).map((item) => `<g data-piece="${item.name}">${item.svg}</g>`).join("");
}
