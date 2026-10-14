import * as Q from '../laboratory/orbits.mjs';
export const DEFAULTS={eccentricity:.4,parameter:.85};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export function advance(s,dt){return {...s,t:Math.max(0,s.t+dt)};}
export function position(s,e=s.eccentricity){return Q.atTime(s.parameter/(1-e*e),e,Q.SOLAR_MU,s.t);}
export function potential(rho){return 1/(2*rho*rho)-1/rho;}
export function snapshot(s){const p=position(s),rho=p.r/s.parameter,energyNorm=-(1-p.e*p.e)/2,radialSpeed=(p.x*p.vx+p.y*p.vy)/p.r;return {...p,t:s.t,rho,energyNorm,potentialNorm:potential(rho),radialKinetic:energyNorm-potential(rho),energyKms:p.energy*Q.KM_S**2,radialSpeedKms:radialSpeed*Q.KM_S,rmin:s.parameter/(1+p.e),rmax:s.parameter/(1-p.e)};}
export function plot(s){const p=snapshot(s);return {curve:Array.from({length:361},(_,i)=>{const rho=.4+3.6*i/360;return [rho,potential(rho)]}),reference:[[.4,p.energyNorm],[4,p.energyNorm]],marker:[p.rho,p.potentialNorm]};}
