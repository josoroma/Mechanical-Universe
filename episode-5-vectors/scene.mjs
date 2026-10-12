import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as O from "./model.mjs";

export const WIDTH = 1020, HEIGHT = 680, SCALE = 60;
export const PLAN = { x: -195, y: -195, w: 390, d: 390, r: 18 };
export const PROJECTION = K.fitProjection(K.boxCorners(PLAN, -26, 90), WIDTH, HEIGHT, { pad: 65, azimuth: 38, elevation: 51 });
const P = PROJECTION;
const line = (d, tone = "lo") => K.lineSvg(d, { tone });
const solid = (paths, material, inner = "", lit = false) => `<g class="material-${material}">${K.solidSvg(paths, { tone: "hi", inner, lit })}</g>`;
const cylinderCache = new Map();
const capsule = (start, end, r) => [...Array.from({ length: 9 }, (_, i) => { const a = Math.PI / 2 + i * Math.PI / 8; return [start + r * Math.cos(a), r * Math.sin(a)]; }), ...Array.from({ length: 9 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 8; return [end + r * Math.cos(a), r * Math.sin(a)]; })];
const Fxy = (at, angle) => { const a = O.radians(angle); return G.frameOf([at[0], at[1], 0], [0, 0, 1], [Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0]); };
const localPoint = (F, x, y, z) => [F.o[0] + F.u[0] * x + F.v[0] * y, F.o[1] + F.u[1] * x + F.v[1] * y, z];
const lineLocal = (F, a, b, z, tone = "lo") => line(K.pathOf([localPoint(F, ...a, z), localPoint(F, ...b, z)].map((p) => K.iso(p, P))), tone);

