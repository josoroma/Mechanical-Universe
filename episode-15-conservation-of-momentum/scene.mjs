import * as K from './kit/iso-kit.mjs';
import * as G from './kit/lathe.mjs';
import * as T from './kit/tube.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=600,SCALE=200,WIRE_RADIUS=.18;
export const PLAN={x:-302,y:-108,w:598,d:208,r:10};
export const P=K.fitProjection([...K.boxCorners(PLAN,-14,24),[-260,-24,104],[260,24,104]],WIDTH,HEIGHT,{pad:32,azimuth:75,elevation:35});
export const FX={o:[0,0,0],a:[1,0,0],u:[0,1,0],v:[0,0,1]};
const path=ps=>K.pathOf(ps.map(p=>K.iso(p,P))),line=(d,tone='lo')=>K.lineSvg(d,{tone});
const make=(name,at,shape,paths,material='brass',inner='',lit=false)=>({name,at,shape,paths,material,inner,lit});
export function bodySvg(p){const a=p.paths;return `<g class="material-${p.material}"><g class="iso-solid" data-tone="mid"${p.lit?' data-lit':''}><path class="iso-fill" d="${a.fill}"/>${[0,1,2,3].map(i=>`<path class="iso-shade" data-shade="${i}" d="${a.shades[i]||''}"/>`).join('')}<path class="iso-top" d="${a.top||''}"/><path class="iso-line iso-crease" data-tone="faint" d="${a.crease||''}"/><path class="iso-line iso-edge" data-tone="mid" d="${a.outline}"/>${p.inner||''}</g></g>`;}
function builders(parts){
  const slab=(name,plan,z,h,m='brass',inner='',lit=false)=>parts.push(make(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],{type:'slab',plan,z,h},K.slabOf(plan,z,h,P,6,.4),m,inner,lit));
  const c=(name,x,y,r,z,h,m='brass',inner='')=>parts.push(make(name,[x,y,z+h/2],{type:'cylinder',x,y,r,z,h},K.cylinder(x,y,r,z,h,P,32,.25),m,inner));
  const screw=(name,x,y,z,r=.9)=>c(name,x,y,r,z,.5,'silver',line(path([[x-r,y,z+.5],[x+r,y,z+.5]])));
  const prism=(name,poly,s0,s1,m='silver',inner='')=>parts.push(make(name,[(s0+s1)/2,poly.reduce((s,p)=>s+p[0],0)/poly.length,poly.reduce((s,p)=>s+p[1],0)/poly.length],{type:'prism',F:FX,polygon:poly,s0,s1},G.prismOf(FX,poly,s0,s1,P),m,inner));
  const disc=(name,s0,s1,r,y,z,m='brass')=>{const F=G.frameAlong([0,y,z],[1,0,0]);parts.push(make(name,[(s0+s1)/2,y,z],{type:'disc',F,s0,s1,r},G.disc(s0,s1,r,F,P),m));};
  return{slab,c,screw,prism,disc};
}
export function hoseRoute(){return G.fillet([[-170,-72,40],[-158,-72,40],[-158,-38,40],[-230,-38,40],[-230,0,32],[-230,0,42]],8,12,{P,tube:1.4});}
function tubes(name,points,r,{render=true,chunks=12,material='silver'}={}){const length=G.pathLength(points);return T.tubePieces(points,r,P,{maxLength:1e6,spacing:.7,breaks:Array.from({length:chunks-1},(_,i)=>(i+1)*length/chunks),stripes:true}).map((piece,i)=>({name:`${name}.${i}`,at:piece.mid,shape:{type:'tube',points:piece.points,r,route:name,chunk:i},tube:piece,svg:render?`<g class="material-${material}">${T.tubeSvg(piece,{tone:'lo'})}</g>`:null}));}
let fixedParts;
export function fixed(){if(fixedParts)return fixedParts;const parts=[],{slab,c,screw,prism,disc}=builders(parts);
  for(const[i,[x,y]]of[[-278,-85],[270,-85],[-278,80],[270,80]].entries()){c(`stand.pad.${i}`,x,y,9,-14,3,'iron');c(`foot.body.${i}`,x,y,6,-11,9,'brass',line(K.knurl(x,y,6,-11,-2,24,P,0)));c(`foot.collar.${i}`,x,y,10,-2,4);}
  slab('base.trim',PLAN,2,3);slab('base.wood',PLAN,5,15,'wood',line(K.sideSeam(PLAN,10,P,6))+line(K.sideSeam(PLAN,17,P,6)));slab('base.cover',PLAN,20,2,'enamel',line(K.planOutline(K.insetPlan(PLAN,5),22,P,6)));
  for(const[i,[x,y]]of[[-292,-98],[286,-98],[-292,90],[286,90]].entries())screw(`base.screw.${i}`,x,y,22,1.3);
  for(const[i,x]of[-192,192].entries()){slab(`support.foot.${i}`,{x:x-17,y:-30,w:34,d:60,r:3},22,4,'brass');slab(`support.post.${i}`,{x:x-10,y:-12,w:20,d:24,r:2},26,16,'enamel');slab(`support.cap.${i}`,{x:x-15,y:-20,w:30,d:40,r:2},42,4,'brass');for(const y of[-25,25])screw(`support.screw.${i}.${y}`,x,y,26,1.1);}
  const rail=[[-18,46],[18,46],[0,64]];let holes='';for(let x=-240;x<=240;x+=8)for(const y of[-9,9])holes+=K.dotsSvg([K.iso([x,y,55.01],P)],{size:.35,tone:'lo'});
  prism('track.manifold',rail,-250,250,'silver',holes);
  for(const[side,a,b]of[[-1,-252,-250],[1,250,252]]){prism(`track.end.${side}`,rail,a,b,'brass');for(const y of[-8,8]){const F=G.frameAlong([0,y,50],[1,0,0]),s0=side<0?-252.5:252,s1=s0+.5;parts.push(make(`track.end.screw.${side}.${y}`,[(s0+s1)/2,y,50],{type:'disc',F,s0,s1,r:.8},G.disc(s0,s1,.8,F,P),'silver'));}}
  c('air.port.track',-230,0,3.5,42,4,'brass');
  for(const x of[-274,268]){slab(`stop.foot.${x}`,{x:x-4,y:-32,w:14,d:64,r:2},22,4);for(const y of[-28,20]){slab(`stop.post.${x}.${y}`,{x,y,w:6,d:8,r:1},26,54,'enamel');screw(`stop.screw.${x}.${y}`,x+3,y+4,86,1);}slab(`stop.bar.${x}`,{x,y:-28,w:6,d:56,r:1},80,6,'brass');}
  const ruler={x:-240,y:35,w:480,d:9,r:1};slab('ruler',ruler,22,.6,'ivory');const ticks=K.topTicks(-236,236,4,5,35,22.6,[2.5,5],P);parts.at(-1).inner=line(ticks.minor)+line(ticks.major,'mid')+line(path([[0,35,22.6],[0,44,22.6]]),'hi');
  for(const[i,[x,y]]of[[-238,-90],[-182,-90],[-238,-56],[-182,-56]].entries())c(`pump.foot.${i}`,x,y,4,22,4,'iron');
  const pump={x:-246,y:-96,w:72,d:46,r:4};slab('pump.case',pump,26,28,'enamel',line(K.sideSeam(pump,31,P,6))+line(K.sideSeam(pump,49,P,6)));slab('pump.lid',pump,54,1,'iron',line(K.planOutline(K.insetPlan(pump,3),55,P,6)));
  for(let i=0;i<7;i++)parts.at(-1).inner+=line(K.planOutline({x:-235+i*5,y:-84,w:2,d:21,r:1},55,P,4),'lo');
  for(const[i,[x,y]]of[[-240,-90],[-180,-90],[-240,-56],[-180,-56]].entries())screw(`pump.screw.${i}`,x,y,55,.8);
  c('pump.knob',-181,-80,3,55,4,'brass',line(K.knurl(-181,-80,3,55,59,20,P,0)));disc('air.port.pump',-174,-170,3.5,-72,40);
  parts.push(...tubes('air.hose',hoseRoute(),1.4,{chunks:14,material:'iron'}));
  const plaque={x:-60,y:72,w:120,d:10,r:1};slab('plaque',plaque,22,.6,'brass',line(K.planOutline(K.insetPlan(plaque,.8),22.6,P,6))+K.faceTextSvg(K.topMatrix([0,77],22.6,P),'CANTIDAD DE MOVIMIENTO · XV',{anchor:'middle',size:2.6,tone:'hi'}));screw('plaque.screw.0',-56,77,22.6,.7);screw('plaque.screw.1',56,77,22.6,.7);
  for(const p of parts)if(!p.svg)p.svg=bodySvg(p);fixedParts=parts;return parts;
}
const cartCache=new Map();
export function cart(id,mass){const key=`${id}:${mass}`;if(cartCache.has(key))return cartCache.get(key);const parts=[],{slab,c,screw,prism,disc}=builders(parts),m=id==='A'?'brass':'enamel';
  prism(`${id}.skid.rear`,[[-24,46.1],[-18,46.1],[0,64.1],[0,78],[-24,78]],-16,16,m);
  prism(`${id}.skid.front`,[[0,64.1],[18,46.1],[24,46.1],[24,78],[0,78]],-16,16,m);
  slab(`${id}.deck`,{x:-18,y:-27,w:36,d:54,r:2},78,3,m,line(K.planOutline({x:-15,y:-24,w:30,d:48,r:1},81,P,4)),id==='A');
  for(const[i,[x,y]]of[[-12,-20],[12,-20],[-12,20],[12,20]].entries())screw(`${id}.deck.screw.${i}`,x,y,81,.8);
  const count=mass===.1?1:mass===.2?3:7;for(let i=0;i<count;i++)slab(`${id}.weight.${i}`,{x:-11,y:-15,w:22,d:30,r:1.5},81.5+i*2,2,'iron',line(K.planOutline({x:-8,y:-12,w:16,d:24,r:1},83.5+i*2,P,4)));
  c(`${id}.weight.seat`,0,0,2.5,81,.5,'brass');c(`${id}.weight.nut`,0,0,3,81.5+count*2,3,'brass',line(K.knurl(0,0,3,81.5+count*2,84.5+count*2,20,P,0)));
  slab(`${id}.bumper.bracket`,{x:id==='A'?12:-16,y:-5,w:4,d:10,r:.5},81,14,m);
  if(id==='A')disc('A.bumper.mount',16,18,2.5,0,90);else disc('B.bumper.mount',-18,-16,2.5,0,90);
  for(const p of parts)p.svg=bodySvg(p);cartCache.set(key,parts);return parts;
}
export function movedCart(id,mass,x){const dx=x*SCALE;return cart(id,mass).map(p=>{const s=p.shape,shape=s.type==='prism'?{...s,s0:s.s0+dx,s1:s.s1+dx}:s.type==='slab'?{...s,plan:{...s.plan,x:s.plan.x+dx}}:s.type==='cylinder'?{...s,x:s.x+dx}:{...s,s0:s.s0+dx,s1:s.s1+dx};return{...p,at:G.add3(p.at,[dx,0,0]),shape,dx};});}
export function springRoute(id,s){const direction=id==='A'?1:-1,x=(id==='A'?s.xA:s.xB)*SCALE,start=x+direction*18,end=x+direction*(42-s.compression*SCALE/2),from=start+direction*.8,to=end-direction*.8,points=[[start,0,90],[from,0,90]];
  for(let i=1;i<=120;i++){const u=i/120,f=u<.05?u*u/(.1*.95):u>.95?1-(1-u)**2/(.1*.95):(u-.025)/.95,a=4*Math.PI*f;points.push([from+(to-from)*u,2.5*(Math.cos(a)-1),90+2.5*Math.sin(a)]);}points.push([end,0,90]);return points;
}
export function bumpers(s,render=true){const parts=[];for(const id of['A','B']){const sign=id==='A'?1:-1,x=(id==='A'?s.xA:s.xB)*SCALE,end=x+sign*(42-s.compression*SCALE/2),F=G.frameAlong([0,0,90],[1,0,0]),s0=sign===1?end:end-1.2,s1=s0+1.2,p=make(`${id}.bumper.head`,[(s0+s1)/2,0,90],{type:'disc',F,s0,s1,r:5.7},render?G.disc(s0,s1,5.7,F,P):null,'iron');if(render)p.svg=bodySvg(p);parts.push(p,...tubes(`${id}.spring`,springRoute(id,s),WIRE_RADIUS,{render,chunks:8}));}return parts;}
export function scene(c=O.create()){const s=O.sample(c);return[...fixed(),...movedCart('A',O.MASS_A,s.xA),...movedCart('B',c.massB,s.xB),...bumpers(s)];}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>{const p=map.get(name);return `<g data-part="${name}"${p.dx!==undefined?` transform="${K.translateAlong(P,[p.dx,0,0])}"`:''}>${p.svg}</g>`;}).join('');}
