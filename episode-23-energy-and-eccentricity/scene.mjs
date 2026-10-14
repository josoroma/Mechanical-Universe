import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as Q from '../laboratory/orbits.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=690,PLAN={x:-212,y:-90,w:430,d:220,r:10},SCALE=25;
export const P=K.fitProjection([...K.boxCorners(PLAN,-14,22),[-180,50,90],[180,50,90]],WIDTH,HEIGHT,{pad:40,azimuth:62,elevation:34});
export const defs=C.defs;
const F={o:[0,0,0],a:[0,0,1],u:[1,0,0],v:[0,1,0]},profileF={o:[0,0,0],a:[0,1,0],u:[1,0,0],v:[0,0,-1]},path=ps=>C.path(ps,P),line=C.line;
export function profile(rho){return [-180+100*(rho-.4),50,30+45*(O.potential(rho)+.5)];}
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'ENERGÍA ORBITAL · XXIII'),B=C.builders(parts,P);
 for(const [i,x]of[-130,0,130].entries()){B.c(`sun.foot.${i}`,x,-35,3,22,2,'iron');B.c(`sun.post.${i}`,x,-35,1.5,24,2,'brass');B.ball(`sun.body.${i}`,[x,-35,29],3,'gold');}
 for(let i=0;i<60;i++){const a=profile(.4+3.6*i/60),b=profile(.4+3.6*(i+1)/60);B.prism(`potential.track.${i}`,profileF,[[a[0],-a[2]],[b[0],-b[2]],[b[0],1.5-b[2]],[a[0],1.5-a[2]]],49,51,'silver');}
 for(const[i,rho]of[.4,1,4].entries()){const p=profile(rho),x=p[0]+(i===0?-2:i===2?2:0);if(i!==1)B.slab(`potential.shoe.${i}`,{x:i===0?-184:180,y:49,w:4,d:2,r:0},p[2]-1.5,1.5,'silver');B.c(`potential.foot.${i}`,x,50,4,22,2,'iron');B.c(`potential.post.${i}`,x,50,.8,24,p[2]-1.5-24,'brass');}
 const ruler={x:-180,y:68,w:360,d:8,r:1};B.slab('profile.ruler',ruler,22,.6,'ivory',line(K.topTicks(-176,176,4,5,68,22.6,[2,8],P).minor)+line(K.topTicks(-176,176,4,5,68,22.6,[2,8],P).major,'mid'));
 B.c('energy.knob',194,92,8,22,7,'iron',line(K.knurl(194,92,8,22,29,36,P,0))+`<path class="iso-line" data-knob d="${path([[194,92,29],[202,92,29]])}"/>`);B.c('energy.knob.hub',194,92,1,29,.5,'silver');fixedParts=parts;return parts;
}
let guideKey='',guideParts=[];
export function guides(s){const key=[s.parameter,s.eccentricity].join(':');if(key===guideKey)return guideParts;const parts=[],B=C.builders(parts,P);for(const[i,e]of[0,s.eccentricity,.6].entries()){const ox=[-130,0,130][i],a=s.parameter/(1-e*e)*SCALE,b=a*Math.sqrt(1-e*e),point=(E,d)=>{const c=Math.cos(E),n=Math.sin(E),length=Math.hypot(c/a,n/b);return [ox+a*(c-e)+d*c/a/length,-35+b*n+d*n/b/length];};for(let j=0;j<36;j++){const a=Q.TAU*j/36,b=Q.TAU*(j+1)/36;B.prism(`orbit.${i}.guide.${j}`,F,[point(a,-2),point(a,2),point(b,2),point(b,-2)],22,23,'silver');}}guideKey=key;guideParts=parts;return parts;}
export function moving(s){const parts=[],B=C.builders(parts,P,true);for(const[i,e]of[0,s.eccentricity,.6].entries()){const p=O.position(s,e),ox=[-130,0,130][i],x=ox+SCALE*p.x,y=-35+SCALE*p.y,radial=G.frameAlong([ox,-35,25],[p.x,p.y,0]);B.c(`planet.car.${i}`,x,y,1.5,23,4,'iron');B.ball(`planet.body.${i}`,[x,y,29.5],2.5,i===1?'teal':'silver');B.slide(`radius.rod.${i}`,radial,1.5,SCALE*p.r-1.5,.3,'silver');}
 const p=O.snapshot(s),at=profile(p.rho),x=at[0],z=at[2],beamZ=z+5.2;B.c('probe.foot',x,40,3,22,3,'iron');B.c('probe.gland',x,40,1.5,25,4,'brass');B.slide('probe.rod',G.frameAlong([x,40,0],[0,0,1]),29,beamZ-.8,.6,'silver');B.rod('probe.arm',[x,40,beamZ],[x,50,beamZ],.8,'silver');B.ball('probe.ball',[x,50,z+10],4,'violet');
 const level=30+45*(p.energyNorm+.5);for(const [i,x]of[-175,175].entries()){B.c(`energy.foot.${i}`,x,92,3,22,2,'iron');B.c(`energy.post.${i}`,x,92,1,24,level-.6-24,'brass');}B.rod('energy.bar',[-175,92,level],[175,92,level],.6,'copper');return parts;
}
export function scene(s=O.create()){return [...fixed(),...guides(s),...moving(s)];}
export function svgParts(parts,order){return C.svgParts(parts,order,P);}

export function afterPaint(s,root){const a=s.eccentricity/.6*1.5*Math.PI;root.querySelector('[data-knob]').setAttribute('d',path([[194,92,29],[194+8*Math.cos(a),92+8*Math.sin(a),29]]));}
