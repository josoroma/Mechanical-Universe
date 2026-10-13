import * as A from './kit/audit.mjs';
import * as S from './scene.mjs';
import * as O from './model.mjs';
import {orderParts} from './painter.mjs';
export function check(only=null){
  const states=[];for(const length of[.6,1.4]){const c=O.create({length,mass:.4,angle:45});for(const f of only===null?[0,.125,.25,.375,.5,.75]:[only])states.push(O.advance(c,c.Tp*f));}if(only===null){const c=O.create({angle:0});states.push(O.advance(c,c.Ts/2));}
  for(const c of states){const s=O.snapshot(c),parts=S.scene(c),R=A.recorder(S.P),order=orderParts(parts,S.P),keys=new Map(order.map((name,i)=>[name,i]));R.route('spring.coil',S.coilRoute(s.spring.x),S.WIRE_RADIUS,{owner:'spring.coil'});R.route('pendulum.thread',S.threadRoute(c),.22,{owner:'pendulum.thread'});
    for(const p of parts){const s=p.shape,shape=s.type==='ball'?A.ball(s.at,s.r):s.type==='tube'?A.tube(s.points,s.r,{owner:s.route}):s.type==='cylinder'?A.cylinder(s.x,s.y,s.r,s.z,s.h):s.type==='slab'?A.slab(s.plan,s.z,s.h):s.type==='prism'?A.prism(s.F,s.polygon,s.s0,s.s1):A.disc(s.F,s.s0,s.s1,s.r);shape.name=p.name;R.put({name:p.name,at:p.at,svg:S.svgParts([p],[p.name]),route:s.route,chunk:s.chunk,shapes:[R.solid(shape)]});}
    A.settle(R,S.P,{states:[0],step:1.3});R.items.forEach(p=>p.key=keys.get(p.name));console.log(`L = ${c.length} m · t = ${c.t.toFixed(6)} s`);A.auditOrExit(R,S.P,{argv:['--audit'],apart:false,frames:[0]});
  }
}
if(process.argv[1]?.endsWith('/audit.mjs'))check(process.argv[2]!==undefined?Number(process.argv[2]):null);
