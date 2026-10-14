import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={frequency:10,voltage:100,amplitude:70},clamp=E.clamp,C0=299792458,RADIUS=.04,GAP=.005,AREA=Math.PI*RADIUS**2,CAPACITANCE=E.EPS0*AREA/GAP;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function wave(s,x=0,t=s.t){const omega=E.TAU*s.frequency*1e6,k=omega/C0,phase=omega*t*1e-9-k*x+Math.PI/4,electric=s.amplitude*Math.sin(phase),magnetic=-electric/C0;return {electric,magnetic,poynting:-electric*magnetic/E.MU0,phase};}
export function snapshot(s){const omega=E.TAU*s.frequency*1e6,phase=omega*s.t*1e-9+Math.PI/4,voltage=s.voltage*Math.sin(phase),charge=CAPACITANCE*voltage,electric=voltage/GAP,flux=electric*AREA,current=CAPACITANCE*s.voltage*omega*Math.cos(phase),displacement=E.EPS0*AREA*s.voltage/GAP*omega*Math.cos(phase),probeB=E.MU0*current/(E.TAU*.06),w=wave(s,15);return {voltage,charge,electric,flux,current,displacement,probeB,waveE:w.electric,waveB:w.magnetic,poynting:w.poynting,meanIntensity:s.amplitude**2/(2*E.MU0*C0),wavelength:C0/(s.frequency*1e6),speed:C0/1e6,capacitance:CAPACITANCE};}
export function plot(s){return {curve:Array.from({length:321},(_,i)=>[30*i/320,wave(s,30*i/320).electric]),reference:Array.from({length:321},(_,i)=>[30*i/320,-C0*wave(s,30*i/320).magnetic]),marker:[15,wave(s,15).electric]};}
