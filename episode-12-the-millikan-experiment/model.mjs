export const E_CHARGE=1.602176634e-19,G=9.80665,RHO_OIL=855,RHO_AIR=1.204,ETA=1.81e-5,PRESSURE=101325,SLIP_B=8.20e-3,GAP=.00762;
export const MEASURE_DISTANCE=.0002,VIEW_HALF=.0014;
export const DROPS=[{id:'A',radius:.85e-6,n:4},{id:'B',radius:1e-6,n:6},{id:'C',radius:.7e-6,n:3},{id:'D',radius:1.1e-6,n:8},{id:'E',radius:.9e-6,n:5}];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function dropAt(index=0){const i=((Math.trunc(index)%DROPS.length)+DROPS.length)%DROPS.length;return {...DROPS[i],z:.0008};}
export function physics(drop,U=0){
  if(!Number.isFinite(U)||!Number.isFinite(drop.radius)||drop.radius<=0||!Number.isInteger(drop.n)||drop.n<1)throw new TypeError('Gota o tensión no válidas');
  U=clamp(U,-500,500);const a=drop.radius,volume=4*Math.PI*a**3/3,mass=volume*RHO_OIL,weight=volume*(RHO_OIL-RHO_AIR)*G,slip=1+SLIP_B/(PRESSURE*a),drag=6*Math.PI*ETA*a/slip,q=-drop.n*E_CHARGE,field=-U/GAP,electric=q*field,net=electric-weight,velocity=net/drag,freefall=weight/drag,balance=weight*GAP/(-q),ratio=electric/weight;
  return {U,a,volume,mass,weight,slip,drag,q,field,electric,net,velocity,freefall,balance,ratio,relaxation:mass/drag,balanced:Math.abs(net/weight)<=.003};
}
export function advance(drop,U,target,dt,seconds=.2){
  if(![U,target,dt,seconds,drop.z].every(Number.isFinite)||dt<0||seconds<0)throw new TypeError('Paso temporal no válido');U=clamp(U,-500,500);target=clamp(target,-500,500);
  const decay=seconds?Math.exp(-dt/seconds):0,nextU=seconds?target+(U-target)*decay:target,integral=seconds?target*dt+(U-target)*seconds*(1-decay):target*dt,s=physics(drop,0),gain=(-s.q)/(GAP*s.drag),dz=gain*integral-s.freefall*dt,limit=GAP/2-drop.radius,z=clamp(drop.z+dz,-limit,limit);
  return {U:nextU,z,velocity:physics(drop,nextU).velocity,contact:drop.z+dz<=-limit?'lower':drop.z+dz>=limit?'upper':null};
}
export function radiusFromFall(velocity){
  if(!Number.isFinite(velocity)||velocity<=0)throw new TypeError('La velocidad de caída debe ser positiva');const b=SLIP_B/PRESSURE,c=9*ETA*velocity/(2*(RHO_OIL-RHO_AIR)*G);return 2*c/(Math.sqrt(b*b+4*c)+b);
}
export function measuredCharge(fallVelocity,U){if(!Number.isFinite(U)||U<=0)throw new TypeError('Se necesita una tensión positiva de equilibrio');const radius=radiusFromFall(fallVelocity),s=physics({radius,n:1},0),q=-s.weight*GAP/U;return {radius,q,units:Math.abs(q)/E_CHARGE};}
