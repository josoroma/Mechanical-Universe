import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as Q from '../laboratory/orbits.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=780,PLAN={x:-180,y:-180,w:360,d:360,r:12},SCALE=70;
export const P=K.fitProjection(K.boxCorners(PLAN,-14,60),WIDTH,HEIGHT,{pad:45,azimuth:48,elevation:38});
export const defs=C.defs;
const path=ps=>C.path(ps,P),line=C.line,F={o:[0,0,0],a:[0,0,1],u:[1,0,0],v:[0,1,0]};
const polar=(r,a,z=22)=>[r*Math.cos(a),r*Math.sin(a),z];
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'LAS LEYES DE KEPLER · XXI'),B=C.builders(parts,P),cover=parts.find(p=>p.name==='base.cover');
 const circles=[162,170].map(r=>path(Array.from({length:145},(_,i)=>polar(r,Q.TAU*i/144)))).join('');let ticks='';for(let i=0;i<72;i++){const a=Q.TAU*i/72;ticks+=path([polar(i%6?168:162,a),polar(170,a)]);}cover.inner+=line(circles)+line(ticks);for(let i=0;i<3;i++)cover.inner+=`<path class="swept-sector" data-sector="${i}" fill="${i===2?'#63daca':'#b79aff'}" opacity="${i===2?.2:.12}"/>`;cover.svg=C.bodySvg(cover);
 B.c('sun.foot',0,0,10,22,6,'iron');B.c('sun.post',0,0,6,28,10,'brass');B.ball('sun.body',[0,0,47],9,'gold');
 B.c('eccentricity.knob',135,135,9,22,8,'iron',line(K.knurl(135,135,9,22,30,36,P,0)));parts.at(-1).inner+=`<path class="iso-line" data-knob d="${path([[135,135,30],[144,135,30]])}"/>`;parts.at(-1).svg=C.bodySvg(parts.at(-1));B.c('knob.hub',135,135,1.2,30,.5,'silver');fixedParts=parts;return parts;
}
let guideKey='',guideParts=[];
export function guide(s){const key=[s.axis,s.eccentricity].join(':');if(key===guideKey)return guideParts;const parts=[],B=C.builders(parts,P),a=s.axis*SCALE,e=s.eccentricity,b=a*Math.sqrt(1-e*e),point=(E,offset)=>{const cs=Math.cos(E),sn=Math.sin(E),length=Math.hypot(cs/a,sn/b);return [a*(cs-e)+offset*cs/a/length,b*sn+offset*sn/b/length];};for(let i=0;i<72;i++){const lo=Q.TAU*i/72,hi=Q.TAU*(i+1)/72;B.prism(`orbit.guide.${i}`,F,[point(lo,-5),point(lo,5),point(hi,5),point(hi,-5)],22,24,'silver');}guideKey=key;guideParts=parts;return parts;}
export function moving(s){const p=O.position(s),x=p.x*SCALE,y=p.y*SCALE,r=p.r*SCALE,parts=[],B=C.builders(parts,P,true),A=G.frameAlong([0,0,32],[x,y,0]);B.c('planet.car',x,y,4,24,6,'iron');B.c('planet.post',x,y,4,30,4,'silver');B.ball('planet.body',[x,y,40],6,'teal');B.disc('radius.gland',A,6,12,1.5,'brass');B.slide('radius.rod',A,12,r-4,.8,'silver');return parts;}
export function scene(s=O.create()){return [...fixed(),...guide(s),...moving(s)];}
export function svgParts(parts,order){return C.svgParts(parts,order,P);}
export function sector(s,M){const e=s.eccentricity,a=s.axis,b=a*Math.sqrt(1-e*e),points=[[0,0,22]];for(let i=0;i<=36;i++){const E=Q.eccentricAnomaly(M+Q.TAU*i/(12*36),e);points.push([SCALE*a*(Math.cos(E)-e),SCALE*b*Math.sin(E),22]);}points.push([0,0,22]);return path(points)+'Z';}
export function afterPaint(s,root){const p=O.position(s);[0,Math.PI,p.M].forEach((M,i)=>root.querySelector(`[data-sector="${i}"]`).setAttribute('d',sector(s,M)));const a=s.eccentricity/.65*1.5*Math.PI;root.querySelector('[data-knob]').setAttribute('d',path([[135,135,30],[135+9*Math.cos(a),135+9*Math.sin(a),30]]));}
