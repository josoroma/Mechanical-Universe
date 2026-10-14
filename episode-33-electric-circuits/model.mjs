import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={voltage:6,resistance:30,mode:0,closed:1},clamp=E.clamp;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function snapshot(s){const resistors=[20,s.resistance,40],equivalent=s.mode?1/resistors.reduce((sum,r)=>sum+1/r,0):resistors.reduce((a,b)=>a+b,0),current=s.closed?s.voltage/equivalent:0,currents=resistors.map(r=>s.mode?(s.closed?s.voltage/r:0):current),voltages=resistors.map((r,i)=>currents[i]*r),powers=resistors.map((r,i)=>currents[i]**2*r),power=powers.reduce((a,b)=>a+b,0);return {voltage:s.voltage,current,equivalent,power,energy:power*s.t,i1:currents[0],i2:currents[1],i3:currents[2],v1:voltages[0],v2:voltages[1],v3:voltages[2],p1:powers[0],p2:powers[1],p3:powers[2],topology:s.mode?'Tres ramas en paralelo':'Una trayectoria en serie',circuit:s.closed?'Cerrado':'Abierto'};}
export function plot(s){const p=snapshot(s).power;return {curve:[[0,0],[20,20*p]],marker:[s.t,s.t*p]};}
