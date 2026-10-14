import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-170,y:-145,w:360,d:300,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,115),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:39});
export const defs=C.defs;
export const trajectory=s=>Array.from({length:161},(_,i)=>{const p=O.point(s,i/160);return[.2*p.x,.2*p.y,29];});
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const a=C.base(P,PLAN,'RUTHERFORD · XLIX'),B=C.builders(a,P),Fz={o:[0,0,0],a:[0,0,1],u:[1,0,0],v:[0,1,0]};B.c('table.base',0,0,120,22,5,'iron');B.c('table.rim',0,0,104,27,1,'iron');let d=C.path(Array.from({length:97},(_,i)=>E.polar(0,0,90,E.TAU*i/96,29)),P)+'Z'+C.path(Array.from({length:97},(_,i)=>E.polar(0,0,98,E.TAU*i/96,29)),P)+'Z';for(let i=0;i<72;i++)d+=C.path([E.polar(0,0,i%6?96:90,E.TAU*i/72,29),E.polar(0,0,98,E.TAU*i/72,29)],P);const r=trajectory(O.create()),q=K.iso(r[0],P);B.c('table.screen',0,0,100,28,1,'iron',C.line(d)+`<path class="iso-line" data-trajectory style="stroke:#d7b26d;stroke-width:1.2" d="${C.path(r,P)}"/><circle data-alpha cx="${q[0]}" cy="${q[1]}" r="2.5" fill="#f2d49b"/>`);
 for(let i=0;i<24;i++){const p=E.TAU*i/24,q=E.TAU*(i+1)/24;B.prism('detector.ring.'+i,Fz,[[100*Math.cos(p),100*Math.sin(p)],[105*Math.cos(p),105*Math.sin(p)],[105*Math.cos(q),105*Math.sin(q)],[100*Math.cos(q),100*Math.sin(q)]],29,31,'silver');}
 const source={x:-148,y:-10,w:23,d:20,r:2};B.slab('source',source,22,43,'iron',C.line(K.sideSeam(source,50,P,6)));B.c('source.cap',-136,0,4,65,4,'silver',C.line(K.knurl(-136,0,4,65,69,28,P,0)));const Fs={o:[0,0,55],a:[1,0,0],u:[0,1,0],v:[0,0,1]};B.disc('collimator',Fs,-125,-110,4,'iron');B.disc('collimator.aperture',Fs,-110,-109,2,'ivory');
 B.c('foil.foot',0,0,6,29,3,'iron');B.c('foil.post',0,0,2,32,5,'silver');const F={o:[0,0,0],a:[1,0,0],u:[0,1,0],v:[0,0,1]};for(const[name,poly]of[['bottom',[[-10,37],[10,37],[10,39],[-10,39]]],['top',[[-10,65],[10,65],[10,67],[-10,67]]],['left',[[-10,39],[-8,39],[-8,65],[-10,65]]],['right',[[8,39],[10,39],[10,65],[8,65]]]])B.prism('foil.frame.'+name,F,poly,-1,1,'iron');B.prism('foil',F,[[-8,39],[8,39],[8,65],[-8,65]],-.2,.2,'copper');E.meter(B,P,'angle',145,-80);E.knob(B,P,'impact.knob',140,110);E.knob(B,P,'energy.knob',176,110);fixedParts=a;return a;}
let detectorParts,detectorKey;
export function moving(s){const v=O.snapshot(s),key=v.theta;if(key===detectorKey)return detectorParts;detectorKey=key;const a=[],B=C.builders(a,P,true),c=Math.cos(key),sn=Math.sin(key),Fz={o:[0,0,0],a:[0,0,1],u:[c,sn,0],v:[-sn,c,0]},F={o:[0,0,36],a:[c,sn,0],u:[-sn,c,0],v:[0,0,1]};B.prism('detector.body',Fz,[[106,-6],[116,-6],[116,6],[106,6]],27,43,'iron');B.disc('detector.aperture',F,105,106,3,'ivory');B.c('detector.adjust',111*c,111*sn,2.5,43,4,'silver');detectorParts=a;return a;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(a,o)=>C.svgParts(a,o,P);
let pathKey='';
export function afterPaint(s,root){const key=[s.energy,s.impact,s.charge].join();if(key!==pathKey){pathKey=key;root.querySelector('[data-trajectory]').setAttribute('d',C.path(trajectory(s),P));}const v=O.snapshot(s),q=K.iso([.2*v.x,.2*v.y,29],P),p=root.querySelector('[data-alpha]');p.setAttribute('cx',q[0]);p.setAttribute('cy',q[1]);E.setMeter(root,P,'angle',145,-80,v.deflection/180);E.setKnob(root,P,'impact.knob',140,110,s.impact/100);E.setKnob(root,P,'energy.knob',176,110,(s.energy-2)/8);}
