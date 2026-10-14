import * as Q from '../laboratory/orbits.mjs';
export const DEFAULTS={axis:1,eccentricity:.45};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export function advance(s,dt){return {...s,t:Math.max(0,s.t+dt)};}
export function position(s,t=s.t){return Q.atTime(s.axis,s.eccentricity,Q.SOLAR_MU,t);}
export function snapshot(s){const p=position(s);return {...p,t:s.t,speedKms:p.speed*Q.KM_S,area:Math.PI*p.a*p.b/12,interval:p.period/12,ratio:p.period**2/p.a**3,perihelion:p.a*(1-p.e),aphelion:p.a*(1+p.e),nuDegrees:((p.nu%(2*Math.PI))+2*Math.PI)%(2*Math.PI)*180/Math.PI};}
export function plot(s){const p=position(s),curve=Array.from({length:241},(_,i)=>{const nu=Q.TAU*i/240,r=p.a*(1-p.e*p.e)/(1+p.e*Math.cos(nu));return [nu*180/Math.PI,Math.sqrt(Q.SOLAR_MU*(2/r-1/p.a))*Q.KM_S]});return {curve,marker:[snapshot(s).nuDegrees,p.speed*Q.KM_S]};}
