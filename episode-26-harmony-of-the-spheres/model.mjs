import * as Q from '../laboratory/orbits.mjs';
import * as H from './polyhedra.mjs';
// JPL's J2000 fitted elements, rounded for this comparison, not a live ephemeris.
export const PLANETS=[{name:'Mercurio',a:.387099,e:.2056},{name:'Venus',a:.723336,e:.0068},{name:'Tierra',a:1.000003,e:.0167},{name:'Marte',a:1.523710,e:.0934},{name:'Júpiter',a:5.202887,e:.0484},{name:'Saturno',a:9.536676,e:.0539}];
export const DEFAULTS={eccentricity:.2056,planet:0,solid:0};
export const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export function configure(params,values){const p={...params,...values};if('planet'in values&&!('eccentricity'in values))p.eccentricity=PLANETS[clamp(Math.round(p.planet),0,5)].e;return p;}
export function create(params={}){const p=configure(DEFAULTS,params);return{t:0,eccentricity:clamp(p.eccentricity,0,.4),planet:clamp(Math.round(p.planet),0,5),solid:clamp(Math.round(p.solid),0,4)};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function voice(s,i=s.planet){const p=PLANETS[i],e=i===s.planet?s.eccentricity:p.e,o=Q.orbit(p.a,e,Q.SOLAR_MU,Q.TAU*s.t),omega=o.h/o.r**2,apoOmega=o.h/(p.a*(1+e))**2,q=omega/apoOmega;return{...o,e,omega,apoOmega,q,tone:220*q,maximum:((1+e)/(1-e))**2,phase:8*o.nu*(1+e)**2/Math.sqrt(1-e*e)};}
export function snapshot(s){const v=voice(s),h=H.SOLIDS[s.solid];return{tone:v.tone,ratio:v.q,maximum:v.maximum,planetName:PLANETS[s.planet].name,solidName:h.name,faces:h.faces,sphereRatio:1/h.ratio,between:h.between,omega:v.omega,eccentricity:s.eccentricity,cycles:s.t};}
export function plot(s){return{curve:Array.from({length:241},(_,i)=>[i/240,voice({...s,t:i/240}).q]),reference:[[0,1],[1,1]],marker:[s.t,voice(s).q]};}
