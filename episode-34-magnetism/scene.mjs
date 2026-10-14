import * as K from '../laboratory/kit/iso-kit.mjs';
import * as C from '../laboratory/geometry.mjs';
import * as E from '../laboratory/electrical.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=750,PLAN={x:-212,y:-90,w:430,d:220,r:10},P=K.fitProjection(K.boxCorners(PLAN,-14,165),WIDTH,HEIGHT,{pad:40,azimuth:57,elevation:30});
export function defs(){return C.defs()+`<style>.material-north{--anatomy-paper:#a14642;--anatomy-top:#ed897d;--anatomy-shade-0:#71332d;--anatomy-shade-1:#a14642;--anatomy-shade-2:#c56157;--anatomy-shade-3:#df7d70}.material-south{--anatomy-paper:#416aaf;--anatomy-top:#8bb8fa;--anatomy-shade-0:#2c4368;--anatomy-shade-1:#416aaf;--anatomy-shade-2:#638dc8;--anatomy-shade-3:#80a7e2}</style>`;}
let fixedParts;
export function centres(kind,i){const a=E.TAU*i/8,r=kind?48:62;return [(kind?105:-115)+r*Math.cos(a),r*Math.sin(a)];}
export function fixed(){if(fixedParts)return fixedParts;const parts=C.base(P,PLAN,'MAGNETISMO · XXXIV'),B=C.builders(parts,P);B.c('magnet.foot',-115,0,24,22,3,'iron');B.c('magnet.turntable',-115,0,22,25,1,'brass');B.c('wire.foot',105,0,7,22,3,'iron');B.c('wire.conductor',105,0,1.4,25,110,'copper');B.ball('wire.terminal',[105,0,139],4,'silver');
 for(let kind=0;kind<2;kind++)for(let i=0;i<8;i++){const [x,y]=centres(kind,i),name=`compass.${kind}.${i}`;B.c(name+'.foot',x,y,8,22,2,'iron');B.c(name+'.case',x,y,10,24,3,'iron',C.line(K.knurl(x,y,10,24,27,32,P,0)));let scale=[8,9].map(r=>C.path(Array.from({length:65},(_,j)=>E.polar(x,y,r,E.TAU*j/64,28)),P)+'Z').join('');for(let j=0;j<16;j++){const a=E.TAU*j/16;scale+=C.path([E.polar(x,y,8,a,28),E.polar(x,y,9,a,28)],P);}B.c(name+'.face',x,y,9.5,27,1,'ivory',C.line(scale)+`<path class="iso-line" style="stroke:#d65e71" data-needle="${name}.north"/><path class="iso-line" style="stroke:#4776c8" data-needle="${name}.south"/>`);B.c(name+'.hub',x,y,.8,28,.5,'silver');}
 E.knob(B,P,'current.knob',155,85);fixedParts=parts;return parts;}
export function moving(s){const parts=[],B=C.builders(parts,P,true),a=O.orientation(s),F={o:[-115,0,0],a:[0,0,1],u:[Math.cos(a),Math.sin(a),0],v:[-Math.sin(a),Math.cos(a),0]};B.prism('magnet.south',F,[[-16,-6],[0,-6],[0,6],[-16,6]],26,32,'south');B.prism('magnet.north',F,[[0,-6],[16,-6],[16,6],[0,6]],26,32,'north');B.c('magnet.axle',-115,0,2,32,2,'silver');return parts;}
export function scene(s=O.create()){return [...fixed(),...moving(s)];}
export const svgParts=(p,o)=>C.svgParts(p,o,P);
export function afterPaint(s,root){E.setKnob(root,P,'current.knob',155,85,(s.current+10)/20);for(let kind=0;kind<2;kind++)for(let i=0;i<8;i++){const [x,y]=centres(kind,i),v=O.field(s,kind,E.TAU*i/8),a=Math.atan2(v[1],v[0]);for(const[sign,pole]of[[1,'north'],[-1,'south']]){const needle=root.querySelector(`[data-needle="compass.${kind}.${i}.${pole}"]`);needle.setAttribute('d',C.path([[x,y,28],E.polar(x,y,8,a+(sign<0?Math.PI:0),28)],P));needle.setAttribute('opacity',Math.hypot(...v)<1e-12?'0':'1');}}}
