export const DEFAULTS={radius:1,omega0:.8,spin:40};
export const I0=4,MASS=2,R0=1,WHEEL_MASS=1.2,WHEEL_I=.1,LEVER=.25,GRAVITY=9.81;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export function advance(s,dt){return {...s,t:Math.max(0,s.t+dt)};}
export function properties(s,r=s.radius){const L=(I0+2*MASS*R0**2)*s.omega0,I=I0+2*MASS*r*r,omega=L/I,energy=L*L/(2*I),initialEnergy=.5*(I0+2*MASS*R0**2)*s.omega0**2,precession=WHEEL_MASS*GRAVITY*LEVER/(WHEEL_I*s.spin);return {L,I,omega,energy,work:energy-initialEnergy,precession,wheelL:WHEEL_I*s.spin};}
export function snapshot(s){const p=properties(s);return {...p,t:s.t,radius:s.radius,theta:p.omega*s.t,phi:p.precession*s.t,psi:s.spin*s.t};}
export function plot(s){const p=properties(s);return {curve:Array.from({length:121},(_,i)=>{const r=.3+.9*i/120;return [r,properties(s,r).omega]}),marker:[s.radius,p.omega]};}
