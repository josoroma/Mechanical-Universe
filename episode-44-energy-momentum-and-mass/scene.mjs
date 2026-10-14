import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-155,y:-110,w:310,d:240,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,100),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:35});
export const defs=C.defs;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const a=C.base(P,PLAN,'ENERGÍA · MOMENTO · XLIV'),B=C.builders(a,P);for(const[name,x]of[['source',-135],['detector',120]]){const plan={x,y:-16,w:15,d:32,r:2};B.slab(name+'.body',plan,22,38,'iron',C.line(K.sideSeam(plan,45,P,6)));B.c(name+'.adjust',x+7.5,0,4,60,5,'iron',C.line(K.knurl(x+7.5,0,4,60,65,28,P,0)));for(const dx of[3,12])B.screw(name+'.screw.'+dx,x+dx,-10,60,.7);}
 const F={o:[0,0,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]},q=K.iso([-120,0,46],P);B.prism('beam.screen',F,[[-120,44],[120,44],[120,48],[-120,48]],0,.3,'iron',C.line(C.path([[-120,0,46],[120,0,46]],P))+`<circle data-beam cx="${q[0]}" cy="${q[1]}" r="2.4" fill="#f2d49b"/>`);
 for(const[i,x]of[-65,0,65].entries()){B.slab('cavity.foot.'+i,{x:x-7,y:-10,w:14,d:20,r:1},22,3,'iron');B.slab('cavity.stem.'+i,{x:x-2,y:-5,w:4,d:10,r:.2},25,9,'iron');const F={o:[x,0,46],a:[1,0,0],u:[0,1,0],v:[0,0,1]};for(let j=0;j<12;j++){const p=E.TAU*j/12,r=E.TAU*(j+1)/12;B.prism('cavity.'+i+'.'+j,F,[[8*Math.cos(p),8*Math.sin(p)],[12*Math.cos(p),12*Math.sin(p)],[12*Math.cos(r),12*Math.sin(r)],[8*Math.cos(r),8*Math.sin(r)]],-3,3,'copper');}for(const y of[-8,8])B.screw('cavity.bolt.'+i+'.'+y,x,y,25,.8);}
 for(const[name,x]of[['speed',-60],['energy',60]])E.meter(B,P,name,x,-70);E.knob(B,P,'drive.knob',65,85);E.knob(B,P,'initial.knob',112,85);fixedParts=a;return a;}
export function scene(s=O.create()){return fixed();}
export const svgParts=(a,o)=>C.svgParts(a,o,P);
export function afterPaint(s,root){const v=O.snapshot(s),q=K.iso([-120+240*v.progress,0,46],P),p=root.querySelector('[data-beam]');p.setAttribute('cx',q[0]);p.setAttribute('cy',q[1]);E.setMeter(root,P,'speed',-60,-70,v.beta);E.setMeter(root,P,'energy',60,-70,v.kinetic/10);E.setKnob(root,P,'drive.knob',65,85,(s.drive-.1)/1.9);E.setKnob(root,P,'initial.knob',112,85,s.initial/4);}
