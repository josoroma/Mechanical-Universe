import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as T from '../laboratory/kit/tube.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as H from './polyhedra.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=770,PLAN={x:-212,y:-90,w:430,d:220,r:10};
export const P=K.fitProjection(K.boxCorners(PLAN,-14,205),WIDTH,HEIGHT,{pad:40,azimuth:60,elevation:32});
export const defs=C.defs;
const path=ps=>C.path(ps,P),line=C.line;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'ARMONÍA · XXVI'),B=C.builders(parts,P);
 for(const[i,cage]of H.cages().entries()){
  for(const[j,v]of cage.vertices.entries())B.ball(`solid.${i}.joint.${j}`,v,cage.joint,'silver');
  for(const[j,[a,b]]of cage.edges.entries()){const va=cage.vertices[a],vb=cage.vertices[b],d=G.unit3(G.sub3(vb,va));B.rod(`solid.${i}.edge.${j}`,G.add3(va,G.mul3(d,cage.joint)),G.sub3(vb,G.mul3(d,cage.joint)),cage.strut,'silver');}
  const bottom=Math.min(...cage.vertices.map(v=>v[2])),supports=i===0?cage.vertices.filter(v=>v[2]<bottom+.01):[cage.vertices.reduce((a,b)=>a[2]<b[2]?a:b)];
  for(const[j,[x,y,z]]of supports.entries()){B.c(`cage.foot.${i}.${j}`,x,y,i===0?3:1,22,1.5,'iron');B.c(`cage.post.${i}.${j}`,x,y,i===0?1:.2,23.5,z-cage.joint-23.5,'brass');}
 }
 for(const[i,[x,y]]of[[72,-42.5],[188,-42.5],[72,42.5],[188,42.5]].entries()){B.c(`music.foot.${i}`,x,y,5,22,3,'iron');B.c(`music.post.${i}`,x,y,2,25,23,'brass');}
 for(const[i,y]of[-45,40].entries()){const plan={x:70,y,w:120,d:5,r:.5};B.slab(`music.bridge.${i}`,plan,48,4,'enamel',line(K.planOutline(K.insetPlan(plan,.6),52,P,4)));for(const[j,x]of[74,186].entries())B.screw(`music.bridge.screw.${i}.${j}`,x,y+2.5,52,.7);}
 for(let i=0;i<6;i++){const x=80+i*20;B.c(`tuner.stem.${i}`,x,42.5,1.5,52,3,'brass');B.c(`tuner.head.${i}`,x,42.5,3.5,55,3,'iron',line(K.knurl(x,42.5,3.5,55,58,24,P,0))+`<path class="iso-line" data-tuner="${i}"/>`);B.c(`tuner.hub.${i}`,x,42.5,.7,58,.4,'silver');}
 B.c('ratio.knob',130,90,8,22,7,'iron',line(K.knurl(130,90,8,22,29,36,P,0))+`<path class="iso-line" data-ratio/>`);B.c('ratio.hub',130,90,1,29,.5,'silver');fixedParts=parts;return parts;
}
export function routes(s){return O.PLANETS.map((_,i)=>{const x=80+i*20,v=O.voice(s,i),points=[[x,-40,50],[x,-35,50],...Array.from({length:47},(_,j)=>{const u=(j+1)/48;return[x+.65*Math.sin(Math.PI*u)**2*Math.sin(v.phase),-35+70*u,50];}),[x,35,50],[x,40,50]];return{name:`string.${i}`,points,r:.14};});}
export function moving(s){const parts=[];for(const r of routes(s))for(const[i,tube]of T.tubePieces(r.points,r.r,P,{maxLength:1e6}).entries())parts.push({name:`${r.name}.${i}`,at:tube.mid,shape:{type:'tube',points:tube.points,r:r.r,route:r.name,chunk:i},tube,svg:`<g class="material-silver">${T.tubeSvg(tube,{tone:'hi'})}</g>`});return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export function svgParts(parts,order){return C.svgParts(parts,order,P);}
export function afterPaint(s,root){for(let i=0;i<5;i++){const selected=i===s.solid;for(const el of root.querySelectorAll(`[data-part^="solid.${i}.edge."] > g`)){el.setAttribute('class',selected?'material-copper':'material-silver');el.querySelector('.iso-edge').style.stroke=selected?'':'var(--silver-top)';}for(const el of root.querySelectorAll(`[data-part^="solid.${i}.joint."] .sphere-body`))el.setAttribute('fill',`url(#sphere-${selected?'gold':'silver'})`);}for(let i=0;i<6;i++){const v=O.voice(s,i),a=Math.log2(v.q)*Math.PI/2,x=80+i*20;root.querySelector(`[data-tuner="${i}"]`).setAttribute('d',path([[x,42.5,58],[x+3.5*Math.cos(a),42.5+3.5*Math.sin(a),58]]));root.querySelector(`[data-part="string.${i}.0"] .tb-body`).style.fill=i===s.planet?'#dbab64':'';root.querySelector(`[data-part="string.${i}.0"] .tb-edge`).style.stroke=i===s.planet?'#efbf8e':'';}
 const a=Math.log2(O.voice(s).q)/Math.log2(49/9)*Math.PI*1.5;root.querySelector('[data-ratio]').setAttribute('d',path([[130,90,29],[130+8*Math.cos(a),90+8*Math.sin(a),29]]));}
