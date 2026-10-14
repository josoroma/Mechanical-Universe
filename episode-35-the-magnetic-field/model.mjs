import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={current:1,turns:120,position:8},clamp=E.clamp,RADIUS=.025,LENGTH=.06,HALL_CURRENT=.005,DENSITY=8e21,THICKNESS=.0005,ELEMENTARY=1.602176634e-19;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function fieldAt(z,current,turns,r=RADIUS,length=LENGTH){const a=z+length/2,b=z-length/2;return E.MU0*turns*current/(2*length)*(a/Math.hypot(r,a)-b/Math.hypot(r,b));}
export function snapshot(s){const position=s.position*.01+.01*Math.sin(E.TAU*s.t/12),field=fieldAt(position,s.current,s.turns);return {position,field,hall:HALL_CURRENT*field/(DENSITY*ELEMENTARY*THICKNESS),centre:fieldAt(0,s.current,s.turns),long:E.MU0*s.turns*s.current/LENGTH,turns:s.turns,current:s.current,direction:Math.abs(field)<1e-12?'Sin campo':field>0?'Hacia arriba · +z':'Hacia abajo · −z'};}
export function plot(s){const v=snapshot(s);return {curve:Array.from({length:161},(_,i)=>[i/10,fieldAt(i/1000,s.current,s.turns)*1000]),reference:[[0,v.long*1000],[3,v.long*1000]],marker:[v.position*100,v.field*1000]};}
