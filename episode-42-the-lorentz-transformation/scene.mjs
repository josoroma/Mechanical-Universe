import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-150,y:-125,w:320,d:265,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,150),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:35});
export const defs=C.defs;
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const a=C.base(P,PLAN,'LORENTZ · XLII'),B=C.builders(a,P);B.slab('diagram.frame',{x:-133,y:-108,w:154,d:196,r:3},22,3,'iron');let grid='';for(let i=0;i<=8;i++){grid+=C.path([[-116+15*i,-90,26],[-116+15*i,70,26]],P);grid+=C.path([[-116,70-20*i,26],[4,70-20*i,26]],P);}grid+=C.path([[-116,10,26],[-56,70,26],[4,10,26]],P);const event=K.iso([-26,70,26],P);B.slab('diagram.plate',{x:-116,y:-90,w:120,d:160,r:0},25,1,'ivory',C.line(grid)+`<circle data-event cx="${event[0]}" cy="${event[1]}" r="2.5" fill="#ef91bc"/>`);for(const[i,[x,y]]of[[-127,-102],[15,-102],[-127,82],[15,82]].entries())B.screw('diagram.screw.'+i,x,y,25);
 B.c('pivot.lower',-56,70,4,26,2,'iron');B.c('pivot.upper',-56,70,4,28,3,'silver');B.c('pivot.cap',-56,70,4,31,1,'iron');
 for(const y of[-78,-38]){B.slab('length.rail.'+y,{x:35,y:y-4,w:112,d:8,r:1},22,3,'iron');let d='';for(let i=0;i<=20;i++)d+=C.path([[40+i*5,y-4,25],[40+i*5,y+(i%5?-2:4),25]],P);B.slab('length.scale.'+y,{x:40,y:y-4,w:100,d:8,r:0},25,.5,'ivory',C.line(d));}
 for(const x of[52,120]){B.slab('clock.foot.'+x,{x:x-8,y:12,w:16,d:30,r:2},22,3,'iron');B.c('clock.post.'+x,x,27,3,25,100,'silver');B.c('clock.nut.'+x,x,27,5,125,3,'iron',C.line(K.knurl(x,27,5,125,128,30,P,0)));}
 B.slab('clock.bottom',{x:55,y:18,w:62,d:18,r:1},25,3,'iron');B.slab('clock.mirror.lower',{x:64,y:19,w:44,d:16,r:1},28,1,'silver');B.slab('clock.top',{x:55,y:18,w:62,d:18,r:1},122,3,'iron');B.slab('clock.mirror.upper',{x:64,y:19,w:44,d:16,r:1},121,1,'silver');
 const F={o:[0,32,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]},cp=K.iso([86,32,29],P);B.prism('clock.guide',F,[[76,29],[96,29],[96,121],[76,121]],0,.5,'iron',C.line(C.path([[86,32,29],[86,32,121]],P))+`<circle data-pulse cx="${cp[0]}" cy="${cp[1]}" r="2.5" fill="#f2d49b"/>`);
 E.knob(B,P,'beta.knob',60,95);E.knob(B,P,'length.knob',120,95);fixedParts=a;return a;}
export function moving(s){const a=[],B=C.builders(a,P,true),v=O.snapshot(s),b=s.beta,n=Math.sqrt(1+b*b),L=105/n,h=4/n,o=[-56,70];
 B.rod('axis.ctprime',[o[0]+b*h,o[1]-h,27],[o[0]+b*L,o[1]-L,27],.75,'copper');B.rod('axis.xprime',[o[0]+h,o[1]-b*h,30],[o[0]+L,o[1]-b*L,30],.75,'silver');

 for(const[name,y,length,mat]of[['rest',-78,s.length,'silver'],['moving',-38,v.length,'copper']])B.slab('length.'+name,{x:40,y:y-2,w:30*length,d:4,r:.5},25.5,2,mat);
 return a;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(a,o)=>C.svgParts(a,o,P);
export function afterPaint(s,root){const ep=K.iso([-56+30*s.eventX,70-40*s.t,26],P),event=root.querySelector('[data-event]');event.setAttribute('cx',ep[0]);event.setAttribute('cy',ep[1]);const cp=K.iso([86,32,29+92*O.snapshot(s).light],P),pulse=root.querySelector('[data-pulse]');pulse.setAttribute('cx',cp[0]);pulse.setAttribute('cy',cp[1]);E.setKnob(root,P,'beta.knob',60,95,s.beta/.95);E.setKnob(root,P,'length.knob',120,95,(s.length-1)/2);}
