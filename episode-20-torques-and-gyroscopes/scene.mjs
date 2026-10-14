import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=730,PLAN={x:-120,y:-90,w:240,d:190,r:10},CENTRE=[0,0,112],N=32;
export const P=K.fitProjection([...K.boxCorners(PLAN,-14,22),[-62,-62,174],[62,62,174]],WIDTH,HEIGHT,{pad:45,azimuth:55,elevation:30});
export const defs=C.defs;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'GIRÓSCOPO · XX'),{c,screw}=C.builders(parts,P),top=112-60*Math.cos(Math.PI/N);c('gyro.foot',0,0,18,22,5,'iron');c('gyro.post',0,0,6,27,top-30,'brass');c('gyro.yaw-bearing',0,0,9,top-3,3,'silver');for(const [i,[x,y]]of[[12,0],[-12,0],[0,12],[0,-12]].entries())screw(`gyro.foot.screw.${i}`,x,y,27,1.1);fixedParts=parts;return parts;}
export function moving(s){const parts=[],B=C.builders(parts,P,true),er=[Math.cos(s.phi),Math.sin(s.phi),0],ep=[-Math.sin(s.phi),Math.cos(s.phi),0],n=G.add3(G.mul3(er,Math.sin(s.theta)),[0,0,Math.cos(s.theta)]),outer={o:CENTRE,a:er,u:ep,v:[0,0,1]},inner={o:CENTRE,a:n,u:ep,v:G.cross3(n,ep)},xy=(r,t)=>[r*Math.cos(t),r*Math.sin(t)];
 for(const [name,F,r0,r1,m]of[['outer',outer,55,60,'brass'],['inner',inner,35,40,'enamel']])for(let i=0;i<N;i++){const a=2*Math.PI*(i+.5)/N,b=2*Math.PI*(i+1.5)/N;B.prism(`gyro.${name}.${i}`,F,[xy(r0,a),xy(r1,a),xy(r1,b),xy(r0,b)],-1.5,1.5,m);}
 for(const sign of[-1,1]){const A={o:CENTRE,a:G.mul3(ep,sign),u:er,v:[0,0,-sign]},a=40*Math.cos(Math.PI/N),b=55*Math.cos(Math.PI/N);B.disc(`gyro.pitch.${sign}`,A,a,b-3,2.2,'silver');B.disc(`gyro.pitch-collar.${sign}`,A,b-3,b,3.2,'brass');B.disc(`gyro.radial-support.${sign}`,A,6,35*Math.cos(Math.PI/N),1.5,'silver');}
 B.disc('gyro.central-bearing',inner,-3,3,6,'brass');B.disc('gyro.shaft',inner,3,10,2,'silver');B.disc('gyro.front-hub',inner,10,12,5,'brass');B.disc('gyro.rotor',inner,12,14,25,'copper');B.disc('gyro.rear-hub',inner,14,18,5,'silver');B.disc('gyro.nut',inner,18,19,4,'iron');
 const radial=G.add3(G.mul3(inner.u,Math.cos(s.psi)),G.mul3(inner.v,Math.sin(s.psi))),point=r=>G.add3(CENTRE,G.add3(G.mul3(n,14),G.mul3(radial,r))),d=C.path([point(5),point(25)],P),p=parts.find(p=>p.name==='gyro.rotor');p.inner=C.line(d,'hi');p.livePaths={'.iso-line[data-engraving]':d};p.svg=C.bodySvg(p).replace('class="iso-line"','class="iso-line" data-engraving');
 return parts;
}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export function svgParts(parts,order){return C.svgParts(parts,order,P);}
