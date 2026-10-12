import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as T from "./kit/tube.mjs";
import * as O from "./model.mjs";

export const WIDTH = 1020, HEIGHT = 680, SCALE = 60, ROPE_R = 48.12;
export const PLANS = { atwood: { x: -155, y: -70, w: 310, d: 140, r: 14 }, table: { x: -170, y: -170, w: 340, d: 340, r: 32 } };
export const PROJECTIONS = {
  atwood: K.fitProjection([...K.boxCorners(PLANS.atwood, -22, 22), [-140, -35, 355], [140, 35, 355]], WIDTH, HEIGHT, { pad: 70, azimuth: 58, elevation: 26 }),
  table: K.fitProjection([...K.boxCorners(PLANS.table, -22, 22), ...K.boxCorners({x:-190,y:-190,w:380,d:380,r:0}, 22, 215)], WIDTH, HEIGHT, { pad: 65, azimuth: 38, elevation: 38 })
};
const cache = new Map(), fixed = new Map();
let fixedAtwoodArc;
const Fxy = (angle) => { const a=O.radians(angle); return G.frameOf([0,0,0],[0,0,1],[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0]); };
const world = (F, x, y, z) => G.add3(F.o,G.add3(G.mul3(F.u,x),G.add3(G.mul3(F.v,y),G.mul3(F.a,z))));
const wrap = (svg, material) => `<g class="material-${material}">${svg}</g>`;
function constructors(parts, mode) {
  const P=PROJECTIONS[mode], line=(d,tone="lo")=>K.lineSvg(d,{tone});
  const stroke=(points,tone="lo")=>line(K.pathOf(points.map(p=>K.iso(p,P))),tone);
  const solid=(paths,material,inner="",lit=false)=>wrap(K.solidSvg(paths,{tone:"hi",inner,lit}),material);
  const put=(name,at,svg,shape)=>parts.push({name,at,svg,shape});
  const cylinder=(name,x,y,r,z,h,material="brass",detail="",lit=false)=>{
    const key=`${mode}/${name}/${r}/${h}/${material}/${detail}/${lit}`;
    if(!cache.has(key)) {
      const inner=detail==="knurl"?line(K.knurl(0,0,r,0,h,32,P,0)):detail==="screw"?line(K.lineOnTop([-r,0],[r,0],h,P),"mid"):detail==="ring"?line(K.ring(0,0,r-2,h,P)):"";
      if(cache.size>2000)cache.clear();
      cache.set(key,solid(K.cylinder(0,0,r,0,h,P,48,.4),material,inner,lit));
    }
    put(name,[x,y,z+h/2],`<g transform="${K.translateAlong(P,[x,y,z])}">${cache.get(key)}</g>`,{type:"cylinder",x,y,r,z,h});
  };
  const slab=(name,plan,z,h,material="brass",inner="")=>put(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],solid(K.slabOf(plan,z,h,P,8,.5),material,inner),{type:"slab",plan,z,h});
  const rect=(name,x,y,w,d,z,h,material="brass",inner="")=>slab(name,{x,y,w,d,r:0},z,h,material,inner);
  const prism=(name,F,polygon,s0,s1,material="brass",inner="",lit=false)=>{
    const c=polygon.reduce((v,p)=>[v[0]+p[0]/polygon.length,v[1]+p[1]/polygon.length],[0,0]);
    put(name,world(F,...c,(s0+s1)/2),solid(G.prismOf(F,polygon,s0,s1,P),material,inner,lit),{type:"prism",F,polygon,s0,s1});
  };
  const disc=(name,F,s0,s1,r,material="brass",inner="")=>put(name,G.add3(F.o,G.mul3(F.a,(s0+s1)/2)),solid(G.disc(s0,s1,r,F,P),material,inner),{type:"disc",F,s0,s1,r});
  const screw=(name,x,y,z,r=1.6)=>cylinder(name,x,y,r,z,.7,"silver","screw");
  const rope=(name,points,r,breaks=[])=>{
    const pieces=T.tubePieces(points,r,P,{maxLength:1000,spacing:.6,breaks,stripes:true});
    const route={name,points,r,touch:[name==="cord.atwood"?"pulley.groove":`station.${name.split(".").at(-1)}.pulley.groove`]};
    pieces.forEach((piece,i)=>put(`${name}.${i}`,piece.mid,wrap(T.tubeSvg(piece,{tone:"mid"}),"cord"),{type:"tube",points:piece.points,r,route:name,chunk:i,routeData:route}));
  };
  return {P,line,stroke,solid,put,cylinder,slab,rect,prism,disc,screw,rope};
}
function base(parts, mode) {
  const {P,line,cylinder,slab,screw}=constructors(parts,mode), plan=PLANS[mode];
  const feet=mode==="atwood"?[[-125,-45],[125,-45],[-125,45],[125,45]]:[[-135,-135],[135,-135],[-135,135],[135,135]];
  feet.forEach(([x,y],i)=>{cylinder(`stand.pad.${i}`,x,y,12,-22,4,"iron");cylinder(`foot.shoe.${i}`,x,y,10,-18,4);cylinder(`foot.body.${i}`,x,y,7,-14,12,"wood","knurl");cylinder(`foot.collar.${i}`,x,y,12,-2,4);});
  slab("base.lower",plan,2,3);slab("base.wood",plan,5,15,"wood",line(K.sideSeam(plan,8,P))+line(K.sideSeam(plan,17,P)));
  slab("base.upper",plan,20,2,"enamel",line(K.planOutline(K.insetPlan(plan,8),22,P)));
  feet.forEach(([x,y],i)=>screw(`base.screw.${i}`,x,y,22,2.2));
  const py=mode==="atwood"?53:150, plaque={x:-48,y:py,w:96,d:12,r:2};
  slab("plaque",plaque,22,.8,"brass",line(K.planOutline(K.insetPlan(plaque,1.2),22.8,P))+K.faceTextSvg(K.topMatrix([0,py+6],22.8,P),"NEWTON · VI",{anchor:"middle",size:3.5,tone:"hi"}));
  screw("plaque.screw.0",-42,py+6,22.8,1);screw("plaque.screw.1",42,py+6,22.8,1);
}
function atwoodFixed() {
  if(fixed.has("atwood"))return fixed.get("atwood");
  const parts=[];base(parts,"atwood");
  const {P,line,stroke,cylinder,rect,disc,screw}=constructors(parts,"atwood");
  for(const [i,x]of[-115,115].entries()) {
    cylinder(`frame.foot.${i}`,x,-25,14,22,5);cylinder(`frame.shoe.${i}`,x,-25,10,27,7,"iron");
    cylinder(`frame.post.${i}`,x,-25,6,34,278,"iron");cylinder(`frame.collar.${i}`,x,-25,9,312,10,"brass","knurl");
    cylinder(`frame.neck.${i}`,x,-25,6,322,8,"iron");cylinder(`frame.cap.${i}`,x,-25,9,340,4);screw(`frame.screw.${i}`,x,-25,344,2.4);
  }
  rect("frame.crossbar",-130,-33,260,16,330,10,"brass");
  rect("axle.mount",-13,-33,26,13,285,45,"iron");
  for(const [i,x]of[-8,8].entries()){const F=G.frameOf([x,-20,315],[0,1,0],[1,0,0],[0,0,-1]);disc(`axle.mount.screw.${i}`,F,0,.7,1.3,"silver",stroke([[x-1.3,-19.3,315],[x+1.3,-19.3,315]],"mid"));}
  const F=G.frameOf([0,0,300],[0,1,0],[1,0,0],[0,0,-1]);
  disc("pulley.shaft.back",F,-20,-4,4,"silver");
  disc("pulley.back",F,-4,-2,50,"brass",line(G.circleOf(F,-4,42,P))+line(G.circleOf(F,-4,8,P)));
  disc("pulley.groove",F,-2,2,47,"iron");
  disc("pulley.front",F,2,4,50,"brass",line(G.circleOf(F,4,42,P))+line(G.circleOf(F,4,8,P)));
  disc("pulley.shaft.front",F,4,10,4,"silver");disc("pulley.hub",F,10,13,8,"brass",line(G.circleOf(F,13,5.5,P)));
  disc("pulley.screw",F,13,13.7,2.5,"silver",stroke([[-2.5,13.7,300],[2.5,13.7,300]],"mid"));
  // A real vertical ruler, clear of both suspended masses.
  const rule={x:78,y:9,w:9,d:2,r:0};
  let ticks=stroke([[82.5,11,43],[82.5,11,260]])+stroke([[87,11,43],[87,11,260]]);
  for(let z=48;z<=258;z+=6)ticks+=stroke([[78,11,z],[z%30===0?87:82.5,11,z]],z%30===0?"mid":"lo");
  rect("rule.support",78,9,9,2,22,21,"iron");
  rect("rule",rule.x,rule.y,rule.w,rule.d,43,217,"brass",ticks);
  screw("rule.screw",82.5,10,260,1);
  fixed.set("atwood",parts);return parts;
}
function weight(parts,mode,id,at,mass,material) {
  const {cylinder}=constructors(parts,mode),[x,y,z]=at,body=8+mass*16;
  cylinder(`${id}.tray`,x,y,14,z,3,"brass");
  cylinder(`${id}.mass`,x,y,12,z+3,body,material,"ring");
  cylinder(`${id}.cap`,x,y,13,z+3+body,2,"brass","ring");
  cylinder(`${id}.lug`,x,y,3,z+5+body,5,"iron");
  return z+10+body;
}
export function atwoodScene(state=O.DEFAULTS,time=0) {
  const snap=O.atwood(state,time),parts=[...atwoodFixed()],{P,stroke,put,disc,rope,prism}=constructors(parts,"atwood");
  const z1=125+snap.q*SCALE,z2=125-snap.q*SCALE;
  const end1=weight(parts,"atwood","mass.1",[-ROPE_R,0,z1],state.m1,"silver"),end2=weight(parts,"atwood","mass.2",[ROPE_R,0,z2],state.m2,"copper");
  const points=[[-ROPE_R,0,end1],[-ROPE_R,0,300]],arc=[[-ROPE_R,0,300]];
  for(let i=1;i<=64;i++){const a=Math.PI-i*Math.PI/64;arc.push([ROPE_R*Math.cos(a),0,300+ROPE_R*Math.sin(a)]);}
  points.push(...arc.slice(1),[ROPE_R,0,end2]);
  const routeData={name:"cord.atwood",points,r:1,touch:["pulley.groove"]};
  if(!fixedAtwoodArc)fixedAtwoodArc=T.tubePieces(arc,1,P,{maxLength:3.8,spacing:.6,caps:false,stripes:true}).map((piece,i)=>({name:`cord.atwood.${i+1}`,at:piece.mid,svg:wrap(T.tubeSvg(piece,{tone:"mid"}),"cord"),shape:{type:"tube",points:piece.points,r:1,route:"cord.atwood",chunk:i+1,routeData}}));
  const straight=(name,chunk,points,caps)=>{const p=T.tubePieces(points,1,P,{maxLength:1000,spacing:.6,caps,stripes:true})[0];put(name,p.mid,wrap(T.tubeSvg(p,{tone:"mid"}),"cord"),{type:"tube",points:p.points,r:1,route:"cord.atwood",chunk,routeData});};
  straight("cord.atwood.0",0,[[-ROPE_R,0,end1],[-ROPE_R,0,300.5]],[true,false]);
  parts.push(...fixedAtwoodArc);
  straight(`cord.atwood.${fixedAtwoodArc.length+1}`,fixedAtwoodArc.length+1,[[ROPE_R,0,300.5],[ROPE_R,0,end2]],[false,true]);
  const rotation=snap.q*SCALE/ROPE_R;
  let spokes="";
  for(let i=0;i<12;i++){const a=rotation+i*Math.PI/6;spokes+=stroke([[8*Math.cos(a),4,300+8*Math.sin(a)],[42*Math.cos(a),4,300+42*Math.sin(a)]],i%3?"lo":"mid");}
  const F=G.frameOf([0,0,300],[0,1,0],[1,0,0],[0,0,-1]);
  // The rotating engraving belongs to the actual front face.
  const fi=parts.findIndex(p=>p.name==="pulley.front");
  parts[fi]={...parts[fi],geometryKey:parts[fi],svg:parts[fi].svg.replace("</g></g>",`<g data-engraving>${spokes}</g></g></g>`)};
  const R=G.frameOf([0,0,0],[0,1,0],[1,0,0],[0,0,-1]),rz=z2+10;
  prism("rule.cursor",R,[[76,-rz-3],[76,-rz+3],[88,-rz]],11,13,"silver","",true);
  return parts;
}
function tableFixed() {
  if(fixed.has("table"))return fixed.get("table");
  const parts=[];base(parts,"table");const {P,line,stroke,cylinder,disc,screw}=constructors(parts,"table");
  for(const [i,a]of[60,180,300].entries()) {const u=O.unit(a),x=u.x*76,y=u.y*76;cylinder(`table.foot.${i}`,x,y,12,22,5);cylinder(`table.post.${i}`,x,y,6,27,131,"iron");cylinder(`table.collar.${i}`,x,y,10,158,6,"brass","knurl");cylinder(`table.neck.${i}`,x,y,6,164,6,"iron");}
  cylinder("table.plate",0,0,122,170,6,"brass","ring");
  let ticks=[107,113,119].map(r=>line(K.ring(0,0,r,178,P))).join("");
  for(let i=0;i<72;i++){const a=i*Math.PI/36,r=i%6?113:107;ticks+=stroke([[119*Math.cos(a),119*Math.sin(a),178],[r*Math.cos(a),r*Math.sin(a),178]],i===0?"hi":i%6?"lo":"mid");}
  cylinder("table.face",0,0,121,176,2,"enamel");
  const face=parts.at(-1);face.svg+=wrap(ticks,"enamel");
  // Mechanical gauge on a support beside the table, not a floating label.
  cylinder("gauge.foot",100,100,14,22,5);cylinder("gauge.post",100,100,5,27,110,"iron");cylinder("gauge.case",100,100,24,137,7,"brass","knurl");
  let dial=[15,18,21].map(r=>line(K.ring(100,100,r,145,P))).join("");
  for(let i=0;i<40;i++){const a=i*Math.PI/20,r=i%5?18:15;dial+=stroke([[100+21*Math.cos(a),100+21*Math.sin(a),145],[100+r*Math.cos(a),100+r*Math.sin(a),145]],i%5?"lo":"mid");}
  cylinder("gauge.face",100,100,23,144,1,"ivory");parts.at(-1).svg+=wrap(dial,"ivory");
  cylinder("gauge.hub",100,100,2.2,146,2,"brass");screw("gauge.screw",100,100,148,1.2);
  cylinder("body",0,0,16,178,8,"silver","ring",true);cylinder("body.stem",0,0,5,186,13,"iron");cylinder("body.junction",0,0,11,199,8,"brass","ring");screw("body.screw",0,0,207,2);
  fixed.set("table",parts);return parts;
}
export function tableScene(state=O.DEFAULTS) {
  const snap=O.table(state),parts=[...tableFixed()],{P,line,stroke,cylinder,prism,disc,screw,rope}=constructors(parts,"table");
  for(const [i,a]of snap.angles.entries()) {
    const H=Fxy(a),u=O.unit(a),t=[-u.y,u.x,0],F=G.frameOf([u.x*158,u.y*158,187],t,[u.x,u.y,0],[0,0,-1]);
    prism(`station.${i}.clamp`,H,[[112,-5],[120,-5],[120,5],[112,5]],160,170,"iron");
    prism(`station.${i}.arm`,H,[[112,-5],[152,-5],[152,5],[112,5]],155,160,"brass");
    prism(`station.${i}.bridge`,H,[[152,-12],[164,-12],[164,12],[152,12]],155,160,"brass");
    for(const [j,side]of[-1,1].entries()) {
      const y=side<0?-12:8;
      prism(`station.${i}.fork.${j}`,H,[[154,y],[162,y],[162,y+4],[154,y+4]],160,192,"iron");
      const p=world(H,158,y+2,192);screw(`station.${i}.screw.${j}`,p[0],p[1],192,1.4);
    }
    disc(`station.${i}.shaft.back`,F,-8,-4,3,"silver");disc(`station.${i}.shaft.front`,F,4,8,3,"silver");
    disc(`station.${i}.pulley.back`,F,-4,-2,17.5,"brass",line(G.circleOf(F,-4,12,P)));
    disc(`station.${i}.pulley.groove`,F,-2,2,15.1,"iron");
    disc(`station.${i}.pulley.front`,F,2,4,17.5,"brass",line(G.circleOf(F,4,12,P))+line(G.circleOf(F,4,4,P)));
    const p=world(H,116,0,178);screw(`station.${i}.clamp.screw`,p[0],p[1],178,2);
    const end=weight(parts,"table",`hanger.${i}`,[u.x*174,u.y*174,85],snap.masses[i]*2,i===2?"copper":"silver");
    const points=[[u.x*11,u.y*11,203],[u.x*158,u.y*158,203]];
    for(let j=1;j<=32;j++){const a=Math.PI/2-j*Math.PI/64;points.push([u.x*(158+16*Math.cos(a)),u.y*(158+16*Math.cos(a)),187+16*Math.sin(a)]);}
    points.push([u.x*174,u.y*174,end]);
    const arcLength=32*32*Math.sin(Math.PI/128),start=147;
    // Split the long hanging leg where it crosses the fork in projection.
    // Each physical segment then has a single unambiguous depth order.
    const arcEnd=start+arcLength, vertical=187-end;
    const verticalCuts=Array.from({length:Math.floor(vertical/10)},(_,j)=>arcEnd+(j+1)*10).filter(s=>s<arcEnd+vertical-2);
    rope(`cord.table.${i}`,points,.8,[start,...Array.from({length:13},(_,j)=>start+arcLength*(j+1)/13),...verticalCuts]);
  }
  for(const [i,a]of[45,165,285].entries()) {const u=O.unit(a),r=state.held?18:28,x=u.x*r,y=u.y*r;cylinder(`jaw.${i}`,x,y,2,178,8,"iron");cylinder(`jaw.cap.${i}`,x,y,2.5,186,3,"brass","knurl");}
  const angle=O.radians(-135+O.clamp(O.norm(snap.acceleration)/8,0,1)*270),F=G.frameOf([100,100,0],[0,0,1],[Math.cos(angle),Math.sin(angle),0],[-Math.sin(angle),Math.cos(angle),0]);
  prism("gauge.needle",F,[[-2,-.7],[18,0],[-2,.7]],145,146,"iron");
  return parts;
}
export const scene=(state=O.DEFAULTS,time=0)=>state.mode==="atwood"?atwoodScene(state,time):tableScene(state);
export const svgParts=(parts,order)=>{const keys=new Map(order.map((name,i)=>[name,i]));return [...parts].sort((a,b)=>keys.get(a.name)-keys.get(b.name)).map(p=>`<g data-part="${p.name}">${p.svg}</g>`).join("");};