function constructors(parts) {
  const put = (name, at, svg, shape) => parts.push({ name, at, svg, shape });
  const cylinder = (name, x, y, r, z, h, material = "brass", detail = "") => {
    const key = `${name}/${r}/${z}/${h}/${material}/${detail}`;
    if (!cylinderCache.has(key)) {
      let inner = detail === "knurl" ? line(K.knurl(0, 0, r, z, z + h, 32, P, 0.5)) : detail === "screw" ? line(K.lineOnTop([-r * 0.8, 0], [r * 0.8, 0], z + h, P), "mid") : detail === "ring" ? line(K.ring(0, 0, r - 2, z + h, P), "mid") : "";
      if (detail === "dial") {
        inner = [21, 24, 27].map((radius) => line(K.ring(0, 0, radius, z + h, P), "lo")).join("");
        for (let i = 0; i < 36; i++) {
          const a = i * Math.PI / 18, radius = i % 3 ? 24 : 21;
          inner += line(K.lineOnTop([27 * Math.cos(a), 27 * Math.sin(a)], [radius * Math.cos(a), radius * Math.sin(a)], z + h, P), i % 3 ? "lo" : "mid");
        }
      }
      cylinderCache.set(key, solid(K.cylinder(0, 0, r, z, h, P, 48, 0.4), material, inner));
    }
    put(name, [x, y, z + h / 2], `<g transform="${K.translateAlong(P, [x, y, 0])}">${cylinderCache.get(key)}</g>`, { type: "cylinder", x, y, r, z, h });
  };
  const slab = (name, plan, z, h, material = "brass", inner = "") => put(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], solid(K.slabOf(plan, z, h, P, 8, 0.5), material, inner), { type: "slab", plan, z, h });
  const prism = (name, F, polygon, z, h, material, inner = "", lit = false) => {
    const center = polygon.reduce((v, p) => [v[0] + p[0] / polygon.length, v[1] + p[1] / polygon.length], [0, 0]);
    put(name, localPoint(F, ...center, z + h / 2), solid(G.prismOf(F, polygon, z, z + h, P), material, inner, lit), { type: "prism", F, polygon, s0: z, s1: z + h });
  };
  const screw = (name, x, y, z, r = 1.7) => cylinder(name, x, y, r, z, 0.65, "silver", "screw");
  return { put, cylinder, slab, prism, screw };
}
let fixed;
export function fixedParts() {
  if (fixed) return fixed;
  const parts = [], { cylinder, slab, prism, screw } = constructors(parts);
  const feet = [[-170, -170], [170, -170], [-170, 170], [170, 170]];
  feet.forEach(([x, y], i) => {
    cylinder(`stand.pad.${i}`, x, y, 17, -26, 4, "iron");
    cylinder(`foot.shoe.${i}`, x, y, 14, -22, 4);
    cylinder(`foot.body.${i}`, x, y, 10, -18, 16, "wood", "knurl");
    cylinder(`foot.collar.${i}`, x, y, 16, -2, 4);
  });
  slab("base.lower", PLAN, 2, 3);
  slab("base.wood", PLAN, 5, 15, "wood", line(K.sideSeam(PLAN, 8, P)) + line(K.sideSeam(PLAN, 17, P)));
  slab("base.upper", PLAN, 20, 2, "enamel", line(K.planOutline(K.insetPlan(PLAN, 9), 22, P)));
  feet.forEach(([x, y], i) => screw(`base.screw.${i}`, x, y, 22, 2.5));
  const plaque = { x: -55, y: 180, w: 110, d: 12, r: 2 };
  slab("plaque", plaque, 22, 0.8, "brass", line(K.planOutline(K.insetPlan(plaque, 1.2), 22.8, P)) + K.faceTextSvg(K.topMatrix([0, 186], 22.8, P), "VECTORES · V", { anchor: "middle", size: 4, tone: "hi" }));
  screw("plaque.screw.0", -49, 186, 22.8, 1);
  screw("plaque.screw.1", 49, 186, 22.8, 1);
  for (const [axis, angle, reach] of [["x", 0, 175], ["y", 90, 135]]) {
    const F = Fxy([0, 0], angle);
    for (const sign of [-1, 1]) {
      const lo = sign < 0 ? -reach : 34, hi = sign < 0 ? -34 : reach;
      let ticks = lineLocal(F, [lo, 0], [hi, 0], 22.7);
      for (let t = Math.ceil(lo / 6) * 6; t <= hi; t += 6) ticks += lineLocal(F, [t, -3], [t, t % 30 === 0 ? 3 : 0], 22.7, t % 30 === 0 ? "mid" : "lo");
      prism(`axis.${axis}.${sign}`, F, [[lo, -3], [hi, -3], [hi, 3], [lo, 3]], 22, 0.7, "brass", ticks);
    }
  }
  for (const [i, cx] of [-90, 90].entries()) {
    const plan = { x: cx - 73, y: 146, w: 146, d: 26, r: 4 };
    slab(`meter.case.${i}`, plan, 22, 4, "brass");
    const face = { x: cx - 64, y: 149, w: 128, d: 20, r: 1.5 };
    let ticks = [153, 157].map((y) => line(K.lineOnTop([cx - 64, y], [cx + 64, y], 27, P))).join("");
    for (let t = -5; t <= 5; t += 0.25) {
      const x = cx + t * 11;
      ticks += line(K.lineOnTop([x, 149], [x, Number.isInteger(t) ? 157 : 153], 27, P), t === 0 ? "hi" : Number.isInteger(t) ? "mid" : "lo");
    }
    slab(`meter.face.${i}`, face, 26, 1, "ivory", ticks);
    for (const [j, x] of [cx - 69, cx + 69].entries()) screw(`meter.screw.${i}.${j}`, x, 159, 26, 1.8);
  }
  cylinder("origin.foot", 0, 0, 30, 22, 5, "brass", "dial");
  cylinder("origin.stem", 0, 0, 9, 27, 5, "iron");
  cylinder("origin.separator.lower", 0, 0, 5, 34, 12, "brass");
  cylinder("origin.separator.upper", 0, 0, 5, 48, 30, "iron");
  cylinder("origin.spool", 0, 0, 12, 80, 5, "brass", "ring");
  cylinder("origin.knob", 0, 0, 8, 85, 5, "brass", "knurl");
  screw("origin.screw", 0, 0, 90, 2.2);
  fixed = parts;
  return fixed;
}
export function movingParts(state = O.DEFAULTS) {
  const snap = O.snapshot(state), parts = [], { cylinder, prism, screw } = constructors(parts);
  const A = [snap.A.x * SCALE, snap.A.y * SCALE], B = [snap.B.x * SCALE, snap.B.y * SCALE], R = [snap.R.x * SCALE, snap.R.y * SCALE];
  const links = [["a", [0, 0], snap.angleA, state.a * SCALE, 32, "brass"], ["b", [0, 0], snap.angleB, state.b * SCALE, 46, "copper"], ["copy-b", A, snap.angleB, state.b * SCALE, 46, "copper"], ["copy-a", B, snap.angleA, state.a * SCALE, 60, "brass"]];
  for (const [id, at, angle, length, z, material] of links) {
    const F = Fxy(at, angle);
    prism(`arm.${id}.bed`, F, capsule(0, 76, 8), z, 2, material);
    for (const [side, y] of [["left", -7], ["right", 3]]) {
      prism(`arm.${id}.${side}`, F, [[6, y], [80, y], [80, y + 4], [6, y + 4]], z + 2, 4, material);
      const p = localPoint(F, 72, y + 2, z + 6);
      screw(`arm.${id}.screw.${side}`, p[0], p[1], z + 6, 1.1);
    }
    let ticks = lineLocal(F, [length - 82.5, 0], [length + 2.5, 0], z + 5);
    for (let offset = 6; offset < 76; offset += 6) {
      const t = length - 80 + offset;
      ticks += lineLocal(F, [t, -2.5], [t, offset % 30 === 0 ? 2.5 : 0], z + 5, offset % 30 === 0 ? "mid" : "lo");
    }
    prism(`arm.${id}.slide`, F, capsule(length - 80, length, 2.5), z + 2, 3, "silver", ticks);
  }
  for (const [id, at, z] of [["a", A, 37], ["b", B, 51]]) {
    cylinder(`joint.${id}.knob`, ...at, 6, z, 4, id === "a" ? "brass" : "copper", "knurl");
    cylinder(`joint.${id}.neck`, ...at, 4, z + 4, 5, "iron");
  }
  cylinder("joint.r.lower", ...R, 4, 51, 11, "iron");
  cylinder("joint.r.cap", ...R, 7, 65, 4, "brass", "ring");
  cylinder("joint.r.upper", ...R, 4, 69, 9, "iron");
  const F = Fxy([0, 0], snap.R.direction ?? 0), length = snap.R.magnitude * SCALE;
  prism("result.tape", F, [[0, -2.5], [length, -2.5], [length, 2.5], [0, 2.5]], 78, 2, "silver", "", true);
  prism("result.tip", F, [[length - 13, -6], [length, 0], [length - 13, 6]], 80, 3, "silver", "", true);
  const p = localPoint(F, length - 8, 0, 83);
  screw("result.screw", p[0], p[1], 83, 1.3);
  for (const [i, value] of [snap.R.x, snap.R.y].entries()) {
    const x = (i ? 90 : -90) + value * 11, F = Fxy([x, 0], 0);
    prism(`meter.cursor.${i}`, F, [[-3, 168], [-3, 161], [0, 156], [3, 161], [3, 168]], 27, 2, "iron");
    screw(`meter.cursor.screw.${i}`, x, 164, 29, 1.3);
  }
  return parts;
}
export const scene = (state = O.DEFAULTS) => [...fixedParts(), ...movingParts(state)];
export function svgParts(parts, order) {
  const keys = new Map(order.map((name, i) => [name, i]));
  return [...parts].sort((a, b) => keys.get(a.name) - keys.get(b.name)).map((part) => `<g data-part="${part.name}">${part.svg}</g>`).join("");
}
