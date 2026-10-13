import * as A from './kit/audit.mjs';
import * as S from './scene.mjs';
import * as O from './model.mjs';
import {orderParts} from './painter.mjs';
export function check(times=[0,.25,.5,.75,1,1.25,1.5,1.75,2]){
  for(const t of times){const state=O.advance(O.create({amplitude:.5}),t),parts=S.scene(state),R=A.recorder(S.P),order=orderParts(parts,S.P),keys=new Map(order.map((name,i)=>[name,i]));
    R.route('spring.coil',S.springRoute(O.spring(state).x),S.WIRE_RADIUS,{owner:'spring.coil'});
    for(const p of parts){const s=p.shape,shape=s.type==='ball'?A.ball(s.at,s.r):s.type==='tube'?A.tube(s.points,s.r,{owner:'spring.coil'}):s.type==='cylinder'?A.cylinder(s.x,s.y,s.r,s.z,s.h):s.type==='slab'?A.slab(s.plan,s.z,s.h):s.type==='prism'?A.prism(s.F,s.polygon,s.s0,s.s1):A.disc(s.F,s.s0,s.s1,s.r);shape.name=p.name;R.put({name:p.name,at:p.at,svg:p.svg,route:s.route,chunk:s.chunk,shapes:[R.solid(shape)]});}
    A.settle(R,S.P,{states:[0],step:1.3});R.items.forEach(p=>p.key=keys.get(p.name));console.log(`Tiempo t = ${t} s`);A.auditOrExit(R,S.P,{argv:['--audit'],apart:false,frames:[0]});
  }
}
if(process.argv[1]?.endsWith('/audit.mjs'))check(process.argv[2]?[Number(process.argv[2])]:undefined);
