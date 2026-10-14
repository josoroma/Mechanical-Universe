import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={drive:1,angle:60,regime:0};
export const clamp=E.clamp;
export function create(p={}){return{...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function probability(angle){return Math.cos(angle*Math.PI/360)**2;}
export function trials(angle,n){let seed=17027,plus=0,last=0;const p=probability(angle),history=[];for(let i=0;i<n;i++){seed=(Math.imul(1664525,seed)+1013904223)>>>0;last=seed/4294967296<p?1:-1;if(last===1)plus++;history.push(plus/(i+1));}return{n,plus,last,history,fraction:n?plus/n:0};}
export function snapshot(s){const q=trials(s.angle,Math.floor(s.t*4)),omega=s.drive*2,current=s.drive*Math.sin(omega*s.t),field=E.MU0*60*current/(2*Math.hypot(.025,.03));return{omega,current,field,probability:probability(s.angle),trials:q.n,plus:q.plus,last:q.last,fraction:q.fraction,angle:s.angle,regime:['Mecánica clásica','Electromagnetismo','Mediciones cuánticas'][s.regime],result:q.n?q.last>0?'Espín +ℏ/2':'Espín −ℏ/2':'Sin mediciones'};}
export function plot(s){const q=trials(s.angle,40);if(s.regime===2)return{curve:[[0,0],...q.history.map((v,i)=>[(i+1)/4,v])],reference:[[0,probability(s.angle)],[10,probability(s.angle)]],marker:[s.t,snapshot(s).fraction]};const value=t=>s.regime===0?Math.sin(2*s.drive*t):Math.sin(2*s.drive*t)*s.drive/2;return{curve:Array.from({length:241},(_,i)=>[i/24,value(i/24)]),reference:[[0,0],[10,0]],marker:[s.t,value(s.t)]};}
