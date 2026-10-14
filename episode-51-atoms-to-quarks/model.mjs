import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={logQ:-3,baryon:0},clamp=E.clamp,HBARC=1.973269804e-16;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function snapshot(s){const probe=10**s.logQ,resolution=HBARC/probe,stage=resolution>1e-10?-1:resolution>1e-14?0:resolution>1e-15?1:2,up=s.baryon?1:2,down=3-up,charge=(2*up-down)/3;return {probe,resolution,logResolution:Math.log10(resolution),stage,up,down,charge,composition:s.baryon?'Neutrón · udd':'Protón · uud',reach:stage<0?'Resolución mayor que la escala atómica':stage===0?'Escala atómica · distribución electrónica':stage===1?'Escala nuclear · nucleones':'Interior del nucleón · quarks y gluones',atom:resolution<=1e-10?1:0,nucleus:resolution<=1e-14?1:0,nucleon:resolution<=1e-15?1:0,beam:-140+280*clamp(s.t/10,0,1)};}
export function plot(s){const v=snapshot(s);return {curve:[[-6,Math.log10(HBARC)+6],[4,Math.log10(HBARC)-4]],marker:[s.logQ,v.logResolution]};}
