import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-155,y:-125,w:310,d:260,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,125),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:35});
export function defs(){return C.defs()+`<style>.material-cool{--anatomy-paper:#39766f;--anatomy-top:#81c8bb;--anatomy-shade-0:#214943;--anatomy-shade-1:#2c6259;--anatomy-shade-2:#3c8b7f;--anatomy-shade-3:#65ac9e;--anatomy-mid:#a3dfd1;--anatomy-lo:#4e9c8c}</style>`;}
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const a=C.base(P,PLAN,'CARNOT · XLVI'),B=C.builders(a,P),base={x:-125,y:-24,w:120,d:42,r:2};B.slab('cylinder.base',base,22,25,'iron',C.line(K.sideSeam(base,34,P,6)));for(const y of[-24,15])B.slab('cylinder.wall.'+y,{x:-125,y,w:120,d:3,r:0},47,36,'iron');B.slab('cylinder.back',{x:-125,y:-21,w:3,d:36,r:0},47,36,'iron');for(const y of[-22.5,16.5])for(const x of[-119,-11])B.screw('cylinder.screw.'+x+'.'+y,x,y,83,.65);
 B.c('bearing.foot',60,10,12,22,3,'iron');B.c('bearing.post',60,10,4,25,44,'silver');const F={o:[60,0,65],a:[0,1,0],u:[1,0,0],v:[0,0,1]};let d=G.circleOf(F,4,30,P)+G.circleOf(F,4,34,P);for(let i=0;i<48;i++){const t=E.TAU*i/48;d+=C.path([[60+(i%4?32.5:30)*Math.cos(t),4,65+(i%4?32.5:30)*Math.sin(t)],[60+34*Math.cos(t),4,65+34*Math.sin(t)]],P);}B.disc('flywheel',F,0,4,35,'iron',C.line(d)+`<path class="iso-line" data-spoke d="${C.path([[60,4,65],[30,4,65]],P)}"/>`);B.disc('flywheel.hub',F,4,6,5,'silver');
 for(const[name,y,mat]of[['hot',-80,'copper'],['cold',75,'cool']]){B.c(name+'.foot',-70,y,24,22,3,'iron');for(let j=0;j<4;j++){B.c(name+'.body.'+j,-70,y,18,25+7*j,6,mat);if(j<3)B.c(name+'.fin.'+j,-70,y,22,31+7*j,1,mat);}B.c(name+'.lid',-70,y,21,52,2,'iron');B.c(name+'.cap',-70,y,5,54,4,'silver',C.line(K.knurl(-70,y,5,54,58,32,P,0)));}
 E.meter(B,P,'efficiency',80,-75);E.knob(B,P,'hot.knob',75,90);E.knob(B,P,'cold.knob',120,90);fixedParts=a;return a;}
export function moving(s){const a=[],B=C.builders(a,P,true),v=O.snapshot(s),p=[v.slider,-3,65],q=[60-30*Math.cos(v.angle),-3,65+30*Math.sin(v.angle)],u=G.mul3(G.sub3(q,p),1/100),F={o:[0,-3,65],a:[1,0,0],u:[0,1,0],v:[0,0,1]};B.disc('piston',F,v.slider-9,v.slider-3,18,'silver');B.ball('piston.joint',p,3,'gold');B.ball('crank.joint',q,3,'gold');B.rod('connecting.rod',G.add3(p,G.mul3(u,3)),G.sub3(q,G.mul3(u,3)),1.2,'silver');return a;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(a,o)=>C.svgParts(a,o,P);
export function afterPaint(s,root){const v=O.snapshot(s);root.querySelector('[data-spoke]').setAttribute('d',C.path([[60,4,65],[60-30*Math.cos(v.angle),4,65+30*Math.sin(v.angle)]],P));E.setMeter(root,P,'efficiency',80,-75,v.efficiency/100);E.setKnob(root,P,'hot.knob',75,90,(s.hot-400)/400);E.setKnob(root,P,'cold.knob',120,90,(s.cold-200)/150);}
