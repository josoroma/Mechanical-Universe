import * as K from './kit/iso-kit.mjs';
import * as G from './kit/lathe.mjs';
import * as O from './model.mjs';
export const WIDTH=650,HEIGHT=540,PLAN={x:-90,y:-65,w:190,d:195,r:10};
export const P=K.fitProjection([...K.boxCorners(PLAN,-16,22),[-70,-40,192],[8,8,192]],WIDTH,HEIGHT,{pad:38,azimuth:52,elevation:27});
export const FLOOR=G.frameOf([0,0,0],[0,0,1],[1,0,0],[0,1,0]);
const line=(d,tone='lo',free)=>K.lineSvg(d,{tone,free});
const stroke=(points,tone='lo',free)=>line(K.pathOf(points.map(p=>K.iso(p,P))),tone,free);
const fixed=new Map(),pictureCache=new Map();
const wrap=(paths,material,inner='',lit=false)=>`<g class="material-${material}">${K.solidSvg(paths,{tone:'mid',inner,lit})}</g>`;
const localBall=(r,material,lit)=>{const key=`ball/${r}/${material}/${lit}`;if(!pictureCache.has(key))pictureCache.set(key,wrap(G.sphereOf([0,0,0],r,P,{steps:64}),material,'',lit));return pictureCache.get(key);};
const localCylinder=(r,h,material,detail)=>{const key=`cylinder/${r}/${h}/${material}/${detail}`;if(!pictureCache.has(key)){const inner=detail==='knurl'?line(K.knurl(0,0,r,0,h,32,P,0)):detail==='ring'?line(K.ring(0,0,r-1.5,h,P)):'';pictureCache.set(key,wrap(K.cylinder(0,0,r,0,h,P,64,.3),material,inner));}return pictureCache.get(key);};
export function solidSlots(paths,material='ivory'){return `<g class="material-${material}"><g class="iso-solid" data-seamless=""><path class="iso-fill" d="${paths.fill}"/>${[0,1,2,3].map(i=>`<path class="iso-shade" data-shade="${i}" d="${paths.shades?.[i]||''}"/>`).join('')}<path class="iso-top" d="${paths.top||''}"/><path class="iso-line iso-edge" data-tone="mid" d="${paths.outline}"/></g></g>`;}
export function armPaths(shape){return G.disc(shape.s0,shape.s1,shape.r,shape.F,P);}
export function staticParts(kind='gravity'){
  if(fixed.has(kind))return fixed.get(kind);
  const parts=[];
  const put=(name,at,paths,material,inner,shape)=>parts.push({name,at,svg:wrap(paths,material,inner),shape});
  const cylinder=(name,x,y,r,z,h,m='brass',detail='')=>{const inner=detail==='knurl'?line(K.knurl(x,y,r,z,z+h,32,P,0)):detail==='screw'?stroke([[x-r,y,z+h],[x+r,y,z+h]],'mid'):detail==='ring'?line(K.ring(x,y,r-1.5,z+h,P)):detail;put(name,[x,y,z+h/2],K.cylinder(x,y,r,z,h,P,64,.3),m,inner,{type:'cylinder',x,y,r,z,h});};
  const slab=(name,plan,z,h,m='brass',inner='')=>put(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],K.slabOf(plan,z,h,P,8,.4),m,inner,{type:'slab',plan,z,h});
  const screw=(name,x,y,z,r=1.5)=>cylinder(name,x,y,r,z,.7,'silver','screw');
  for(const[i,[x,y]]of[[-70,-45],[80,-45],[-70,110],[80,110]].entries()){
    cylinder(`stand.pad.${i}`,x,y,10,-16,3,'iron');cylinder(`foot.shoe.${i}`,x,y,8,-13,3);
    cylinder(`foot.body.${i}`,x,y,6,-10,8,'wood','knurl');cylinder(`foot.collar.${i}`,x,y,10,-2,4);
  }
  slab('base.trim',PLAN,2,3);slab('base.wood',PLAN,5,15,'wood',line(K.sideSeam(PLAN,8,P))+line(K.sideSeam(PLAN,17,P)));
  const bed={x:10,y:3,w:75,d:114,r:3};
  let bedLines=line(K.planOutline(K.insetPlan(PLAN,6),22,P))+line(K.planOutline(bed,22,P));
  for(let y=13;y<112;y+=10)bedLines+=stroke([[10,y,22],[85,y,22]],'lo');
  for(let x=20;x<80;x+=10)bedLines+=stroke([[x,3,22],[x,117,22]],'lo');
  slab('base.top',PLAN,20,2,'enamel',bedLines);
  for(const[i,[x,y]]of[[-80,-55],[90,-55],[-80,120],[90,120]].entries())screw(`base.screw.${i}`,x,y,22,1.6);
  const plaque={x:-72,y:114,w:65,d:9,r:1.3};
  slab('plaque',plaque,22,.7,'brass',line(K.planOutline(K.insetPlan(plaque,.8),22.7,P))+K.faceTextSvg(K.topMatrix([-39.5,118.5],22.7,P),kind==='gravity'?'GRAVITACIÓN · X':'ELECTROSTÁTICA · X',{anchor:'middle',size:2.65,tone:'hi'}));
  screw('plaque.screw.0',-68,118.5,22.7,.8);screw('plaque.screw.1',-11,118.5,22.7,.8);
  cylinder('frame.mount',-62,-32,13,22,5,'brass','ring');
  for(const[i,a]of[45,135,225,315].entries()){const t=a*Math.PI/180;screw(`frame.screw.${i}`,-62+9*Math.cos(t),-32+9*Math.sin(t),27,1.2);}
  cylinder('frame.lower',-62,-32,5,27,118,'iron');cylinder('frame.collar',-62,-32,8,145,7,'brass','knurl');cylinder('frame.upper',-62,-32,4,152,24,'iron');
  const u=G.unit3([62,32,0]),v=[-u[1],u[0],0],a=G.sub3([-62,-32,0],G.mul3(u,5)),b=G.mul3(u,5);
  const polygon=[[a[0]+4*v[0],a[1]+4*v[1]],[b[0]+4*v[0],b[1]+4*v[1]],[b[0]-4*v[0],b[1]-4*v[1]],[a[0]-4*v[0],a[1]-4*v[1]]];
  put('frame.arm',[-31,-16,180],G.prismOf(FLOOR,polygon,176,184,P),'brass','',{type:'prism',F:FLOOR,polygon,s0:176,s1:184});
  screw('frame.arm.screw',-62,-32,184,1.5);
  cylinder('suspension.head',0,0,6,174,2,'iron','ring');cylinder('suspension.neck',0,0,2,172,2,'brass');
  cylinder('suspension.knob',0,0,6,184,5,'brass','knurl');screw('suspension.screw',0,0,189,1.4);
  cylinder('suspension.wire',0,0,.35,115,57,'silver');
  put('beam.joint',[0,0,112],G.sphereOf([0,0,112],3,P,{steps:48}),'brass','',{type:'ball',at:[0,0,112],r:3});
  cylinder('scale.mount',0,0,11,22,5,'brass','ring');cylinder('scale.post',0,0,4,27,47,'iron');cylinder('scale.collar',0,0,9,74,2);
  cylinder('scale.rim',0,0,32,76,3,'brass','ring');
  let ticks=[3,25,28,30].map(r=>line(K.ring(0,0,r,80,P))).join('');
  for(let i=0;i<72;i++){const t=i*Math.PI/36,r=i%6?28:25;ticks+=stroke([[30*Math.cos(t),30*Math.sin(t),80],[r*Math.cos(t),r*Math.sin(t),80]],i===0?'hi':i%6?'lo':'mid');}
  cylinder('scale.face',0,0,31,79,1,'enamel',ticks);screw('scale.pin',0,0,80,1);
  fixed.set(kind,parts);return parts;
}
export function scene(values=O.DEFAULTS,kind='gravity',draw=true,secondCharge){
  const s=O.snapshot(values,secondCharge),reading=kind==='gravity'?s.gravitational:s.electrostatic,t=reading.angle,u=[Math.cos(t),Math.sin(t),0],v=[-u[1],u[0],0];
  const test=G.add3([0,0,112],G.mul3(u,38)),counter=G.add3([0,0,112],G.mul3(u,-38)),source=G.add3(test,G.mul3(v,100*s.distance)),parts=[...staticParts(kind)];
  const ball=(name,at,r,material,lit=false)=>parts.push({name,at,shape:{type:'ball',at,r},svg:draw?`<g transform="${K.translateAlong(P,at)}">${localBall(r,material,lit)}</g>`:''});
  const cylinder=(name,x,y,r,z,h,material,detail='')=>parts.push({name,at:[x,y,z+h/2],shape:{type:'cylinder',x,y,r,z,h},svg:draw?`<g transform="${K.translateAlong(P,[x,y,z])}">${localCylinder(r,h,material,detail)}</g>`:''});
  const F=G.frameAlong([0,0,112],u);
  for(const[i,[s0,s1]]of[[-31,-3],[3,31]].entries()){const shape={type:'disc',F,s0,s1,r:1};parts.push({name:`beam.arm.${i}`,at:G.add3(F.o,G.mul3(u,(s0+s1)/2)),shape,svg:draw?solidSlots(armPaths(shape)):''});}
  ball('beam.counter',counter,7,'iron');ball('beam.test',test,7,'brass',true);
  cylinder('source.shoe',source[0],source[1],11,22,3,'brass','ring');cylinder('source.collar',source[0],source[1],6,25,4,'brass','knurl');
  cylinder('source.post',source[0],source[1],3,29,74,'ivory');ball('source.ball',source,9,kind==='gravity'?'silver':'copper');
  return parts;
}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>`<g data-part="${name}">${map.get(name).svg}</g>`).join('');}
