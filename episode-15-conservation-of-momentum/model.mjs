export const MASS_A=.2,SPRING_K=32,K=SPRING_K/2,D=.432,LIMIT=1.1,XA=-.5,XB=.35;
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function raw(c,t){
  const {massB,vA,vB,omega,contact,duration,V,Q0}=c,M=MASS_A+massB,w=vA-vB;
  let xA,xB,uA,uB,compression=0,phase='aproximación';
  if(!Number.isFinite(contact)||t<=contact){xA=XA+vA*t;xB=XB+vB*t;uA=vA;uB=vB;}
  else if(t<contact+duration){const tau=t-contact,cos=Math.cos(omega*tau);compression=w/omega*Math.sin(omega*tau);const d=D-compression,Q=Q0+V*t;xA=Q-massB/M*d;xB=Q+MASS_A/M*d;uA=V+massB/M*w*cos;uB=V-MASS_A/M*w*cos;phase=tau<duration/2?'compresión':'expansión';}
  else{const end=contact+duration,Q=Q0+V*end;uA=V-massB/M*w;uB=V+MASS_A/M*w;xA=Q-massB/M*D+uA*(t-end);xB=Q+MASS_A/M*D+uB*(t-end);phase='separación';}
  const pA=MASS_A*uA,pB=massB*uB,KA=MASS_A*uA*uA/2,KB=massB*uB*uB/2,U=K*compression*compression/2;
  return{t,xA,xB,vA:uA,vB:uB,pA,pB,P:pA+pB,KA,KB,U,E:KA+KB+U,compression,force:K*compression,phase,Q:Q0+V*t,V};
}
const linearExit=(x,v)=>v>0?(LIMIT-x)/v:v<0?(-LIMIT-x)/v:Infinity;
export function create({massB=.2,vA=.6,vB=0}={}){
  if(![.1,.2,.4].includes(massB)||!Number.isFinite(vA)||vA<.2||vA>.8||![-.2,0,.2].includes(vB))throw new RangeError('Parámetros fuera de rango');
  const M=MASS_A+massB,mu=MASS_A*massB/M,omega=Math.sqrt(K/mu),w=vA-vB,contact=w>1e-12?(XB-XA-D)/w:Infinity,duration=Math.PI/omega;
  const c={massB,vA,vB,mu,omega,contact,duration,V:(MASS_A*vA+massB*vB)/M,Q0:(MASS_A*XA+massB*XB)/M,t:0};
  const before=Math.min(linearExit(XA,vA),linearExit(XB,vB));let end=before;
  if(contact<before){
    let previous=contact,found=false;
    for(let i=1;i<=128;i++){const t=contact+duration*i/128,s=raw(c,t);if(Math.max(Math.abs(s.xA),Math.abs(s.xB))>=LIMIT){let lo=previous,hi=t;for(let j=0;j<50;j++){const mid=(lo+hi)/2,q=raw(c,mid);if(Math.max(Math.abs(q.xA),Math.abs(q.xB))>=LIMIT)hi=mid;else lo=mid;}end=(lo+hi)/2;found=true;break;}previous=t;}
    if(!found){const t=contact+duration,s=raw(c,t);end=t+Math.min(linearExit(s.xA,s.vA),linearExit(s.xB,s.vB));}
  }
  c.end=end;c.encounter=contact<end;c.P0=MASS_A*vA+massB*vB;c.E0=MASS_A*vA*vA/2+massB*vB*vB/2;return c;
}
export function sample(c,t=c.t){const s=raw(c,clamp(t,0,c.end));return{...s,done:s.t>=c.end-1e-10,momentumError:s.P-c.P0,energyError:s.E-c.E0,impulseA:s.pA-MASS_A*c.vA,impulseB:s.pB-c.massB*c.vB};}
export function advance(c,dt){if(!Number.isFinite(dt)||dt<0)throw new RangeError('Paso temporal no válido');return{...c,t:Math.min(c.end,c.t+dt)};}
export function finalVelocities(c){const M=MASS_A+c.massB;return{vA:((MASS_A-c.massB)*c.vA+2*c.massB*c.vB)/M,vB:(2*MASS_A*c.vA+(c.massB-MASS_A)*c.vB)/M};}
