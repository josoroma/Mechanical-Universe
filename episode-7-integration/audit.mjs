import * as A from "./kit/audit.mjs";
import * as K from "./kit/iso-kit.mjs";
import * as S from "./scene.mjs";
import {orderParts} from "./painter.mjs";
export function check(state,x=state.x){
  const parts=S.scene(state,x),R=A.recorder(S.P),order=orderParts(parts,S.P),keys=new Map(order.map((name,i)=>[name,i]));
  for(const p of parts){const s=p.shape;
    const shape=s.type==="cylinder"?A.cylinder(s.x,s.y,s.r,s.z,s.h):s.type==="slab"?A.slab(s.plan,s.z,s.h):A.disc(s.F,s.s0,s.s1,s.r);
    shape.name=p.name;
    // Draw and record the same translated geometry, including the sliding group.
    const svg=p.moving?`<g transform="${K.translateAlong(S.P,[p.shift,0,0])}">${p.svg}</g>`:p.svg;
    R.put({name:p.name,at:p.at,svg,shapes:[R.solid(shape)]});
  }
  A.settle(R,S.P,{states:[0],step:1.2});R.items.forEach(p=>p.key=keys.get(p.name));
  return A.auditOrExit(R,S.P,{argv:["--audit"],apart:false,frames:[0]});
}
