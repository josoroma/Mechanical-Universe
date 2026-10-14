import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as Q from '../laboratory/orbits.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=790,PLAN={x:-180,y:-180,w:360,d:360,r:12},SCALE=70;
export const P=K.fitProjection(K.boxCorners(PLAN,-14,118),WIDTH,HEIGHT,{pad:45,azimuth:48,elevation:36});
export const defs=C.defs;
const path=ps=>C.path(ps,P),line=C.line,circle=r=>path(Array.from({length:145},(_,i)=>[r*Math.cos(Q.TAU*i/144),r*Math.sin(Q.TAU*i/144),22]))+'Z';
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'TRANSFERENCIA · XXIV'),B=C.builders(parts,P),cover=parts.find(p=>p.name==='base.cover');cover.inner+=line(circle(70))+line(circle(162))+line(circle(170));let ticks='';for(let i=0;i<72;i++){const a=Q.TAU*i/72;ticks+=path([[Math.cos(a)*(i%6?168:162),Math.sin(a)*(i%6?168:162),22],[170*Math.cos(a),170*Math.sin(a),22]]);}cover.inner+=line(ticks)+`<path class="iso-line" data-outer data-tone="mid"/><path class="iso-line" data-transfer style="stroke:#b79aff;opacity:.7"/>`;cover.svg=C.bodySvg(cover);
 B.c('sun.foot',0,0,12,22,5,'iron');for(const[i,[a,b]]of[[27,31],[33,59],[61,85],[87,100]].entries())B.c(`sun.shaft.${i}`,0,0,6,a,b-a,'brass');for(const [i,z]of[31,59,85].entries())B.c(`sun.bearing.${i}`,0,0,9,z,2,'silver',line(K.knurl(0,0,9,z,z+2,36,P,0)));B.ball('sun.body',[0,0,109],9,'gold');
 B.c('phase.knob',135,135,9,22,8,'iron',line(K.knurl(135,135,9,22,30,36,P,0))+`<path class="iso-line" data-knob d="${path([[135,135,30],[144,135,30]])}"/>`);B.c('phase.hub',135,135,1,30,.5,'silver');fixedParts=parts;return parts;
}
export function moving(s){const parts=[],B=C.builders(parts,P,true),p=O.positions(s);for(const [name,body,z,bottom,centre,r,m]of[['inner',p.inner,32,30.8,45,4,'teal'],['outer',p.outer,60,58.8,73,4,'pink'],['ship',p.ship,86,85,96,3,'violet']]){const x=body.x*SCALE,y=body.y*SCALE,F=G.frameAlong([0,0,z],[x,y,0]);if(name==='ship'){B.disc('ship.gland',F,9,17,2,'brass');B.slide('ship.arm',F,17,body.r*SCALE-r,.8,'silver');}else B.disc(`${name}.arm`,F,9,body.r*SCALE-r,1.2,'silver');const ballR=name==='ship'?4:5;B.c(`${name}.post`,x,y,r,bottom,centre-ballR-bottom,'iron');B.ball(`${name}.body`,[x,y,centre],ballR,m);}return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export function svgParts(parts,order){return C.svgParts(parts,order,P);}
export function afterPaint(s,root){const p=O.transfer(s),points=Array.from({length:181},(_,i)=>{const b=Q.orbit(p.a,p.e,Q.SOLAR_MU,Q.TAU*i/180);return [b.x*SCALE,b.y*SCALE,22];});root.querySelector('[data-outer]').setAttribute('d',circle(SCALE*s.destination));root.querySelector('[data-transfer]').setAttribute('d',path(points)+'Z');const a=s.phaseOffset*Math.PI/90;root.querySelector('[data-knob]').setAttribute('d',path([[135,135,30],[135+9*Math.cos(a),135+9*Math.sin(a),30]]));}
