import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as T from '../laboratory/kit/tube.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as Q from '../laboratory/orbits.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=720,PLAN={x:-185,y:-125,w:370,d:280,r:12},SCALE=320;
export const P=K.fitProjection(K.boxCorners(PLAN,-14,65),WIDTH,HEIGHT,{pad:45,azimuth:53,elevation:37});
export const defs=C.defs;
const path=ps=>C.path(ps,P),line=C.line;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'FUERZA CENTRAL · XXII'),B=C.builders(parts,P),cover=parts.find(p=>p.name==='base.cover');cover.inner+=`<path class="iso-line" data-orbit data-tone="lo"/>`;cover.svg=C.bodySvg(cover);
 B.c('tensor.foot',0,0,10,22,5,'iron');B.c('tensor.shaft',0,0,6,27,13,'silver');B.c('tensor.collar',0,0,7,40,1,'brass');B.c('tensor.drum',0,0,9,41,6,'iron',line(K.knurl(0,0,9,41,47,40,P,0)));B.c('tensor.cap',0,0,2,47,1,'silver');
 B.slab('controller.foot',{x:113,y:33,w:49,d:49,r:3},22,5,'iron');B.slab('controller.body',{x:115,y:35,w:45,d:45,r:2},27,22,'enamel');B.slab('controller.lid',{x:115,y:35,w:45,d:45,r:2},49,2,'brass');
 for(const [i,[x,y]]of[[118,38],[157,38],[118,77],[157,77]].entries())B.screw(`controller.screw.${i}`,x,y,51,1);
 B.c('force.bezel',137.5,57.5,14,51,1.4,'iron');let ticks='';for(let i=0;i<=20;i++){const a=-Math.PI*.75+i*Math.PI*1.5/20,r=i%5?11:9;ticks+=path([[137.5+r*Math.cos(a),57.5+r*Math.sin(a),53],[137.5+12*Math.cos(a),57.5+12*Math.sin(a),53]]);}B.c('force.dial',137.5,57.5,12,52.4,.6,'ivory',line(ticks,'mid')+`<path class="iso-line" data-needle style="stroke:#ac3e68;stroke-width:1;fill:none" data-free="end" data-tone="hi"/>`);B.c('force.hub',137.5,57.5,1,53,.4,'iron');
 const ruler={x:-160,y:115,w:240,d:8,r:1};B.slab('radial.ruler',ruler,22,.6,'ivory',line(K.topTicks(-156,76,4,5,115,22.6,[2,8],P).minor)+line(K.topTicks(-156,76,4,5,115,22.6,[2,8],P).major,'mid'));fixedParts=parts;return parts;
}
export function routes(s){const p=O.position(s),d=[p.x/p.r,p.y/p.r,0],at=r=>[r*d[0],r*d[1],32];return [{name:'radial.string',points:[at(6),at(SCALE*p.r-4)],r:.22}];}
export function moving(s){const p=O.position(s),x=p.x*SCALE,y=p.y*SCALE,parts=[],B=C.builders(parts,P,true);B.c('puck.body',x,y,4,22,13,'iron');B.ball('puck.cap',[x,y,41],6,'teal');for(const r of routes(s))for(const [i,tube]of T.tubePieces(r.points,r.r,P,{maxLength:1e6}).entries())parts.push({name:`${r.name}.${i}`,at:tube.mid,shape:{type:'tube',points:tube.points,r:r.r,route:r.name,chunk:i},tube,svg:`<g class="material-silver">${T.tubeSvg(tube,{tone:'hi'})}</g>`});return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export function svgParts(parts,order){return C.svgParts(parts,order,P);}
export function afterPaint(s,root){const e=O.elements(s),points=Array.from({length:181},(_,i)=>{const p=Q.orbit(e.a,e.e,s.mu,Q.TAU*i/180,e.peri);return [SCALE*p.x,SCALE*p.y,22];});root.querySelector('[data-orbit]').setAttribute('d',path(points)+'Z');const a=-Math.PI*.75+Math.min(1,O.snapshot(s).tension/.2)*Math.PI*1.5;root.querySelector('[data-needle]').setAttribute('d',path([[137.5,57.5,53],[137.5+10*Math.cos(a),57.5+10*Math.sin(a),53]]));}
