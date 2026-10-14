import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-212,y:-90,w:430,d:220,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,165),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:30}),defs=C.defs;
let fixedParts;
export function routes(){return E.winding('winding',-80,0,32,6,15,5);}
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'CAMPO B · XXXV'),B=C.builders(parts,P);E.spool(B,P,'coil',-80,0,31,6,15,5);E.tubes(parts,P,routes(),3);B.c('probe.foot',-10,0,12,22,3,'iron');B.c('probe.gland',-10,0,5,25,10,'brass');E.meter(B,P,'ammeter',100,-20);E.meter(B,P,'hallmeter',100,60);E.knob(B,P,'current.knob',155,95);fixedParts=parts;return parts;}
export function moving(s){const parts=[],B=C.builders(parts,P,true),z=46+500*O.snapshot(s).position,F={o:[-10,0,0],a:[0,0,1],u:[1,0,0],v:[0,1,0]};B.slide('probe.rod',F,35,z-4,3,'silver');B.slab('probe.arm',{x:-84,y:-4,w:79,d:8,r:1},z-4,2,'iron');B.c('probe.stem',-80,0,1.4,z-2,1,'silver');B.slab('probe.sensor',{x:-82,y:-2,w:4,d:4,r:.3},z-1,2,'brass');for(const[i,x]of[-74,-12].entries())B.screw('probe.screw.'+i,x,0,z-2,.7);return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(p,o)=>C.svgParts(p,o,P);
export function afterPaint(s,root){const v=O.snapshot(s);E.setMeter(root,P,'ammeter',100,-20,(s.current+3)/6);E.setMeter(root,P,'hallmeter',100,60,.5+v.hall/50e-6);E.setKnob(root,P,'current.knob',155,95,(s.current+3)/6);}
