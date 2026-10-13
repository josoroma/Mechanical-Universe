import * as A from './kit/audit.mjs';
import * as S from './scene.mjs';
import {orderParts} from './painter.mjs';
export function check(xs=[-21,-18,-15,-12,-9,-6,-3,0,3,6,9,12,15,18,21]){
  for(const x of xs){
    const parts=S.scene(x),R=A.recorder(S.P),order=orderParts(parts,S.P),keys=new Map(order.map((name,i)=>[name,i]));
    for(const p of parts){const s=p.shape,shape=s.type==='cylinder'?A.cylinder(s.x,s.y,s.r,s.z,s.h):s.type==='slab'?A.slab(s.plan,s.z,s.h):s.type==='prism'?A.prism(s.F,s.polygon,s.s0,s.s1):A.disc(s.F,s.s0,s.s1,s.r);shape.name=p.name;R.put({name:p.name,at:p.at,svg:p.svg||S.bodySvg(p),shapes:[R.solid(shape)]});}
    A.settle(R,S.P,{states:[0],step:1.3});R.items.forEach(p=>p.key=keys.get(p.name));console.log(`Posición x = ${x} m`);A.auditOrExit(R,S.P,{argv:['--audit'],apart:false,frames:[0]});
  }
}
if(process.argv[1]?.endsWith('/audit.mjs'))check(process.argv[2]?[Number(process.argv[2])]:undefined);
