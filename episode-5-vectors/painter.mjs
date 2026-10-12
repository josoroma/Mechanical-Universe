import * as K from "./kit/iso-kit.mjs";

// All machine solids are convex extrusions perpendicular to the table.
// A separating plane determines which solid a camera ray reaches first.
const dot = (p, n) => p[0] * n[0] + p[1] * n[1];
function hull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (values) => { const out = []; for (const p of values) { while (out.length > 1 && cross(out.at(-2), out.at(-1), p) <= 0) out.pop(); out.push(p); } return out.slice(0, -1); };
  return [...half(sorted), ...half([...sorted].reverse())];
}
function axes(poly) { return poly.map((p, i) => { const q = poly[(i + 1) % poly.length]; return [p[1] - q[1], q[0] - p[0]]; }); }
const extent = (poly, n) => { let lo = Infinity, hi = -Infinity; for (const p of poly) { const t = dot(p, n); lo = Math.min(lo, t); hi = Math.max(hi, t); } return [lo, hi]; };
function projectedOverlap(a, b) {
  if (a.bounds[2] < b.bounds[0] || b.bounds[2] < a.bounds[0] || a.bounds[3] < b.bounds[1] || b.bounds[3] < a.bounds[1]) return false;
  for (const n of [...a.screenAxes, ...b.screenAxes]) {
    const [loA, hiA] = extent(a.screen, n), [loB, hiB] = extent(b.screen, n);
    if (hiA < loB - 1e-7 || hiB < loA - 1e-7) return false;
  }
  return true;
}
export function geometry(part, projection) {
  const s = part.shape;
  let polygon, z0, z1, circle = null;
  if (s.type === "cylinder") {
    circle = { x: s.x, y: s.y, r: s.r };
    polygon = Array.from({ length: 32 }, (_, i) => [s.x + s.r * Math.cos(i * Math.PI / 16), s.y + s.r * Math.sin(i * Math.PI / 16)]);
    z0 = s.z; z1 = s.z + s.h;
  } else if (s.type === "slab") { polygon = K.roundedPlan(s.plan, 8); z0 = s.z; z1 = s.z + s.h; }
  else {
    polygon = s.polygon.map(([x, y]) => [s.F.o[0] + x * s.F.u[0] + y * s.F.v[0], s.F.o[1] + x * s.F.u[1] + y * s.F.v[1]]);
    z0 = s.s0; z1 = s.s1;
  }
  const screen = hull(polygon.flatMap(([x, y]) => [K.iso([x, y, z0], projection), K.iso([x, y, z1], projection)]));
  const xs = screen.map((p) => p[0]), ys = screen.map((p) => p[1]);
  return { name: part.name, polygon, circle, z0, z1, screen, screenAxes: axes(screen), bounds: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], depth: K.depthOf(part.at, projection) };
}
function interval(s, n) {
  if (!s.circle) return extent(s.polygon, n);
  const c = dot([s.circle.x, s.circle.y], n), radius = s.circle.r * Math.hypot(...n);
  return [c - radius, c + radius];
}
function relation(a, b, view) {
  if (a.z1 <= b.z0 + 1e-7) return 1;
  if (b.z1 <= a.z0 + 1e-7) return -1;
  const candidates = [...axes(a.polygon), ...axes(b.polygon)];
  if (a.circle && b.circle) candidates.push([b.circle.x - a.circle.x, b.circle.y - a.circle.y]);
  else if (a.circle) for (const p of b.polygon) candidates.push([p[0] - a.circle.x, p[1] - a.circle.y]);
  else if (b.circle) for (const p of a.polygon) candidates.push([p[0] - b.circle.x, p[1] - b.circle.y]);
  for (const n of candidates) {
    const size = Math.hypot(...n); if (size < 1e-8) continue;
    const [loA, hiA] = interval(a, n), [loB, hiB] = interval(b, n), toward = dot(view, n);
    if (Math.abs(toward) < size * 1e-8) continue;
    if (hiA <= loB + 1e-7) return toward > 0 ? 1 : -1;
    if (hiB <= loA + 1e-7) return toward > 0 ? -1 : 1;
  }
  throw new Error(`Sólidos sin plano separador: ${a.name} / ${b.name}`);
}
export function orderParts(parts, projection, cache = new WeakMap()) {
  const shapes = parts.map((part) => {
    // Fixed parts retain their geometry object across frames.
    if (!cache.has(part)) cache.set(part, geometry(part, projection));
    return cache.get(part);
  });
  const forward = shapes.map(() => []), degree = shapes.map(() => 0), view = K.towardViewer(projection);
  for (let i = 0; i < shapes.length; i++) for (let j = i + 1; j < shapes.length; j++) {
    if (!projectedOverlap(shapes[i], shapes[j])) continue;
    const nearB = relation(shapes[i], shapes[j], view) > 0;
    const from = nearB ? i : j, to = nearB ? j : i;
    forward[from].push(to); degree[to]++;
  }
  const ready = degree.flatMap((n, i) => n === 0 ? [i] : []), order = [];
  while (ready.length) {
    ready.sort((a, b) => shapes[b].depth - shapes[a].depth);
    const i = ready.pop(); order.push(shapes[i].name);
    for (const j of forward[i]) if (--degree[j] === 0) ready.push(j);
  }
  if (order.length !== parts.length) throw new Error("Ciclo de profundidad: hay que dividir una pieza.");
  return order;
}
