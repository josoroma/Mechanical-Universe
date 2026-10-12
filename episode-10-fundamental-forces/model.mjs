export const G=6.67430e-11,KE=8.9875517862e9,LEVER=.38,MAX_ANGLE=Math.PI/10;
export const DEFAULTS={distance:.5,mass:1,charge:1,polarity:'opposite'};
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function settings(values={}){
  const s={...DEFAULTS,...values};
  for(const k of ['distance','mass','charge'])if(!Number.isFinite(s[k]))throw new TypeError(`Valor no finito: ${k}`);
  return {...s,distance:clamp(s.distance,.2,1),mass:clamp(s.mass,.5,5),charge:clamp(s.charge,0,2),polarity:s.polarity==='same'?'same':'opposite'};
}
export function balance(force,reference){const span=Math.abs(force)+reference,angle=MAX_ANGLE*force/span;return {force,span,angle,kappa:span*LEVER/MAX_ANGLE};}
export function snapshot(values=DEFAULTS,secondCharge){
  const s=settings(values),q2=secondCharge??(s.polarity==='opposite'?-s.charge:s.charge);
  if(!Number.isFinite(q2)||Math.abs(q2)>2)throw new TypeError('Segunda carga fuera de rango');
  const gravity=G*s.mass*s.mass/s.distance**2,signedElectric=-KE*s.charge*q2*1e-18/s.distance**2,electric=Math.abs(signedElectric);
  return {...s,q1:s.charge,q2,gravity,electric,signedElectric,net:gravity+signedElectric,ratio:electric/gravity,
    gravitational:balance(gravity,.2e-9),electrostatic:balance(signedElectric,20e-9)};
}
export function equalCharge(mass){return mass*Math.sqrt(G/KE)*1e9;}
export const PRESETS=[
  {id:'attraction',name:'Atracción',label:'Cargas de signos opuestos',values:{...DEFAULTS}},
  {id:'repulsion',name:'Repulsión',label:'Cargas del mismo signo',values:{...DEFAULTS,polarity:'same'}},
  {id:'neutral',name:'Sin carga',label:'La gravedad permanece',values:{...DEFAULTS,charge:0}},
  {id:'near-equal',name:'Casi iguales',label:'Fuerzas que casi se compensan',values:{...DEFAULTS,charge:.086,polarity:'same'}}
];
