import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={hot:600,cold:300,ratio:2},clamp=E.clamp,R=8.314462618,N=.02,CV=1.5*R,GAMMA=5/3;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function snapshot(s){const q=clamp(s.t/3,0,4),stage=Math.min(3,Math.floor(q)),u=q-stage,alpha=(s.hot/s.cold)**1.5,V1=1,V2=s.ratio,V3=V2*alpha,V4=alpha,qh=N*R*s.hot*Math.log(s.ratio),qc=N*R*s.cold*Math.log(s.ratio),wa=N*CV*(s.hot-s.cold);let volume,temperature,work,heatHot,heatCold;
 if(stage===0){volume=V1*s.ratio**u;temperature=s.hot;work=qh*u;heatHot=work;heatCold=0;}
 else if(stage===1){volume=V2*alpha**u;temperature=s.hot*(V2/volume)**(GAMMA-1);work=qh+N*CV*(s.hot-temperature);heatHot=qh;heatCold=0;}
 else if(stage===2){volume=V3/s.ratio**u;temperature=s.cold;work=qh+wa-qc*u;heatHot=qh;heatCold=qc*u;}
 else{volume=V4/alpha**u;temperature=s.cold*(V4/volume)**(GAMMA-1);work=qh+wa-qc+N*CV*(s.cold-temperature);heatHot=qh;heatCold=qc;}
 const stroke=clamp((volume-1)/(V3-1),0,1),d=130-60*stroke,theta=Math.acos(clamp((d*d+900-10000)/(60*d),-1,1)),angle=stage<2?theta:2*Math.PI-theta;
 return {stage,u,volume,temperature,pressure:N*R*temperature/volume,work,heatHot,heatCold,qh,qc,net:qh-qc,efficiency:100*(1-s.cold/s.hot),entropy:N*CV*Math.log(temperature/s.hot)+N*R*Math.log(volume),reservoirEntropy:-heatHot/s.hot+heatCold/s.cold,stroke,slider:60-d,angle,phase:['Expansión isotérmica · absorbe calor','Expansión adiabática · se enfría','Compresión isotérmica · cede calor','Compresión adiabática · se calienta'][stage]};}
export function plot(s){const v=snapshot(s);return {curve:Array.from({length:321},(_,i)=>{const q=snapshot({...s,t:12*i/320});return[q.volume,q.pressure];}),marker:[v.volume,v.pressure]};}
