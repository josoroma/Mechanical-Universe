import * as K from './kit/iso-kit.mjs';
import * as G from './kit/lathe.mjs';
import * as T from './kit/tube.mjs';
import * as C from './geometry.mjs';
export const TAU=2*Math.PI,EPS0=8.8541878128e-12,MU0=1.25663706212e-6,COULOMB=1/(4*Math.PI*EPS0),FARADAY=96485.33212;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const polar=(x,y,r,a,z)=>[x+r*Math.cos(a),y+r*Math.sin(a),z];
export function knob(B,P,name,x,y,z=22,r=8){B.c(name,x,y,r,z,7,'iron',C.line(K.knurl(x,y,r,z,z+7,36,P,0))+`<path class="iso-line" data-knob="${name}"/>`);B.c(name+'.hub',x,y,1,z+7,.5,'silver');}
export function setKnob(root,P,name,x,y,value,z=29,r=8){const a=value*Math.PI*1.5;root.querySelector(`[data-knob="${name}"]`)?.setAttribute('d',C.path([[x,y,z],polar(x,y,r,a,z)],P));}
export function meter(B,P,name,x,y){B.c(name+'.foot',x,y,12,22,3,'iron');B.c(name+'.post',x,y,5,25,9,'brass');B.c(name+'.case',x,y,23,34,4,'iron',C.line(K.knurl(x,y,23,34,38,64,P,0)));let scale=C.path(Array.from({length:97},(_,i)=>polar(x,y,17,i*TAU/96,39)),P)+'Z';scale+=C.path(Array.from({length:97},(_,i)=>polar(x,y,20,i*TAU/96,39)),P)+'Z';for(let j=0;j<=24;j++){const a=-Math.PI*.75+j*Math.PI*1.5/24;scale+=C.path([polar(x,y,j%3?18.5:17,a,39),polar(x,y,20,a,39)],P);}B.c(name+'.face',x,y,21,38,1,'ivory',C.line(scale)+`<path class="iso-line" style="stroke:#dc74ae" data-meter="${name}"/>`);B.c(name+'.hub',x,y,1.1,39,.5,'iron');}
export function setMeter(root,P,name,x,y,value){const a=-Math.PI*.75+clamp(value,0,1)*Math.PI*1.5;root.querySelector(`[data-meter="${name}"]`)?.setAttribute('d',C.path([[x,y,39],polar(x,y,17,a,39)],P));}
export function tubes(parts,P,routes,maxLength=12){for(const r of routes){const pieces=T.tubePieces(r.points,r.r,P,{maxLength,closed:!!r.closed});for(const[i,tube]of pieces.entries())parts.push({name:`${r.name}.${i}`,at:tube.mid,shape:{type:'tube',points:tube.points,r:r.r,route:r.name,chunk:i,cycleChunks:r.closed?pieces.length:0},tube,svg:`<g class="material-${r.material||'copper'}">${T.tubeSvg(tube,{tone:'hi'})}</g>`});}}
export function winding(name,x,y,z,turns=6,r=15,pitch=5){return Array.from({length:turns},(_,i)=>({name:`${name}.${i}`,closed:true,touch:['coil.seat.'+i],r:.5,points:Array.from({length:97},(_,j)=>polar(x,y,r,j*TAU/96,z+i*pitch))}));}
export function spool(B,P,name,x,y,z=29,turns=6,r=15,pitch=5){B.c(name+'.foot',x,y,r+5,22,3,'iron');B.c(name+'.neck',x,y,6,25,z-26,'brass');B.c(name+'.bottom',x,y,r+3,z-1,1,'brass');for(let i=0;i<turns;i++){B.c(name+'.seat.'+i,x,y,r+1,z+i*pitch,.5,'iron');B.c(i?name+'.former.'+i:name+'.former',x,y,r-1,z+i*pitch+.5,pitch-.5,'iron');}B.c(name+'.top',x,y,r+3,z+turns*pitch,1,'brass');B.c(name+'.nut',x,y,4,z+turns*pitch+1,3,'silver');}
