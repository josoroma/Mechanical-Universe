import * as Q from '../laboratory/orbits.mjs';
export const DEFAULTS={speedRatio:.85,distance:.2,mu:.004},MASS=.05;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export function advance(s,dt){return {...s,t:Math.max(0,s.t+dt)};}
export function elements(s){const e=Math.abs(s.speedRatio**2-1),a=s.distance/(2-s.speedRatio**2),phase=s.speedRatio<1?Math.PI:0,peri=s.speedRatio<1?Math.PI:0;return {a,e,phase,peri};}
export function position(s,t=s.t){const e=elements(s);return Q.atTime(e.a,e.e,s.mu,t,e.phase,e.peri);}
export function force(s,r){return MASS*s.mu/(r*r);}
export function snapshot(s){const p=position(s),tension=force(s,p.r);return {...p,t:s.t,tension,energyJ:MASS*p.energy,initialSpeed:s.speedRatio*Math.sqrt(s.mu/s.distance),circularSpeed:Math.sqrt(s.mu/s.distance),acceleration:s.mu/(p.r*p.r),periapsis:p.a*(1-p.e),apoapsis:p.a*(1+p.e)};}
export function plot(s){const p=snapshot(s);return {curve:Array.from({length:241},(_,i)=>{const r=.04+.46*i/240;return [r,force(s,r)]}),marker:[p.r,p.tension]};}
