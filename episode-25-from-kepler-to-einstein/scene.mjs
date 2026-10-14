import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as Q from '../laboratory/orbits.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=660,PLAN={x:-212,y:-110,w:430,d:240,r:10},SCALE=150;
export const P=K.fitProjection(K.boxCorners(PLAN,-14,60),WIDTH,HEIGHT,{pad:40,azimuth:64,elevation:36});
export const defs=C.defs;
const path=ps=>C.path(ps,P),line=C.line,polar=(x,r,a)=>[x+r*Math.cos(a),r*Math.sin(a),26];
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'MERCURIO · XXV'),B=C.builders(parts,P);for(const[i,x]of[-105,105].entries()){const circles=[86,89].map(r=>path(Array.from({length:145},(_,j)=>polar(x,r,Q.TAU*j/144)))+'Z').join('');let ticks='';for(let j=0;j<72;j++){const a=Q.TAU*j/72;ticks+=path([polar(x,j%6?88:86,a),polar(x,89,a)]);}B.c(`plate.${i}`,x,0,90,22,4,'enamel',line(circles)+line(ticks)+`<path class="iso-line" data-guide="${i}" style="stroke:${i?'#63daca':'#b79aff'}"/>${i?'<path class="iso-line" data-initial data-tone="lo"/><path class="iso-line" data-history style="stroke:#63daca;opacity:.5"/>':''}`);B.c(`sun.foot.${i}`,x,0,10,26,2,'iron');B.c(`sun.post.${i}`,x,0,6,28,10,'brass');B.ball(`sun.body.${i}`,[x,0,47],9,'gold');}
 B.c('scale.knob',190,96,8,22,7,'iron',line(K.knurl(190,96,8,22,29,36,P,0))+`<path class="iso-line" data-knob d="${path([[190,96,29],[198,96,29]])}"/>`);B.c('scale.hub',190,96,1,29,.5,'silver');fixedParts=parts;return parts;
}
export function moving(s){const parts=[],B=C.builders(parts,P,true);for(let i=0;i<2;i++){const p=O.position(s,!!i),ox=i?105:-105,x=ox+SCALE*p.x,y=SCALE*p.y,A=G.frameAlong([ox,0,32],[p.x,p.y,0]);B.c(`planet.car.${i}`,x,y,4,26,8,'iron');B.ball(`planet.body.${i}`,[x,y,39],5,i?'teal':'violet');B.disc(`radius.gland.${i}`,A,6,12,1.2,'brass');B.slide(`radius.rod.${i}`,A,12,SCALE*p.r-4,.65,'silver');}return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export function svgParts(parts,order){return C.svgParts(parts,order,P);}
export function ellipse(s,ox,phi){return path(Array.from({length:181},(_,i)=>{const p=Q.orbit(O.AXIS,s.eccentricity,O.MU,Q.TAU*i/180,phi);return [ox+SCALE*p.x,SCALE*p.y,26];}))+'Z';}
export function afterPaint(s,root){const phi=O.shift(s.eccentricity)*s.t*s.amplification;root.querySelector('[data-guide="0"]').setAttribute('d',ellipse(s,-105,0));root.querySelector('[data-guide="1"]').setAttribute('d',ellipse(s,105,phi));root.querySelector('[data-initial]').setAttribute('d',ellipse(s,105,0));const n=Math.max(1,Math.ceil(s.t*100)),history=Array.from({length:n+1},(_,i)=>{const p=O.position({...s,t:s.t*i/n},true);return [105+SCALE*p.x,SCALE*p.y,26];});root.querySelector('[data-history]').setAttribute('d',path(history));const a=s.amplification/100000*Math.PI*1.5;root.querySelector('[data-knob]').setAttribute('d',path([[190,96,29],[190+8*Math.cos(a),96+8*Math.sin(a),29]]));}
