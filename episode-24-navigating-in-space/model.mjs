import * as Q from '../laboratory/orbits.mjs';
export const DEFAULTS={destination:1.524,phaseOffset:0};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export function advance(s,dt){return {...s,t:Math.max(0,s.t+dt)};}
export function transfer(s){const r1=1,r2=s.destination,a=(r1+r2)/2,e=(r2-r1)/(r1+r2),mu=Q.SOLAR_MU,flight=Math.PI*Math.sqrt(a**3/mu),n1=Math.sqrt(mu/r1**3),n2=Math.sqrt(mu/r2**3),phase=Math.PI-n2*flight,dv1=Math.sqrt(mu/r1)*(Math.sqrt(2*r2/(r1+r2))-1)*Q.KM_S,dv2=Math.sqrt(mu/r2)*(1-Math.sqrt(2*r1/(r1+r2)))*Q.KM_S;return {r1,r2,a,e,flight,n1,n2,phase,dv1,dv2};}
export function positions(s,t=s.t){const p=transfer(s),ship=t<=p.flight?Q.atTime(p.a,p.e,Q.SOLAR_MU,t):Q.orbit(p.r2,0,Q.SOLAR_MU,Math.PI+p.n2*(t-p.flight));return {inner:Q.orbit(1,0,Q.SOLAR_MU,p.n1*t),outer:Q.orbit(p.r2,0,Q.SOLAR_MU,p.phase+s.phaseOffset*Math.PI/180+p.n2*t),ship};}
export function snapshot(s){const p=transfer(s),b=positions(s),arrivalMiss=2*p.r2*Math.abs(Math.sin(s.phaseOffset*Math.PI/360));return {...p,t:s.t,flightDays:p.flight*365.25,timeDays:s.t*365.25,totalDv:p.dv1+p.dv2,optimalPhase:p.phase*180/Math.PI,arrivalMiss,r:b.ship.r,speedKms:b.ship.speed*Q.KM_S,phase:s.t===0?'Primer impulso · salida':s.t<p.flight?'En la elipse de transferencia':'Segundo impulso · órbita exterior'};}
export function plot(s){const p=snapshot(s);return {curve:Array.from({length:241},(_,i)=>{const t=1.1*i/240;return [t*365.25,positions(s,t).ship.r]}),reference:[[0,s.destination],[410,s.destination]],marker:[p.timeDays,p.r]};}
