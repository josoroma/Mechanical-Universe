import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={gap:4,kappa:1,voltage:100,mode:1},clamp=E.clamp,AREA=.04,REFERENCE=.004;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function snapshot(s){const separation=s.gap*.001*(1+.2*Math.sin(E.TAU*s.t/12)),capacitance=s.kappa*E.EPS0*AREA/separation,q0=E.EPS0*AREA/REFERENCE*s.voltage,voltage=s.mode?s.voltage:q0/capacitance,charge=capacitance*voltage;return {separation,capacitance,voltage,charge,energy:.5*charge*voltage,field:voltage/separation,condition:s.mode?'Tensión constante':'Carga constante',dielectric:s.kappa===1?'Aire ideal':`Dieléctrico κ = ${s.kappa}`};}
export function plot(s){return {curve:Array.from({length:161},(_,i)=>[12*i/160,snapshot({...s,t:12*i/160}).capacitance*1e12]),marker:[s.t,snapshot(s).capacitance*1e12]};}
