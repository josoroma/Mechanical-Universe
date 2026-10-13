import * as K from './kit/iso-kit.mjs';
import * as G from './kit/lathe.mjs';
export const WIDTH=820,HEIGHT=610,PLAN={x:-125,y:-90,w:270,d:190,r:10};
export const P=K.fitProjection([...K.boxCorners(PLAN,-16,22),[-95,65,150],[0,0,150]],WIDTH,HEIGHT,{pad:34,azimuth:50,elevation:28});
const line=(d,tone='lo')=>K.lineSvg(d,{tone});
const stroke=(points,tone='lo')=>line(K.pathOf(points.map(p=>K.iso(p,P))),tone);
const wrap=(paths,material,inner='',lit=false)=>`<g class="material-${material}">${K.solidSvg(paths,{tone:'mid',inner,lit})}</g>`;
let fixed;
export function ballDefs(){return `<defs>${['brass','iron','copper'].map(m=>`<radialGradient id="ball-${m}" class="material-${m}" cx="30%" cy="24%" r="80%"><stop offset="0" style="stop-color:var(--anatomy-top)"/><stop offset=".3" style="stop-color:var(--anatomy-shade-3)"/><stop offset=".7" style="stop-color:var(--anatomy-shade-1)"/><stop offset="1" style="stop-color:var(--anatomy-shade-0)"/></radialGradient>`).join('')}</defs>`;}
export function pointer(U){const a=(U/500*130-90)*Math.PI/180;return K.pathOf([2,7].map(r=>K.iso([98+r*Math.cos(a),-56+r*Math.sin(a),50],P)));}
export function scene(){
  if(fixed)return fixed;const parts=[];
  const put=(name,at,shape,svg)=>parts.push({name,at,shape,svg});
  const c=(name,x,y,r,z,h,m='brass',detail='')=>{let inside=detail==='knurl'?line(K.knurl(x,y,r,z,z+h,32,P,0)):detail==='screw'?stroke([[x-r,y,z+h],[x+r,y,z+h]],'mid'):detail==='ring'?line(K.ring(x,y,Math.max(.5,r-1.4),z+h,P)):detail;put(name,[x,y,z+h/2],{type:'cylinder',x,y,r,z,h},wrap(K.cylinder(x,y,r,z,h,P,64,.35),m,inside));};
  const slab=(name,plan,z,h,m='brass',inner='')=>put(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],{type:'slab',plan,z,h},wrap(K.slabOf(plan,z,h,P,8,.35),m,inner));
  const rod=(name,o,u,s0,s1,r,m='brass',detail='',lit=false)=>{const F=G.frameAlong(o,u),inner=detail==='ribs'?line(G.ribsOf(F,s0,s1,r,32,P,{seams:true})):detail==='rim'?line(G.circleOf(F,s1,r-1.2,P)):detail;put(name,G.add3(o,G.mul3(u,(s0+s1)/2)),{type:'disc',F,s0,s1,r},wrap(G.disc(s0,s1,r,F,P),m,inner,lit));};
  const ball=(name,at,r,m='brass')=>{const d=G.sphereOf(at,r,P,{steps:64}).outline;put(name,at,{type:'ball',at,r},`<g class="material-${m}"><g class="iso-solid"><path class="iso-fill" d="${d}" style="fill:url(#ball-${m})"/><path class="iso-line iso-edge" data-tone="mid" d="${d}"/></g></g>`);};
  const screw=(name,x,y,z,r=1.4)=>c(name,x,y,r,z,.6,'silver','screw');
  for(const [i,[x,y]]of[[-105,-70],[125,-70],[-105,80],[125,80]].entries()){c(`stand.pad.${i}`,x,y,10,-16,3,'iron');c(`foot.shoe.${i}`,x,y,8,-13,3);c(`foot.body.${i}`,x,y,6,-10,8,'wood','knurl');c(`foot.collar.${i}`,x,y,10,-2,4);}
  slab('base.trim',PLAN,2,3);slab('base.wood',PLAN,5,15,'wood',line(K.sideSeam(PLAN,9,P))+line(K.sideSeam(PLAN,17,P)));slab('base.top',PLAN,20,2,'enamel',line(K.planOutline(K.insetPlan(PLAN,6),22,P)));
  for(const [i,[x,y]]of[[-115,-80],[135,-80],[-115,90],[135,90]].entries())screw(`base.screw.${i}`,x,y,22);
  const plaque={x:-30,y:83,w:72,d:8,r:1.2};slab('plaque',plaque,22,.6,'brass',line(K.planOutline(K.insetPlan(plaque,.7),22.6,P))+K.faceTextSvg(K.topMatrix([6,87],22.6,P),'MILLIKAN · XII',{anchor:'middle',size:3,tone:'hi'}));screw('plaque.screw.0',-27,87,22.6,.7);screw('plaque.screw.1',39,87,22.6,.7);
  c('chamber.foot',0,0,19,22,6,'brass','ring');c('chamber.post',0,0,9,28,36,'iron');c('chamber.flange',0,0,25,64,4,'brass','ring');
  slab('plate.lower',{x:-40,y:-34,w:80,d:68,r:1.2},68,4,'copper',line(K.planOutline({x:-36,y:-30,w:72,d:60,r:1},72,P)));
  slab('chamber.back',{x:-40,y:-34,w:80,d:4,r:0},72,40,'ivory');
  for(const [i,[x,y]]of[[-33,-25],[33,-25],[-33,25],[33,25]].entries()){c(`insulator.foot.${i}`,x,y,4,72,3,'brass','ring');c(`insulator.body.${i}`,x,y,2.5,75,34,'ivory');c(`insulator.cap.${i}`,x,y,4,109,3,'brass','ring');}
  // Three real solids describe the sectioned upper plate and its enlarged inlet.
  slab('plate.upper.rear',{x:-40,y:-34,w:80,d:31,r:0},112,4,'copper');slab('plate.upper.left',{x:-40,y:-3,w:37,d:37,r:0},112,4,'copper');slab('plate.upper.right',{x:3,y:-3,w:37,d:37,r:0},112,4,'copper');
  for(const [i,[x,y]]of[[-33,-25],[33,-25],[-33,25],[33,25]].entries())screw(`plate.screw.${i}`,x,y,116);
  for(const [id,y,z]of[['lower',20,70],['upper',-20,114]]){rod(`plate.contact.${id}`,[0,y,z],[1,0,0],40,44.5,1);ball(`plate.terminal.${id}`,[47,y,z],2.5,'copper');}
  c('microscope.foot',100,0,12,22,6,'brass','ring');c('microscope.post',100,0,4,28,44,'iron');slab('microscope.mount',{x:94,y:-6,w:12,d:12,r:1},72,8,'brass');
  rod('microscope.objective',[0,0,90],[1,0,0],44,50,9,'brass','rim');rod('microscope.tube',[0,0,90],[1,0,0],50,100,7,'iron','ribs');rod('microscope.ocular',[0,0,90],[1,0,0],100,106,10,'brass','rim');rod('microscope.lens',[0,0,90],[1,0,0],106,106.6,8,'glass','',true);
  rod('microscope.focus.neck',[97,0,76],[0,1,0],6,10,2,'brass');rod('microscope.focus.knob',[97,0,76],[0,1,0],10,15,5,'brass','ribs');
  c('lamp.foot',-90,0,12,22,5,'brass','ring');c('lamp.post',-90,0,4,27,52,'iron');rod('lamp.rear',[0,0,90],[1,0,0],-101,-98,12,'brass','rim');rod('lamp.body',[0,0,90],[1,0,0],-98,-58,11,'iron','ribs');rod('lamp.bezel',[0,0,90],[1,0,0],-58,-54,13,'brass','rim');rod('lamp.lens',[0,0,90],[1,0,0],-54,-53.5,11,'glass');
  c('atomizer.foot',-85,65,13,22,4,'brass','ring');c('atomizer.bottle',-85,65,11,26,23,'glass','ring');c('atomizer.shoulder',-85,65,8,49,4,'ivory');c('atomizer.neck',-85,65,4,53,5,'brass');c('atomizer.cap',-85,65,7,58,4,'brass','knurl');
  rod('atomizer.riser',[-85,65,0],[0,0,1],62,135,1.5,'silver');ball('atomizer.elbow.0',[-85,65,138],3);const u=G.unit3([85,-65,0]);rod('atomizer.arm',[-85,65,138],u,3,Math.hypot(85,65)-3,1.2,'silver');ball('atomizer.elbow.1',[0,0,138],3);rod('atomizer.nozzle',[0,0,0],[0,0,1],118,135,1.2,'silver');
  rod('atomizer.air.link',[0,65,60],[1,0,0],-105,-92,1.5,'iron');ball('atomizer.air.elbow',[-108,65,60],3,'iron');rod('atomizer.air.neck',[-108,65,0],[0,0,1],63,65,1.5,'iron');ball('atomizer.bulb',[-108,65,74],9,'iron');
  const box={x:75,y:-75,w:47,d:37,r:3};slab('source.case',box,22,21,'enamel',line(K.sideSeam(box,26,P)));slab('source.lid',box,43,1,'brass',line(K.planOutline(K.insetPlan(box,3),44,P)));
  for(const [i,[x,y]]of[[79,-71],[118,-71],[79,-42],[118,-42]].entries())screw(`source.screw.${i}`,x,y,44,1.1);
  let dial=[10,11,12].map(r=>line(K.ring(98,-56,r,46,P))).join('');for(let i=0;i<24;i++){const a=i*Math.PI/12;dial+=stroke([[98+12*Math.cos(a),-56+12*Math.sin(a),46],[98+(i%3?11:10)*Math.cos(a),-56+(i%3?11:10)*Math.sin(a),46]],i%3?'lo':'mid');}c('source.dial',98,-56,14,44,2,'brass',dial);
  c('source.knob',98,-56,8,46,4,'iron',line(K.knurl(98,-56,8,46,50,36,P,0))+line(K.ring(98,-56,7,50,P))+line(K.ring(98,-56,2,50,P))+`<path class="iso-line voltage-pointer" data-tone="hi" d="${pointer(0)}"/>`);
  const routes={lower:[[85,-35.5,32],[85,45,32],[57,45,32],[57,45,70],[47,20,70]],upper:[[111,-35.5,36],[111,-20,36],[65,-20,36],[65,-20,114],[47,-20,114]]};
  for(const [id,points]of Object.entries(routes)){points.slice(0,-1).forEach((p,i)=>ball(`wire.${id}.joint.${i}`,p,2.5,'iron'));points.slice(0,-1).forEach((p,i)=>{const q=points[i+1],delta=G.sub3(q,p),length=G.len3(delta);rod(`wire.${id}.leg.${i}`,p,G.unit3(delta),2.5,length-2.5,.7,'iron');});}
  fixed=parts;return parts;
}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>`<g data-part="${name}">${map.get(name).svg}</g>`).join('');}
