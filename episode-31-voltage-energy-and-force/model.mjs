import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={voltage:200,gap:6,charge:2},clamp=E.clamp,AREA=.01;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function snapshot(s){const voltage=s.voltage*Math.cos(E.TAU*s.t/12),distance=s.gap*.001,field=voltage/distance,capacitance=E.EPS0*AREA/distance;return {voltage,distance,field,capacitance,force:.5*E.EPS0*AREA*field**2,energy:.5*capacitance*voltage**2,probeForce:s.charge*1e-9*field,work:s.charge*1e-9*voltage,response:(voltage/300)**2,polarity:Math.abs(voltage)<1e-8?'Sin tensión':voltage>0?'Izquierda positiva':'Derecha positiva'};}
export function plot(s){return {curve:Array.from({length:161},(_,i)=>[12*i/160,snapshot({...s,t:12*i/160}).force*1e6]),marker:[s.t,snapshot(s).force*1e6]};}
