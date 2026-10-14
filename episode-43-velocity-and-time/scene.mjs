import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-155,y:-110,w:320,d:230,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,150),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:35});
export const defs=C.defs;
function clock(B,name,x,y,z){for(const dx of[-23,23]){B.c(name+'.post.'+dx,x+dx,y,2,z,96,'silver');B.c(name+'.nut.'+dx,x+dx,y,3.5,z+96,2,'iron',C.line(K.knurl(x+dx,y,3.5,z+96,z+98,24,P,0)));}B.slab(name+'.lower',{x:x-21,y:y-8,w:42,d:16,r:.5},z,2,'silver');B.slab(name+'.upper',{x:x-21,y:y-8,w:42,d:16,r:.5},z+94,2,'silver');const F={o:[0,y+5,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]},q=K.iso([x,y+5,z+2],P);B.prism(name+'.guide',F,[[x-12,z+2],[x+12,z+2],[x+12,z+94],[x-12,z+94]],0,.5,'iron',C.line(C.path([[x,y+5,z+2],[x,y+5,z+94]],P))+`<circle data-pulse="${name}" cx="${q[0]}" cy="${q[1]}" r="2.5" fill="${name==='cart'?'#f2d49b':'#71d9cb'}"/>`);}
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const a=C.base(P,PLAN,'RELOJ DE LUZ · XLIII'),B=C.builders(a,P);for(const y of[-18,18]){const plan={x:-140,y:y-4,w:280,d:8,r:1};B.slab('rail.'+y,plan,22,3,'silver');let d='';for(let i=0;i<=56;i++)d+=C.path([[-140+5*i,y-4,25],[-140+5*i,y+(i%5?-2:4),25]],P);a.at(-1).inner=C.line(d);a.at(-1).svg=C.bodySvg(a.at(-1));}B.slab('reference.foot',{x:-120,y:-88,w:56,d:40,r:2},22,3,'iron');clock(B,'reference',-92,-68,25);E.meter(B,P,'dilation.meter',82,-70);E.knob(B,P,'speed.knob',90,75);E.knob(B,P,'period.knob',130,75);fixedParts=a;return a;}
let carriage;
export function moving(s){if(!carriage){const a=[],B=C.builders(a,P);for(const x of[-18,18])for(const side of[-1,1]){const F={o:[x,0,31],a:[0,1,0],u:[1,0,0],v:[0,0,1]};B.disc('cart.wheel.'+x+'.'+side,F,side<0?-22:17,side<0?-17:22,6,'iron',C.line(G.circleOf(F,side<0?-22:22,3.5,P)));}B.slab('cart.platform',{x:-27,y:-17,w:54,d:34,r:2},33,3,'iron');for(const[i,[x,y]]of[[-22,-12],[22,-12],[-22,12],[22,12]].entries())B.screw('cart.bolt.'+i,x,y,36);clock(B,'cart',0,0,36);carriage=a;}const x=O.snapshot(s).cartX;return carriage.map(p=>{const q={...p,translate:[x,0,0],at:[p.at[0]+x,p.at[1],p.at[2]]},f=p.shape;q.shape=f.type==='slab'?{...f,plan:{...f.plan,x:f.plan.x+x}}:{...f,F:{...f.F,o:[f.F.o[0]+x,f.F.o[1],f.F.o[2]]}};return q;});}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(a,o)=>C.svgParts(a,o,P);
export function afterPaint(s,root){const v=O.snapshot(s);for(const[name,x,y,z,h]of[['reference',-92,-63,27,v.fixedPulse],['cart',0,5,38,v.pulse]]){const q=K.iso([x,y,z+92*h],P),p=root.querySelector(`[data-pulse="${name}"]`);p.setAttribute('cx',q[0]);p.setAttribute('cy',q[1]);}E.setMeter(root,P,'dilation.meter',82,-70,(v.gamma-1)/2.21);E.setKnob(root,P,'speed.knob',90,75,s.beta/.95);E.setKnob(root,P,'period.knob',130,75,(s.period-1)/2);}
