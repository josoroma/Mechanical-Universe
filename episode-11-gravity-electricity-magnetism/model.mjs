export const G=6.67430e-11,KE=8.9875517862e9,MU0=1.25663706127e-6;
export const L=.2,SMALL_MASS=.05,KAPPA=6e-8,AMPLIFY=4,CAPACITANCE=12e-12,PER_TURN=12;
export const LEAF_LENGTH=.06,LEAF_HALF_GAP=4/26*LEAF_LENGTH,LEAF_MASS=1e-5,LEAF_FRACTION=.02;
export const EARTH_FIELD=25e-6,WIRE_HEIGHT=.02;
export const DEFAULTS={mass:15,distance:.18,rpm:40,leak:'dry',current:0};
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function settings(values={}){
  const s={...DEFAULTS,...values};for(const k of ['mass','distance','rpm','current'])if(!Number.isFinite(s[k]))throw new TypeError(`Valor no finito: ${k}`);
  return {...s,mass:clamp(s.mass,5,30),distance:clamp(s.distance,.12,.30),rpm:clamp(s.rpm,0,120),current:clamp(s.current,-5,5),leak:s.leak==='damp'?'damp':'dry'};
}
export function attractions(mass,distance,angle){
  const tests=[1,-1].map(sign=>[sign*L*Math.cos(angle),sign*L*Math.sin(angle)]),sources=[[L,distance],[-L,-distance]];
  const forces=tests.map(p=>sources.map(q=>{const dx=q[0]-p[0],dy=q[1]-p[1],r=Math.hypot(dx,dy),f=G*SMALL_MASS*mass/r**2;return {fx:f*dx/r,fy:f*dy/r,r,f};}));
  const torque=tests.reduce((sum,p,i)=>sum+forces[i].reduce((t,f)=>t+p[0]*f.fy-p[1]*f.fx,0),0);
  return {tests,sources,forces,torque,nearest:forces[0][0].r,force:forces[0][0].f};
}
export function gravity(values={}){
  const s=settings(values);let lo=0,hi=.15;
  for(let i=0;i<48;i++){const mid=(lo+hi)/2;if(KAPPA*mid<attractions(s.mass,s.distance,mid).torque)lo=mid;else hi=mid;}
  const angle=(lo+hi)/2;return {...s,...attractions(s.mass,s.distance,angle),angle,visualAngle:angle*AMPLIFY,kappa:KAPPA};
}
export const tau=leak=>leak==='damp'?5:18;
export function advanceCharge(charge,rpm,leak,dt,ground=false){
  if(![charge,rpm,dt].every(Number.isFinite)||charge<0||dt<0)throw new TypeError('Estado de carga no válido');
  const t=ground?.15:tau(leak),source=ground?0:PER_TURN*Math.max(0,rpm)/60,decay=Math.exp(-dt/t);
  const next=charge*decay+source*t*(1-decay);return next<1e-7?0:next;
}
export function electroscope(charge){
  const q=charge*1e-9*LEAF_FRACTION;let lo=0,hi=Math.PI/2-.000001;
  for(let i=0;i<45;i++){const t=(lo+hi)/2,sep=2*(LEAF_HALF_GAP+LEAF_LENGTH*Math.sin(t));if(LEAF_MASS*9.80665*Math.tan(t)<KE*q*q/sep**2)lo=t;else hi=t;}
  return charge===0?0:(lo+hi)/2;
}
export function electric(charge=0,values={}){
  if(!Number.isFinite(charge)||charge<0)throw new TypeError('Carga no válida');
  const s=settings(values),Q=charge*1e-9,voltage=Q/CAPACITANCE,generated=PER_TURN*s.rpm/60,loss=charge/tau(s.leak);
  return {...s,charge,voltage,energy:Q*Q/(2*CAPACITANCE),generated,loss,net:generated-loss,angle:electroscope(charge)};
}
export function magnetic(current=0){
  if(!Number.isFinite(current))throw new TypeError('Corriente no válida');current=clamp(current,-5,5);
  const bx=-MU0*current/(2*Math.PI*WIRE_HEIGHT),by=EARTH_FIELD;return {current,bx,by,field:Math.abs(bx),total:Math.hypot(bx,by),angle:current===0?0:Math.atan2(bx,by)};
}
