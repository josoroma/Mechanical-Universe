import * as A from "./kit/audit.mjs";
import * as S from "./scene.mjs";
import { orderParts } from "./painter.mjs";
export function record(parts) {
  const R = A.recorder(S.PROJECTION);
  for (const part of parts) {
    const s = part.shape;
    const shape = s.type === "cylinder" ? A.cylinder(s.x, s.y, s.r, s.z, s.h) : s.type === "slab" ? A.slab(s.plan, s.z, s.h) : A.prism(s.F, s.polygon, s.s0, s.s1);
    R.put({ name: part.name, at: part.at, svg: part.svg, shapes: [R.solid({ ...shape, name: part.name })] });
  }
  return R;
}
export function check(parts) {
  const R = record(parts), order = orderParts(parts, S.PROJECTION), keys = new Map(order.map((name, i) => [name, i]));
  A.settle(R, S.PROJECTION, { states: [0], step: 1.2 });
  R.items.forEach((item) => { item.key = keys.get(item.name); });
  return A.auditOrExit(R, S.PROJECTION, { argv: ["--audit"], apart: false, frames: [0] });
}
