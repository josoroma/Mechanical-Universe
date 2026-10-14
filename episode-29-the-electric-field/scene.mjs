import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-212,y:-90,w:430,d:220,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,125),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:30}),defs=C.defs;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'CAMPO · XXIX'),B=C.builders(parts,P),ring=[[-155,-32],[-115,-32],[-75,-32],[-75,0],[-75,32],[-115,32],[-155,32],[-155,0]],zs=[23.5,53.5,83.5];
 for(const [j,z]of zs.entries())for(let i=0;i<8;i++){const a=[...ring[i],z],b=[...ring[(i+1)%8],z],d=G.unit3(G.sub3(b,a));B.ball(`cage.joint.${j}.${i}`,a,1.5,'silver');B.rod(`cage.ring.${j}.${i}`,G.add3(a,G.mul3(d,1.5)),G.sub3(b,G.mul3(d,1.5)),.4,'silver');if(j<2)B.rod(`cage.vertical.${j}.${i}`,[a[0],a[1],z+1.5],[a[0],a[1],zs[j+1]-1.5],.4,'silver');}
 B.c('inside.foot',-115,0,6,22,4,'iron');B.c('inside.stem',-115,0,1.5,26,24,'brass');B.ball('inside.sensor',[-115,0,53],3,'teal');
 const lines=Array.from({length:7},(_,i)=>C.path([[50,-30+i*10,26],[170,-30+i*10,26]],P)).join('');B.slab('mapping.board',{x:35,y:-50,w:155,d:100,r:3},22,4,'ivory',C.line(lines));B.slab('plate.left',{x:47,y:-40,w:3,d:80,r:0},26,60,'brass');B.slab('plate.right',{x:170,y:-40,w:3,d:80,r:0},26,60,'silver');for(const[i,x]of[40,183].entries())for(const[j,y]of[-45,45].entries())B.screw(`board.screw.${i}.${j}`,x,y,26,1);
 E.meter(B,P,'potential',-105,82);E.knob(B,P,'voltage.knob',150,85);fixedParts=parts;return parts;}
export function moving(s){const parts=[],B=C.builders(parts,P,true),x=50+1000*O.snapshot(s).position;B.c('probe.foot',x,0,4,26,3,'iron');B.c('probe.stem',x,0,1.5,29,7,'silver');B.ball('probe.charge',[x,0,40],4,'pink');return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(p,o)=>C.svgParts(p,o,P);
export function afterPaint(s,root){E.setMeter(root,P,'potential',-105,82,O.snapshot(s).potential/120);E.setKnob(root,P,'voltage.knob',150,85,s.voltage/120);root.querySelector('[data-part="inside.sensor"] .sphere-body').setAttribute('fill',`url(#sphere-${s.shield?'gold':'teal'})`);root.querySelector('[data-part="probe.charge"] .sphere-body').setAttribute('fill',`url(#sphere-${s.shield?'silver':s.charge<0?'teal':'pink'})`);}
