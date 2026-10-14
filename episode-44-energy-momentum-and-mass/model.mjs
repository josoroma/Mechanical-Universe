import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={drive:1,initial:0},clamp=E.clamp,REST=.51099895;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function snapshot(s){const p=s.initial+s.drive*s.t,gamma=Math.hypot(1,p),g0=Math.hypot(1,s.initial),beta=p/gamma,distance=(gamma-g0)/s.drive;return {p,gamma,beta,kinetic:(gamma-1)*REST,total:gamma*REST,rest:REST,momentum:p*REST,inertia:gamma**3,energyMass:gamma,distance,progress:distance/8,work:(gamma-g0)*REST};}
export function plot(s){const v=snapshot(s);return {curve:Array.from({length:201},(_,i)=>{const p=i/10;return[p,p/Math.hypot(1,p)];}),marker:[v.p,v.beta]};}
