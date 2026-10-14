import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-150,y:-115,w:300,d:245,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,130),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:35});
export const defs=C.defs;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const a=C.base(P,PLAN,'CRIOGENIA · XLVIII'),B=C.builders(a,P),Fz={o:[0,0,0],a:[0,0,1],u:[1,0,0],v:[0,1,0]};B.c('cryostat.base',0,0,40,22,5,'iron');for(let i=0;i<6;i++){const p=(210+20*i)*Math.PI/180,q=p+Math.PI/9;B.prism('cryostat.shell.'+i,Fz,[[38*Math.cos(p),38*Math.sin(p)],[40*Math.cos(p),40*Math.sin(p)],[40*Math.cos(q),40*Math.sin(q)],[38*Math.cos(q),38*Math.sin(q)]],27,100,'iron');}
 B.c('salt.pedestal',0,0,22,27,8,'iron');B.c('salt.seat',0,0,12,35,5,'silver');B.c('salt.body',0,0,12,40,50,'ivory');B.c('salt.cap',0,0,14,90,2,'silver');let symbols='';for(let i=0;i<24;i++){const q=K.iso([-6+4*(i%4),12.8,46+7*Math.floor(i/4)],P);symbols+=`<circle data-spin="${i}" cx="${q[0]}" cy="${q[1]}" r="1.5" fill="${i<12?'#b7a0ff':'#71d9cb'}"/>`;}const Fy={o:[0,12,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]};B.prism('salt.window',Fy,[[-8,44],[8,44],[8,86],[-8,86]],0,.8,'iron',symbols);
 for(const y of[-33,33]){B.c('coil.post.'+y,0,y,3,27,73,'ivory');B.c('coil.cap.'+y,0,y,5,100,3,'iron',C.line(K.knurl(0,y,5,100,103,32,P,0)));}for(let j=0;j<4;j++)for(let i=0;i<12;i++){const p=E.TAU*i/12,q=E.TAU*(i+1)/12;B.prism('coil.'+j+'.'+i,Fz,[[24*Math.cos(p),24*Math.sin(p)],[30*Math.cos(p),30*Math.sin(p)],[30*Math.cos(q),30*Math.sin(q)],[24*Math.cos(q),24*Math.sin(q)]],45+12*j,47+12*j,'copper');}
 B.c('bath.foot',-85,0,27,22,3,'iron');B.c('bath.body',-85,0,22,25,27,'silver',C.line(K.sideArc(-85,0,22,38,P,64)));B.c('bath.lid',-85,0,25,52,2,'iron');E.knob(B,P,'bath.valve',-85,0,54,5);B.slab('thermal.bridge',{x:-60,y:-1,w:35,d:2,r:0},52,2,'copper');B.ball('switch.joint',[-24,0,53],1,'gold');
 E.meter(B,P,'temperature',99,-65);E.knob(B,P,'initial.knob',95,85);E.knob(B,P,'final.knob',131,85);fixedParts=a;return a;}
export function moving(s){const a=[],B=C.builders(a,P,true),v=O.snapshot(s),u=[Math.cos(v.switchAngle),0,Math.sin(v.switchAngle)],p=[-24,0,53];B.rod('switch.arm',G.add3(p,u),G.add3(p,G.mul3(u,10.8)),.6,'copper');B.ball('switch.contact',G.add3(p,G.mul3(u,11.4)),.6,'gold');return a;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(a,o)=>C.svgParts(a,o,P);
export function afterPaint(s,root){const v=O.snapshot(s),up=(1+v.polarization/100)/2;for(let i=0;i<24;i++)root.querySelector(`[data-spin="${i}"]`).setAttribute('fill',i<Math.round(24*up)?'#b7a0ff':'#71d9cb');E.setMeter(root,P,'temperature',99,-65,v.temperature/2);E.setKnob(root,P,'initial.knob',95,85,(s.initial-1)/3);E.setKnob(root,P,'final.knob',131,85,(s.final-.05)/.45);E.setKnob(root,P,'bath.valve',-85,0,(s.bath-.8)/1.2,61,5);}
