import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={frequency:2,field:.8,turns:150,resistance:40},clamp=E.clamp,AREA=.004;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function snapshot(s){const omega=E.TAU*s.frequency,angle=omega*s.t,linkage=s.turns*s.field*AREA,peak=linkage*omega,voltage=peak*Math.sin(angle),current=voltage/s.resistance,power=voltage*current,average=peak**2/(2*s.resistance),energy=omega?peak**2/s.resistance*(s.t/2-Math.sin(2*angle)/(4*omega)):0,torque=-linkage*current*Math.sin(angle);return {omega,angle,flux:linkage*Math.cos(angle),voltage,current,power,peak,rms:Math.abs(peak)/Math.sqrt(2),average,energy,torque,mechanical:-torque*omega,frequency:s.frequency};}
export function plot(s){return {curve:Array.from({length:481},(_,i)=>[4*i/480,snapshot({...s,t:4*i/480}).voltage]),reference:[[0,0],[4,0]],marker:[s.t,snapshot(s).voltage]};}
