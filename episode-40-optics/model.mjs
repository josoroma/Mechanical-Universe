import * as E from '../laboratory/electrical.mjs';
export const DEFAULTS={focus:60,distance:200,index:1.5},clamp=E.clamp,OBJECT_HEIGHT=12,APEX=Math.PI/3;
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export const advance=(s,dt)=>({...s,t:Math.max(0,s.t+dt)});
export function mirrorRay(f,height){const radius=2*f,x=-radius+Math.sqrt(radius**2-height**2),normal=[(x+radius)/radius,height/radius],direction=[1-2*normal[0]**2,-2*normal[0]*normal[1]],axis=height?x-height*direction[0]/direction[1]:-f;return {hit:[x,height],direction,axis};}
export function snapshot(s){const distance=s.distance+20*Math.sin(E.TAU*s.t/12),image=s.focus*distance/(distance-s.focus),magnification=-image/distance,height=OBJECT_HEIGHT*magnification,incidence=Math.asin(s.index*Math.sin(APEX/2)),deviation=2*incidence-APEX,marginal=-mirrorRay(s.focus,12).axis;return {distance,image,magnification,height,focus:s.focus,incidence:incidence*180/Math.PI,deviation:deviation*180/Math.PI,refraction:30,marginal,index:s.index};}
export function lensRays(s){const v=snapshot(s),object=[-v.distance,OBJECT_HEIGHT],image=[v.image,v.height];return [[object,[0,OBJECT_HEIGHT],image],[object,[0,0],image]];}
export function prismRay(s){const delta=snapshot(s).deviation*Math.PI/180,a=delta/2,entry=[-6*Math.sqrt(3),-6],exit=[6*Math.sqrt(3),-6],source=[entry[0]-40*Math.cos(a),entry[1]+40*Math.sin(a)],end=[exit[0]+40*Math.cos(a),exit[1]+40*Math.sin(a)];return {points:[source,entry,exit,end],incoming:[Math.cos(a),-Math.sin(a)],outgoing:[Math.cos(a),Math.sin(a)]};}
export function plot(s){const r=lensRays(s),v=snapshot(s);return {curve:r[0],reference:r[1],marker:[v.image,v.height]};}
