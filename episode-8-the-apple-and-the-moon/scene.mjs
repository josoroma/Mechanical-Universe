import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as O from "./model.mjs";
export const WIDTH=1020,HEIGHT=780,PLAN={x:-125,y:-82,w:250,d:164,r:12};
export const P=K.fitProjection([...K.boxCorners(PLAN,-18,22),...K.boxCorners({x:-205,y:12,w:410,d:12,r:0},25,345)],WIDTH,HEIGHT,{pad:52,azimuth:60,elevation:22});
export const EARTH=G.frameOf([0,0,230],[0,1,0],[1,0,0],[0,0,-1]);
export const BALL_Z=230+90*O.R0/O.R;
export const project=s=>K.iso([s[0]*90/O.R,18,230+s[1]*90/O.R],P);
const line=(d,tone="lo",free)=>K.lineSvg(d,{tone,free});
const stroke=(points,tone="lo",free)=>line(K.pathOf(points.map(p=>K.iso(p,P))),tone,free);
export function needle(v){const a=(-210+v/12*240)*Math.PI/180;return K.pathOf([[91,43,43],[91+12*Math.cos(a),43+12*Math.sin(a),43]].map(p=>K.iso(p,P)));}
let fixed;
export function scene(){
  if(fixed)return fixed;
  const parts=[];
  const put=(name,at,paths,material,inner,shape)=>parts.push({name,at,svg:`<g class="material-${material}">${K.solidSvg(paths,{inner:inner||"",tone:name.startsWith("base")||name.startsWith("foot")?"lo":"mid"})}</g>`,shape});
  const cylinder=(name,x,y,r,z,h,m="brass",detail="")=>{const inner=detail==="knurl"?line(K.knurl(x,y,r,z,z+h,32,P,0)):detail==="screw"?stroke([[x-r,y,z+h],[x+r,y,z+h]],"mid"):detail==="ring"?line(K.ring(x,y,r-1.5,z+h,P)):detail;put(name,[x,y,z+h/2],K.cylinder(x,y,r,z,h,P,64,.35),m,inner,{type:"cylinder",x,y,r,z,h});};
  const slab=(name,plan,z,h,m="brass",inner="")=>put(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],K.slabOf(plan,z,h,P,8,.4),m,inner,{type:"slab",plan,z,h});
  const rect=(name,x,y,w,d,z,h,m="brass",inner="")=>slab(name,{x,y,w,d,r:0},z,h,m,inner);
  const disc=(name,F,s0,s1,r,m="brass",inner="")=>put(name,G.add3(F.o,G.mul3(F.a,(s0+s1)/2)),G.lathe([[s0,r,1],[s1,r,1]],F,P,{smooth:{slope:()=>0}}),m,inner,{type:"disc",F,s0,s1,r});
  const screw=(name,x,y,z,r=1.5)=>cylinder(name,x,y,r,z,.7,"silver","screw");
  for(const[i,[x,y]]of[[-104,-61],[104,-61],[-104,61],[104,61]].entries()){
    cylinder(`stand.pad.${i}`,x,y,11,-18,3,"iron");cylinder(`foot.shoe.${i}`,x,y,9,-15,3);
    cylinder(`foot.adjuster.${i}`,x,y,7,-12,10,"wood","knurl");cylinder(`foot.collar.${i}`,x,y,11,-2,4);
  }
  slab("base.trim",PLAN,2,3);slab("base.wood",PLAN,5,15,"wood",line(K.sideSeam(PLAN,8,P))+line(K.sideSeam(PLAN,17,P)));
  slab("base.top",PLAN,20,2,"enamel",line(K.planOutline(K.insetPlan(PLAN,7),22,P)));
  for(const[i,[x,y]]of[[-112,-69],[112,-69],[-112,69],[112,69]].entries())screw(`base.screw.${i}`,x,y,22,2);
  const plaque={x:-42,y:61,w:84,d:11,r:1.5};
  slab("plaque",plaque,22,.8,"brass",line(K.planOutline(K.insetPlan(plaque,1),22.8,P))+K.faceTextSvg(K.topMatrix([0,66.5],22.8,P),"NEWTON · VIII",{anchor:"middle",size:3.4,tone:"hi"}));
  screw("plaque.screw.0",-37,66.5,22.8,1);screw("plaque.screw.1",37,66.5,22.8,1);
  cylinder("pedestal.mount",0,-24,19,22,5,"brass","ring");
  for(const[i,a]of[45,135,225,315].entries()){const t=a*Math.PI/180;screw(`pedestal.screw.${i}`,14*Math.cos(t),-24+14*Math.sin(t),27,1.3);}
  cylinder("pedestal.lower",0,-24,8,27,110,"iron");cylinder("pedestal.collar",0,-24,11,137,7,"brass","knurl");
  cylinder("pedestal.upper",0,-24,5,144,79,"iron");
  disc("earth.bearing",EARTH,-28,-20,7,"brass",line(G.circleOf(EARTH,-20,5,P)));
  disc("earth.axle",EARTH,-20,-8,3,"silver");
  disc("earth.rim",EARTH,-8,-5,93,"brass",line(G.circleOf(EARTH,-5,91,P)));
  disc("earth.body",EARTH,-5,13,90,"iron");
  let engraving=[88,4].map(r=>line(G.circleOf(EARTH,14,r,P))).join("");
  for(const ratio of [.3,.6]){let pts=[];for(let i=0;i<=160;i++){const a=i*O.TAU/160;pts.push([90*ratio*Math.cos(a),14,230+88*Math.sin(a)]);}engraving+=stroke(pts,"lo");}
  for(const ratio of [-.6,-.3,0,.3,.6]){const z=ratio*88,half=Math.sqrt(88*88-z*z);engraving+=stroke([[-half,14,230+z],[half,14,230+z]],"lo");}
  const continents=[
    [[-68,44],[-55,57],[-42,64],[-23,57],[-25,44],[-36,34],[-28,21],[-35,12],[-44,25],[-57,30]],
    [[-32,9],[-18,6],[-10,-8],[-16,-23],[-22,-32],[-28,-52],[-35,-61],[-40,-43],[-38,-23],[-46,-7]],
    [[4,45],[17,58],[35,55],[44,62],[62,50],[77,26],[66,20],[57,27],[48,14],[42,9],[35,24],[21,26],[14,35]],
    [[13,25],[34,19],[41,2],[31,-14],[24,-32],[12,-23],[9,-4],[0,8]],
    [[53,-35],[67,-29],[75,-40],[65,-50],[52,-47]],
    [[-20,73],[-6,76],[0,65],[-13,62]]
  ];
  engraving+=continents.map(poly=>`<path class="land" d="${K.pathOf(poly.map(([x,z])=>K.iso([x,14,230+z],P)),true)}"/>`).join("");
  disc("earth.face",EARTH,13,14,90,"enamel",engraving);
  const polygon=[[-42,-60],[-25,-91.7],[-5,-91.7],[14,-60]];
  const mountainLines=stroke([[-42,24,290],[-17,24,321.7],[14,24,290]],"mid")+stroke([[-17,24,321.7],[-8,24,290]],"lo");
  put("mountain.relief",[-14,19,313],G.prismOf(EARTH,polygon,14,24,P),"silver",mountainLines,{type:"prism",F:EARTH,polygon,s0:14,s1:24});
  rect("cannon.platform",-29,11,25,14,321.7,.8,"brass");
  for(const[i,x]of[-22,-9].entries()){
    const F=G.frameOf([x,0,325],[0,1,0],[1,0,0],[0,0,-1]);
    disc(`cannon.axle.${i}`,F,13,23,.9,"silver");
    for(const[j,[a,b]]of[[11,13],[23,25]].entries()){
      let spokes=line(G.circleOf(F,b,1,P));for(let k=0;k<6;k++){const t=k*O.TAU/6;spokes+=stroke([[x+Math.cos(t),b,325+Math.sin(t)],[x+2.5*Math.cos(t),b,325+2.5*Math.sin(t)]],"mid");}
      disc(`cannon.wheel.${i}.${j}`,F,a,b,2.5,"iron",spokes);
    }
  }
  rect("cannon.chassis",-24,14,17,8,325.9,BALL_Z-3.2-325.9,"wood");
  const F=G.frameOf([0,18,BALL_Z],[1,0,0],[0,1,0],[0,0,1]);
  disc("cannon.barrel",F,-25,-7,3.2,"brass",line(G.circleOf(F,-7,2.6,P)));
  disc("cannon.rearband",F,-28,-25,3.9,"iron",line(G.circleOf(F,-25,3.2,P)));
  disc("cannon.breech",F,-30,-28,1.7,"brass");
  disc("cannon.muzzle",F,-7,-3.3,3.9,"iron",line(G.circleOf(F,-3.3,2.9,P))+`<path class="bore" d="${G.circleOf(F,-3.3,2.45,P)}"/>`);
  cylinder("dial.mount",91,43,20,22,4,"brass","ring");
  cylinder("dial.stem",91,43,9,26,8,"iron");cylinder("dial.case",91,43,18,34,7,"brass","knurl");
  cylinder("dial.rim",91,43,17,41,1,"iron","ring");
  let ticks=[11,13.8,15.5].map(r=>line(K.ring(91,43,r,43,P))).join("");
  for(let i=0;i<=24;i++){const a=(-210+i*10)*Math.PI/180,r=i%2?13.8:11;ticks+=stroke([[91+15.5*Math.cos(a),43+15.5*Math.sin(a),43],[91+r*Math.cos(a),43+r*Math.sin(a),43]],i%2?"lo":"mid");}
  ticks+=`<path class="iso-line" data-tone="hi" data-free="both" data-needle d="${needle(O.CIRCULAR)}"/>`;
  cylinder("dial.face",91,43,16,42,1,"ivory",ticks);cylinder("dial.pin",91,43,1.3,43,.8,"brass");
  fixed=parts;return fixed;
}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>`<g data-part="${name}">${map.get(name).svg}</g>`).join("");}
