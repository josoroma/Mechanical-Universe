import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";

// Each ordering edge is proved by a separating plane of the actual solids.
const dot=G.dot3,add=G.add3,mul=G.mul3,sub=G.sub3;
const floor={o:[0,0,0],a:[0,0,1],u:[1,0,0],v:[0,1,0]};
const pairCache=new WeakMap();
const point=(F,x,y,s)=>add(F.o,add(mul(F.u,x),add(mul(F.v,y),mul(F.a,s))));
function hull(points){const sorted=[...points].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const half=values=>{const out=[];for(const p of values){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=0)out.pop();out.push(p);}return out.slice(0,-1);};return[...half(sorted),...half([...sorted].reverse())];}
const axes=poly=>poly.map((p,i)=>{const q=poly[(i+1)%poly.length];return[p[1]-q[1],q[0]-p[0]];});
const extent=(points,n)=>{let lo=Infinity,hi=-Infinity;for(const p of points){const v=p.reduce((s,x,i)=>s+x*n[i],0);lo=Math.min(lo,v);hi=Math.max(hi,v);}return[lo,hi];};
export function geometry(part,P){
  const s=part.shape;let F,poly,s0,s1,round=null,sections=null;
  if(s.type==="cylinder"){F={...floor,o:[s.x,s.y,0]};s0=s.z;s1=s.z+s.h;round={F,s0,s1,r:s.r};}
  else if(s.type==="disc"){({F,s0,s1}=s);round={F,s0,s1,r:s.r};}
  else if(s.type==="slab"){F=floor;s0=s.z;s1=s.z+s.h;poly=K.roundedPlan(s.plan,8);}
  else if(s.type==="prism"){({F,polygon:poly,s0,s1}=s);}
  let vertices=[],normals=[],edges=[],ball=null;
  if(round){poly=Array.from({length:48},(_,i)=>{const a=i*Math.PI/24,r=s.r/Math.cos(Math.PI/48);return[r*Math.cos(a),r*Math.sin(a)];});normals=[F.a,...Array.from({length:24},(_,i)=>add(mul(F.u,Math.cos(i*Math.PI/24)),mul(F.v,Math.sin(i*Math.PI/24))))];edges=[F.a];}
  if(s.type==="ball"){
    ball={c:s.at,r:s.r};
    vertices=[-1,1].flatMap(x=>[-1,1].flatMap(y=>[-1,1].map(z=>add(s.at,[x*s.r,y*s.r,z*s.r]))));
    normals=[[1,0,0],[0,1,0],[0,0,1]];edges=[];
  }else if(s.type==="tube"){
    sections=s.points.map((p,i)=>{const tangent=G.unit3(sub(s.points[Math.min(i+1,s.points.length-1)],s.points[Math.max(0,i-1)])),F=G.frameAlong(p,tangent);return{F,r:s.r};});
    for(const {F,r}of sections)for(let i=0;i<16;i++){const a=i*Math.PI/8;vertices.push(point(F,r*Math.cos(a)/Math.cos(Math.PI/16),r*Math.sin(a)/Math.cos(Math.PI/16),0));}
    edges=[sections[0].F.a,sections.at(-1).F.a];normals=[...edges,...edges.flatMap(a=>[G.cross3(a,[1,0,0]),G.cross3(a,[0,1,0]),G.cross3(a,[0,0,1])])];
  }else{
    vertices=poly.flatMap(([x,y])=>[point(F,x,y,s0),point(F,x,y,s1)]);
    if(!round){edges=[F.a,...poly.map((p,i)=>{const q=poly[(i+1)%poly.length];return add(mul(F.u,q[0]-p[0]),mul(F.v,q[1]-p[1]));})];normals=[F.a,...edges.slice(1).map(e=>G.cross3(F.a,e))];}
  }
  const screen=hull(vertices.map(p=>K.iso(p,P))),xs=screen.map(p=>p[0]),ys=screen.map(p=>p[1]);
  return{name:part.name,at:part.at,round,ball,sections,vertices,normals,edges,screen,screenAxes:axes(screen),bounds:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],depth:K.depthOf(part.at,P),route:s.route,chunk:s.chunk};
}
function interval(s,n){
  const n2=dot(n,n);
  if(s.ball){const c=dot(s.ball.c,n),r=s.ball.r*Math.sqrt(n2);return[c-r,c+r];}
  if(s.round){const {F,s0,s1,r}=s.round,c=dot(F.o,n),a=dot(F.a,n),rad=r*Math.sqrt(Math.max(0,n2-a*a));return[c+Math.min(s0*a,s1*a)-rad,c+Math.max(s0*a,s1*a)+rad];}
  if(s.sections){let lo=Infinity,hi=-Infinity;for(const {F,r}of s.sections){const c=dot(F.o,n),a=dot(F.a,n),rad=r*Math.sqrt(Math.max(0,n2-a*a));lo=Math.min(lo,c-rad);hi=Math.max(hi,c+rad);}return[lo,hi];}
  return extent(s.vertices,n);
}
function overlap(a,b){if(a.bounds[2]<b.bounds[0]||b.bounds[2]<a.bounds[0]||a.bounds[3]<b.bounds[1]||b.bounds[3]<a.bounds[1])return false;for(const n of [...a.screenAxes,...b.screenAxes]){const [a0,a1]=extent(a.screen,n),[b0,b1]=extent(b.screen,n);if(a1<b0-1e-6||b1<a0-1e-6)return false;}return true;}
function relation(a,b,V){
  const candidates=[[0,0,1],[1,0,0],[0,1,0],...a.normals,...b.normals,sub(b.at,a.at)];
  for(const [s,o]of[[a,b],[b,a]])if(s.round){const axis=s.round.F.a;for(const at of [o.at,...(!o.round?o.vertices:[])]){const v=sub(at,s.at);candidates.push(sub(v,mul(axis,dot(v,axis))));}}
  for(const e of a.edges)for(const f of b.edges)candidates.push(G.cross3(e,f));
  let parallel=false;
  for(const raw of candidates){const length=G.len3(raw);if(length<1e-8)continue;const n=mul(raw,1/length),[a0,a1]=interval(a,n),[b0,b1]=interval(b,n),toward=dot(n,V);if(a1<=b0+1e-6||b1<=a0+1e-6){if(Math.abs(toward)<1e-8){parallel=true;continue;}return(a1<=b0+1e-6?1:-1)*(toward>0?1:-1);}}
  if(parallel)return 0;
  throw new Error(`No hay plano separador: ${a.name} / ${b.name}`);
}
export function orderParts(parts,P,cache=new WeakMap()){
  const shapes=parts.map(p=>{const key=p.geometryKey??p;if(!cache.has(key))cache.set(key,geometry(p,P));return cache.get(key);}),V=G.viewOf(P),forward=shapes.map(()=>[]),degree=shapes.map(()=>0);
  for(let i=0;i<shapes.length;i++)for(let j=i+1;j<shapes.length;j++){
    const a=shapes[i],b=shapes[j];if(a.route&&a.route===b.route&&Math.abs(a.chunk-b.chunk)<=1)continue;
    if(!pairCache.has(a))pairCache.set(a,new WeakMap());const row=pairCache.get(a);let r;
    if(row.has(b))r=row.get(b);else{r=overlap(a,b)?relation(a,b,V):0;row.set(b,r);}
    if(!r)continue;const from=r>0?i:j,to=r>0?j:i;forward[from].push(to);degree[to]++;
  }
  const ready=degree.flatMap((n,i)=>n===0?[i]:[]),order=[];
  while(ready.length){ready.sort((a,b)=>shapes[b].depth-shapes[a].depth);const i=ready.pop();order.push(shapes[i].name);for(const j of forward[i])if(--degree[j]===0)ready.push(j);}
  if(order.length!==parts.length){const seen=new Set(),path=[];let cycle=[];const visit=i=>{if(path.includes(i)){cycle=[...path.slice(path.indexOf(i)),i];return true;}if(seen.has(i))return false;seen.add(i);path.push(i);for(const j of forward[i])if(degree[j]>0&&visit(j))return true;path.pop();return false;};for(let i=0;i<parts.length;i++)if(degree[i]>0&&visit(i))break;throw new Error(`Ciclo de profundidad: ${cycle.map(i=>shapes[i].name).join(" → ")}`);}return order;
}
