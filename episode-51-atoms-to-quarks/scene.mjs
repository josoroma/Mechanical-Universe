import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-190,y:-125,w:380,d:265,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,130),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:35});
export const defs=C.defs;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const a=C.base(P,PLAN,'ÁTOMOS · NÚCLEOS · QUARKS · LI'),B=C.builders(a,P);for(const[name,x]of[['source',-155],['detector',140]]){const plan={x,y:30,w:15,d:20,r:1};B.slab(name,plan,22,38,'iron',C.line(K.sideSeam(plan,48,P,6)));B.c(name+'.cap',x+7.5,40,3,60,4,'silver',C.line(K.knurl(x+7.5,40,3,60,64,24,P,0)));}
 const Fs={o:[0,39,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]},q=K.iso([-140,39,45],P);B.prism('beam.screen',Fs,[[-140,43],[140,43],[140,47],[-140,47]],0,.3,'iron',C.line(C.path([[-140,39,45],[140,39,45]],P))+`<circle data-beam cx="${q[0]}" cy="${q[1]}" r="2.5" fill="#f2d49b"/>`);
 for(const[i,x]of[-110,0,110].entries()){B.slab('cavity.foot.'+i,{x:x-9,y:30,w:18,d:20,r:1},22,3,'iron');B.slab('cavity.stem.'+i,{x:x-3,y:35,w:6,d:10,r:.2},25,8,'iron');const F={o:[x,40,45],a:[1,0,0],u:[0,1,0],v:[0,0,1]};for(let j=0;j<12;j++){const p=E.TAU*j/12,r=E.TAU*(j+1)/12;B.prism('cavity.'+i+'.'+j,F,[[8*Math.cos(p),8*Math.sin(p)],[12*Math.cos(p),12*Math.sin(p)],[12*Math.cos(r),12*Math.sin(r)],[8*Math.cos(r),8*Math.sin(r)]],-3,3,'copper');}
 B.c('viewer.'+i+'.foot',x,-31,12,22,3,'iron');B.c('viewer.'+i+'.post',x,-31,2,25,24,'silver');const V={o:[x,0,75],a:[0,1,0],u:[1,0,0],v:[0,0,1]};B.disc('viewer.'+i+'.case',V,-33,-29,26,'iron',C.line(G.ribsOf(V,-33,-29,26,64,P,{seams:true})));let picture='';const dot=(dx,dz,r,fill,extra='')=>{const q=K.iso([x+dx,-28,75+dz],P);return `<circle cx="${q[0]}" cy="${q[1]}" r="${r}" fill="${fill}" ${extra}/>`;};
 if(i===0){for(let r=20;r>=2;r-=2)picture+=`<path d="${G.circleOf(V,-28,r,P)}" fill="#b7a0ff" opacity=".08"/>`;picture+=dot(0,0,2,'#f2d49b');}
 if(i===1){for(let j=0;j<7;j++){const t=E.TAU*j/6;picture+=dot(j?8*Math.cos(t):0,j?8*Math.sin(t):0,4,j%2?'#71d9cb':'#b7a0ff');}}
 if(i===2){const p=Array.from({length:3},(_,j)=>[x+11*Math.cos(E.TAU*j/3),-28,75+11*Math.sin(E.TAU*j/3)]);picture+=C.line(C.path([...p,p[0]],P));for(let j=0;j<3;j++)picture+=dot(11*Math.cos(E.TAU*j/3),11*Math.sin(E.TAU*j/3),4,j<2?'#f2d49b':'#ef91bc',`data-quark="${j}"`);}
 B.disc('viewer.'+i+'.face',V,-29,-28,24,'iron',C.line(G.circleOf(V,-28,22,P))+`<g data-viewer="${i}" opacity="${i?'.15':'1'}">${picture}</g>`);}
 E.meter(B,P,'resolution',135,-80);E.knob(B,P,'momentum.knob',115,100);E.knob(B,P,'baryon.knob',155,100);fixedParts=a;return a;}
export function scene(s=O.create()){return fixed();}
export const svgParts=(a,o)=>C.svgParts(a,o,P);
export function afterPaint(s,root){const v=O.snapshot(s),q=K.iso([v.beam,39,45],P),beam=root.querySelector('[data-beam]');beam.setAttribute('cx',q[0]);beam.setAttribute('cy',q[1]);for(let i=0;i<3;i++)root.querySelector(`[data-viewer="${i}"]`).setAttribute('opacity',v.stage>=i?1:.15);for(let i=0;i<3;i++)root.querySelector(`[data-quark="${i}"]`).setAttribute('fill',i<v.up?'#f2d49b':'#ef91bc');E.setMeter(root,P,'resolution',135,-80,(s.logQ+6)/10);E.setKnob(root,P,'momentum.knob',115,100,(s.logQ+6)/10);E.setKnob(root,P,'baryon.knob',155,100,s.baryon);}
