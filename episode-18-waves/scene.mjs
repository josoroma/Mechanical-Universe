import * as K from '../laboratory/kit/iso-kit.mjs';
import * as G from '../laboratory/kit/lathe.mjs';
import * as T from '../laboratory/kit/tube.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=620,WIRE_RADIUS=.16;
export const PLAN={x:-212,y:-65,w:430,d:165,r:10};
export const P=K.fitProjection([...K.boxCorners(PLAN,-14,22),[-170,-25,95],[170,-25,95]],WIDTH,HEIGHT,{pad:40,azimuth:65,elevation:30});
const path=ps=>K.pathOf(ps.map(p=>K.iso(p,P))),line=(d,tone='lo')=>K.lineSvg(d,{tone});
const make=(name,at,shape,paths,material='brass',inner='',lit=false)=>({name,at,shape,paths,material,inner,lit});
export function bodySvg(p){const a=p.paths;return `<g class="material-${p.material}"><g class="iso-solid" data-tone="mid"${p.lit?' data-lit':''}><path class="iso-fill" d="${a.fill}"/>${[0,1,2,3].map(i=>`<path class="iso-shade" data-shade="${i}" d="${a.shades[i]||''}"/>`).join('')}<path class="iso-top" d="${a.top||''}"/><path class="iso-line iso-crease" data-tone="faint" d="${a.crease||''}"/><path class="iso-line iso-edge" data-tone="mid" d="${a.outline}"/>${p.inner||''}</g></g>`;}
export function defs(){return `<defs>${[['silver','var(--silver-top)','var(--silver-0)'],['violet','#ddd4ff','#6343ac'],['teal','#c5fff1','#217d70']].map(([id,a,b])=>`<radialGradient id="sphere-${id}" cx="28%" cy="22%" r="82%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`).join('')}</defs>`;}
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
  for(let i=0;i<O.COUNT;i++){const x=-170+i*340/12;
    c(`transverse.foot.${i}`,x,-25,5,22,3,'iron');c(`transverse.gland.${i}`,x,-25,2.2,25,14,'brass');c(`transverse.collar.${i}`,x,-25,3,39,1,'silver');screw(`transverse.screw.${i}`,x-3,-25,25,.5);
  }
  slab('longitudinal.rail',{x:-190,y:54,w:380,d:16,r:2},22,4,'silver',line(K.planOutline({x:-187,y:57,w:374,d:10,r:1},26,P,5)));
  for(const[x,y]of[[-184,56],[-184,68],[184,56],[184,68]])screw(`longitudinal.rail.screw.${x}.${y}`,x,y,26,.7);
  c('tension.knob',-193,39,9,22,8,'iron',line(K.knurl(-193,39,9,22,30,36,P,0)));
  parts.at(-1).inner+=`<path class="iso-line" data-live="tension-mark" d="${path([[-193,39,30],[-184,39,30]])}"/>`;
  c('tension.hub',-193,39,1.2,30,.5,'silver');
  const ruler={x:-170,y:86,w:340,d:8,r:1};slab('wave.ruler',ruler,22,.6,'ivory');const ticks=K.topTicks(-166,166,4,5,86,22.6,[2,5],P);parts.at(-1).inner=line(ticks.minor)+line(ticks.major,'mid');
  const plaque={x:-50,y:76,w:110,d:10,r:1};slab('plaque',plaque,22,.6,'brass',line(K.planOutline(K.insetPlan(plaque,.8),22.6,P,6))+K.faceTextSvg(K.topMatrix([5,81],22.6,P),'ONDAS · XVIII',{anchor:'middle',size:3,tone:'hi'}));screw('plaque.screw.0',-46,81,22.6,.7);screw('plaque.screw.1',56,81,22.6,.7);
  for(const p of parts)if(!p.svg)p.svg=bodySvg(p);fixedParts=parts;return parts;
}

const capCache=new Map();
function cap(i,bank,at,r){const id=i===6?(bank==='transverse'?'violet':'teal'):'silver',key=id+':'+r;if(!capCache.has(key)){const p=G.sphereOf([0,0,0],r,P,{steps:64});capCache.set(key,`<path class="sphere-body" d="${p.outline}" fill="url(#sphere-${id})"/><path class="sphere-edge" d="${p.outline}"/>`);}return {name:`${bank}.cap.${i}`,at,shape:{type:'ball',at,r},translate:at,svg:capCache.get(key)};}
export function positions(c){const s=O.snapshot(c);return {T:s.transverse.map((y,i)=>[-170+i*340/12,-25,70+y*800]),L:s.longitudinal.map((u,i)=>[-170+i*340/12+u*200,62,37])};}
function between(a,b,rA,rB){const d=G.unit3(G.sub3(b,a));return [G.add3(a,G.mul3(d,rA)),G.sub3(b,G.mul3(d,rB))];}
export function routes(c){const {T:heads,L:cars}=positions(c),out=[];for(let i=0;i<O.COUNT-1;i++){
 const [a,b]=between(heads[i],heads[i+1],3,3);out.push({name:`transverse.cord.${i}`,points:[a,b],r:WIRE_RADIUS});
 const [from,to]=between(cars[i],cars[i+1],4,4),start=from[0]+1,end=to[0]-1,points=[from,[start,62,37]];
 for(let j=1;j<32;j++){const u=j/32;points.push([start+(end-start)*u,62+1.5*Math.sin(Math.PI*u)**2*Math.sin(4*Math.PI*u),37]);}
 points.push([end,62,37],to);out.push({name:`longitudinal.spring.${i}`,points,r:WIRE_RADIUS});
 }return out;}
function tubes(route){return T.tubePieces(route.points,route.r,P,{maxLength:1e6,spacing:.65,stripes:true}).map((piece,i)=>({name:`${route.name}.${i}`,at:piece.mid,shape:{type:'tube',points:piece.points,r:route.r,route:route.name,chunk:i},tube:piece,svg:`<g class="material-silver">${T.tubeSvg(piece,{tone:'lo'})}</g>`}));}
export function moving(c){const parts=[],{c:column,slab}=builders(parts),{T:heads,L:cars}=positions(c);for(let i=0;i<O.COUNT;i++){
 const at=heads[i];column(`transverse.rod.${i}`,at[0],at[1],.65,40,at[2]-3-40,'silver');parts.at(-1).dynamic=true;parts.push(cap(i,'transverse',at,3));
 const pos=cars[i];slab(`longitudinal.car.${i}`,{x:pos[0]-4,y:57,w:8,d:10,r:1},26,7,'enamel');parts.at(-1).dynamic=true;parts.push(cap(i,'longitudinal',pos,4));
 }for(const p of parts)if(!p.svg)p.svg=bodySvg(p);return [...parts,...routes(c).flatMap(tubes)];}
export function scene(c=O.create()){return [...fixed(),...moving(c)];}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>{const p=map.get(name);return `<g data-part="${name}"${p.translate?` transform="${K.translateAlong(P,p.translate)}"`:''}>${p.svg}</g>`;}).join('');}
export function afterPaint(c,root){const a=(c.tension-4)/32*Math.PI*1.5;root.querySelector('[data-live=tension-mark]').setAttribute('d',path([[-193,39,30],[-193+9*Math.cos(a),39+9*Math.sin(a),30]]));}
