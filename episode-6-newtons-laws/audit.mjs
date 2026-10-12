import * as A from "./kit/audit.mjs";
import * as S from "./scene.mjs";
import { orderParts } from "./painter.mjs";
export function record(parts,P){
  const R=A.recorder(P),routes=new Set();
  for(const part of parts){const s=part.shape;let shape;
    if(s.type==="cylinder")shape=A.cylinder(s.x,s.y,s.r,s.z,s.h);
    else if(s.type==="slab")shape=A.slab(s.plan,s.z,s.h);
    else if(s.type==="disc")shape=A.disc(s.F,s.s0,s.s1,s.r);
    else if(s.type==="prism")shape=A.prism(s.F,s.polygon,s.s0,s.s1);
    else {shape=A.tube(s.points,s.r,{route:s.route,chunk:s.chunk});if(!routes.has(s.route)){const r=s.routeData;R.route(r.name,r.points,r.r,{touch:r.touch});routes.add(s.route);}}
    shape.name=part.name;
    R.put({name:part.name,at:part.at,svg:part.svg,route:s.route,chunk:s.chunk,shapes:[s.type==="tube"?shape:R.solid(shape)]});
  }return R;
}
export function check(state,time=0){
  // Rope contact with its own groove is intentional. Prove its clearance
  // independently before declaring that mating surface to the route recorder.
  const minimum=state.mode==="atwood"?S.ROPE_R*Math.cos(Math.PI/128)-1-47:16*Math.cos(Math.PI/128)-.8-15.1;
  if(minimum<0||minimum>.15)throw new Error("Contacto de cuerda inválido: invasión o separación de la garganta.");
  const parts=S.scene(state,time),P=S.PROJECTIONS[state.mode],R=record(parts,P),order=orderParts(parts,P),keys=new Map(order.map((n,i)=>[n,i]));A.settle(R,P,{states:[0],step:1.2});R.items.forEach(p=>p.key=keys.get(p.name));return A.auditOrExit(R,P,{argv:["--audit"],apart:false,frames:[0]});}
