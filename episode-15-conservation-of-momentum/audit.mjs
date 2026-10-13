import * as A from './kit/audit.mjs';
import * as S from './scene.mjs';
import * as O from './model.mjs';
import {orderParts} from './painter.mjs';
export function check(only=null){
  const configs=[O.create(),O.create({massB:.4,vA:.8,vB:-.2})];
  for(const[cindex,c]of configs.entries())for(const t of only!==null?[only]:[0,c.contact,c.contact+c.duration/4,c.contact+c.duration/2,c.contact+c.duration*.75,c.contact+c.duration,c.end]){
    const state={...c,t},s=O.sample(state),parts=S.scene(state),R=A.recorder(S.P),order=orderParts(parts,S.P),keys=new Map(order.map((name,i)=>[name,i]));
    R.route('air.hose',S.hoseRoute(),1.4,{owner:'air.hose'});for(const id of['A','B'])R.route(`${id}.spring`,S.springRoute(id,s),S.WIRE_RADIUS,{owner:`${id}.spring`});
    for(const p of parts){const s=p.shape,shape=s.type==='tube'?A.tube(s.points,s.r,{owner:s.route}):s.type==='cylinder'?A.cylinder(s.x,s.y,s.r,s.z,s.h):s.type==='slab'?A.slab(s.plan,s.z,s.h):s.type==='prism'?A.prism(s.F,s.polygon,s.s0,s.s1):A.disc(s.F,s.s0,s.s1,s.r);shape.name=p.name;const svg=S.svgParts([p],[p.name]);R.put({name:p.name,at:p.at,svg,route:s.route,chunk:s.chunk,shapes:[R.solid(shape)]});}
    A.settle(R,S.P,{states:[0],step:1.3});R.items.forEach(p=>p.key=keys.get(p.name));console.log(`Configuración ${cindex+1} · t = ${t.toFixed(6)} s`);A.auditOrExit(R,S.P,{argv:['--audit'],apart:false,frames:[0]});
  }
}
if(process.argv[1]?.endsWith('/audit.mjs'))check(process.argv[2]!==undefined?Number(process.argv[2]):null);
