export const G=9.81,LENGTH=1,TAU=2*Math.PI;
export const DEFAULTS={mode:"pendulum",angle:35,mass:.25,radius:.65,rpm:30};
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function settings(values={}){
  const s={...DEFAULTS,...values};
  for(const k of ['angle','mass','radius','rpm'])if(!Number.isFinite(s[k]))throw new TypeError(`Valor no finito: ${k}`);
  return {...s,mode:s.mode==='platform'?'platform':'pendulum',angle:clamp(s.angle,10,65),mass:clamp(s.mass,.1,1),radius:clamp(s.radius,.15,.85),rpm:clamp(s.rpm,0,60)};
}
export function snapshot(values=DEFAULTS,phase=0){
  const s=settings(values),theta=s.angle*Math.PI/180,pendulum=s.mode==='pendulum';
  const omega=pendulum?Math.sqrt(G/(LENGTH*Math.cos(theta))):s.rpm*TAU/60,r=pendulum?LENGTH*Math.sin(theta):s.radius;
  const speed=omega*r,ac=omega*omega*r,force=s.mass*ac,weight=s.mass*G,tension=pendulum?weight/Math.cos(theta):force;
  const c=Math.cos(phase),q=Math.sin(phase),position=[r*c,r*q,pendulum?-LENGTH*Math.cos(theta):0];
  return {...s,theta,r,omega,rpm:omega*60/TAU,speed,ac,force,weight,tension,vertical:pendulum?tension*Math.cos(theta):weight,period:omega?TAU/omega:Infinity,position,velocity:[-speed*q,speed*c,0],acceleration:[-ac*c,-ac*q,0],phase};
}
