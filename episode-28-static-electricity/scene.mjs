import * as  K from'../laboratory/kit/iso-kit.mjs';
import * as  G from'../laboratory/kit/lathe.mjs';
import * as  C from'../laboratory/geometry.mjs';
import * as  E from'../laboratory/electrical.mjs';
import * as  O from'./model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-212,y:-90,w:430,d:220,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,175),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:30}),defs=C.defs;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'CARGA · XXVIII'),B=C.builders(parts,P);B.c('generator.foot',-110,0,22,22,6,'iron');for(const[i,[z,h,r]]of[[28,21,8],[49,4,10],[53,27,8],[80,4,10],[84,20,8],[104,4,10]].entries())B.c('generator.column.'+i,-110,0,r,z,h,'silver');B.ball('generator.dome',[-110,0,140],32,'silver');B.c('pendulum.foot',15,0,10,22,3,'iron');B.c('pendulum.post',15,0,2,25,91,'brass');B.slab('pendulum.beam',{x:12,y:-12,w:26,d:24,r:1},116,4,'enamel');for(const[i,y]of[-9,9].entries())B.ball('pendulum.pivot.'+i,[35,y,114.5],1.5,'silver');B.c('jar.bottom',145,0,16,22,3,'iron');const F={o:[145,0,0],a:[0,0,1],u:[1,0,0],v:[0,1,0]},xy=(r,a)=>[r*Math.cos(a),r*Math.sin(a)];for(let i=0;i<32;i++){const a=E.TAU*i/32,b=E.TAU*(i+1)/32;B.prism('jar.wall.'+i,F,[xy(14,a),xy(16,a),xy(16,b),xy(14,b)],25,75,'enamel');}B.c('jar.lid',145,0,16,75,2,'brass');B.c('jar.stem',145,0,2,77,13,'silver');B.ball('jar.terminal',[145,0,95],5,'silver');E.meter(B,P,'voltmeter',-80,75);E.knob(B,P,'current.knob',150,85);fixedParts=parts;return parts;}
export function moving(s){const parts=[],B=C.builders(parts,P,true),a=O.snapshot(s).theta;for(const[i,sign]of[-1,1].entries()){const pivot=[35,sign*9,114.5],d=[0,sign*Math.sin(a),-Math.cos(a)],ball=G.add3(pivot,G.mul3(d,50));B.rod('pith.string.'+i,G.add3(pivot,G.mul3(d,1.5)),G.sub3(ball,G.mul3(d,3)),.2,'silver');B.ball('pith.ball.'+i,ball,3,i?'pink':'teal');}return parts;}
export function scene(s=O.create()){return[...fixed(),...moving(s)];}
export const svgParts=(p,o)=>C.svgParts(p,o,P);
export function afterPaint(s,root){const v=O.snapshot(s);E.setMeter(root,P,'voltmeter',-80,75,v.voltage/25000);E.setKnob(root,P,'current.knob',150,85,s.current/30);root.querySelector('[data-part="jar.terminal"] .sphere-body').setAttribute('fill',`url(#sphere-${s.jar?'gold':'silver'})`);}
