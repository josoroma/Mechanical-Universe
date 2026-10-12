import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as O from "./model.mjs";
export const WIDTH=1020, HEIGHT=650;
export const PLAN={x:-130,y:-90,w:260,d:180,r:12};
export const P=K.fitProjection([...K.boxCorners(PLAN,-18,22),...K.boxCorners({x:-80,y:-40,w:160,d:80,r:0},22,173)],WIDTH,HEIGHT,{pad:67,azimuth:58,elevation:36});
export const AXLE=G.frameOf([0,0,122],[1,0,0],[0,1,0],[0,0,1]);
const wrap=(svg,material)=>`<g class="material-${material}">${svg}</g>`;
const line=(d,tone="lo",free)=>K.lineSvg(d,{tone,free});
const stroke=(points,tone="lo",free)=>line(K.pathOf(points.map(p=>K.iso(p,P))),tone,free);
function tools(parts){
  const put=(name,at,svg,shape)=>parts.push({name,at,svg,shape});
  const solid=(paths,material,inner="",lit=false)=>wrap(K.solidSvg(paths,{tone:"hi",inner,lit}),material);
  const cylinder=(name,x,y,r,z,h,material="brass",detail="",lit=false)=>{
    const inner=detail==="knurl"?line(K.knurl(x,y,r,z,z+h,32,P,0)):detail==="screw"?stroke([[x-r,y,z+h],[x+r,y,z+h]],"mid"):detail==="ring"?line(K.ring(x,y,r-1.6,z+h,P)):detail;
    put(name,[x,y,z+h/2],solid(K.cylinder(x,y,r,z,h,P,64,.35),material,inner,lit),{type:"cylinder",x,y,r,z,h});
  };
  const slab=(name,plan,z,h,material="brass",inner="")=>put(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],solid(K.slabOf(plan,z,h,P,8,.4),material,inner),{type:"slab",plan,z,h});
  const rect=(name,x,y,w,d,z,h,material="brass",inner="")=>slab(name,{x,y,w,d,r:0},z,h,material,inner);
  const disc=(name,F,s0,s1,r,material="brass",inner="",lit=false)=>put(name,G.add3(F.o,G.mul3(F.a,(s0+s1)/2)),solid(G.disc(s0,s1,r,F,P),material,inner,lit),{type:"disc",F,s0,s1,r});
  const screw=(name,x,y,z,r=1.5)=>cylinder(name,x,y,r,z,.7,"silver","screw");
  return {put,cylinder,slab,rect,disc,screw};
}
let fixed,moving;
function stationary(){
  if(fixed)return fixed;
  const parts=[],{cylinder,slab,rect,screw}=tools(parts);
  for(const [i,[x,y]]of[[-108,-66],[108,-66],[-108,66],[108,66]].entries()){
    cylinder(`stand.pad.${i}`,x,y,11,-18,3,"iron");cylinder(`foot.shoe.${i}`,x,y,9,-15,3);
    cylinder(`foot.adjuster.${i}`,x,y,7,-12,10,"wood","knurl");cylinder(`foot.collar.${i}`,x,y,11,-2,4);
  }
  slab("base.trim",PLAN,2,3);slab("base.wood",PLAN,5,15,"wood",line(K.sideSeam(PLAN,8,P))+line(K.sideSeam(PLAN,17,P)));
  slab("base.top",PLAN,20,2,"enamel",line(K.planOutline(K.insetPlan(PLAN,7),22,P)));
  for(const [i,[x,y]]of[[-117,-77],[117,-77],[-117,77],[117,77]].entries())screw(`base.screw.${i}`,x,y,22,2);
  const plate={x:-47,y:67,w:94,d:11,r:1.5};
  slab("plaque",plate,22,.8,"brass",line(K.planOutline(K.insetPlan(plate,1),22.8,P))+K.faceTextSvg(K.topMatrix([0,72.5],22.8,P),"INTEGRAL · VII",{anchor:"middle",size:3.5,tone:"hi"}));
  screw("plaque.screw.0",-42,72.5,22.8,1);screw("plaque.screw.1",42,72.5,22.8,1);
  cylinder("spindle.mount",0,0,18,22,5,"brass","ring");
  for(const [i,a]of[45,135,225,315].entries()){const t=a*Math.PI/180;screw(`spindle.screw.${i}`,14*Math.cos(t),14*Math.sin(t),27,1.4);}
  cylinder("spindle.pedestal",0,0,9,27,57,"iron");cylinder("spindle.bearing",0,0,14,84,9,"brass","knurl");
  cylinder("spindle.neck",0,0,6,93,7,"silver");cylinder("spindle.hub",0,0,16,100,4,"brass","ring");
  cylinder("disk.body",0,0,62,104,5,"brass","ring");
  const diskInner=[10,52,59].map(r=>line(K.ring(0,0,r,110,P))).join("")+`<path class="iso-line" data-tone="mid" data-disk-lines d="${diskLines(0)}"/>`;
  cylinder("disk.face",0,0,62,109,1,"silver",diskInner);
  for(const [i,[x,y]]of[[-100,-28],[100,-28],[-100,28],[100,28]].entries()){
    cylinder(`frame.foot.${i}`,x,y,10,22,5,"brass","ring");
    cylinder(`frame.post.${i}`,x,y,4,27,115,"iron");cylinder(`frame.collar.${i}`,x,y,7,142,6,"brass","knurl");
    cylinder(`frame.neck.${i}`,x,y,4,148,2,"silver");
    cylinder(`frame.cap.${i}`,x,y,5,154,3,"brass");screw(`frame.screw.${i}`,x,y,157,1.7);
  }
  for(const [i,y]of[-28,28].entries()){
    // Physical joints at x = ±12 prevent a single long rail from surrounding
    // the moving carriage in painter order; the assembled rail stays continuous.
    for(const [j,[x,w]]of[[-106,94],[-12,24],[12,94]].entries())rect(`rail.${i}.${j}`,x,y-3,w,6,150,4,"silver",stroke([[x,y,154],[x+w,y,154]],"lo"));
    rect(`stop.${i}.left`,-64,y-4,3,8,154,6,"iron");rect(`stop.${i}.right`,61,y-4,3,8,154,6,"iron");
    screw(`stop.${i}.screw.left`,-62.5,y,160,1);screw(`stop.${i}.screw.right`,62.5,y,160,1);
  }
  // Scale rests on the front edge of the front guide.
  let ticks=stroke([[-60,-33,155],[60,-33,155]])+stroke([[-60,-31,155],[60,-31,155]]);
  for(let x=-60;x<=60;x+=4)ticks+=stroke([[x,-35,155],[x,x%12===0?-31:-33,155]],x===0?"hi":x%12===0?"mid":"lo");
  rect("scale",-60,-35,120,4,154,1,"brass",ticks);
  fixed=parts;return fixed;
}
function carriage(){
  if(moving)return moving;
  const parts=[],{cylinder,rect,disc,screw}=tools(parts);
  for(const [i,y]of[-28,28].entries()){
    rect(`carriage.shoe.${i}`,-8,y-5,16,10,155,3,"iron");
    // Bearing shoes seat on the rail; the scale under the front shoe is 1 high.
    if(i===1)rect("carriage.spacer",-8,y-5,16,10,154,1,"iron");
  }
  rect("carriage.bridge",-8,-33,16,66,158,4,"brass",line(K.planOutline({x:-5,y:-30,w:10,d:60,r:0},162,P)));
  for(const [i,y]of[-28,28].entries())screw(`carriage.screw.${i}`,0,y,162,1.5);
  cylinder("carriage.knob.stem",0,0,3,162,4,"iron");cylinder("carriage.knob",0,0,6,166,6,"brass","knurl");screw("carriage.knob.screw",0,0,172,1.8);
  // Two tangential bearing supports hang from the bridge, clear of the wheel.
  rect("carriage.fork.back",4,-5,4,2,122,36,"iron");rect("carriage.fork.front",4,3,4,2,122,36,"iron");
  disc("wheel.contact",AXLE,-1,1,12,"silver","",true);
  disc("wheel.back",AXLE,-2,-1,10.5,"brass",line(G.circleOf(AXLE,-2,8.5,P)));
  const wheelInner=line(G.circleOf(AXLE,2,8.5,P))+line(G.circleOf(AXLE,2,3,P))+`<path class="iso-line" data-tone="mid" data-wheel-lines d="${wheelLines(0)}"/>`;
  disc("wheel.front",AXLE,1,2,10.5,"brass",wheelInner);
  disc("wheel.shaft",AXLE,2,4,1.5,"silver");disc("wheel.bearing",AXLE,4,8,3,"brass",line(G.circleOf(AXLE,8,2.3,P)));
  disc("output.shaft",AXLE,8,24,1.5,"silver");disc("output.case",AXLE,24,28,10,"brass",line(G.circleOf(AXLE,28,9,P)));
  let ticks=[6.5,8.5].map(r=>line(G.circleOf(AXLE,29,r,P))).join("");
  for(let i=0;i<30;i++){const a=i*O.TAU/30,r=i%5?7.5:6.5;ticks+=stroke([[29,8.5*Math.cos(a),122+8.5*Math.sin(a)],[29,r*Math.cos(a),122+r*Math.sin(a)]],i%5?"lo":"mid");}
  ticks+=line(G.circleOf(AXLE,29,7.5,P));
  ticks+=`<path class="iso-line" data-tone="hi" data-free="true" data-needle d="${needle(0)}"/>`;
  disc("output.face",AXLE,28,29,9,"ivory",ticks);disc("output.pin",AXLE,29,30,1.2,"brass");
  moving=parts;return moving;
}
export function diskLines(theta){let d="";for(let i=0;i<12;i++){const a=theta+i*O.TAU/12;d+=K.pathOf([10,52].map(r=>K.iso([r*Math.cos(a),r*Math.sin(a),110],P)));}return d;}
export function wheelLines(phi){let d="";for(let i=0;i<8;i++){const a=phi+i*O.TAU/8;d+=K.pathOf([3,8.5].map(r=>K.iso([2,r*Math.cos(a),122+r*Math.sin(a)],P)));}return d;}
export function needle(phi){return K.pathOf([[29,0,122],[29,7.9*Math.cos(phi),122+7.9*Math.sin(phi)]].map(p=>K.iso(p,P)));}
export function scene(state=O.DEFAULTS,x=state.x){
  const r=O.snapshot(state,x).r;
  return [...stationary(),...carriage().map(part=>{
    const s=part.shape;let shape;
    if(s.type==="cylinder")shape={...s,x:s.x+r};
    else if(s.type==="slab")shape={...s,plan:{...s.plan,x:s.plan.x+r}};
    else shape={...s,F:{...s.F,o:[s.F.o[0]+r,...s.F.o.slice(1)]}};
    return {...part,at:[part.at[0]+r,...part.at.slice(1)],shape,moving:true,shift:r};
  })];
}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>{const p=map.get(name);return `<g data-part="${name}"${p.moving?` transform="${K.translateAlong(P,[p.shift,0,0])}"`:""}>${p.svg}</g>`;}).join("");}
