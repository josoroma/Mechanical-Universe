import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as O from "./model.mjs";

export const WIDTH = 1020;
export const HEIGHT = 680;
export const SCALE = 60;
export const BASELINE = 80;
export const PROJECTION = K.fitProjection([...K.boxCorners({ x: -244, y: -73, w: 489, d: 206 }, -28, 24), [-192, -45, 255], [192, -23, 255]], WIDTH, HEIGHT, { pad: 65, azimuth: 77, elevation: 31 });
const P = PROJECTION;
const FRONT = G.frameOf([0, 0, 0], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
const line = (d, tone = "lo") => K.lineSvg(d, { tone });
const stroke = (points, tone = "lo") => line(K.pathOf(points.map((p) => K.iso(p, P))), tone);
const solid = (paths, material, inner = "") => `<g class="material-${material}">${K.solidSvg(paths, { tone: "hi", inner })}</g>`;
const spheres = new Map();
export function rollerPosition(profile, x, second = false) {
  const slope = O.derivativeAt(profile, x), length = Math.hypot(1, slope);
  return [x * SCALE - 4 * slope / length, second ? -39 : -28, BASELINE + O.valueAt(profile, x) * SCALE + 4 / length];
}
export function rollerSvg(at, second = false) {
  const material = second ? "copper" : "silver";
  if (!spheres.has(material)) spheres.set(material, solid(G.sphereOf([0, 0, 0], 4, P, { steps: 64 }), material));
  return `<g transform="${K.translateAlong(P, at)}">${spheres.get(material)}</g>`;
}
export const position = (x, y) => [x * SCALE, 0, BASELINE + y * SCALE];
export function barPart(state) {
  const snap = O.snapshot(state);
  const [x, , z] = position(snap.x, snap.y);
  const c = Math.cos(snap.angle), s = Math.sin(snap.angle);
  const F = G.frameOf([x, 0, z], [0, -1, 0], [c, 0, s], [-s, 0, c]);
  const polygon = [[-88, -2.2], [88, -2.2], [91, 0], [88, 2.2], [-88, 2.2], [-91, 0]];
  let ticks = "";
  for (let i = -8; i <= 8; i++) {
    if (!i) continue;
    const a = i * 10;
    ticks += stroke([[x + c * a - s * 2.2, 54, z + s * a + c * 2.2], [x + c * a - s * (i % 2 ? 0.4 : -0.8), 54, z + s * a + c * (i % 2 ? 0.4 : -0.8)]], "mid");
  }
  return { name: "rule", at: [x, 52.5, z], svg: solid(G.prismOf(F, polygon, -54, -51, P), state.mode === "secant" ? "brass" : "copper", ticks), shape: { type: "prism", F, polygon, s0: -54, s1: -51 } };
}
export function stemPart(state) {
  const snap = O.snapshot(state), [x, , z] = position(snap.x, snap.y);
  const h = z - 26 - 39;
  return { name: "follower.stem", at: [x, 47, 39 + h / 2], svg: solid(K.cylinder(x, 47, 3, 39, h, P, 40, 0.3), "silver"), shape: { type: "cylinder", x, y: 47, r: 3, z: 39, h } };
}
export function markerPart(state) {
  const snap = O.snapshot(state), [x, , z] = position(snap.x + snap.h, snap.nextY);
  const F = G.frameOf([x, 0, z], FRONT.a, FRONT.u, FRONT.v);
  return { name: "point.second", at: [x, -22.7, z], svg: solid(G.disc(22.4, 23, 0.5, F, P), "copper"), shape: { type: "disc", F, s0: 22.4, s1: 23, r: 0.5 } };
}
export function scene(state = O.DEFAULTS) {
  const parts = [];
  const put = (name, at, svg, shape) => parts.push({ name, at, svg, shape });
  const cylinder = (name, x, y, r, z, h, material = "brass", inner = "") => put(name, [x, y, z + h / 2], solid(K.cylinder(x, y, r, z, h, P, 48, 0.5), material, inner), { type: "cylinder", x, y, r, z, h });
  const slab = (name, plan, z, h, material = "brass", inner = "") => put(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], solid(K.slabOf(plan, z, h, P, 8, 0.6), material, inner), { type: "slab", plan, z, h });
  const rect = (name, x, y, w, d, z, h, material = "brass", inner = "") => slab(name, { x, y, w, d, r: 0 }, z, h, material, inner);
  const disc = (name, F, s0, s1, r, material = "brass", inner = "") => put(name, F.o.map((v, i) => v + F.a[i] * (s0 + s1) / 2), solid(G.disc(s0, s1, r, F, P), material, inner), { type: "disc", F, s0, s1, r });
  const screw = (name, x, y, z, r = 2.1) => cylinder(name, x, y, r, z, 0.7, "silver", line(K.lineOnTop([x - r * 0.8, y], [x + r * 0.8, y], z + 0.7, P), "mid"));
  const feet = [[-210, -42], [210, -42], [-210, 101], [210, 101]];
  for (const [i, [x, y]] of feet.entries()) {
    cylinder(`stand.pad.${i}`, x, y, 14, -27, 4, "iron");
    cylinder(`foot.shoe.${i}`, x, y, 11, -23, 4);
    cylinder(`foot.body.${i}`, x, y, 8, -19, 17, "wood", line(K.knurl(x, y, 8, -19, -2, 28, P, 0.4)));
    cylinder(`foot.collar.${i}`, x, y, 13, -2, 4);
  }
  const plan = { x: -240, y: -70, w: 480, d: 200, r: 15 };
  slab("base.lower", plan, 2, 3);
  slab("base.wood", plan, 5, 15, "wood", line(K.sideSeam(plan, 8, P)) + line(K.sideSeam(plan, 17, P)));
  slab("base.upper", plan, 20, 2, "enamel");
  feet.forEach(([x, y], i) => screw(`base.screw.${i}`, x, y, 22));
  const plaque = { x: -48, y: 104, w: 96, d: 18, r: 2 };
  slab("plaque", plaque, 22, 0.8, "brass", line(K.planOutline(K.insetPlan(plaque, 1.5), 22.8, P)) + K.faceTextSvg(K.topMatrix([0, 113], 22.8, P), "DERIVADAS · III", { anchor: "middle", size: 3.6, tone: "hi" }));
  screw("plaque.screw.0", -43, 113, 22.8, 1);
  screw("plaque.screw.1", 43, 113, 22.8, 1);
  for (const [i, x] of [-160, 160].entries()) {
    rect(`profile.foot.${i}`, x - 15, -53, 30, 39, 22, 4, "brass");
    rect(`profile.pedestal.${i}`, x - 10, -45, 20, 22, 26, 10, "iron");
    screw(`profile.screw.${i}.back`, x, -49, 26, 1.6);
    screw(`profile.screw.${i}.front`, x, -18, 26, 1.6);
  }
  const curve = Array.from({ length: 161 }, (_, i) => { const x = -3.2 + i * 6.4 / 160; return [x * SCALE, BASELINE + O.valueAt(state.profile, x) * SCALE]; });
  const polygon = [[-192, 36], [192, 36], ...[...curve].reverse()];
  const paths = G.prismOf(FRONT, polygon, 23, 45, P);
  paths.fill = "";
  paths.outline = K.pathOf(polygon.map(([x, z]) => K.iso([x, -23, z], P)), true) + K.pathOf(curve.map(([x, z]) => K.iso([x, -45, z], P))) + K.pathOf([[192, -23, 36], [192, -45, 36], [192, -45, curve.at(-1)[1]], [192, -23, curve.at(-1)[1]]].map((p) => K.iso(p, P)));
  const light = G.lightOf(P);
  const finish = curve.slice(1).map(([x, z], i) => {
    const [left, low] = curve[i];
    const normal = G.unit3([-(z - low) / (x - left), 0, 1]);
    const tone = Math.max(0, Math.min(100, 54 + 38 * G.dot3(normal, light)));
    const color = `color-mix(in srgb,var(--wood-1),var(--wood-top) ${tone.toFixed(2)}%)`;
    const d = K.pathOf([[left, -45, low], [x, -45, z], [x, -23, z], [left, -23, low]].map((p) => K.iso(p, P)), true);
    return `<path d="${d}" style="fill:${color};stroke:${color};stroke-width:.25;stroke-linejoin:round"/>`;
  }).join("");
  put("profile.cam", [0, -34, 108], solid(paths, "wood", finish), { type: "prism", F: FRONT, polygon, s0: 23, s1: 45 });
  for (const second of [false, true]) {
    const at = rollerPosition(state.profile, state.x + (second ? state.h : 0), second);
    put(second ? "roller.second" : "roller.first", at, rollerSvg(at, second), { type: "ball", at, r: 4 });
  }
  for (const [i, x] of [-160, 160].entries()) {
    rect(`profile.clamp.${i}`, x - 9, -23, 18, 3, 36, 9, "brass");
    const F = G.frameOf([x, 0, 40.5], FRONT.a, FRONT.u, FRONT.v);
    disc(`profile.clamp.screw.${i}`, F, 19, 20, 2.2, "silver", line(G.circleOf(F, 19, 1.1, P), "mid"));
  }
  for (const [i, y] of [38, 78].entries()) {
    rect(`guide.${i}`, -204, y, 408, 5, 22, 4, "silver");
    for (const [j, x] of [-214, 204].entries()) {
      rect(`guide.stop.${i}.${j}`, x, y - 3, 10, 11, 22, 9, "iron");
      screw(`guide.stop.screw.${i}.${j}`, x + 5, y + 2.5, 31, 1.8);
    }
  }
  const snap = O.snapshot(state), [x, , z] = position(snap.x, snap.y);
  slab("carriage.body", { x: x - 16, y: 34, w: 32, d: 51, r: 3 }, 26, 6, "enamel");
  for (const [i, dx] of [-10, 10].entries()) for (const [j, y] of [39, 79].entries()) {
    rect(`carriage.pad.${i}.${j}`, x + dx - 3.5, y - 3.5, 7, 7, 32, 3, "brass");
    screw(`carriage.screw.${i}.${j}`, x + dx, y, 35, 1.6);
  }
  cylinder("carriage.socket", x, 47, 8, 32, 4, "brass");
  cylinder("carriage.collar", x, 47, 5, 36, 3, "iron");
  parts.push(stemPart(state));
  const D = G.frameOf([x, 0, z], FRONT.a, FRONT.u, FRONT.v);
  disc("point.first", D, 22.4, 23, 0.5, "brass");
  disc("follower.shaft", D, -43, 22.4, 0.5, "silver");
  disc("dial.case", D, -49, -43, 26, "brass");
  let dialTicks = line(G.circleOf(D, -51, 23.2, P), "mid");
  for (let i = 0; i < 60; i++) {
    const a = i * Math.PI / 30;
    const r = i % 5 ? 21.7 : 19.5;
    dialTicks += stroke([[x + 23.2 * Math.cos(a), 51, z + 23.2 * Math.sin(a)], [x + r * Math.cos(a), 51, z + r * Math.sin(a)]], i % 5 ? "lo" : "mid");
  }
  disc("dial.face", D, -51, -49, 25, "ivory", dialTicks);
  parts.push(barPart(state));
  disc("dial.hub", D, -57, -54, 5.5, "brass", line(G.circleOf(D, -57, 3.7, P), "mid"));
  disc("dial.screw", D, -57.8, -57, 2.3, "silver", stroke([[x - 2, 57.8, z], [x + 2, 57.8, z]], "mid"));
  parts.push(markerPart(state));
  for (const [i, end] of [-1, 1].entries()) {
    rect(`drive.mount.${i}`, (end < 0 ? -210 : 240) - 9, 104, 18, 15, 22, 4, "brass");
    const F = G.frameAlong([0, 111.5, 32], [1, 0, 0]);
    disc(`drive.bearing.${i}`, F, end < 0 ? -219 : 240, end < 0 ? -210 : 249, 6, "iron");
  }
  const drive = G.frameAlong([0, 111.5, 32], [1, 0, 0]);
  let threads = "";
  for (let i = -68; i <= 68; i++) threads += line(G.circleOf(drive, i * 3, 2.5, P, 16), "lo");
  disc("drive.screw", drive, -210, 240, 2.5, "silver", threads);
  disc("drive.neck", drive, 249, 255, 3, "brass");
  disc("drive.wheel", drive, 255, 261, 15, "brass", line(G.circleOf(drive, 261, 12, P), "mid"));
  disc("drive.hub", drive, 261, 264, 5, "iron");
  disc("drive.cap", drive, 264, 265, 2.5, "silver");
  const rule = { x: -190, y: 98, w: 380, d: 5, r: 0.4 };
  const t = K.topTicks(-180, 180, 6, 5, 98, 22.6, [2, 4], P);
  slab("base.ruler", rule, 22, 0.6, "brass", line(t.minor) + line(t.major, "mid"));
  return parts;
}
export function svgParts(parts, order) {
  const keys = new Map(order.map((name, i) => [name, i]));
  return [...parts].sort((a, b) => keys.get(a.name) - keys.get(b.name)).map((part) => `<g data-part="${part.name}">${part.svg}</g>`).join("");
}
