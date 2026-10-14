import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={wavelength:600,separation:.25,view:1,which:0},clamp=E.clamp,LENGTH=2,WIDTH=.04,RATE=50;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export const sinc=x=>Math.abs(x)<1e-9?1:Math.sin(x)/x;
export function intensity(s,y){const lambda=s.wavelength*1e-9,q=y*1e-3/(lambda*LENGTH),envelope=sinc(Math.PI*WIDTH*1e-3*q)**2;return envelope*(1+(1-s.which)*Math.cos(2*Math.PI*s.separation*1e-3*q))/2;}
let pdfCache,pdfKey;
export function distribution(s){const key=[s.wavelength,s.separation,s.which].join();if(key===pdfKey)return pdfCache;pdfKey=key;const weights=Array.from({length:2000},(_,i)=>intensity(s,-20+(i+.5)*.02)),sum=weights.reduce((a,b)=>a+b,0);let q=0;const cdf=weights.map(v=>q+=v/sum);cdf[cdf.length-1]=1;pdfCache={cdf,weights:weights.map(v=>v/sum),dy:.02};return pdfCache;}
export function random(i){let x=(i+1)>>>0;x=Math.imul(x^(x>>>16),0x21f0aaad);x=Math.imul(x^(x>>>15),0x735a2d97);return ((x^(x>>>15))>>>0)/4294967296;}
export function sample(s,u){const d=distribution(s);let lo=0,hi=d.cdf.length-1;while(lo<hi){const m=(lo+hi)>>1;if(d.cdf[m]<u)lo=m+1;else hi=m;}return -20+(lo+.5)*d.dy;}
export function hit(s,i){return {y:sample(s,random(2*i)),height:random(2*i+1)};}
export function snapshot(s){const d=distribution(s);return {count:Math.min(600,Math.floor(s.t*RATE)),spacing:s.wavelength*1e-9*LENGTH/(s.separation*1e-3)*1000,visibility:100*(1-s.which),central:100*d.weights.slice(950,1050).reduce((a,b)=>a+b,0),width:WIDTH,distance:LENGTH,rate:RATE,wavelength:s.wavelength,representation:s.view?'Intensidad ondulatoria prevista':'Impactos individuales acumulados',information:s.which?'Caminos distinguibles · sin interferencia':'Sin información de camino · interferencia'};}
export function plot(s){return {curve:Array.from({length:1001},(_,i)=>{const y=-20+i*.04;return[y,intensity(s,y)];})};}
