export const G=9.80665,XMIN=-24,XMAX=24,HMIN=3,HCENTRE=18,STEP=1/240;
export const HEIGHTS=[32,3,18,3,32];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function track(x){
  if(!Number.isFinite(x))throw new TypeError('Posición no válida');x=clamp(x,XMIN,XMAX);
  const i=Math.min(3,Math.floor((x+24)/12)),u=(x-(-24+i*12))/12,a=HEIGHTS[i],delta=HEIGHTS[i+1]-a;
  return{x,h:a+delta*u**3*(10-15*u+6*u*u),slope:delta*30*u*u*(1-u)**2/12,curvature:delta*60*u*(1-u)*(1-2*u)/144};
}
export function startX(height){if(!Number.isFinite(height)||height<8||height>30)throw new RangeError('La altura debe estar entre 8 y 30 m');let lo=-24,hi=-12;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(track(mid).h>height)lo=mid;else hi=mid;}return(lo+hi)/2;}
export function create({height=26,mass=500,gamma=0}={}){
  if(!Number.isFinite(mass)||mass<200||mass>1000||!Number.isFinite(gamma)||gamma<0||gamma>.2)throw new RangeError('Parámetros fuera de rango');
  return{x:startX(height),v:0,q:0,t:0,mass,h0:height,gamma,turns:0,settled:false};
}
const derivative=(x,v,gamma)=>{const p=track(x),scale=Math.hypot(1,p.slope);return[v/scale,-G*p.slope/scale-gamma*v,gamma*v*v];};
export function advance(state,dt){
  if(!Number.isFinite(dt)||dt<0||dt>60)throw new RangeError('Paso temporal no válido');const next={...state};if(!dt||state.settled)return next;
  const count=Math.ceil(dt/STEP),h=dt/count;
  for(let i=0;i<count;i++){
    const {x,v,gamma}=next,a=derivative(x,v,gamma),b=derivative(x+a[0]*h/2,v+a[1]*h/2,gamma),c=derivative(x+b[0]*h/2,v+b[1]*h/2,gamma),d=derivative(x+c[0]*h,v+c[1]*h,gamma);
    next.x+=h*(a[0]+2*b[0]+2*c[0]+d[0])/6;next.v+=h*(a[1]+2*b[1]+2*c[1]+d[1])/6;next.q+=h*(a[2]+2*b[2]+2*c[2]+d[2])/6;next.t+=h;
    if(next.x<XMIN||next.x>XMAX)throw new Error('El carrito ha salido del dominio de la pista');
    if(v*next.v<0)next.turns++;
    if(gamma>0&&Math.abs(next.v)<.002&&Math.abs(track(next.x).slope)<.0002&&track(next.x).h-HMIN<.0002){next.x=next.x<0?-12:12;next.v=0;next.q=G*(next.h0-HMIN);next.settled=true;break;}
  }
  return next;
}
export function snapshot(state){const {h,slope}=track(state.x),potential=state.mass*G*h,kinetic=state.mass*state.v**2/2,thermal=state.mass*state.q,total=potential+kinetic+thermal,initial=state.mass*G*state.h0;return{h,slope,speed:Math.abs(state.v),potential,kinetic,thermal,mechanical:potential+kinetic,total,initial,error:total-initial,loss:thermal/initial,maxReach:state.h0-state.q/G,canCross:state.h0-state.q/G>HCENTRE,descending:state.v*slope<0};}
