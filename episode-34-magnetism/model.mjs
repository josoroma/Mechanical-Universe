import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={current:4,angle:0,earth:1},clamp=E.clamp,MOMENT=1.2,RADIUS=.18,WIRE_RADIUS=.04;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function orientation(s){return s.angle*Math.PI/180+E.TAU*s.t/20;}
export function dipole(x,y,angle){const r=Math.hypot(x,y),mx=MOMENT*Math.cos(angle),my=MOMENT*Math.sin(angle),dot=(mx*x+my*y)/r,k=E.MU0/(4*Math.PI*r**3);return [k*(3*dot*x/r-mx),k*(3*dot*y/r-my)];}
export function wire(x,y,current){const k=E.MU0*current/(2*Math.PI*(x*x+y*y));return [-k*y,k*x];}
export function field(s,kind,azimuth){const r=kind?WIRE_RADIUS:RADIUS,x=r*Math.cos(azimuth),y=r*Math.sin(azimuth),v=kind?wire(x,y,s.current):dipole(x,y,orientation(s));return [v[0]+s.earth*25e-6,v[1]];}
export function snapshot(s){const bar=field(s,0,0),hilo=field(s,1,0),barField=Math.hypot(...bar),wireField=Math.hypot(...hilo),angleBar=Math.atan2(bar[1],bar[0]),angleWire=Math.atan2(hilo[1],hilo[0]),label=(v,a)=>v<1e-12?'Sin orientación definida':(a*180/Math.PI).toLocaleString('es-CR',{maximumFractionDigits:1})+'°';return {barField,wireField,angleBar,angleWire,rotation:(orientation(s)*180/Math.PI)%360,earthField:s.earth*25e-6,sourceField:E.MU0*s.current/(2*Math.PI*WIRE_RADIUS),barDirection:label(barField,angleBar),wireDirection:label(wireField,angleWire),current:s.current};}
export function plot(s){return {curve:Array.from({length:161},(_,i)=>[20*i/160,snapshot({...s,t:20*i/160}).barField*1e6]),marker:[s.t,snapshot(s).barField*1e6]};}
