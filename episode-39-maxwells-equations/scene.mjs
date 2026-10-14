import * as K from '../laboratory/kit/iso-kit.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-185,y:-80,w:390,d:210,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,125),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:32});
export function defs(){return C.defs();}
export const sites=Array.from({length:13},(_,i)=>-5+12*i);
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'MAXWELL · XXXIX'),B=C.builders(parts,P);B.c('capacitor.foot',-120,0,12,22,4,'iron');B.c('capacitor.insulator',-120,0,7,26,19,'ivory');
 for(const[side,z]of[['lower',45],['upper',80]]){const dots=Array.from({length:12},(_,i)=>{const p=K.iso(E.polar(-120,0,19,E.TAU*i/12,z+3),P);return `<circle data-charge="${side}" cx="${p[0]}" cy="${p[1]}" r="1.2" fill="#dc74ae"/>`;}).join('');B.c('plate.'+side,-120,0,25,z,3,'silver',C.line(K.ring(-120,0,22,z+3,P,64))+dots);}
 for(const[i,x]of[-154,-86].entries()){B.c('bridge.foot.'+i,x,0,6,22,3,'iron');B.c('bridge.post.'+i,x,0,2,25,58,'ivory');}B.slab('bridge.bar',{x:-156,y:-3,w:72,d:6,r:0},83,4,'iron');for(const[i,x]of[-154,-86].entries())B.screw('bridge.screw.'+i,x,0,87,1);E.meter(B,P,'current',-112,76);E.knob(B,P,'frequency.knob',164,-10);E.knob(B,P,'voltage.knob',164,65);
 B.slab('electric.bed',{x:-13,y:-39,w:161,d:14,r:1},22,3,'iron');B.slab('magnetic.bed',{x:-13,y:7,w:161,d:50,r:1},22,3,'iron');
 for(const[i,x]of sites.entries()){B.c('electric.guide.'+i,x,-32,3,25,20,'iron',C.line(K.sideArc(x,-32,3,42,P,32))+C.line(K.knurl(x,-32,3,42,45,20,P,0)));B.slab('magnetic.track.'+i,{x:x-2,y:7,w:4,d:50,r:0},25,3,'silver');}
 for(const[i,[x,y]]of[[-10,-36],[145,-36],[-10,11],[145,53]].entries())B.screw('bed.screw.'+i,x,y,25,.7);fixedParts=parts;return parts;}
export function moving(s){const parts=[],B=C.builders(parts,P,true);for(const[i,x]of sites.entries()){const v=O.wave(s,30*i/12),height=70+20*v.electric/100,y=32+20*v.magnetic*O.C0/100;B.slide('electric.rod.'+i,{o:[x,-32,0],a:[0,0,1],u:[1,0,0],v:[0,1,0]},45,height,1,'silver');B.c('electric.head.'+i,x,-32,3,height,2,'copper');B.slab('magnetic.slider.'+i,{x:x-3,y:y-3,w:6,d:6,r:.3},28,3,'iron');B.c('magnetic.head.'+i,x,y,2.5,31,1,'ivory');}return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(p,o)=>C.svgParts(p,o,P);
export function afterPaint(s,root){const v=O.snapshot(s);E.setMeter(root,P,'current',-112,76,.5+v.current/.48);E.setKnob(root,P,'frequency.knob',164,-10,(s.frequency-1)/19);E.setKnob(root,P,'voltage.knob',164,65,s.voltage/200);for(const side of['lower','upper'])for(const node of root.querySelectorAll(`[data-charge="${side}"]`)){node.setAttribute('fill',(v.charge>0)===(side==='lower')?'#dc74ae':'#71d9cb');node.setAttribute('opacity',String(Math.abs(v.charge)/(O.CAPACITANCE*200)));}}
