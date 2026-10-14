import * as K from '../laboratory/kit/iso-kit.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-212,y:-90,w:430,d:220,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,150),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:30}),defs=C.defs;
let fixedParts;
const pileCache=new Map();
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'PILAS · XXXII'),B=C.builders(parts,P);B.c('pile.foot',-135,0,26,22,4,'iron');
 for(const[i,x]of[55,135].entries()){const y=-15;B.slab('vessel.floor.'+i,{x:x-28,y:y-25,w:56,d:50,r:1},22,3,'enamel');B.slab('vessel.left.'+i,{x:x-28,y:y-25,w:2,d:50,r:0},25,30,'enamel');B.slab('vessel.right.'+i,{x:x+26,y:y-25,w:2,d:50,r:0},25,30,'enamel');for(const[j,yy]of[y-25,y+23].entries())B.slab(`vessel.edge.${i}.${j}`,{x:x-26,y:yy,w:52,d:2,r:0},25,30,'enamel');B.slab('electrode.'+i,{x:x-3,y:y-10,w:6,d:20,r:0},25,45,i?'copper':'silver');B.c('electrode.terminal.'+i,x,y,2,70,4,'brass');
  const fills=[{x:x-26,y:y-23,w:23,d:46},{x:x+3,y:y-23,w:23,d:46},{x:x-3,y:y-23,w:6,d:13},{x:x-3,y:y+10,w:6,d:13}];for(const[j,plan]of fills.entries()){const marks=j===3?`<g data-ions="${i}">${[0,1,2].map(k=>{const p=K.iso([x,i?6-k/3*11:-5+k/3*11,48],P);return `<circle data-ion="${i}.${k}" cx="${p[0]}" cy="${p[1]}" r="1.4" fill="#68d8cc"/>`;}).join('')}</g>`:'';B.slab(`liquid.${i}.${j}`,{...plan,r:0},25,23,'ivory',marks);}
 }
 for(const[i,x]of[70,120].entries()){B.c('bridge.leg.'+i,x,-15,1.2,48,27,'silver');B.ball('bridge.elbow.'+i,[x,-15,77],2,'silver');}
 const bridge=B.rod('bridge.bar',[72,-15,77],[118,-15,77],1.2,'silver');bridge.inner=`<g data-bridge-flow>${[['anion',116,'#db8bb8'],['cation',74,'#68d8cc']].map(([type,x,color])=>{const p=K.iso([x,-15,78.2],P);return `<circle data-bridge-${type} cx="${p[0]}" cy="${p[1]}" r="1.2" fill="${color}"/>`;}).join('')}</g>`;bridge.svg=C.bodySvg(bridge);
 E.meter(B,P,'ammeter',-75,75);E.knob(B,P,'load.knob',145,85);B.slab('load.foot',{x:20,y:65,w:65,d:15,r:2},22,3,'iron');B.slab('load.body',{x:28,y:68,w:49,d:9,r:1},25,7,'brass',C.line(K.planOutline({x:31,y:70,w:43,d:5,r:1},32,P,6)));for(const[i,x]of[23,82].entries())B.c('load.terminal.'+i,x,72,2,25,5,'silver');fixedParts=parts;return parts;}
export function pile(s){if(pileCache.has(s.cells))return pileCache.get(s.cells);const parts=[],B=C.builders(parts,P,true);for(let i=0;i<s.cells;i++){const z=26+i*9;B.c('pile.zinc.'+i,-135,0,22,z,3,'silver');B.c('pile.separator.'+i,-135,0,21,z+3,3,'ivory');B.c('pile.copper.'+i,-135,0,22,z+6,3,'copper');}const z=26+s.cells*9;B.c('pile.cap',-135,0,24,z,3,'iron');B.c('pile.terminal',-135,0,3,z+3,5,'brass');pileCache.set(s.cells,parts);return parts;}
export function scene(s=O.create()){return [...fixed(),...pile(s)];}
export const svgParts=(p,o)=>C.svgParts(p,o,P);
export function afterPaint(s,root){const v=O.snapshot(s),phase=v.charge*.15,active=Boolean(s.source&&s.closed);E.setMeter(root,P,'ammeter',-75,75,v.current/.20);E.setKnob(root,P,'load.knob',145,85,(s.load-10)/90);for(let i=0;i<2;i++){root.querySelector(`[data-ions="${i}"]`).setAttribute('opacity',active?'1':'0');for(let k=0;k<3;k++){const u=(phase+k/3)%1,y=-5+u*11*(i?-1:1)+(i?11:0),p=K.iso([i?135:55,y,48],P),dot=root.querySelector(`[data-ion="${i}.${k}"]`);dot.setAttribute('cx',p[0]);dot.setAttribute('cy',p[1]);}}
 root.querySelector('[data-bridge-flow]').setAttribute('opacity',active?'1':'0');for(const[type,u]of[['anion',1-phase%1],['cation',phase%1]]){const p=K.iso([74+42*u,-15,78.2],P),dot=root.querySelector(`[data-bridge-${type}]`);dot.setAttribute('cx',p[0]);dot.setAttribute('cy',p[1]);}}
