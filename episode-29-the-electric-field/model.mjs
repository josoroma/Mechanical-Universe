import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={voltage:60,charge:2,shield:0},clamp=E.clamp,DISTANCE=.12;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function snapshot(s){const position=.06+.04*Math.sin(E.TAU*s.t/12),outside=s.voltage/DISTANCE,field=s.shield?0:outside,potential=s.shield?0:s.voltage*(1-position/DISTANCE);return {position,outside,field,potential,force:s.charge*1e-9*field,inside:0,zone:s.shield?'Interior protegido':'Entre las placas',direction:s.charge===0?'Sin fuerza':s.charge*s.voltage>0?'Hacia la derecha':s.charge*s.voltage<0?'Hacia la izquierda':'Sin fuerza'};}
export function plot(s){return {curve:Array.from({length:161},(_,i)=>{const t=12*i/160;return [t,snapshot({...s,t}).potential];}),reference:[[0,0],[12,0]],marker:[s.t,snapshot(s).potential]};}
