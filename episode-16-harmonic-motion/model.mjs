export const G=9.80665,K=.2*G,A=.12,BOB_MASS=.2,STEP=1/240,DEG=Math.PI/180;
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function ellipticK(k){let a=1,b=Math.sqrt(1-k*k);for(let i=0;i<30&&Math.abs(a-b)>1e-15;i++){const next=(a+b)/2;b=Math.sqrt(a*b);a=next;}return Math.PI/(2*a);}
export function period(length,angle,linear=false){return linear?2*Math.PI*Math.sqrt(length/G):4*Math.sqrt(length/G)*ellipticK(Math.sin(Math.abs(angle)/2));}
export function create({angle=15,mass=.2,length=1,linear=false}={}){
  if(!Number.isFinite(angle)||angle<0||angle>45||![.1,.2,.4].includes(mass)||![.6,1,1.4].includes(length)||typeof linear!=='boolean')throw new RangeError('Parámetros fuera de rango');
  return{angle,mass,length,linear,theta0:angle*DEG,theta:angle*DEG,omega:0,t:0,ws:Math.sqrt(K/mass),w0:Math.sqrt(G/length),Ts:2*Math.PI*Math.sqrt(mass/K),T0:2*Math.PI*Math.sqrt(length/G),Tp:period(length,angle*DEG,linear)};
}
export function advance(c,dt){
  if(!Number.isFinite(dt)||dt<0||dt>60)throw new RangeError('Paso temporal no válido');const next={...c,t:c.t+dt};
  if(c.linear){next.theta=c.theta0*Math.cos(c.w0*next.t);next.omega=-c.theta0*c.w0*Math.sin(c.w0*next.t);return next;}
  const steps=Math.ceil(dt/STEP),h=steps?dt/steps:0,acc=theta=>-G/c.length*Math.sin(theta);
  for(let j=0;j<steps;j++){const q=next.theta,v=next.omega,a1=v,b1=acc(q),a2=v+b1*h/2,b2=acc(q+a1*h/2),a3=v+b2*h/2,b3=acc(q+a2*h/2),a4=v+b3*h,b4=acc(q+a3*h);next.theta+=h*(a1+2*a2+2*a3+a4)/6;next.omega+=h*(b1+2*b2+2*b3+b4)/6;}
  return next;
}
export function snapshot(c){
  const x=A*Math.cos(c.ws*c.t),v=-A*c.ws*Math.sin(c.ws*c.t),Us=K*x*x/2,Ks=c.mass*v*v/2,Es=K*A*A/2;
  const potential=theta=>c.linear?BOB_MASS*G*c.length*theta*theta/2:BOB_MASS*G*c.length*2*Math.sin(theta/2)**2;
  const Up=potential(c.theta),Kp=BOB_MASS*c.length*c.length*c.omega*c.omega/2,Ep=potential(c.theta0);
  return{t:c.t,spring:{x,v,U:Us,K:Ks,E:Us+Ks,E0:Es,error:Us+Ks-Es,force:-K*x,q:x/A,u:v/(c.ws*A),period:c.Ts},pendulum:{theta:c.theta,omega:c.omega,U:Up,K:Kp,E:Up+Kp,E0:Ep,error:Up+Kp-Ep,torque:-BOB_MASS*G*c.length*(c.linear?c.theta:Math.sin(c.theta)),q:c.theta0?c.theta/c.theta0:0,u:c.theta0?c.omega/(c.w0*c.theta0):0,period:c.theta0?c.Tp:null},ratio:c.Tp/c.Ts};
}
export function orbit(c,id,steps=240){if(id==='spring'||c.linear&&c.theta0)return Array.from({length:steps+1},(_,i)=>{const p=2*Math.PI*i/steps;return[Math.cos(p),-Math.sin(p)];});if(!c.theta0)return[[0,0]];return Array.from({length:steps+1},(_,i)=>{const p=2*Math.PI*i/steps,q=Math.cos(p),difference=2*Math.sin(c.theta0*(1+q)/2)*Math.sin(c.theta0*(1-q)/2),u=Math.sqrt(Math.max(0,2*difference))/c.theta0;return[q,p<=Math.PI?-u:u];});}
