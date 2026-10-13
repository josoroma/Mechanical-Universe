export const G=9.80665,MASS=.1,R=.8,BALL_RADIUS=.04,K0=MASS*G/R,STEP=1/240;
export const TYPES=[{id:'solid',beta:2/5,name:'Bola maciza'},{id:'hollow',beta:2/3,name:'Bola hueca'}];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const height=x=>x*x/(2*R);
export const potential=x=>MASS*G*height(x);
export function create({amplitude=.35,side=1,factor=1}={}){
  if(!Number.isFinite(amplitude)||amplitude<0||amplitude>.5||![1,-1].includes(side)||![1,2].includes(factor))throw new RangeError('Parámetros fuera de rango');
  return{amplitude,side,factor,t:0,balls:TYPES.map(type=>({...type,x:side*amplitude,u:0,angle:0}))};
}
export function derivative(x,u,beta){const slope=x/R,metric=1+slope*slope;return[u,-(x*u*u/(R*R)+G*x/(R*(1+beta)))/metric,u*Math.sqrt(metric)/BALL_RADIUS];}
export function advance(state,dt){
  if(!Number.isFinite(dt)||dt<0||dt>60)throw new RangeError('Paso temporal no válido');const next={...state,balls:state.balls.map(b=>({...b}))};if(!dt)return next;
  const count=Math.ceil(dt/STEP),h=dt/count;
  for(let j=0;j<count;j++)for(const ball of next.balls){const {x,u,beta}=ball,a=derivative(x,u,beta),b=derivative(x+a[0]*h/2,u+a[1]*h/2,beta),c=derivative(x+b[0]*h/2,u+b[1]*h/2,beta),d=derivative(x+c[0]*h,u+c[1]*h,beta);ball.x+=h*(a[0]+2*b[0]+2*c[0]+d[0])/6;ball.u+=h*(a[1]+2*b[1]+2*c[1]+d[1])/6;ball.angle+=h*(a[2]+2*b[2]+2*c[2]+d[2])/6;}
  next.t=state.t+dt;return next;
}
export function spring(state){const k=K0*state.factor,omega=Math.sqrt(k/MASS),phase=omega*state.t,x=state.side*state.amplitude*Math.cos(phase),u=-state.side*state.amplitude*omega*Math.sin(phase),U=k*x*x/2,K=MASS*u*u/2,E=k*state.amplitude**2/2;return{id:'spring',name:'Carro y resorte',x,u,speed:Math.abs(u),h:0,U,Ktr:K,Krot:0,K,total:U+K,initial:E,error:U+K-E,k,omega,force:-k*x};}
export function snapshot(state){const balls=state.balls.map(b=>{const v=b.u*Math.hypot(1,b.x/R),U=potential(b.x),Ktr=MASS*v*v/2,Krot=b.beta*Ktr,K=Ktr+Krot,E=potential(state.amplitude);return{...b,h:height(b.x),speed:Math.abs(v),v,U,Ktr,Krot,K,total:U+K,initial:E,error:U+K-E,force:-MASS*G*(b.x/R)/Math.hypot(1,b.x/R)};});return{balls,spring:spring(state),k:K0*state.factor,E:potential(state.amplitude),t:state.t};}
