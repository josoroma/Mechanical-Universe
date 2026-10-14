import * as  E from'../laboratory/electrical.mjs';
export const DEFAULTS={current:18,jar:0,humidity:0},clamp=E.clamp,CS=4*Math.PI*E.EPS0*.15,MASS=2e-6,LENGTH=.12,A=.01,G=9.80665;
export function create(p={}){return{...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function angle(q){if(!q)return 0;let lo=0,hi=Math.PI/2-1e-8;for(let i=0;i<65;i++){const m=(lo+hi)/2,f=MASS*G*Math.tan(m)-E.COULOMB*q*q/(2*(A+LENGTH*Math.sin(m)))**2;if(f>0)hi=m;else lo=m;}return(lo+hi)/2;}
export function snapshot(s){const capacitance=CS+(s.jar?100e-12:0),resistance=s.humidity?2e11:1e12,current=s.current*1e-9,tau=resistance*capacitance,voltage=current*resistance*(-Math.expm1(-s.t/tau)),charge=capacitance*voltage,qBall=.2e-12*voltage,theta=angle(qBall);return{capacitance,resistance,tau,voltage,charge,qBall,theta,degrees:theta*180/Math.PI,energy:.5*capacitance*voltage**2,leak:voltage/resistance,jarState:s.jar?'Conectada':'Desconectada',air:s.humidity?'Húmedo':'Seco'};}
export function plot(s){return{curve:Array.from({length:161},(_,i)=>[i/8,snapshot({...s,t:i/8}).voltage/1000]),reference:[[0,0],[20,0]],marker:[s.t,snapshot(s).voltage/1000]};}
