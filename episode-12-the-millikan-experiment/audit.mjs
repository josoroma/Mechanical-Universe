import * as A from './kit/audit.mjs';
import * as S from './scene.mjs';
import {orderParts} from './painter.mjs';
export function check(){
  const parts=S.scene(),R=A.recorder(S.P),order=orderParts(parts,S.P),keys=new Map(order.map((name,i)=>[name,i]));
  for(const p of parts){const s=p.shape,shape=s.type==='ball'?A.ball(s.at,s.r):s.type==='cylinder'?A.cylinder(s.x,s.y,s.r,s.z,s.h):s.type==='slab'?A.slab(s.plan,s.z,s.h):A.disc(s.F,s.s0,s.s1,s.r);shape.name=p.name;R.put({name:p.name,at:p.at,svg:p.svg,shapes:[R.solid(shape)]});}
  A.settle(R,S.P,{states:[0],step:1.2});R.items.forEach(p=>p.key=keys.get(p.name));return A.auditOrExit(R,S.P,{argv:['--audit'],apart:false,frames:[0]});
}
if(process.argv[1]?.endsWith('/audit.mjs'))check();
