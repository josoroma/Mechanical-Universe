import * as A from "./kit/audit.mjs";
import * as S from "./scene.mjs";

export function record(parts) {
  const R = A.recorder(S.PROJECTION);
  for (const part of parts) {
    const s = part.shape;
    let shape;
    if (s.type === "cylinder") shape = A.cylinder(s.x, s.y, s.r, s.z, s.h);
    else if (s.type === "slab") shape = A.slab(s.plan, s.z, s.h);
    else if (s.type === "prism") shape = A.prism(s.F, s.polygon, s.s0, s.s1);
    else if (s.type === "disc") shape = A.disc(s.F, s.s0, s.s1, s.r);
    else shape = A.ball(s.at, s.r, { freeBody: s.freeBody });
    R.put({ name: part.name, at: part.at, svg: part.svg, shapes: [R.solid({ ...shape, name: part.name })] });
  }
  return R;
}
export function solveMany(poses) {
  const R = record(S.scene(poses[0]));
  const names = new Map(R.items.map((item, i) => [item.name, i]));
  let measured;
  const pairs = [];
  for (const pose of poses) {
    const recorder = record(S.scene(pose));
    measured = A.overlapsOf(recorder.items, S.PROJECTION, { states: [0], step: 1.2 });
    for (const pair of measured.pairs) pairs.push({ ...pair, a: names.get(recorder.items[pair.a].name), b: names.get(recorder.items[pair.b].name) });
  }
  const solved = A.orderKeys(R.items, { ...measured, pairs });
  if (solved.cycles.length || solved.dropped.length) throw new Error("La geometría requiere dividir una pieza para resolver el orden de pintura.");
  return R.items.map((item, i) => ({ name: item.name, key: solved.keys[i] })).sort((a, b) => a.key - b.key).map((item) => item.name);
}
export function check(parts, order) {
  const R = record(parts);
  const keys = new Map(order.map((name, i) => [name, i]));
  A.settle(R, S.PROJECTION, { states: [0], step: 1.2 });
  R.items.forEach((item) => { item.key = keys.get(item.name); });
  return A.auditOrExit(R, S.PROJECTION, { argv: ["--audit"], apart: false, frames: [0] });
}
