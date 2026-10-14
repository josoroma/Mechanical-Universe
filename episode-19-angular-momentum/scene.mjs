import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=650,PLAN={x:-212,y:-75,w:430,d:180,r:10};
export const P=K.fitProjection([...K.boxCorners(PLAN,-14,22),[150,-50,105],[-100,0,62]],WIDTH,HEIGHT,{pad:45,azimuth:60,elevation:32});
export const defs=C.defs;
const path=ps=>C.path(ps,P),line=C.line;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'MOMENTO ANGULAR · XIX'),{c,screw}=C.builders(parts,P);
 c('platform.foot',-100,0,16,22,6,'iron');c('platform.bearing',-100,0,7,28,6,'silver');
 c('platform.disc',-100,0,64,34,6,'enamel',line(K.planOutline({x:-163,y:-63,w:126,d:126,r:63},40,P,32)));c('platform.hub',-100,0,5,40,4,'silver');
 c('wheel.foot',105,0,15,22,5,'iron');c('wheel.post',105,0,5,27,40,'brass');c('wheel.collar',105,0,7,67,3,'silver');
 for(const[x,y]of[[96,0],[114,0]])screw(`wheel.screw.${x}`,x,y,27,1);fixedParts=parts;return parts;
}
export function moving(c){const parts=[],B=C.builders(parts,P,true),s=O.snapshot(c),F={o:[-100,0,0],a:[0,0,1],u:[Math.cos(s.theta),Math.sin(s.theta),0],v:[-Math.sin(s.theta),Math.cos(s.theta),0]};
 const point=(x,y,z)=>G.add3(F.o,G.add3(G.mul3(F.u,x),G.add3(G.mul3(F.v,y),[0,0,z])));
 for(const sign of[-1,1]){const r=sign*40*c.radius,x1=sign*8,x2=sign*56;
 B.prism(`platform.rail.${sign}`,F,[[Math.min(x1,x2),-2],[Math.max(x1,x2),-2],[Math.max(x1,x2),2],[Math.min(x1,x2),2]],40,43,'silver');
 B.prism(`platform.car.${sign}`,F,[[r-4,-3],[r+4,-3],[r+4,3],[r-4,3]],43,47,'enamel');
 B.disc(`platform.weight.${sign}`,{...F,o:point(r,0,0)},47,57,4,sign<0?'copper':'brass');
 for(const side of[-1,1])B.prism(`platform.ear.${sign}.${side}`,F,[[r-1,Math.min(3*side,5*side)],[r+1,Math.min(3*side,5*side)],[r+1,Math.max(3*side,5*side)],[r-1,Math.max(3*side,5*side)]],57,61,'silver');
 B.rod(`platform.handle.${sign}`,point(r,-5,62),point(r,5,62),1,'iron');
 }
 const er=[Math.cos(s.phi),Math.sin(s.phi),0],ep=[-Math.sin(s.phi),Math.cos(s.phi),0],ez=[0,0,1],pivot=[105,0,72],centre=G.add3(pivot,G.mul3(er,30));
 const W={o:pivot,a:er,u:G.add3(G.mul3(ep,Math.cos(s.psi)),G.mul3(ez,Math.sin(s.psi))),v:G.add3(G.mul3(ep,-Math.sin(s.psi)),G.mul3(ez,Math.cos(s.psi)))};
 B.disc('wheel.axle',W,0,25,2,'silver');B.disc('wheel.hub',W,25,35,5,'brass');B.disc('wheel.nut',W,35,38,3,'silver');
 const radial=a=>G.add3(G.mul3(W.u,Math.cos(a)),G.mul3(W.v,Math.sin(a))),N=32;
 for(let i=0;i<N;i++){const a=2*Math.PI*i/N,b=2*Math.PI*(i+1)/N,xy=(r,t)=>[r*Math.cos(t),r*Math.sin(t)];
 B.prism(`wheel.rim.${i}`,W,[xy(24,a),xy(26,a),xy(26,b),xy(24,b)],28.9,31.1,'iron');
 const n=radial((a+b)/2),r=24*Math.cos(Math.PI/N),point=r=>G.add3(centre,G.mul3(n,r));B.rod(`wheel.spoke.${i}`,point(5),point(r-1.4),.22,i%8===0?'copper':'silver');B.rod(`wheel.nipple.${i}`,point(r-1.4),point(r),.45,'brass');
 }
 return parts;
}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export function svgParts(parts,order){return C.svgParts(parts,order,P);}
