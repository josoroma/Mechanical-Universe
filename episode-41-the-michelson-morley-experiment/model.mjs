import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={angle:0,speed:30,wavelength:589,offset:0,mode:0},clamp=E.clamp,C0=299792458,LENGTH=11;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function etherPath(speed,theta){if(!speed)return 0;const b=(speed*1000/C0)**2,s=Math.sqrt(1-b*Math.sin(theta)**2),c=Math.sqrt(1-b*Math.cos(theta)**2);return 2*LENGTH*b*Math.cos(2*theta)/((1-b)*(s+c));}
export function snapshot(s){const angle=(s.angle+15*s.t)%360,theta=angle*Math.PI/180,ether=etherPath(s.speed,theta)/(s.wavelength*1e-9),orientation=s.mode?ether:0,phase=2*s.offset*1e-6/(s.wavelength*1e-9)+orientation,intensity=.5*(1+Math.cos(E.TAU*phase)),shift90=2*etherPath(s.speed,0)/(s.wavelength*1e-9);return {angle,theta,ether,orientation,phase,intensity:intensity*100,shift90,delay:etherPath(s.speed,theta)/C0,mirrorPath:2*s.offset,model:s.mode?'Éter clásico · hipótesis descartada':'Luz isotrópica · modelo ideal',wavelength:s.wavelength};}
export function intensityAt(s,u){return .5*(1+Math.cos(E.TAU*(3*u+snapshot(s).phase)));}
export function plot(s){const v=snapshot(s);return {curve:Array.from({length:361},(_,i)=>[i/2,etherPath(s.speed,i*Math.PI/360)/(s.wavelength*1e-9)]),reference:[[0,0],[180,0]],marker:[v.angle%180,v.orientation]};}
