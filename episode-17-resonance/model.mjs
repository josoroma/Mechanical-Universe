export const MASS=.2,K=8,TAU=2*Math.PI;
export const DEFAULTS={frequency:1,force:.06,damping:.2};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function create(p={}){return {...DEFAULTS,...p,mass:MASS,t:0};}
export function advance(s,dt){return {...s,t:Math.max(0,s.t+dt)};}
export function response(p,frequency=p.frequency){const w=TAU*frequency;return p.force/Math.hypot(K-MASS*w*w,p.damping*w);}
export function snapshot(s){
 const w=TAU*s.frequency,w0=Math.sqrt(K/MASS),beta=s.damping/(2*MASS),wd=Math.sqrt(w0*w0-beta*beta),A=response(s),phase=Math.atan2(s.damping*w,K-MASS*w*w),C=-A*Math.cos(phase),D=(beta*C-A*w*Math.sin(phase))/wd;
 const t=s.t,e=Math.exp(-beta*t),c=Math.cos(wd*t),q=Math.sin(wd*t),h=C*c+D*q;
 const x=A*Math.cos(w*t-phase)+e*h,v=-A*w*Math.sin(w*t-phase)+e*(-beta*h+wd*(-C*q+D*c));
 const F=s.force*Math.cos(w*t),a=(F-s.damping*v-K*x)/MASS;
 return {t,x,v,a,F,A,phase,f0:w0/TAU,fr:Math.sqrt(w0*w0-2*beta*beta)/TAU,energy:.5*MASS*v*v+.5*K*x*x,power:F*v,loss:s.damping*v*v,Q:MASS*w0/s.damping,spring:{x,v},driverPhase:w*t};
}
export function plot(s){return {curve:Array.from({length:241},(_,i)=>{const f=.4+1.2*i/240;return [f,response(s,f)*100]}),marker:[s.frequency,response(s)*100]};}
