import * as K from '../laboratory/kit/iso-kit.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-175,y:-100,w:350,d:235,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,100),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:38});
export const defs=C.defs;
const count=64;
const floorStrip=(s,i)=>{const w=90*s.length/count,x=-150+i*w;return C.path([[x,-28,25],[x+w,-28,25],[x+w,28,25],[x,28,25],[x,-28,25]],P);};
const panelStrip=i=>{const x=15+130*i/count,w=130/count;return C.path([[x,-30,27],[x+w,-30,27],[x+w,-30,83],[x,-30,83],[x,-30,27]],P);};
function traces(s){const c=O.coefficients(s),points=Array.from({length:161},(_,i)=>{const u=i/160;return {u,w:O.well(s,u),b:O.scattering(s,O.barrierX(s,u),c)};}),max=Math.max(...points.map(p=>p.b.rho),1e-30);return [C.path(points.map(p=>[-150+90*s.length*p.u,-30,55+23*p.w.re*Math.sqrt(s.length)/2]),P),C.path(points.map(p=>[15+130*p.u,-30,55+23*p.b.re/Math.sqrt(max)]),P)];}
function traceMarkup(i,d){return `<g data-quantum="${i}"><path class="iso-line" data-tone="hi" data-wave="${i}" d="${d}"/></g>`;}
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const a=C.base(P,PLAN,'POZO · BARRERA · PROBABILIDAD · LII'),B=C.builders(a,P),s=O.create(),F={o:[0,0,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]},waves=traces(s);
 B.prism('well.screen',F,[[-153,22],[-12,22],[-12,85],[-153,85]],-33,-30,'iron',traceMarkup(0,waves[0]));
 B.slab('well.left',{x:-153,y:-30,w:3,d:63,r:0},22,63,'iron');
 B.slab('barrier.floor',{x:15,y:-30,w:130,d:60,r:0},22,3,'iron');
 B.slab('barrier.front',{x:15,y:30,w:130,d:3,r:0},22,13,'iron');
 const cloud=Array.from({length:count},(_,i)=>`<path data-cloud="1" data-bin="${i}" d="${panelStrip(i)}" fill="#71d9cb" opacity=".1"/>`).join('');
 B.prism('barrier.screen',F,[[15,22],[145,22],[145,85],[15,85]],-33,-30,'iron',`<g data-quantum="1">${cloud}</g>`+traceMarkup(1,waves[1]));
 B.c('barrier.adjuster',80,0,2.4,43,3,'copper',C.line(K.knurl(80,0,2.4,43,46,24,P,0)));
 E.meter(B,P,'probability',-90,75);E.knob(B,P,'length.knob',75,90);E.knob(B,P,'energy.knob',120,90);
 fixedParts=a;return a;
}
export function scene(s=O.create()){const a=[...fixed()],B=C.builders(a,P,true),w=90*s.length,cloud=Array.from({length:count},(_,i)=>`<path data-cloud="0" data-bin="${i}" d="${floorStrip(s,i)}" fill="#b7a0ff" opacity=".1"/>`).join('');
 B.slab('well.floor',{x:-150,y:-30,w,d:60,r:0},22,3,'iron',`<g data-quantum="0">${cloud}</g>`);
 B.slab('well.right',{x:-150+w,y:-30,w:3,d:63,r:0},22,63,'iron');
 B.slab('well.front',{x:-150,y:30,w,d:3,r:0},22,13,'iron');
 B.slab('barrier',{x:80-17.5*s.length,y:-12,w:35*s.length,d:24,r:0},25,18,'iron');return a;
}
export const svgParts=(a,o)=>C.svgParts(a,o,P);
const nodeCache=new WeakMap();
export function afterPaint(s,root){let nodes=nodeCache.get(root);if(!nodes){nodes={waves:[0,1].map(i=>root.querySelector(`[data-wave="${i}"]`)),clouds:[0,1].map(i=>[...root.querySelectorAll(`[data-cloud="${i}"]`)]),groups:[0,1].map(i=>[...root.querySelectorAll(`[data-quantum="${i}"]`)])};nodeCache.set(root,nodes);}const waves=traces(s),c=O.coefficients(s),densities=[Array.from({length:count},(_,i)=>O.well(s,(i+.5)/count).rho),Array.from({length:count},(_,i)=>O.scattering(s,O.barrierX(s,(i+.5)/count),c).rho)];for(let j=0;j<2;j++){nodes.waves[j].setAttribute('d',waves[j]);const max=Math.max(...densities[j],1e-30);for(let i=0;i<count;i++){nodes.clouds[j][i].setAttribute('opacity',.7*densities[j][i]/max);if(j===0)nodes.clouds[j][i].setAttribute('d',floorStrip(s,i));}for(const group of nodes.groups[j])group.setAttribute('opacity',s.experiment===j?1:.2);}E.setMeter(root,P,'probability',-90,75,O.snapshot(s).probability/100);E.setKnob(root,P,'length.knob',75,90,(s.length-.2)/1.3);E.setKnob(root,P,'energy.knob',120,90,(s.energy-.2)/2.8);}
