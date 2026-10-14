import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as T from '../laboratory/kit/tube.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=620,SPRING_SCALE=200,WIRE_RADIUS=.18;
export const PLAN={x:-212,y:-65,w:430,d:165,r:10};
export const P=K.fitProjection([...K.boxCorners(PLAN,-14,22),[200,-35,85],[200,75,85]],WIDTH,HEIGHT,{pad:40,azimuth:65,elevation:30});
const path=ps=>K.pathOf(ps.map(p=>K.iso(p,P))),line=(d,tone='lo')=>K.lineSvg(d,{tone});
const make=(name,at,shape,paths,material='brass',inner='',lit=false)=>({name,at,shape,paths,material,inner,lit});
export function bodySvg(p){const a=p.paths;return `<g class="material-${p.material}"><g class="iso-solid" data-tone="mid"${p.lit?' data-lit':''}><path class="iso-fill" d="${a.fill}"/>${[0,1,2,3].map(i=>`<path class="iso-shade" data-shade="${i}" d="${a.shades[i]||''}"/>`).join('')}<path class="iso-top" d="${a.top||''}"/><path class="iso-line iso-crease" data-tone="faint" d="${a.crease||''}"/><path class="iso-line iso-edge" data-tone="mid" d="${a.outline}"/>${p.inner||''}</g></g>`;}
export function defs(){return `<defs><radialGradient id="sphere-silver" class="material-silver" cx="28%" cy="22%" r="82%"><stop offset="0" style="stop-color:var(--anatomy-top)"/><stop offset=".25" style="stop-color:var(--anatomy-shade-3)"/><stop offset=".72" style="stop-color:var(--anatomy-shade-1)"/><stop offset="1" style="stop-color:var(--anatomy-shade-0)"/></radialGradient></defs>`;}
function ballSvg(at,r){const paths=G.sphereOf(at,r,P,{steps:80});return `<g class="material-silver"><path class="sphere-body" d="${paths.outline}" fill="url(#sphere-silver)"/><path class="sphere-edge" d="${paths.outline}"/></g>`;}
function builders(parts){
  const slab=(name,plan,z,h,m='brass',inner='',lit=false)=>parts.push(make(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],{type:'slab',plan,z,h},K.slabOf(plan,z,h,P,6,.4),m,inner,lit));
  const c=(name,x,y,r,z,h,m='brass',inner='')=>parts.push(make(name,[x,y,z+h/2],{type:'cylinder',x,y,r,z,h},K.cylinder(x,y,r,z,h,P,36,.25),m,inner));
  const screw=(name,x,y,z,r=.9)=>c(name,x,y,r,z,.5,'silver',line(path([[x-r,y,z+.5],[x+r,y,z+.5]])));
  const disc=(name,F,s0,s1,r,m='brass')=>parts.push(make(name,G.add3(F.o,G.mul3(F.a,(s0+s1)/2)),{type:'disc',F,s0,s1,r},G.disc(s0,s1,r,F,P),m));
  const prism=(name,F,polygon,s0,s1,m='brass',inner='')=>parts.push(make(name,G.add3(F.o,G.add3(G.mul3(F.a,(s0+s1)/2),G.add3(G.mul3(F.u,polygon.reduce((s,p)=>s+p[0],0)/polygon.length),G.mul3(F.v,polygon.reduce((s,p)=>s+p[1],0)/polygon.length)))),{type:'prism',F,polygon,s0,s1},G.prismOf(F,polygon,s0,s1,P),m,inner));
  return{slab,c,screw,disc,prism};
}
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=[],{slab,c,screw,disc,prism}=builders(parts);
  for(const[i,[x,y]]of[[-190,-44],[196,-44],[-190,79],[196,79]].entries()){c(`stand.pad.${i}`,x,y,9,-14,3,'iron');c(`foot.body.${i}`,x,y,6,-11,9,'brass',line(K.knurl(x,y,6,-11,-2,28,P,0)));c(`foot.collar.${i}`,x,y,10,-2,4);}
  slab('base.trim',PLAN,2,3);slab('base.wood',PLAN,5,15,'wood',line(K.sideSeam(PLAN,10,P,6))+line(K.sideSeam(PLAN,17,P,6)));slab('base.cover',PLAN,20,2,'enamel',line(K.planOutline(K.insetPlan(PLAN,5),22,P,6)));
  for(const[i,[x,y]]of[[-202,-55],[208,-55],[-202,90],[208,90]].entries())screw(`base.screw.${i}`,x,y,22,1.3);
  for(const[y,id]of[[0,'rear'],[20,'front']])slab(`spring.rail.${id}`,{x:-166,y,w:104,d:4,r:1},22,8,'silver');
  for(const x of[-166,-66]){slab(`spring.stop.${x}`,{x,y:-3,w:4,d:30,r:1},30,5);for(const y of[-1,25])screw(`spring.stop.screw.${x}.${y}`,x+2,y,35,.75);}
  slab('spring.anchor.foot',{x:-192,y:-3,w:18,d:30,r:2},22,4,'brass');slab('spring.anchor',{x:-188,y:3,w:8,d:18,r:1},26,28,'enamel');for(const y of[6,18])screw(`spring.anchor.screw.${y}`,-184,y,54,.9);
  disc('spring.port.fixed',G.frameAlong([0,12,44],[1,0,0]),-180,-177,2.3);
  const ruler={x:-160,y:38,w:100,d:8,r:1};slab('spring.ruler',ruler,22,.6,'ivory');const ticks=K.topTicks(-158,-62,4,5,38,22.6,[2,4.8],P);parts.at(-1).inner=line(ticks.minor)+line(ticks.major,'mid')+line(path([[-110,38,22.6],[-110,46,22.6]]),'hi');
  for(const [i,x]of [[0,-162],[1,-62]]){
    slab(`exciter.foot.${i}`,{x:x-8,y:-24,w:16,d:20,r:2},22,4,'iron');
    slab(`exciter.support.${i}`,{x:x-4,y:-18,w:8,d:8,r:1},26,10,'enamel');
    disc(`exciter.coil.${i}`,G.frameAlong([0,-14,41],[1,0,0]),x-6,x+6,5,'copper');
    const F=G.frameAlong([0,-14,41],[1,0,0]);parts.at(-1).paths=G.disc(x-6,x+6,5,F,P,{smooth:{slope:()=>0}});parts.at(-1).inner=line(Array.from({length:11},(_,j)=>G.arcOf(F,x-5+j,5,P)).join(''),'faint');
    disc(`exciter.cap.left.${i}`,G.frameAlong([0,-14,41],[1,0,0]),x-7,x-6,5.3,'iron');
    disc(`exciter.cap.right.${i}`,G.frameAlong([0,-14,41],[1,0,0]),x+6,x+7,5.3,'iron');
    for(const y of[-21,-7])screw(`exciter.mount.${i}.${y}`,x,y,26,.7);
  }
  const casePlan={x:40,y:-40,w:152,d:100,r:5};
  slab('driver.case',casePlan,22,24,'enamel',line(K.sideSeam(casePlan,27,P,6))+line(K.planOutline(K.insetPlan(casePlan,5),46,P,6)));
  for(const [i,[x,y]]of [[47,-33],[185,-33],[47,53],[185,53]].entries())screw(`driver.case.screw.${i}`,x,y,46,1.1);
  c('driver.dial.rim',100,4,29,46,2,'iron');c('driver.dial.face',100,4,27,48,.6,'ivory');
  const dialPath=[];for(let i=0;i<36;i++){const a=i*Math.PI/18,r=i%3?24:23;dialPath.push(path([[100+r*Math.cos(a),4+r*Math.sin(a),48.6],[100+26*Math.cos(a),4+26*Math.sin(a),48.6]]));}
  parts.at(-1).inner=line(K.ring(100,4,26,48.6,P,72),'mid')+line(dialPath.join(''))+`<path class="iso-line" data-live="driver-needle" data-free="end" d="${path([[100,4,48.6],[121,4,48.6]])}"/>`;
  c('driver.dial.hub',100,4,2,48.6,1,'brass');c('driver.knob',164,29,9,46,8,'iron',line(K.knurl(164,29,9,46,54,36,P,0)));
  for(let i=0;i<5;i++){const plan={x:145,y:-27+i*6,w:31,d:2,r:1};slab(`driver.vent.${i}`,plan,46,.2,'iron');}
  const plaque={x:-50,y:76,w:110,d:10,r:1};slab('plaque',plaque,22,.6,'brass',line(K.planOutline(K.insetPlan(plaque,.8),22.6,P,6))+K.faceTextSvg(K.topMatrix([5,81],22.6,P),'RESONANCIA · XVII',{anchor:'middle',size:3,tone:'hi'}));screw('plaque.screw.0',-46,81,22.6,.7);screw('plaque.screw.1',56,81,22.6,.7);
  for(const p of parts)if(!p.svg)p.svg=bodySvg(p);fixedParts=parts;return parts;
}
const carCache=new Map();
export function car(mass){if(carCache.has(mass))return carCache.get(mass);const parts=[],{slab,c,screw,disc}=builders(parts);slab('spring.carriage',{x:-8,y:0,w:16,d:24,r:1.5},30,19,'brass',line(K.planOutline({x:-6,y:2,w:12,d:20,r:1},49,P,4)),true);
  for(const y of[3,21])screw(`spring.carriage.screw.${y}`,0,y,49,.8);c('spring.weight.seat',0,12,2,49,.5);const count=mass===.1?1:mass===.2?3:7;for(let i=0;i<count;i++)slab(`spring.weight.${i}`,{x:-5,y:7,w:10,d:10,r:1},49.5+2*i,2,'iron',line(K.planOutline({x:-3,y:9,w:6,d:6,r:.5},51.5+2*i,P,4)));c('spring.weight.nut',0,12,2.2,49.5+count*2,3,'brass',line(K.knurl(0,12,2.2,49.5+count*2,52.5+count*2,18,P,0)));
  slab('car.magnet.bracket',{x:-6,y:-12,w:12,d:12,r:1},34,4,'silver');slab('car.magnet',{x:-6,y:-16,w:12,d:4,r:1},34,14,'iron');
  disc('spring.port.moving',G.frameAlong([0,12,44],[1,0,0]),-10,-8,2.3);for(const p of parts)p.svg=bodySvg(p);carCache.set(mass,parts);return parts;
}
export function movedCar(mass,x){const dx=-110+x*SPRING_SCALE;return car(mass).map(p=>{const s=p.shape,shape=s.type==='slab'?{...s,plan:{...s.plan,x:s.plan.x+dx}}:s.type==='cylinder'?{...s,x:s.x+dx}:{...s,s0:s.s0+dx,s1:s.s1+dx};return{...p,shape,at:G.add3(p.at,[dx,0,0]),translate:[dx,0,0]};});}
export function coilRoute(x){const start=-177,end=-120+x*SPRING_SCALE,from=start+2,to=end-2,points=[[start,12,44],[from,12,44]];for(let i=1;i<=180;i++){const u=i/180,f=u<.05?u*u/(.1*.95):u>.95?1-(1-u)**2/(.1*.95):(u-.025)/.95,a=6*Math.PI*f;points.push([from+(to-from)*u,10+2*Math.cos(a),44+2*Math.sin(a)]);}points.push([end,12,44]);return points;}
function tubes(name,points,r,chunks,render=true){const length=G.pathLength(points);return T.tubePieces(points,r,P,{maxLength:1e6,spacing:.8,breaks:Array.from({length:chunks-1},(_,i)=>(i+1)*length/chunks),stripes:true}).map((piece,i)=>({name:`${name}.${i}`,at:piece.mid,shape:{type:'tube',points:piece.points,r,route:name,chunk:i},tube:piece,svg:render?`<g class="material-silver">${T.tubeSvg(piece,{tone:'lo'})}</g>`:null}));}
export function moving(c,render=true){const s=O.snapshot(c);return[...movedCar(c.mass,s.spring.x),...tubes('spring.coil',coilRoute(s.spring.x),WIRE_RADIUS,16,render)];}
export function scene(c=O.create()){return[...fixed(),...moving(c)];}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>{const p=map.get(name);return `<g data-part="${name}"${p.translate?` transform="${K.translateAlong(P,p.translate)}"`:''}>${p.svg}</g>`;}).join('');}

export function routes(c){return [{name:'spring.coil',points:coilRoute(O.snapshot(c).x),r:WIRE_RADIUS}];}
export function afterPaint(c,root){const a=O.snapshot(c).driverPhase;root.querySelector('[data-live=driver-needle]').setAttribute('d',path([[100,4,48.6],[100+21*Math.cos(a),4+21*Math.sin(a),48.6]]));}
