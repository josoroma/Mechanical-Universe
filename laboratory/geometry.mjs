import * as K from './kit/iso-kit.mjs';
import * as G from './kit/lathe.mjs';
export const path=(points,P)=>K.pathOf(points.map(p=>K.iso(p,P)));
export const line=(d,tone='lo')=>K.lineSvg(d,{tone});
export function bodySvg(p){const a=p.paths;return `<g class="material-${p.material}"><g class="iso-solid" data-tone="mid"${a.seamless?' data-seamless="true"':''}><path class="iso-fill" d="${a.fill}"/>${[0,1,2,3].map(i=>`<path class="iso-shade" data-shade="${i}" d="${a.shades?.[i]||''}"/>`).join('')}<path class="iso-top" d="${a.top||''}"/><path class="iso-line iso-crease" data-tone="faint" d="${a.crease||''}"/><path class="iso-line iso-edge" data-tone="mid" d="${a.outline}"/>${p.inner||''}</g></g>`;}
export function defs(){return `<defs>${[['silver','var(--silver-top)','var(--silver-0)'],['violet','#ddd4ff','#6343ac'],['teal','#c5fff1','#217d70'],['gold','#fff3ba','#9a6d23'],['pink','#ffe0ec','#ab4278']].map(([id,a,b])=>`<radialGradient id="sphere-${id}" cx="28%" cy="22%" r="82%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`).join('')}</defs>`;}
export function builders(parts,P,dynamic=false){
 const add=(name,at,shape,paths,material,inner='')=>{const p={name,at,shape,paths,material,inner,dynamic};p.svg=bodySvg(p);parts.push(p);return p;};
 const slab=(name,plan,z,h,m='brass',inner='')=>add(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],{type:'slab',plan,z,h},K.slabOf(plan,z,h,P,6,.4),m,inner);
 const disc=(name,F,s0,s1,r,m='silver',inner='')=>add(name,G.add3(F.o,G.mul3(F.a,(s0+s1)/2)),{type:'disc',F,s0,s1,r},G.disc(s0,s1,r,F,P,{smooth:{slope:()=>0}}),m,inner);
 const c=(name,x,y,r,z,h,m='brass',inner='')=>disc(name,{o:[x,y,0],a:[0,0,1],u:[1,0,0],v:[0,1,0]},z,z+h,r,m,inner);
 const rod=(name,a,b,r,m='silver')=>disc(name,G.frameAlong(a,G.sub3(b,a)),0,G.len3(G.sub3(b,a)),r,m);
 const slide=(name,F,from,to,r,m='silver')=>{const out=G.rodOut(F,from,to,r,P,{smooth:{slope:()=>0}});return add(name,G.add3(F.o,G.mul3(F.a,(from+to)/2)),{type:'disc',F,s0:from,s1:to,r,slide:true},out.paths,m);};
 const prism=(name,F,polygon,s0,s1,m='brass',inner='')=>add(name,G.add3(F.o,G.add3(G.mul3(F.a,(s0+s1)/2),G.add3(G.mul3(F.u,polygon.reduce((s,p)=>s+p[0],0)/polygon.length),G.mul3(F.v,polygon.reduce((s,p)=>s+p[1],0)/polygon.length)))),{type:'prism',F,polygon,s0,s1},G.prismOf(F,polygon,s0,s1,P),m,inner);
 const ball=(name,at,r,m='silver')=>{const a=G.sphereOf([0,0,0],r,P,{steps:64}),p={name,at,shape:{type:'ball',at,r},translate:at,svg:`<path class="sphere-body" d="${a.outline}" fill="url(#sphere-${m})"/><path class="sphere-edge" d="${a.outline}"/>`};parts.push(p);return p;};
 const screw=(name,x,y,z,r=.9)=>c(name,x,y,r,z,.5,'silver',line(path([[x-r,y,z+.5],[x+r,y,z+.5]],P)));
 return{slab,disc,c,rod,slide,prism,ball,screw};
}
export function base(P,plan,label){const parts=[],{slab,c,screw}=builders(parts,P);for(const[i,[x,y]]of[[plan.x+22,plan.y+21],[plan.x+plan.w-22,plan.y+21],[plan.x+22,plan.y+plan.d-21],[plan.x+plan.w-22,plan.y+plan.d-21]].entries()){c(`stand.pad.${i}`,x,y,9,-14,3,'iron');c(`foot.body.${i}`,x,y,6,-11,9,'brass',line(K.knurl(x,y,6,-11,-2,28,P,0)));c(`foot.collar.${i}`,x,y,10,-2,4);}
 slab('base.trim',plan,2,3);slab('base.wood',plan,5,15,'wood',line(K.sideSeam(plan,10,P,6))+line(K.sideSeam(plan,17,P,6)));slab('base.cover',plan,20,2,'enamel',line(K.planOutline(K.insetPlan(plan,5),22,P,6)));
 for(const[i,[x,y]]of[[plan.x+10,plan.y+10],[plan.x+plan.w-10,plan.y+10],[plan.x+10,plan.y+plan.d-10],[plan.x+plan.w-10,plan.y+plan.d-10]].entries())screw(`base.screw.${i}`,x,y,22,1.3);
 const plaque={x:-55,y:plan.y+plan.d-24,w:110,d:12,r:1};slab('plaque',plaque,22,.6,'brass',line(K.planOutline(K.insetPlan(plaque,.8),22.6,P,6))+K.faceTextSvg(K.topMatrix([0,plaque.y+6],22.6,P),label,{anchor:'middle',size:3,tone:'hi'}));screw('plaque.screw.0',-51,plaque.y+6,22.6,.7);screw('plaque.screw.1',51,plaque.y+6,22.6,.7);return parts;
}
export function svgParts(parts,order,P){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>{const p=map.get(name);return `<g data-part="${name}"${p.translate?` transform="${K.translateAlong(P,p.translate)}"`:''}>${p.svg}</g>`;}).join('');}
