export const MU=398600.435507, R=6371, ALTITUDE=700, R0=R+ALTITUDE, VIEW_RADIUS=2.2*R, TAU=2*Math.PI;
export const CIRCULAR=Math.sqrt(MU/R0), ESCAPE=Math.sqrt(2*MU/R0), MOON_DISTANCE=384400;
export const PRESETS=[
  {id:"fall",name:"Volver a la Tierra",label:"4,000 km/s",v:4,description:"La bala avanza y cae. Su trayectoria se encuentra con la superficie antes de poder rodear la Tierra."},
  {id:"circle",name:"Dar la vuelta",label:"Órbita circular",v:CIRCULAR,description:"La bala cae continuamente, pero la superficie se curva bajo ella al mismo ritmo. La altura permanece constante."},
  {id:"ellipse",name:"Alargar la órbita",label:"8,500 km/s",v:8.5,description:"La bala se aleja y pierde rapidez; al volver a acercarse, acelera. Sigue ligada a la Tierra en una órbita elíptica."},
  {id:"escape",name:"Escapar",label:"Velocidad de escape",v:ESCAPE,description:"Con la velocidad mínima de escape, la bala se aleja indefinidamente. Su rapidez tiende a cero muy lejos de la Tierra."}
];
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function gravity(r){return 1000*MU/(r*r);}
export function invariants(s){return {energy:(s[2]**2+s[3]**2)/2-MU/Math.hypot(s[0],s[1]),angular:s[0]*s[3]-s[1]*s[2]};}
export function elements(v){
  const energy=v*v/2-MU/R0, angular=R0*v, e=Math.abs(v*v*R0/MU-1),p=angular*angular/MU;
  const a=energy<0?-MU/(2*energy):Infinity, peri=p/(1+e),apo=energy<0?p/(1-e):Infinity;
  const impact=peri<=R+1e-7,unbound=energy>=-1e-10;
  const kind=impact?"impact":unbound?"escape":e<1e-9?"circle":"ellipse";
  return {energy,angular,e,a,peri,apo,kind,period:energy<0?TAU*Math.sqrt(a**3/MU):Infinity};
}
function derivative(s){const r=Math.hypot(s[0],s[1]),c=-MU/(r*r*r);return [s[2],s[3],c*s[0],c*s[1]];}
export function step(s,dt){
  const k1=derivative(s),k2=derivative(s.map((x,i)=>x+dt*k1[i]/2)),k3=derivative(s.map((x,i)=>x+dt*k2[i]/2)),k4=derivative(s.map((x,i)=>x+dt*k3[i]));
  return s.map((x,i)=>x+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
}
export function flight(velocity){
  if(!Number.isFinite(velocity))throw new TypeError("La velocidad debe ser finita.");
  const v=clamp(velocity,0,12),orbit=elements(v),samples=[{t:0,s:[0,R0,v,0]}];
  const grazing=orbit.kind==="impact"&&Math.abs(orbit.peri-R)<1e-6;
  let t=0,s=samples[0].s,event="orbit",limit=grazing?orbit.period/2:orbit.period;
  if(!Number.isFinite(limit))limit=20000;
  for(let n=0;n<12000&&t<limit-1e-8;n++){
    const dt=Math.min(2,limit-t),next=step(s,dt),radius=Math.hypot(next[0],next[1]);
    if((radius<=R&&!grazing)||radius>=VIEW_RADIUS){
      event=radius<=R?"impact":"view";let lo=0,hi=dt;
      for(let j=0;j<40;j++){const mid=(lo+hi)/2,p=step(s,mid),r=Math.hypot(p[0],p[1]);if(event==="impact"?r>R:r<VIEW_RADIUS)lo=mid;else hi=mid;}
      const end=(lo+hi)/2;t+=end;s=step(s,end);samples.push({t,s});break;
    }
    t+=dt;s=next;samples.push({t,s});
  }
  if(grazing)event="impact";
  return {v,orbit,samples,duration:t,event};
}
export function at(f,t){
  t=clamp(t,0,f.duration);let lo=0,hi=f.samples.length-1;
  while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(f.samples[mid].t<=t)lo=mid;else hi=mid-1;}
  const sample=f.samples[lo],s=t===sample.t?sample.s:step(sample.s,t-sample.t),radius=Math.hypot(s[0],s[1]);
  return {t,s,radius,height:Math.max(0,radius-R),speed:Math.hypot(s[2],s[3]),g:gravity(radius),...invariants(s)};
}
