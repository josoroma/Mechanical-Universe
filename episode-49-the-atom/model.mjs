import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={impact:25,energy:5,charge:79},clamp=E.clamp,KE=1.439964548,RADIUS=500,ALPHA_MASS=6.6446573357e-27,MEV=1.602176634e-13;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function orbit(s){const a=KE*s.charge/s.energy,e=Math.hypot(1,s.impact/a),theta=2*Math.atan2(a,s.impact),omega=Math.PI/2+theta/2,U=Math.acosh((RADIUS/a-1)/e),vinf=Math.sqrt(2*s.energy*MEV/ALPHA_MASS),half=a*1e-15/vinf*(e*Math.sinh(U)+U);return {a,e,theta,omega,U,vinf,half};}
export function point(s,f){const o=orbit(s),target=(1-2*clamp(f,0,1))*(o.e*Math.sinh(o.U)+o.U);let lo=-o.U,hi=o.U;for(let i=0;i<45;i++){const h=(lo+hi)/2;if(o.e*Math.sinh(h)+h<target)lo=h;else hi=h;}const u=(lo+hi)/2,X=o.a*(o.e+Math.cosh(u)),Y=s.impact*Math.sinh(u),c=Math.cos(o.omega),sn=Math.sin(o.omega);return {x:X*c-Y*sn,y:X*sn+Y*c,r:o.a*(1+o.e*Math.cosh(u))};}
export function snapshot(s){const o=orbit(s),p=point(s,s.t/8),potential=2*s.energy*o.a/p.r,kinetic=Math.max(0,s.energy-potential),end=point(s,1);return {...p,a:o.a,deflection:o.theta*180/Math.PI,theta:o.theta,closest:o.a*(1+o.e),kinetic,potential,total:s.energy,flightTime:2*o.half,detectorAngle:Math.atan2(end.y,end.x)*180/Math.PI,charge:s.charge,impact:s.impact,material:s.charge===79?'Oro · Z = 79':s.charge===47?'Plata · Z = 47':'Cobre · Z = 29'};}
export function plot(s){const v=snapshot(s);return {curve:Array.from({length:201},(_,i)=>[i/2,2*Math.atan2(v.a,i/2)*180/Math.PI]),marker:[s.impact,v.deflection]};}
