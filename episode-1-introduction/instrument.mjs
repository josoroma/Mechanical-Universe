import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as A from "./kit/audit.mjs";
import * as M from "./mechanism.mjs";

export function instrument({ audit = false } = {}) {
  const P = M.PROJECTION;
  const R = A.recorder(P);
  const line = (d, tone = "lo") => K.lineSvg(d, { tone });
  const wrap = (svg, material) => `<g class="material-${material}">${svg}</g>`;
  const solid = (paths, material, inner = "") => wrap(K.solidSvg(paths, { tone: "hi", inner }), material);
  const put = (name, at, svg, shape) => R.put({ name, at, svg, shapes: [R.solid({ ...shape, name })] });
  const cylinder = (name, x, y, r, z, h, material = "brass", inner = "") => put(name, [x, y, z + h / 2], solid(K.cylinder(x, y, r, z, h, P, r > 100 ? 180 : 40, 0.7), material, inner), A.cylinder(x, y, r, z, h));
  const slab = (name, plan, z, h, material, inner = "") => put(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], solid(K.slabOf(plan, z, h, P, 10, 1.2), material, inner), A.slab(plan, z, h));
  const plan = { x: -268, y: -254, w: 536, d: 508, r: 42 };
  const feet = [[-226, -214], [-226, 214], [226, -214], [226, 214]];
  for (const [i, [x, y]] of feet.entries()) {
    const pad = cylinder(`stand.pad.${i}`, x, y, 20, -117, 4, "iron");
    pad.shapes[0].ground = true;
    cylinder(`foot.shoe.${i}`, x, y, 16, -113, 5, "brass");
    cylinder(`foot.body.${i}`, x, y, 11, -108, 35, "wood", line(K.knurl(x, y, 11, -108, -73, 32, P), "lo"));
    cylinder(`foot.collar.${i}`, x, y, 17, -73, 4, "brass");
  }
  slab("plinth.bottom", plan, -69, 4, "brass");
  slab("plinth.wood", plan, -65, 18, "wood", line(K.sideSeam(plan, -61, P, 10), "lo") + line(K.sideSeam(plan, -51, P, 10), "lo"));
  slab("plinth.top", plan, -47, 3, "brass");
  for (const [i, [x, y]] of feet.entries()) {
    cylinder(`plinth.washer.${i}`, x, y, 5, -44, 0.5, "brass");
    cylinder(`plinth.screw.${i}`, x, y, 3.2, -43.5, 1, "silver", line(K.lineOnTop([x - 2.8, y], [x + 2.8, y], -42.5, P), "mid"));
  }
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    const x = 195 * Math.cos(angle);
    const y = 195 * Math.sin(angle);
    cylinder(`column.lower.${i}`, x, y, 9, -44, 3, "brass");
    cylinder(`column.body.${i}`, x, y, 5.7, -41, 10, "brass", line(K.knurl(x, y, 5.7, -41, -31, 24, P), "mid"));
    cylinder(`column.upper.${i}`, x, y, 9, -31, 3, "brass");
  }
  cylinder("bearing.base", 0, 0, 240, -28, 5, "iron");
  const gear = Array.from({ length: 400 }, (_, i) => {
    const angle = i * Math.PI * 2 / 400;
    const r = i % 4 === 1 || i % 4 === 2 ? 259 : 250;
    return [r * Math.cos(angle), r * Math.sin(angle)];
  });
  put("drive.toothed-wheel", [0, 0, -21], solid(K.extrude(gear, -23, 4, P, { convex: false }), "brass"), A.extruded(gear, -23, 4));
  cylinder("drum.case", 0, 0, 250, -19, 16, "brass", line(K.sideArc(0, 0, 250, -14, P, 100), "mid") + line(K.sideArc(0, 0, 250, -7, P, 100), "lo"));
  const dialFace = cylinder("dial.face", 0, 0, 237, 3, 0.01, "enamel");
  const ticks = K.radialTicks(0, 0, 252, 120, 10, 3, [3.3, 7.5], P);
  const dialBezel = cylinder("dial.bezel", 0, 0, 255, -3, 6, "brass", line(K.ring(0, 0, 252, 3, P, 180), "mid") + line(K.ring(0, 0, 240, 3, P, 180), "lo") + line(ticks.minor, "lo") + line(ticks.major, "hi"));
  dialFace.name = "dial.assembly";
  dialFace.svg = dialBezel.svg + dialFace.svg;
  dialFace.shapes.push(...dialBezel.shapes);
  R.items.splice(R.items.indexOf(dialBezel), 1);
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const x = 245.5 * Math.cos(angle);
    const y = 245.5 * Math.sin(angle);
    cylinder(`bezel.screw.${i}`, x, y, 1.8, 3, 0.7, "silver", line(K.lineOnTop([x - 1.5, y], [x + 1.5, y], 3.7, P), "mid"));
  }
  const plaque = { x: 122, y: 213, w: 70, d: 25, r: 3 };
  const engraving = K.faceTextSvg(K.topMatrix([157, 225], -43, P), "PLANETARIO · I", { size: 3.5, anchor: "middle", tone: "hi" });
  slab("plaque", plaque, -44, 1, "brass", line(K.planOutline(K.insetPlan(plaque, 2), -43, P), "mid") + engraving);
  for (const x of [127, 187]) cylinder(`plaque.rivet.${x}`, x, 225, 1, -43, 0.6, "silver");
  if (audit) {
    A.settle(R, P, { step: 0.8, states: [0] });
    A.auditOrExit(R, P, { apart: false, frames: [0] });
  }
  const sorted = audit ? [...R.items].sort((a, b) => a.key - b.key) : R.items;
  return { svg: sorted.map((item) => `<g data-fixed="${item.name}">${item.svg}</g>`).join(""), recorder: R, count: R.solids.length };
}

export function recordMechanism(items, recorder) {
  for (const item of items) {
    const s = item.shape;
    let shape;
    if (s.type === "cylinder") shape = A.cylinder(s.x, s.y, s.r, s.z, s.h);
    else if (s.type === "extruded") shape = A.extruded(s.polygon, s.z, s.h);
    else if (s.type === "ring") shape = A.ring(G.frameAlong([s.x, s.y, 0], [0, 0, 1]), s.z, s.z + s.h, s.r0, s.r1);
    else shape = A.ball(s.at, s.r);
    const shapes = [recorder.solid({ ...shape, name: item.name })];
    if (item.carrier) {
      const { x, y, z } = item.carrier;
      shapes.push(recorder.solid(A.cylinder(x, y, 3.5, z, 2, { name: `${item.name}.shoe` })));
      shapes.push(recorder.solid(A.cylinder(x, y, 1.65, z + 2, 6, { name: `${item.name}.stem` })));
    }
    recorder.put({ name: item.name, at: item.at, svg: item.svg.replace(/<circle class="(?:planet-hit|selection-halo)"[^>]*\/>/g, ""), shapes });
  }
  return recorder;
}
