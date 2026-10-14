import * as K from '../laboratory/kit/iso-kit.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-212,y:-90,w:430,d:220,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,170),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:30}),defs=C.defs;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'CAPACIDAD · XXX'),B=C.builders(parts,P);B.c('capacitor.foot',-55,0,17,22,4,'iron');B.c('capacitor.pedestal',-55,0,8,26,26,'brass');B.c('plate.fixed',-55,0,40,52,3,'silver',C.line(C.path(Array.from({length:97},(_,i)=>E.polar(-55,0,37,E.TAU*i/96,55)),P)+'Z'));B.c('gantry.foot',20,0,13,22,3,'iron');B.c('gantry.post',20,0,6,25,110,'silver');B.slab('gantry.beam',{x:-65,y:-6,w:95,d:12,r:2},135,5,'iron');E.knob(B,P,'adjuster',-55,0,140,9);E.meter(B,P,'voltmeter',115,35);E.knob(B,P,'gap.knob',135,85);for(const[i,x]of[-160,-145,-130].entries()){B.c('source.cell.'+i,x,-35,5,22,20,'iron');B.c('source.cap.'+i,x,-35,5,42,2,'brass');B.c('source.terminal.'+i,x,-35,2,44,2,'silver');}fixedParts=parts;return parts;}
export function moving(s){const parts=[],B=C.builders(parts,P,true),gap=O.snapshot(s).separation*3000,z=55+gap;B.c('plate.moving',-55,0,40,z,3,'silver');if(s.kappa>1)B.c('dielectric',-55,0,39.5,55,gap,'enamel');const ribs=K.knurl(-55,0,3,z+3,135,20,P,0),screw=B.c('adjuster.screw',-55,0,3,z+3,135-z-3,'silver',C.line(ribs));screw.livePaths={'.iso-line[data-tone="lo"]':ribs};for(const[i,[x,y]]of[[-80,-25],[-80,25],[-30,-25],[-30,25]].entries())B.screw('plate.screw.'+i,x,y,z+3,1.2);return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(p,o)=>C.svgParts(p,o,P);
export function afterPaint(s,root){E.setMeter(root,P,'voltmeter',115,35,O.snapshot(s).voltage/750);E.setKnob(root,P,'gap.knob',135,85,(s.gap-2)/10);E.setKnob(root,P,'adjuster',-55,0,s.t/12,147,9);}
