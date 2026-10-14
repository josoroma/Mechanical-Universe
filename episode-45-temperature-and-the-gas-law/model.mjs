import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={temperature:300,volume:10,amount:.05},clamp=E.clamp,R=8.314462618,M=.039948,NA=6.02214076e23;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export const reflect=q=>{const f=((q%2)+2)%2;return f<=1?f:2-f;};
export function snapshot(s){return {temperature:s.temperature,volume:s.volume,amount:s.amount,pressure:s.amount*R*s.temperature/s.volume,vrms:Math.sqrt(3*R*s.temperature/M),internal:1.5*s.amount*R*s.temperature,molecules:s.amount*NA,count:Math.round(s.amount*400),piston:-100+8*s.volume};}
export function particles(s){const v=snapshot(s),speed=v.vrms/Math.sqrt(3),t=s.t/1000,L=s.volume/10;return Array.from({length:v.count},(_,i)=>{const sx=i&1?1:-1,sy=i&2?1:-1;return {x:reflect((i*.61803398875+.11)%1+sx*speed*t/L),y:reflect((i*.41421356237+.23)%1+sy*speed*t/.1)};});}
export function plot(s){const v=snapshot(s);return {curve:Array.from({length:151},(_,i)=>{const V=5+i/10;return [V,s.amount*R*s.temperature/V];}),marker:[s.volume,v.pressure]};}
