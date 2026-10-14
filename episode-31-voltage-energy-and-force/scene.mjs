import * as K from '../laboratory/kit/iso-kit.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-212,y:-90,w:430,d:220,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,130),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:30}),defs=C.defs;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'TENSIÓN · XXXI'),B=C.builders(parts,P),plan={x:35,y:-50,w:155,d:100,r:3};B.slab('bench',plan,22,4,'ivory',C.line(K.planOutline(K.insetPlan(plan,4),26,P,6)));for(const[i,x]of[40,183].entries())for(const[j,y]of[-45,45].entries())B.screw(`bench.screw.${i}.${j}`,x,y,26,1);E.meter(B,P,'electrostatic',-130,0);E.meter(B,P,'force',-55,60);E.knob(B,P,'voltage.knob',140,85);B.slab('source',{x:-170,y:-65,w:85,d:27,r:3},22,8,'iron');for(const[i,x]of[-155,-100].entries()){B.c('source.insulator.'+i,x,-51,4,30,6,'enamel');B.c('source.terminal.'+i,x,-51,2,36,2,'brass');}fixedParts=parts;return parts;}
export function moving(s){const parts=[],B=C.builders(parts,P,true),d=O.snapshot(s).distance*12000;for(const[i,sign]of[-1,1].entries()){const x=110+sign*(d/2+1.5);B.slab('slide.'+i,{x:x-5,y:-12,w:10,d:24,r:1},26,3,'iron');B.c('insulator.'+i,x,0,3,29,9,'enamel');B.slab('electrode.'+i,{x:x-1.5,y:-32,w:3,d:64,r:0},38,50,i?'silver':'brass');B.c('electrode.terminal.'+i,x,0,1.4,88,4,'silver');B.ball('electrode.ball.'+i,[x,0,95],3,'pink');}return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(p,o)=>C.svgParts(p,o,P);
export function afterPaint(s,root){const v=O.snapshot(s);E.setMeter(root,P,'electrostatic',-130,0,v.response);E.setMeter(root,P,'force',-55,60,v.force/.001);E.setKnob(root,P,'voltage.knob',140,85,(s.voltage+300)/600);for(let i=0;i<2;i++)root.querySelector(`[data-part="electrode.ball.${i}"] .sphere-body`).setAttribute('fill',`url(#sphere-${Math.abs(v.voltage)<1e-8?'silver':(v.voltage>0)!==Boolean(i)?'pink':'teal'})`);}
