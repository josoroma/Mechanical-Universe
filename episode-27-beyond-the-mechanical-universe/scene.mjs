import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=670,PLAN={x:-212,y:-90,w:430,d:220,r:10};
export const P=K.fitProjection(K.boxCorners(PLAN,-14,84),WIDTH,HEIGHT,{pad:45,azimuth:60,elevation:34}),defs=C.defs;
let fixedParts;
export function routes(){return E.winding('winding',0,0,32,6);}
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'MODELOS · XXVII'),B=C.builders(parts,P);B.c('gear.foot',-130,0,16,22,4,'iron');B.c('gear.post',-130,0,5,26,14,'brass');B.c('gear.bearing',-130,0,7,40,4,'silver');B.c('gear.axle',-130,0,3,48,9,'silver');B.c('gear.nut',-130,0,5,57,2,'iron');E.spool(B,P,'coil',0,0,31,6);E.tubes(parts,P,routes(),3);B.slab('dice.foot',{x:105,y:-25,w:50,d:50,r:4},22,4,'iron');B.slab('dice.body',{x:116,y:-14,w:28,d:28,r:1},26,28,'ivory',`<circle data-result cx="${K.iso([130,0,54],P)[0]}" cy="${K.iso([130,0,54],P)[1]}" r="4" fill="#a58bdb"/>`);for(const[i,[x,y]]of[[109,-21],[151,-21],[109,21],[151,21]].entries())B.screw('dice.screw.'+i,x,y,26,.9);E.meter(B,P,'meter',0,72);E.knob(B,P,'drive.knob',150,83);fixedParts=parts;return parts;}
export function moving(s){const parts=[],B=C.builders(parts,P,true),a=2*s.drive*s.t;B.c('gear.disk',-130,0,25,44,4,'brass','<path class="iso-line" data-gear/>');for(let i=0;i<12;i++){const angle=a+E.TAU*i/12,F={o:[-130,0,46],a:[0,0,1],u:[Math.cos(angle),Math.sin(angle),0],v:[-Math.sin(angle),Math.cos(angle),0]};B.prism('gear.tooth.'+i,F,[[25,-1.8],[29,-1.6],[29,1.6],[25,1.8]],-2,2,'brass');}return parts;}
export function scene(s=O.create()){return[...fixed(),...moving(s)];}
export const svgParts=(p,o)=>C.svgParts(p,o,P);
export function afterPaint(s,root){const q=O.snapshot(s);let ink='';for(const r of[9,22])ink+=C.path(Array.from({length:97},(_,i)=>E.polar(-130,0,r,E.TAU*i/96,48)),P)+'Z';for(let i=0;i<3;i++){const a=2*s.drive*s.t+E.TAU*i/3;ink+=C.path([E.polar(-130,0,9,a,48),E.polar(-130,0,22,a,48)],P);}root.querySelector('[data-gear]').setAttribute('d',ink);E.setMeter(root,P,'meter',0,72,(q.field/.002+1)/2);E.setKnob(root,P,'drive.knob',150,83,s.drive/2);root.querySelector('[data-result]').setAttribute('fill',q.trials?q.last>0?'#63daca':'#e978af':'#8a97a7');root.querySelector('[data-result]').setAttribute('r',q.trials?q.last>0?4:2:1);}
