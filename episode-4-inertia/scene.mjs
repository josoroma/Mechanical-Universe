import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as O from "./model.mjs";

export const WIDTH = 1020;
export const HEIGHT = 680;
export const SCALE = 60;
export const START_X = -180;
export const WHEEL_RADIUS = 15;
export const PIVOT_HEIGHT = 250;
export const PROJECTION = K.fitProjection([...K.boxCorners({ x: -350, y: -80, w: 700, d: 180 }, -27, 22), [-250, -20, 283], [250, 22, 283]], WIDTH, HEIGHT, { pad: 65, azimuth: 70, elevation: 31 });
const P = PROJECTION;
const FRONT = G.frameOf([0, 0, 0], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
const line = (d, tone = "lo") => K.lineSvg(d, { tone });
const stroke = (points, tone = "lo") => line(K.pathOf(points.map((p) => K.iso(p, P))), tone);
const solid = (paths, material, inner = "") => `<g class="material-${material}">${K.solidSvg(paths, { tone: "hi", inner })}</g>`;
export const cartCenter = (snap) => START_X + snap.position * SCALE;
export const bobCenter = (state, snap = O.snapshot(state)) => [cartCenter(snap) + snap.displacement * SCALE, 22, PIVOT_HEIGHT + snap.bobHeight * SCALE];
let sphere;
export function bobPart(state, snap = O.snapshot(state)) {
  const at = bobCenter(state, snap);
  if (!sphere) sphere = solid(G.sphereOf([0, 0, 0], 11, P, { steps: 72 }), "brass");
  return { name: "pendulum.bob", at, svg: `<g transform="${K.translateAlong(P, at)}">${sphere}</g>`, shape: { type: "ball", at, r: 11 } };
}
export function rodPart(state, snap = O.snapshot(state)) {
  const x = cartCenter(snap), c = Math.cos(snap.angle), s = Math.sin(snap.angle);
  const F = G.frameOf([x, 0, PIVOT_HEIGHT], FRONT.a, [c, 0, s], [-s, 0, c]);
  const length = state.length * SCALE - 11;
  const polygon = [[-1.1, 0], [1.1, 0], [1.1, -length], [-1.1, -length]];
  return { name: "pendulum.rod", at: [x + s * length / 2, 22, PIVOT_HEIGHT - c * length / 2], svg: solid(G.prismOf(F, polygon, -23, -21, P), "silver"), shape: { type: "prism", F, polygon, s0: -23, s1: -21 } };
}
export function wheelSpokes(index, angle = 0) {
  const x = START_X + (index < 2 ? -50 : 50), y = index % 2 ? 43 : -43;
  let d = "";
  for (let i = 0; i < 6; i++) {
    const a = angle + i * Math.PI / 3;
    d += K.pathOf([[x + 4 * Math.cos(a), y, 43 + 4 * Math.sin(a)], [x + 12 * Math.cos(a), y, 43 + 12 * Math.sin(a)]].map((p) => K.iso(p, P)));
  }
  return d;
}
export function scene(state = O.DEFAULTS) {
  const parts = [], snap = O.snapshot(state), cx = cartCenter(snap);
  const put = (name, at, svg, shape) => parts.push({ name, at, svg, shape });
  const cylinder = (name, x, y, r, z, h, material = "brass", inner = "") => put(name, [x, y, z + h / 2], solid(K.cylinder(x, y, r, z, h, P, 48, 0.5), material, inner), { type: "cylinder", x, y, r, z, h });
  const slab = (name, plan, z, h, material = "brass", inner = "") => put(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], solid(K.slabOf(plan, z, h, P, 8, 0.6), material, inner), { type: "slab", plan, z, h });
  const rect = (name, x, y, w, d, z, h, material = "brass", inner = "") => slab(name, { x, y, w, d, r: 0 }, z, h, material, inner);
  const disc = (name, F, s0, s1, r, material = "brass", inner = "") => put(name, F.o.map((v, i) => v + F.a[i] * (s0 + s1) / 2), solid(G.disc(s0, s1, r, F, P), material, inner), { type: "disc", F, s0, s1, r });
  const screw = (name, x, y, z, r = 2) => cylinder(name, x, y, r, z, 0.7, "silver", line(K.lineOnTop([x - r * 0.8, y], [x + r * 0.8, y], z + 0.7, P), "mid"));
  const feet = [[-300, -56], [300, -56], [-300, 74], [300, 74]];
  for (const [i, [x, y]] of feet.entries()) {
    cylinder(`stand.pad.${i}`, x, y, 14, -27, 4, "iron");
    cylinder(`foot.shoe.${i}`, x, y, 11, -23, 4);
    cylinder(`foot.body.${i}`, x, y, 8, -19, 17, "wood", line(K.knurl(x, y, 8, -19, -2, 28, P, 0.4)));
    cylinder(`foot.collar.${i}`, x, y, 13, -2, 4);
  }
  const plan = { x: -350, y: -80, w: 700, d: 180, r: 15 };
  slab("base.lower", plan, 2, 3);
  slab("base.wood", plan, 5, 15, "wood", line(K.sideSeam(plan, 8, P)) + line(K.sideSeam(plan, 17, P)));
  slab("base.upper", plan, 20, 2, "enamel");
  feet.forEach(([x, y], i) => screw(`base.screw.${i}`, x, y, 22));
  const plaque = { x: -46, y: 76, w: 92, d: 17, r: 2 };
  slab("plaque", plaque, 22, 0.8, "brass", line(K.planOutline(K.insetPlan(plaque, 1.5), 22.8, P)) + K.faceTextSvg(K.topMatrix([0, 84.5], 22.8, P), "INERCIA · IV", { anchor: "middle", size: 3.7, tone: "hi" }));
  screw("plaque.screw.0", -41, 84.5, 22.8, 1);
  screw("plaque.screw.1", 41, 84.5, 22.8, 1);
  for (const [i, y] of [-42, 32].entries()) {
    rect(`track.${i}`, -320, y, 640, 10, 22, 6, "silver", line(K.sideSeam({ x: -320, y, w: 640, d: 10, r: 0 }, 25, P)));
    for (const [j, x] of [-330, 320].entries()) {
      rect(`track.stop.${i}.${j}`, x, y - 4, 10, 18, 22, 11, "iron");
      screw(`track.stop.screw.${i}.${j}`, x + 5, y + 5, 33);
    }
  }
  const rule = { x: -310, y: 58, w: 620, d: 6, r: 0.4 };
  const ticks = K.topTicks(-300, 300, 6, 5, 58, 22.7, [2.5, 5], P);
  slab("base.ruler", rule, 22, 0.7, "brass", line(ticks.minor) + line(ticks.major, "mid"));
  for (const [i, dx] of [-50, 50].entries()) {
    const x = cx + dx, F = G.frameOf([x, 0, 43], FRONT.a, FRONT.u, FRONT.v);
    disc(`cart.axle.${i}`, F, -32, 32, 3, "silver");
    for (const [j, front] of [false, true].entries()) {
      const n = i * 2 + j, y = front ? 43 : -43;
      disc(`cart.wheel.${n}`, F, front ? -42 : 32, front ? -32 : 42, 15, "iron");
      const circle = line(G.circleOf(F, -y, 12, P), "mid") + line(G.circleOf(F, -y, 4, P), "mid");
      const localSpokes = wheelSpokes(n, -snap.position * SCALE / WHEEL_RADIUS);
      const translated = `<g transform="${K.translateAlong(P, [cx - START_X, 0, 0])}">${line(localSpokes, "mid").replace("<path", `<path data-spokes="${n}"`)}</g>`;
      disc(`cart.wheel.face.${n}`, F, front ? -43 : 42, front ? -42 : 43, 13, "brass", circle + translated);
      disc(`cart.wheel.hub.${n}`, F, front ? -46 : 43, front ? -43 : 46, 4, "brass", line(G.circleOf(F, front ? -46 : 46, 2.2, P), "mid"));
      rect(`cart.bearing.${n}`, x - 6, (front ? 23 : -23) - 5, 12, 10, 46, 9, "brass");
    }
  }
  slab("cart.chassis", { x: cx - 80, y: -27, w: 160, d: 54, r: 3 }, 55, 6, "iron");
  const deck = { x: cx - 83, y: -31, w: 166, d: 62, r: 4 };
  slab("cart.deck", deck, 61, 9, "wood", line(K.sideSeam(deck, 65, P)));
  slab("cart.rim", deck, 70, 4, "brass");
  for (const [i, dx] of [-74, 74].entries()) for (const [j, y] of [-25, 25].entries()) screw(`cart.deck.screw.${i}.${j}`, cx + dx, y, 74, 1.6);
  for (const [i, dx] of [-66, 66].entries()) {
    const x = cx + dx;
    cylinder(`cart.frame.foot.${i}`, x, -17, 8, 74, 5);
    cylinder(`cart.frame.post.${i}`, x, -17, 4, 79, 149, "iron");
    cylinder(`cart.frame.collar.${i}`, x, -17, 6.5, 228, 9, "brass", line(K.knurl(x, -17, 6.5, 228, 237, 32, P, 0.6)));
    cylinder(`cart.frame.neck.${i}`, x, -17, 4, 237, 9, "iron");
    cylinder(`cart.frame.cap.${i}`, x, -17, 5, 254, 4);
    screw(`cart.frame.screw.${i}`, x, -17, 258, 2.2);
  }
  rect("cart.frame.crossbar", cx - 74, -22, 148, 10, 246, 8, "brass");
  const D = G.frameOf([cx, 0, PIVOT_HEIGHT], FRONT.a, FRONT.u, FRONT.v);
  disc("cart.dial.shaft", D, -15, 12, 3, "silver");
  disc("cart.dial.case", D, -19, -15, 31, "brass");
  let dialTicks = line(G.circleOf(D, -21, 28, P), "mid") + line(G.circleOf(D, -21, 26, P)) + line(G.circleOf(D, -21, 23, P));
  for (let i = 0; i < 60; i++) {
    const a = i * Math.PI / 30, r = i % 5 ? 26 : 23;
    dialTicks += stroke([[cx + 28 * Math.sin(a), 21, PIVOT_HEIGHT - 28 * Math.cos(a)], [cx + r * Math.sin(a), 21, PIVOT_HEIGHT - r * Math.cos(a)]], i === 0 ? "hi" : i % 5 ? "lo" : "mid");
  }
  disc("cart.dial.face", D, -21, -19, 30, "ivory", dialTicks);
  parts.push(rodPart(state, snap));
  disc("cart.dial.hub", D, -26, -23, 5, "brass", line(G.circleOf(D, -26, 3.3, P), "mid"));
  disc("cart.dial.screw", D, -26.8, -26, 2.1, "silver", stroke([[cx - 1.7, 26.8, PIVOT_HEIGHT], [cx + 1.7, 26.8, PIVOT_HEIGHT]], "mid"));
  parts.push(bobPart(state, snap));
  const box = { x: cx - 54, y: 3, w: 24, d: 17, r: 2 };
  slab("cart.control.box", box, 74, 8, "enamel", line(K.sideSeam(box, 78, P)));
  cylinder("cart.control.knob", cx - 42, 11.5, 5, 82, 5, "brass", line(K.knurl(cx - 42, 11.5, 5, 82, 87, 32, P, 0.5)));
  screw("cart.control.screw.0", cx - 50, 7, 82, 1.2);
  screw("cart.control.screw.1", cx - 34, 16, 82, 1.2);
  return parts;
}
export function svgParts(parts, order) {
  const keys = new Map(order.map((name, i) => [name, i]));
  return [...parts].sort((a, b) => keys.get(a.name) - keys.get(b.name)).map((part) => `<g data-part="${part.name}">${part.svg}</g>`).join("");
}
