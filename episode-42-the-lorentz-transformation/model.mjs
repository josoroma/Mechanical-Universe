import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={beta:.6,eventX:1,length:2},clamp=E.clamp;
export const gamma=b=>1/Math.sqrt(1-b*b);
export const transform=(x,ct,b)=>({xp:gamma(b)*(x-b*ct),ctp:gamma(b)*(ct-b*x)});
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function snapshot(s){const g=gamma(s.beta),q=transform(s.eventX,s.t,s.beta),tau=s.t/g,phase=tau%2;return {beta:s.beta,gamma:g,x:s.eventX,ct:s.t,...q,interval:s.t*s.t-s.eventX*s.eventX,length:s.length/g,restLength:s.length,tau,light:phase<=1?phase:2-phase};}
export function plot(s){return {curve:Array.from({length:101},(_,i)=>[i*.0095,gamma(i*.0095)]),marker:[s.beta,gamma(s.beta)]};}
