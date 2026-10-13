import * as K from './kit/iso-kit.mjs';
import * as G from './kit/lathe.mjs';
import * as O from './model.mjs';
export const WIDTH=650,HEIGHT=540;
export const FLOOR=G.frameOf([0,0,0],[0,0,1],[1,0,0],[0,1,0]);
export const PLANS={gravity:{x:-90,y:-98,w:180,d:196,r:10},electric:{x:-90,y:-60,w:185,d:165,r:10},magnetic:{x:-50,y:-80,w:100,d:160,r:8}};
export const PROJECTIONS=Object.fromEntries(Object.entries(PLANS).map(([kind,plan])=>[kind,K.fitProjection([...K.boxCorners(plan,kind==='magnetic'?-8:-16,22),...(kind==='gravity'?[[-75,-65,193],[0,0,193]]:kind==='electric'?[[-40,-26,148],[80,95,148]]:[[0,0,75]])],WIDTH,HEIGHT,{pad:38,azimuth:52,elevation:kind==='magnetic'?42:27})]));
const pictures=new Map(),fixed=new Map();
const line=(d,tone='lo')=>K.lineSvg(d,{tone});
const stroke=(points,P,tone='lo')=>line(K.pathOf(points.map(p=>K.iso(p,P))),tone);
const wrap=(paths,material,inner='',lit=false)=>`<g class="material-${material}">${K.solidSvg(paths,{tone:'mid',inner,lit})}</g>`;
export function ballDefs(kind){return `<defs>${['brass','silver','copper'].map(m=>`<radialGradient id="${kind}-ball-${m}" class="material-${m}" cx="30%" cy="24%" r="80%"><stop offset="0" style="stop-color:var(--anatomy-top)"/><stop offset=".3" style="stop-color:var(--anatomy-shade-3)"/><stop offset=".7" style="stop-color:var(--anatomy-shade-1)"/><stop offset="1" style="stop-color:var(--anatomy-shade-0)"/></radialGradient>`).join('')}</defs>`;}
export function pathsOf(s,P){if(s.type==='disc')return G.disc(s.s0,s.s1,s.r,s.F,P);if(s.type==='prism')return G.prismOf(s.F,s.polygon,s.s0,s.s1,P);throw new Error(s.type);}
export function solidSlots(paths,material,lit=false){return `<g class="material-${material}"><g class="iso-solid" data-seamless="" ${lit?'data-lit=""':''}><path class="iso-fill" d="${paths.fill}"/>${[0,1,2,3].map(i=>`<path class="iso-shade" data-shade="${i}" d="${paths.shades?.[i]||''}"/>`).join('')}<path class="iso-top" d="${paths.top||''}"/><path class="iso-line iso-edge" data-tone="mid" d="${paths.outline}"/></g></g>`;}
function builder(kind,draw=true,parts=[]){
  const P=PROJECTIONS[kind];
  const put=(name,at,shape,svg,dynamic=false)=>{parts.push({name,at,shape,svg:draw?svg:'',dynamic});};
  const cylinder=(name,x,y,r,z,h,material='brass',detail='',dynamic=false)=>{
    const key=`${kind}/c/${r}/${h}/${material}/${detail}`;
    if(draw&&!pictures.has(key)){const inside=detail==='knurl'?line(K.knurl(0,0,r,0,h,32,P,0)):detail==='screw'?stroke([[-r,0,h],[r,0,h]],P,'mid'):detail==='ring'?line(K.ring(0,0,Math.max(.3,r-1.3),h,P)):'';pictures.set(key,wrap(K.cylinder(0,0,r,0,h,P,64,.3),material,inside));}
    put(name,[x,y,z+h/2],{type:'cylinder',x,y,r,z,h},`<g transform="${K.translateAlong(P,[x,y,z])}">${pictures.get(key)||''}</g>`,dynamic);
  };
  const ball=(name,at,r,material='brass',lit=false,dynamic=false)=>{const key=`${kind}/b/${r}/${material}/${lit}`;if(draw&&!pictures.has(key)){const d=G.sphereOf([0,0,0],r,P,{steps:64}).outline;pictures.set(key,`<g class="material-${material}"><g class="iso-solid" ${lit?'data-lit=""':''}><path class="iso-fill" d="${d}" style="fill:url(#${kind}-ball-${material})"/><path class="iso-line iso-edge" data-tone="${lit?'hi':'mid'}" d="${d}"/></g></g>`);}put(name,at,{type:'ball',at,r},`<g transform="${K.translateAlong(P,at)}">${pictures.get(key)||''}</g>`,dynamic);};
  const slab=(name,plan,z,h,material='brass',inner='')=>put(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],{type:'slab',plan,z,h},draw?wrap(K.slabOf(plan,z,h,P,8,.4),material,inner):'');
  const shaped=(name,shape,at,material='brass',inner='',dynamic=false,lit=false)=>put(name,at,shape,draw?(dynamic?solidSlots(pathsOf(shape,P),material,lit):wrap(pathsOf(shape,P),material,inner,lit)):'',dynamic);
  const rod=(name,o,u,s0,s1,r,material='brass',dynamic=false,inner='',lit=false)=>{const F=G.frameAlong(o,u);shaped(name,{type:'disc',F,s0,s1,r},G.add3(o,G.mul3(u,(s0+s1)/2)),material,inner,dynamic,lit);};
  const screw=(name,x,y,z,r=1.4)=>cylinder(name,x,y,r,z,.6,'silver','screw');
  return {parts,P,put,cylinder,ball,slab,shaped,rod,screw};
}
function base(B,kind){
  const {P,cylinder:c,slab,screw}=B,plan=PLANS[kind],small=kind==='magnetic',z=small?-3:2;
  const corners=[[plan.x+18,plan.y+18],[plan.x+plan.w-18,plan.y+18],[plan.x+18,plan.y+plan.d-18],[plan.x+plan.w-18,plan.y+plan.d-18]];
  corners.forEach(([x,y],i)=>{if(small){c(`stand.foot.${i}`,x,y,7,-8,5,'iron');return;}c(`stand.pad.${i}`,x,y,10,-16,3,'iron');c(`foot.shoe.${i}`,x,y,8,-13,3);c(`foot.body.${i}`,x,y,6,-10,8,'wood','knurl');c(`foot.collar.${i}`,x,y,10,-2,4);});
  slab('base.trim',plan,z,3);slab('base.wood',plan,z+3,small?12:15,'wood',line(K.sideSeam(plan,z+6,P))+line(K.sideSeam(plan,z+(small?13:16),P)));
  const top=small?14:22;let detail=line(K.planOutline(K.insetPlan(plan,6),top,P));
  if(kind==='gravity')for(const sign of [-1,1]){const strip={x:sign*42-8,y:sign===1?20:-67,w:16,d:47,r:1};detail+=line(K.planOutline(strip,top,P));detail+=stroke([[strip.x+7,strip.y,top],[strip.x+7,strip.y+47,top]],P);for(let j=0;j<9;j++){const y=strip.y+3+j*5;detail+=stroke([[strip.x,y,top],[strip.x+(j%2?4:7),y,top]],P);}}
  slab('base.top',plan,top-2,2,'enamel',detail);
  for(const[i,[x,y]]of corners.entries())screw(`base.screw.${i}`,x+(x<0?-8:8),y+(y<0?-8:8),top);
  if(!small){const plate={x:plan.x+14,y:plan.y+plan.d-15,w:73,d:8,r:1.1};slab('plaque',plate,22,.6,'brass',line(K.planOutline(K.insetPlan(plate,.7),22.6,P))+K.faceTextSvg(K.topMatrix([plate.x+36.5,plate.y+4],22.6,P),kind==='gravity'?'CAVENDISH · XI':'ELECTRICIDAD · XI',{anchor:'middle',size:2.7,tone:'hi'}));screw('plaque.screw.0',plate.x+3,plate.y+4,22.6,.7);screw('plaque.screw.1',plate.x+70,plate.y+4,22.6,.7);}
}
function dial(B,z=79,r=32){const {P,cylinder:c}=B;let details=[3,r-7,r-4,r-2].map(a=>line(K.ring(0,0,a,z+1,P))).join('');for(let i=0;i<72;i++){const t=i*Math.PI/36,a=i%6?r-4:r-7;details+=stroke([[(r-2)*Math.cos(t),(r-2)*Math.sin(t),z+1],[a*Math.cos(t),a*Math.sin(t),z+1]],P,i===18?'hi':i%6?'lo':'mid');}if(r===33)details+=K.faceTextSvg(K.topMatrix([0,23],z+1,P),'N',{anchor:'middle',size:4,tone:'hi'});c('scale.rim',0,0,r+1,z-3,3,'brass','ring');B.put('scale.face',[0,0,z+.5],{type:'cylinder',x:0,y:0,r,z,h:1},wrap(K.cylinder(0,0,r,z,1,P,64,.3),'enamel',details));}
export function staticParts(kind){
  if(fixed.has(kind))return fixed.get(kind);const B=builder(kind),{P,cylinder:c,ball,rod,screw,shaped}=B;base(B,kind);
  if(kind==='gravity'){
    c('frame.mount',-70,-60,12,22,5,'brass','ring');for(let i=0;i<4;i++){const a=(45+i*90)*Math.PI/180;screw(`frame.screw.${i}`,-70+8*Math.cos(a),-60+8*Math.sin(a),27,1.1);}
    c('frame.column',-70,-60,4,27,127,'iron');c('frame.collar',-70,-60,7,154,6,'brass','knurl');c('frame.upper',-70,-60,3,160,16,'iron');
    const u=G.unit3([70,60,0]),v=[-u[1],u[0]],a=G.sub3([-70,-60,0],G.mul3(u,5)),b=G.mul3(u,5),polygon=[[a[0]+4*v[0],a[1]+4*v[1]],[b[0]+4*v[0],b[1]+4*v[1]],[b[0]-4*v[0],b[1]-4*v[1]],[a[0]-4*v[0],a[1]-4*v[1]]];
    shaped('frame.arm',{type:'prism',F:FLOOR,polygon,s0:176,s1:184},[-35,-30,180]);screw('frame.arm.screw',-70,-60,184);
    c('suspension.head',0,0,6,174,2,'iron','ring');c('suspension.neck',0,0,2,172,2);c('suspension.knob',0,0,6,184,5,'brass','knurl');screw('suspension.screw',0,0,189);
    c('suspension.wire',0,0,.35,108,64,'silver');ball('beam.joint',[0,0,105],3);
    c('scale.mount',0,0,11,22,5,'brass','ring');c('scale.post',0,0,3,27,46,'iron');c('scale.collar',0,0,9,73,3);dial(B);screw('scale.pin',0,0,80,1);
  }else if(kind==='electric'){
    for(const x of [-48,48]){const id=x<0?'left':'right';c(`bearing.${id}.foot`,x,0,11,22,5,'brass','ring');c(`bearing.${id}.post`,x,0,4,27,70,'wood');rod(`bearing.${id}.bush`,[x,0,105],[1,0,0],-4,4,8,'brass',false,line(G.circleOf(G.frameAlong([x,0,105],[1,0,0]),4,6,P)));}
    rod('axle.left',[0,0,105],[1,0,0],-44,-38,3,'iron');rod('axle.right',[0,0,105],[1,0,0],38,44,3,'iron');rod('axle.crank',[0,0,105],[1,0,0],52,60,3,'iron');
    const F=G.frameAlong([0,0,105],[1,0,0]);rod('drum',F.o,F.a,-38,38,26,'glass',false,`<path class="iso-line rotor-lines" data-tone="lo" d="${G.ribsOf(F,-38,38,26,20,P,{phase:0,seams:true})}"/>`,true);
    rod('crank.hub',[0,0,105],[1,0,0],60,64,7,'brass');
    c('pad.foot',0,-29,9,22,5,'brass','ring');c('pad.post',0,-29,3,27,68,'wood');B.slab('pad',{x:-15,y:-32,w:30,d:6,r:0},95,20,'iron');
    rod('collector',[0,32,105],[1,0,0],-24,24,2.5,'brass');for(let x=-20;x<=20;x+=5)rod(`collector.tooth.${x}`,[x,0,105],[0,1,0],28,29.5,.55,'silver');
    ball('collector.tee',[26.5,32,105],2.5);rod('collector.link',[0,32,105],[1,0,0],29,35,1.2,'brass');ball('collector.elbow',[40,32,105],5);
    const from=[40,32,105],to=[0,65,125],u=G.unit3(G.sub3(to,from)),length=G.len3(G.sub3(to,from));rod('conductor',from,u,5,length-13,1.2,'brass');
    c('terminal.foot',0,65,10,22,5,'brass','ring');c('terminal.collar',0,65,6,27,5,'brass','knurl');c('terminal.insulator',0,65,3,32,80,'ivory');ball('terminal',[0,65,125],13,'brass');
    rod('electroscope.arm',[0,65,125],[1,0,0],13,45,1,'brass');ball('electroscope.tee',[47,65,125],2);
    rod('electroscope.fork.a',[47,0,125],[0,1,0],62.5,63,1,'brass');rod('electroscope.fork.b',[47,0,125],[0,1,0],67,67.5,1,'brass');ball('electroscope.pivot.a',[47,61,125],1.5);ball('electroscope.pivot.b',[47,69,125],1.5);
  }else{
    c('scale.mount',0,0,11,14,4,'brass','ring');c('scale.post',0,0,4,18,23,'iron');dial(B,44,33);c('needle.pin',0,0,1,45,3,'silver');ball('needle.pivot',[0,0,50],2);
    for(const sign of [-1,1]){c(`wire.foot.${sign}`,0,sign*66,7,14,4,'brass','ring');c(`wire.post.${sign}`,0,sign*66,3,18,45,'ivory');ball(`wire.terminal.${sign}`,[0,sign*66,65],2,'copper');}rod('wire',[0,0,65],[0,1,0],-64,64,.8,'copper');
  }
  fixed.set(kind,B.parts);return B.parts;
}
export function scene(values=O.DEFAULTS,kind='gravity',draw=true,charge=0,phase=0){
  const parts=[...staticParts(kind)],B=builder(kind,draw,parts),{ball,cylinder:c,rod,shaped}=B;
  if(kind==='gravity'){
    const s=O.gravity(values),u=[Math.cos(s.visualAngle),Math.sin(s.visualAngle),0];
    for(const sign of [-1,1]){rod(`beam.arm.${sign}`,[0,0,105],u,sign<0?-38:3,sign<0?-3:38,.9,'ivory',true);ball(`beam.ball.${sign}`,[sign*42*u[0],sign*42*u[1],105],4,'brass',sign===1,true);const x=sign*42,y=sign*210*s.distance;c(`source.foot.${sign}`,x,y,11,22,3,'brass','ring',true);c(`source.collar.${sign}`,x,y,6,25,4,'brass','knurl',true);c(`source.post.${sign}`,x,y,3,29,66,'ivory','',true);ball(`source.ball.${sign}`,[x,y,105],10,'silver',false,true);}
  }else if(kind==='electric'){
    const u=[0,Math.sin(phase),Math.cos(phase)],o=[62,0,105],at=G.add3(o,G.mul3(u,20));rod('crank.arm',o,u,7,17,2.5,'brass',true);ball('crank.joint',at,3,'brass',false,true);rod('crank.handle',at,[1,0,0],3,18,3,'wood',true);
    const a=O.electroscope(charge);for(const sign of [-1,1]){const pivot=[47,65+sign*4,125],u=[0,sign*Math.sin(a),-Math.cos(a)];rod(`leaf.wire.${sign}`,pivot,u,1.5,23,.35,'silver',true);ball(`leaf.ball.${sign}`,G.add3(pivot,G.mul3(u,26)),3,'brass',false,true);}
  }else{
    const a=O.magnetic(values.current).angle,u=[Math.sin(a),Math.cos(a),0],v=[-u[1],u[0],0];
    for(const sign of [-1,1]){const p=(r,w)=>[sign*r*u[0]+w*v[0],sign*r*u[1]+w*v[1]],polygon=[p(3,-.7),p(8,-4),p(28,0),p(8,4),p(3,.7)];rod(`needle.bridge.${sign}`,[0,0,50],G.mul3(u,sign),2,3,.7,'brass',true);shaped(`needle.half.${sign}`,{type:'prism',F:FLOOR,polygon,s0:49.3,s1:50.7},[sign*12*u[0],sign*12*u[1],50],sign===1?'brass':'iron','',true,sign===1);}
  }
  return parts;
}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>`<g data-part="${name}">${map.get(name).svg}</g>`).join('');}
