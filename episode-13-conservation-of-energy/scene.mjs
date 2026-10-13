import * as K from './kit/iso-kit.mjs';
import * as G from './kit/lathe.mjs';
import * as O from './model.mjs';
export const WIDTH=1120,HEIGHT=650,XSCALE=7,ZSCALE=3.8,BASE=22;
export const PLAN={x:-184,y:-54,w:368,d:130,r:9};
export const P=K.fitProjection([...K.boxCorners(PLAN,-14,22),[-174,0,169],[174,0,169]],WIDTH,HEIGHT,{pad:38,azimuth:68,elevation:27});
const line=(d,tone='lo')=>K.lineSvg(d,{tone});
const stroke=points=>line(K.pathOf(points.map(p=>K.iso(p,P))));
const centre=(F,u,v,s=0)=>G.add3(F.o,G.add3(G.mul3(F.u,u),G.add3(G.mul3(F.v,v),G.mul3(F.a,s))));
export const zAt=x=>BASE+O.track(x).h*ZSCALE;
export function railTop(x){const a=Math.min(23.5,-24+Math.floor((x+24)*2)/2),t=(x-a)*2;return zAt(a)*(1-t)+zAt(a+.5)*t;}
export function wheelOffset(x,r=3.2){
  const wx=x*XSCALE,z=zAt(x),s=O.track(x).slope*ZSCALE/XSCALE,nx=-s/Math.hypot(1,s),nz=1/Math.hypot(1,s),segments=[];
  for(let i=Math.max(0,Math.floor((x+24)*2)-4);i<Math.min(96,Math.floor((x+24)*2)+5);i++){const a=-24+i*.5,b=a+.5;segments.push([a*XSCALE,zAt(a),b*XSCALE,zAt(b)]);}
  const distance=offset=>{const px=wx+nx*offset,pz=z+nz*offset;let min=Infinity;for(const[ax,az,bx,bz]of segments){const dx=bx-ax,dz=bz-az,t=O.clamp(((px-ax)*dx+(pz-az)*dz)/(dx*dx+dz*dz),0,1);min=Math.min(min,Math.hypot(px-ax-dx*t,pz-az-dz*t));}return min;};
  let lo=r-.5,hi=r+.5;for(let i=0;i<40;i++){const m=(lo+hi)/2;if(distance(m)<r)lo=m;else hi=m;}return hi+1e-6;
}
export function bodySvg(part){const p=part.paths;return `<g class="material-${part.material}"><g class="iso-solid" data-tone="mid"${part.lit?' data-lit="true"':''}><path class="iso-fill" d="${p.fill}"/>${[0,1,2,3].map(i=>`<path class="iso-shade" data-shade="${i}" d="${p.shades[i]||''}"/>`).join('')}<path class="iso-top" d="${p.top||''}"/><path class="iso-line iso-crease" data-tone="faint" d="${p.crease||''}"/><path class="iso-line iso-edge" data-tone="mid" d="${p.outline}"/>${part.inner||''}</g></g>`;}
const make=(name,at,shape,paths,material='brass',inner='',lit=false)=>({name,at,shape,paths,material,inner,lit});
let staticParts;
export function fixed(){
  if(staticParts)return staticParts;const parts=[];
  const slab=(name,plan,z,h,material='brass',inner='')=>parts.push(make(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],{type:'slab',plan,z,h},K.slabOf(plan,z,h,P,5,.35),material,inner));
  const c=(name,x,y,r,z,h,material='brass',inner='')=>parts.push(make(name,[x,y,z+h/2],{type:'cylinder',x,y,r,z,h},K.cylinder(x,y,r,z,h,P,40,.25),material,inner));
  const screw=(name,x,y,z,r=.9)=>c(name,x,y,r,z,.5,'silver',stroke([[x-r,y,z+.5],[x+r,y,z+.5]]));
  for(const [i,[x,y]]of[[-165,-35],[165,-35],[-165,58],[165,58]].entries()){c(`stand.pad.${i}`,x,y,9,-14,3,'iron');c(`foot.adjuster.${i}`,x,y,6,-11,9,'brass',line(K.knurl(x,y,6,-11,-2,26,P,0)));c(`foot.collar.${i}`,x,y,10,-2,4);}
  slab('base.trim',PLAN,2,3);slab('base.wood',PLAN,5,15,'wood',line(K.sideSeam(PLAN,9,P,5))+line(K.sideSeam(PLAN,17,P,5)));slab('base.enamel',PLAN,20,2,'enamel',line(K.planOutline(K.insetPlan(PLAN,5),22,P,5)));
  for(const[i,[x,y]]of[[-176,-46],[176,-46],[-176,68],[176,68]].entries())screw(`base.screw.${i}`,x,y,22,1.3);
  const plaque={x:-37,y:60,w:74,d:8,r:1};slab('plaque',plaque,22,.6,'brass',line(K.planOutline(K.insetPlan(plaque,.6),22.6,P))+K.faceTextSvg(K.topMatrix([0,64],22.6,P),'ENERGÍA · XIII',{anchor:'middle',size:3,tone:'hi'}));screw('plaque.screw.0',-34,64,22.6,.7);screw('plaque.screw.1',34,64,22.6,.7);
  const ruler={x:-162,y:43,w:324,d:6,r:1};slab('ruler',ruler,22,.5,'ivory');const ticks=K.topTicks(-158,158,7,5,43,22.5,[2.1,4],P);parts.at(-1).inner=line(ticks.minor,'lo')+line(ticks.major,'mid');
  for(const[i,x]of[-24,-18,-12,0,12,18,24].entries()){
    const wx=x*XSCALE,x0=x-2/XSCALE,x1=x+2/XSCALE,top0=railTop(Math.max(-24,x0))-1.2,top1=railTop(Math.min(24,x1))-1.2,z=Math.min(railTop(Math.max(-24,x-5/XSCALE)),railTop(Math.min(24,x+5/XSCALE)))-4.2;
    for(const[j,y]of[-12,12].entries()){
      c(`support.foot.${i}.${j}`,wx,y,6,22,3,'brass',line(K.ring(wx,y,4.6,25,P)));
      c(`support.post.${i}.${j}`,wx,y,2.5,25,z-28,'iron');c(`support.collar.${i}.${j}`,wx,y,4,z-3,3,'brass');
      screw(`support.bolt.${i}.${j}`,wx+4.3,y,25,.6);
    }
    const left=Math.max(-168,wx-2),right=Math.min(168,wx+2),F={o:[0,0,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]};
    for(const[j,[a,b,ta,tb]]of[[left,wx,top0,zAt(x)-1.2],[wx,right,zAt(x)-1.2,top1]].entries())if(b>a){const polygon=[[a,z],[b,z],[b,tb],[a,ta]];parts.push(make(`support.crossbar.${i}.${j}`,[(a+b)/2,0,(z+Math.max(ta,tb))/2],{type:'prism',F,polygon,s0:-16,s1:16},G.prismOf(F,polygon,-16,16,P),'brass'));}
  }
  // The rails are the actual sampled profile, not bounding-box stand-ins.
  const F={o:[0,0,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]};
  for(const y of[-12,12])for(let i=0;i<96;i++){
    const a=-24+i*.5,b=a+.5,z0=zAt(a),z1=zAt(b),polygon=[[a*XSCALE,z0],[b*XSCALE,z1],[b*XSCALE,z1-1.2],[a*XSCALE,z0-1.2]];
    const name=`rail.${y<0?'rear':'front'}.${i}`;parts.push(make(name,[(a+b)*XSCALE/2,y,(z0+z1)/2-.6],{type:'prism',F,polygon,s0:y-1.5,s1:y+1.5},G.prismOf(F,polygon,y-1.5,y+1.5,P),'silver'));
  }
  for(const p of parts)p.svg=bodySvg(p);staticParts=parts;return parts;
}
export function car(x,roll=0){
  const z=zAt(x),slope=O.track(x).slope*ZSCALE/XSCALE,angle=Math.atan(slope),u=[Math.cos(angle),0,Math.sin(angle)],v=[-Math.sin(angle),0,Math.cos(angle)];
  const F={o:[x*XSCALE,0,z],a:[0,1,0],u,v},parts=[],normal=wheelOffset(x);
  const prism=(name,u0,u1,v0,v1,y0,y1,material='brass',lit=false)=>{const polygon=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];parts.push(make(name,centre(F,(u0+u1)/2,(v0+v1)/2,(y0+y1)/2),{type:'prism',F,polygon,s0:y0,s1:y1},G.prismOf(F,polygon,y0,y1,P),material,'',lit));};
  const axis={...F,o:centre(F,0,normal)};
  const disc=(name,y0,y1,r,material='brass',detail=false)=>{const details=detail?[G.circleOf(axis,y1,r-.6,P),...[0,Math.PI/2,Math.PI,Math.PI*1.5].map(a=>K.pathOf([G.pointOf(axis,y1,.7,a+roll),G.pointOf(axis,y1,r-.6,a+roll)].map(p=>K.iso(p,P)))),G.circleOf(axis,y1,.7,P)]:[],inner=details.map(d=>line(d)).join('');parts.push({...make(name,centre(axis,0,0,(y0+y1)/2),{type:'disc',F:axis,s0:y0,s1:y1,r},G.disc(y0,y1,r,axis,P),material,inner),details});};
  disc('car.axle',-11,11,1,'iron');disc('car.wheel.rear',-13,-11,3.2,'brass');disc('car.wheel.front',11,13,3.2,'brass',true);
  prism('car.mount',-1,1,normal+1,normal+5,-2,2,'iron');prism('car.floor',-6,6,normal+5,normal+7,-9,9,'brass',true);
  prism('car.side.rear',-6,6,normal+7,normal+12,-10,-9,'enamel');prism('car.side.front',-6,6,normal+7,normal+12,9,10,'enamel');
  prism('car.back',-6,-4,normal+7,normal+17,-9,9,'enamel');prism('car.nose',4,6,normal+7,normal+11,-9,9,'enamel');
  prism('car.seat',-2,2,normal+7,normal+9,-7,7,'ivory');prism('car.seatback',-4,-2,normal+7,normal+15,-7,7,'ivory');
  return parts;
}
export function scene(x=O.startX(26),roll=0){return[...fixed(),...car(x,roll)];}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>`<g data-part="${name}">${map.get(name).svg||bodySvg(map.get(name))}</g>`).join('');}
