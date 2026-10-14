export const TAU=2*Math.PI,MU=.5,MASS=.08,SPACING=1/6,AMPLITUDE=.025,COUNT=13;
export const DEFAULTS={frequency:2,tension:8,stiffness:40};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export function advance(s,dt){return {...s,t:Math.max(0,s.t+dt)};}
export function properties(s){const w=TAU*s.frequency,cT=Math.sqrt(s.tension/MU),qT=w/cT,qL=2/SPACING*Math.asin(w/(2*Math.sqrt(s.stiffness/MASS)));return {w,cT,qT,qL,cL:w/qL,lambdaT:cT/s.frequency,lambdaL:TAU/qL,cutoff:Math.sqrt(s.stiffness/MASS)/Math.PI};}
export function displacement(s,x,type='transverse'){const p=properties(s),q=type==='transverse'?p.qT:p.qL;return AMPLITUDE*Math.sin(q*x-p.w*s.t);}
export function snapshot(s){const p=properties(s);return {...p,t:s.t,frequency:s.frequency,amplitude:AMPLITUDE,transverse:Array.from({length:COUNT},(_,i)=>displacement(s,i*SPACING)),longitudinal:Array.from({length:COUNT},(_,i)=>displacement(s,i*SPACING,'longitudinal')),y:displacement(s,1),xi:displacement(s,1,'longitudinal')};}
export function plot(s){return {curve:Array.from({length:181},(_,i)=>[i/90,displacement(s,i/90)*1000]),reference:Array.from({length:181},(_,i)=>[i/90,displacement(s,i/90,'longitudinal')*1000]),marker:[1,displacement(s,1)*1000]};}
