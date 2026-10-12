import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as O from "./model.mjs";

export const WIDTH = 1020;
export const HEIGHT = 680;
export const SCALE = 120;
export const PROJECTION = K.fitProjection([...K.boxCorners({ x: -279, y: -92, w: 566, d: 201 }, -30, 23), [-240, 0, 218], [270, 0, 330]], WIDTH, HEIGHT, { pad: 70, azimuth: 64, elevation: 29 });
const P = PROJECTION;
const ballCache = new Map();
const line = (d, tone = "lo") => K.lineSvg(d, { tone });
const solid = (paths, material, inner = "") => `<g class="material-${material}">${K.solidSvg(paths, { tone: "hi", inner })}</g>`;
const point = (F, s, u = 0, v = 0) => F.o.map((value, i) => value + F.a[i] * s + F.u[i] * u + F.v[i] * v);
const stroke = (points, tone = "lo") => line(K.pathOf(points.map((p) => K.iso(p, P))), tone);
export function rampFrame(angle) {
  const a = angle * Math.PI / 180;
  return G.frameOf([75 - 300 * Math.cos(a), 0, 65 + 300 * Math.sin(a)], [Math.cos(a), 0, -Math.sin(a)], [0, 1, 0], [Math.sin(a), 0, Math.cos(a)]);
}
export function rampPosition(angle, distance) { return point(rampFrame(angle), distance * SCALE, 0, 9.25); }
export function dropPosition(height, distance, which) { return [which === "a" ? 175 : 220, 26, 41 + (height - distance) * SCALE]; }
export function sphereSvg(center, material = "silver") {
  if (!ballCache.has(material)) ballCache.set(material, solid(G.sphereOf([0, 0, 0], 9, P, { steps: 64 }), material));
  return `<g transform="${K.translateAlong(P, center)}">${ballCache.get(material)}</g>`;
}
export function scene(state = O.DEFAULTS) {
  const parts = [];
  const put = (name, at, svg, shape, extra = {}) => parts.push({ name, at, svg, shape, ...extra });
  const cylinder = (name, x, y, r, z, h, material = "brass", inner = "") => put(name, [x, y, z + h / 2], solid(K.cylinder(x, y, r, z, h, P, 48, 0.5), material, inner), { type: "cylinder", x, y, r, z, h });
  const slab = (name, plan, z, h, material = "brass", inner = "") => put(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], solid(K.slabOf(plan, z, h, P, 8, 0.8), material, inner), { type: "slab", plan, z, h });
  const prism = (name, F, polygon, s0, s1, material, inner = "") => put(name, point(F, (s0 + s1) / 2), solid(G.prismOf(F, polygon, s0, s1, P), material, inner), { type: "prism", F, polygon, s0, s1 });
  const rect = (name, x, y, w, d, z, h, material = "brass", inner = "") => slab(name, { x, y, w, d, r: 0 }, z, h, material, inner);
  const screw = (name, x, y, z, r = 2.3) => cylinder(name, x, y, r, z, 0.7, "silver", line(K.lineOnTop([x - r * 0.8, y], [x + r * 0.8, y], z + 0.7, P), "mid"));
  const feet = [[-238, -57], [-238, 73], [241, -57], [241, 73]];
  feet.forEach(([x, y], i) => {
    cylinder(`stand.pad.${i}`, x, y, 15, -29, 4, "iron");
    cylinder(`foot.shoe.${i}`, x, y, 12, -25, 4);
    cylinder(`foot.body.${i}`, x, y, 9, -21, 19, "wood", line(K.knurl(x, y, 9, -21, -2, 28, P), "lo"));
    cylinder(`foot.collar.${i}`, x, y, 14, -2, 4);
  });
  const plan = { x: -275, y: -89, w: 553, d: 194, r: 20 };
  slab("base.lower", plan, 2, 3);
  slab("base.wood", plan, 5, 15, "wood", line(K.sideSeam(plan, 9, P), "lo") + line(K.sideSeam(plan, 17, P), "lo"));
  slab("base.upper", plan, 20, 3, "enamel");
  feet.forEach(([x, y], i) => screw(`base.screw.${i}`, x, y, 23));
  const plaque = { x: -60, y: 65, w: 115, d: 26, r: 3 };
  slab("base.plaque", plaque, 23, 1, "brass", line(K.planOutline(K.insetPlan(plaque, 2), 24, P), "mid") + K.faceTextSvg(K.topMatrix([-2.5, 78], 24, P), "GALILEO · II", { anchor: "middle", size: 4.5, tone: "hi" }));
  screw("plaque.left", -54, 78, 24, 1.1);
  screw("plaque.right", 49, 78, 24, 1.1);
  const angle = state.angle * Math.PI / 180;
  const F = rampFrame(state.angle);
  const underside = (x) => 65 + (75 - x) * Math.tan(angle) - 6 / Math.cos(angle);
  for (const [i, x] of [-174, 65].entries()) {
    const low = Math.min(underside(x - 7), underside(x + 7)) - 6;
    cylinder(`ramp.support.${i}.foot`, x, 0, 17, 23, 4);
    cylinder(`ramp.support.${i}.lower`, x, 0, 7, 27, 8, "iron");
    cylinder(`ramp.support.${i}.knob`, x, 0, 12, 35, 6, "brass", line(K.knurl(x, 0, 12, 35, 41, 36, P, 0.5), "mid"));
    cylinder(`ramp.support.${i}.stem`, x, 0, 5, 41, low - 41, "silver");
    const J = G.frameOf([0, 0, 0], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
    prism(`ramp.support.${i}.saddle`, J, [[x - 7, low], [x + 7, low], [x + 7, underside(x + 7)], [x - 7, underside(x - 7)]], -14, 14, "brass");
  }
  prism("ramp.board", F, [[-24, -6], [24, -6], [24, 0], [-24, 0]], -12, 313, "wood");
  const marks = O.rampState(0, state.angle).marks;
  const timing = marks.map((mark) => stroke([point(F, mark.distance * SCALE, -17, 0.25), point(F, mark.distance * SCALE, 17, 0.25)], "mid")).join("");
  prism("ramp.surface", F, [[-17, 0], [17, 0], [17, 0.25], [-17, 0.25]], -12, 313, "enamel", `<g class="timing-marks">${timing}</g>`);
  for (const side of [-1, 1]) {
    const u0 = side < 0 ? -24 : 22;
    const rim = side < 0 ? 5 : 1.2;
    prism(`ramp.rail.${side}`, F, [[u0, 0], [u0 + 2, 0], [u0 + 2, rim], [u0, rim]], -12, 313, "brass");
  }
  let ticks = stroke([point(F, 0, -19, 0.5), point(F, 300, -19, 0.5)], "lo");
  for (let i = 0; i <= 50; i++) ticks += stroke([point(F, i * 6, -22, 0.5), point(F, i * 6, i % 5 ? -19 : -17, 0.5)], i % 5 ? "lo" : "mid");
  prism("ramp.ruler", F, [[-22, 0], [-17, 0], [-17, 0.5], [-22, 0.5]], 0, 300, "brass", ticks);
  prism("ramp.mark-strip", F, [[17, 0], [22, 0], [22, 0.5], [17, 0.5]], 0, 300, "iron");
  for (const { n, distance } of marks) {
    const s = distance * SCALE;
    const at = point(F, s, 19.5, 0.5);
    const B = G.frameAlong(at, F.v);
    put(`ramp.mark.${n}`, at, solid(G.disc(0, 0.8, 1.65, B, P), "brass"), { type: "disc", F: B, s0: 0, s1: 0.8, r: 1.65 });
  }
  prism("ramp.stop", F, [[-17, 0.25], [17, 0.25], [17, 10], [-17, 10]], 309, 313, "iron");
  const releaseZ = 41 + state.height * SCALE;
  const beamZ = releaseZ + 18;
  for (const [i, x] of [120, 245].entries()) {
    cylinder(`tower.foot.${i}`, x, -35, 15, 23, 4);
    cylinder(`tower.socket.${i}`, x, -35, 9, 27, 10, "iron");
    cylinder(`tower.post.lower.${i}`, x, -35, 5.3, 37, beamZ - 5 - 37, "brass");
    cylinder(`tower.clamp.${i}`, x, -35, 9, beamZ - 5, 10, "iron");
    cylinder(`tower.post.upper.${i}`, x, -35, 5.3, beamZ + 5, 315 - beamZ - 5, "brass");
    cylinder(`tower.cap.${i}`, x, -35, 9, 315, 4);
    cylinder(`tower.finial.${i}`, x, -35, 6, 319, 5, "iron");
    screw(`tower.cap.screw.${i}`, x, -35, 324, 2);
  }
  rect("tower.crossbar", 129, -39, 107, 8, beamZ - 4, 8, "iron");
  for (const [i, x] of [175, 220].entries()) {
    rect(`tower.arm.${i}`, x - 4, -31, 8, 57, beamZ - 3, 6, "brass");
    screw(`tower.arm.screw.${i}`, x, -26, beamZ + 3, 1.7);
    cylinder(`tower.release.stem.${i}`, x, 26, 2.1, releaseZ + 13, 2, "silver");
    cylinder(`tower.release.tip.${i}`, x, 26, 5.5, releaseZ + 9, 4, "iron");
    cylinder(`tower.receiver.base.${i}`, x, 26, 16, 23, 5, "brass", line(K.ring(x, 26, 14.5, 28, P, 64), "mid"));
    cylinder(`tower.receiver.pad.${i}`, x, 26, 13, 28, 4, "wood");
  }
  cylinder("tower.ruler.foot", 269, -37, 8, 23, 4, "brass");
  const ruleFrame = G.frameOf([0, -36, 0], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
  let rulerTicks = stroke([[268, -36, 41], [268, -36, 311]], "lo");
  for (let i = 0; i <= 45; i++) rulerTicks += stroke([[271, -36, 41 + i * 6], [i % 5 ? 268 : 265, -36, 41 + i * 6]], i % 5 ? "lo" : "mid");
  prism("tower.ruler", ruleFrame, [[265, 27], [271, 27], [271, 312], [265, 312]], 0, 2, "brass", rulerTicks);
  const snap = O.snapshot(state);
  const rampAt = rampPosition(state.angle, snap.ramp.distance);
  put("ball.ramp", rampAt, `<g id="ball-ramp">${sphereSvg(rampAt, "silver")}</g>`, { type: "ball", at: rampAt, r: 9 });
  for (const which of ["a", "b"]) {
    const at = dropPosition(state.height, snap[which].distance, which);
    put(`ball.${which}`, at, `<g id="ball-${which}">${sphereSvg(at, which === "a" ? "silver" : "brass")}</g>`, { type: "ball", at, r: 9, freeBody: true });
  }
  return parts;
}
export function svgParts(parts, order) {
  const keys = new Map(order.map((name, i) => [name, i]));
  return [...parts].sort((a, b) => keys.get(a.name) - keys.get(b.name)).map((part) => `<g data-part="${part.name}">${part.svg}</g>`).join("");
}
