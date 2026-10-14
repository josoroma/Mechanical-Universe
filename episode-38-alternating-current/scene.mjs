import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-175,y:-85,w:370,d:220,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,140),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:30});
export function defs(){return C.defs()+`<style>.material-north{--anatomy-paper:#a14642;--anatomy-top:#ed897d;--anatomy-shade-0:#71332d;--anatomy-shade-1:#a14642;--anatomy-shade-2:#c56157;--anatomy-shade-3:#df7d70}.material-south{--anatomy-paper:#416aaf;--anatomy-top:#8bb8fa;--anatomy-shade-0:#2c4368;--anatomy-shade-1:#416aaf;--anatomy-shade-2:#638dc8;--anatomy-shade-3:#80a7e2}</style>`;}
let fixedParts;
export function trace(s){const v=O.snapshot(s);return C.path(Array.from({length:161},(_,i)=>[55+60*i/160,-8-22*v.peak/16*Math.sin(v.angle+E.TAU*2*i/160),63]),P);}
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'ALTERNA · XXXVIII'),B=C.builders(parts,P);
 for(const[i,x]of[-125,-25].entries()){B.slab('pole.foot.'+i,{x:x-16,y:-35,w:32,d:70,r:3},22,4,'iron');B.slab('pole.body.'+i,{x:x-12,y:-29,w:24,d:58,r:2},26,25,'iron');B.slab('pole.face.'+i,{x:x-12,y:-29,w:24,d:58,r:2},51,59,i?'south':'north');for(const[j,y]of[-32,32].entries())B.screw(`pole.screw.${i}.${j}`,x,y,26,1.2);}
 B.c('rotor.foot',-75,0,10,22,4,'iron');for(const[i,[a,b,r,m]]of[[26,30,3,'silver'],[30,33,5,'copper'],[33,36,3,'iron'],[36,39,5,'copper'],[39,49,3,'silver'],[52,103,3,'silver'],[106,119,3,'silver']].entries())B.c('shaft.'+i,-75,0,r,a,b-a,m);
 B.slab('brush.foot',{x:-61,y:-6,w:10,d:12,r:1},22,8,'iron');B.slab('brush.lower',{x:-70,y:-1,w:19,d:2,r:0},30,3,'brass');B.slab('brush.spacer',{x:-61,y:-6,w:10,d:12,r:1},33,3,'iron');B.slab('brush.upper',{x:-70,y:-1,w:19,d:2,r:0},36,3,'brass');B.screw('brush.screw',-56,0,39,1);
 B.c('rotor.cap',-75,0,7,119,3,'iron',C.line(K.knurl(-75,0,7,119,122,32,P,0)));B.c('rotor.head',-75,0,2,122,1,'silver');
 const box={x:40,y:-50,w:90,d:85,r:3};B.slab('scope.case',box,22,40,'iron',C.line(K.sideSeam(box,37,P,6)));let grid='';for(const x of[55,67,79,91,103,115])grid+=C.path([[x,-38,63],[x,22,63]],P);for(const y of[-38,-26,-14,-2,10,22])grid+=C.path([[55,y,63],[115,y,63]],P);B.slab('scope.screen',{x:55,y:-38,w:60,d:60,r:0},62,1,'iron',C.line(grid,'faint')+`<path class="iso-line" style="stroke:#71d9cb;stroke-width:1.3" data-trace d="${trace(O.create())}"/>`);for(const[i,x]of[47,123].entries())for(const[j,y]of[-43,28].entries())B.screw(`scope.screw.${i}.${j}`,x,y,62,1);E.knob(B,P,'scope.knob',151,-20);E.knob(B,P,'drive.knob',151,67);E.meter(B,P,'current',20,75);B.slab('load.foot',{x:-125,y:59,w:50,d:18,r:2},22,3,'iron');B.slab('load.body',{x:-121,y:62,w:42,d:12,r:1},25,8,'brass',C.line(K.planOutline({x:-118,y:64,w:36,d:8,r:1},33,P,6)));fixedParts=parts;return parts;}
export function moving(s){const a=O.snapshot(s).angle,F={o:[-75,0,0],a:[Math.cos(a),Math.sin(a),0],u:[-Math.sin(a),Math.cos(a),0],v:[0,0,1]},parts=[],B=C.builders(parts,P,true);
 for(const[i,poly]of[[[-24,49],[-21,49],[-21,106],[-24,106]],[[21,49],[24,49],[24,106],[21,106]],[[-21,49],[21,49],[21,52],[-21,52]],[[-21,103],[21,103],[21,106],[-21,106]]].entries())B.prism('coil.bar.'+i,F,poly,-1.5,1.5,'copper');
 for(const[i,[w,z]]of[[-22.5,50.5],[22.5,50.5],[-22.5,104.5],[22.5,104.5]].entries()){const F1={...F,o:G.add3(F.o,G.add3(G.mul3(F.u,w),G.mul3(F.v,z)))};B.disc('coil.rivet.'+i,F1,1.5,2,.8,'silver');}return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(p,o)=>C.svgParts(p,o,P);
export function afterPaint(s,root){const v=O.snapshot(s);root.querySelector('[data-trace]').setAttribute('d',trace(s));E.setMeter(root,P,'current',20,75,.5+v.current/3.1);E.setKnob(root,P,'drive.knob',151,67,s.frequency/3);E.setKnob(root,P,'scope.knob',151,-20,s.field);}
