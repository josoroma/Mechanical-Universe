import * as A from './kit/audit.mjs';
import {orderParts} from './painter.mjs';
export function auditScene(S,states){for(const [i,state]of states.entries()){
 const parts=S.scene(state),R=A.recorder(S.P),order=orderParts(parts,S.P),keys=new Map(order.map((name,i)=>[name,i]));
 for(const r of S.routes?.(state)||[])R.route(r.name,r.points,r.r,{owner:r.name,closed:r.closed||false});
 for(const p of parts){const s=p.shape,shape=s.slide?A.slide(s.F,s.s0,s.s1,s.r):s.type==='ball'?A.ball(s.at,s.r):s.type==='tube'?A.tube(s.points,s.r,{owner:s.route}):s.type==='cylinder'?A.cylinder(s.x,s.y,s.r,s.z,s.h):s.type==='slab'?A.slab(s.plan,s.z,s.h):s.type==='prism'?A.prism(s.F,s.polygon,s.s0,s.s1):A.disc(s.F,s.s0,s.s1,s.r);shape.name=p.name;R.put({name:p.name,at:p.at,svg:S.svgParts([p],[p.name]),route:s.route,chunk:s.chunk,shapes:[R.solid(shape)]});}
 A.settle(R,S.P,{states:[0],step:1.3});R.items.forEach(p=>p.key=keys.get(p.name));console.log(`Estado físico ${i+1}/${states.length} · t = ${state.t}`);A.auditOrExit(R,S.P,{argv:['--audit'],apart:false,frames:[0]});
}}
