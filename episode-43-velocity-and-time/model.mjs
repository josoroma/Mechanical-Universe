import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={beta:.6,period:2},clamp=E.clamp,C0=299792458;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export const bounce=q=>{const p=((q%1)+1)%1;return p<=.5?2*p:2-2*p;};
export function snapshot(s){const gamma=1/Math.sqrt(1-s.beta*s.beta),tau=s.t/gamma;return {gamma,tau,labTime:s.t,delay:s.t-tau,labPeriod:gamma*s.period,properPeriod:s.period,distance:C0*s.period/2,verticalSpeed:1/gamma,speed:s.beta,cartX:-100+200*s.beta*s.t/6,pulse:bounce(tau/s.period),fixedPulse:bounce(s.t/s.period),ticks:Math.floor(tau/s.period),labTicks:Math.floor(s.t/s.period)};}
export function plot(s){const v=snapshot(s);return {curve:[[0,0],[6,6/v.gamma]],reference:[[0,0],[6,6]],marker:[s.t,v.tau]};}
