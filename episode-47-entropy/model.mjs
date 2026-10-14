import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={speed:1,count:40,kind:0},clamp=E.clamp,R=8.314462618,AMOUNT=.1;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export const reflect=q=>{const f=((q%2)+2)%2;return f<=1?f:2-f;};
export function particles(s){const n=s.count/2,t=Math.max(0,s.t-.5)*s.speed;return Array.from({length:s.count},(_,i)=>{const group=i<n?0:1,j=i%n,x0=group*.5+.02+.46*((j*.61803398875+.21)%1),y0=.04+.92*((j*.41421356237+.13)%1),vx=(i%2?1:-1)*(.11+.31*((j*.73205080757+.1)%1)),vy=(i%3?1:-1)*(.2+.4*((i*.317+.4)%1));return {group,x:reflect(x0+vx*t),y:reflect(y0+vy*t)};});}
export function logChoose(n,k){let v=0;for(let j=1;j<=Math.min(k,n-k);j++)v+=Math.log(n-j+1)-Math.log(j);return v;}
export function snapshot(s){const p=particles(s),n=s.count/2,a=p.filter(q=>q.group===0&&q.x<.5).length,b=p.filter(q=>q.group===1&&q.x<.5).length,logOmega=logChoose(n,a)+logChoose(n,b),perParticle=s.kind?0:logOmega/s.count;return {a,b,leftA:100*a/n,leftB:100*b/n,entropy:AMOUNT*R*perParticle,perParticle,limit:s.kind?0:AMOUNT*R*Math.log(2),logOmega,returnLog:-s.count*Math.log10(2),lift:45*clamp(s.t/.5,0,1),count:s.count,comparison:s.kind?'Mismo gas · sin entropía ideal de mezcla':'Gases distintos · mezcla observable'};}
export function plot(s){const v=snapshot(s);return {curve:Array.from({length:301},(_,i)=>[i*.04,snapshot({...s,t:i*.04}).perParticle]),reference:[[0,s.kind?0:Math.log(2)],[12,s.kind?0:Math.log(2)]],marker:[s.t,v.perParticle]};}
