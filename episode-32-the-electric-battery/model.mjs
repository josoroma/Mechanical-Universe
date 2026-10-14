import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={load:25,cells:4,source:1,closed:1},clamp=E.clamp;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function snapshot(s){const emf=s.source?1.10:.90*s.cells,internal=s.source?2:3*s.cells,current=s.closed?emf/(s.load+internal):0,charge=current*s.t,extent=charge/(2*E.FARADAY),power=current**2*s.load;return {emf,internal,current,charge,power,terminal:emf-current*internal,delivered:power*s.t,heat:current**2*internal*s.t,chemical:emf*charge,zinc:extent*65.38*(s.source?1:s.cells),copper:s.source?extent*63.546:0,extent,kind:s.source?'Celda de Daniell':'Pila de Volta',circuit:s.closed?'Circuito cerrado':'Circuito abierto'};}
export function plot(s){const p=snapshot(s).power;return {curve:[[0,0],[600,600*p]],marker:[s.t,s.t*p]};}
