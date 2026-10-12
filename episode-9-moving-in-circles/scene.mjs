import * as K from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as O from "./model.mjs";
export const WIDTH=1020,HEIGHT=740,PLAN={x:-180,y:-144,w:355,d:288,r:12};
export const P=K.fitProjection([...K.boxCorners(PLAN,-18,22),...K.boxCorners({x:-151,y:-6,w:157,d:12,r:0},228,238)],WIDTH,HEIGHT,{pad:62,azimuth:55,elevation:29});
export const PIVOT=[0,0,228],SCALE=120;
const line=(d,tone="lo",free)=>K.lineSvg(d,{tone,free});
const stroke=(points,tone="lo",free)=>line(K.pathOf(points.map(p=>K.iso(p,P))),tone,free);
export function needle(force){const a=(-210+force/40*240)*Math.PI/180;return K.pathOf([[130,105,42],[130+12*Math.cos(a),105+12*Math.sin(a),42]].map(p=>K.iso(p,P)));}
export function spokes(phase){let d="";for(let i=0;i<12;i++){const a=phase+i*O.TAU/12;d+=K.pathOf([[10*Math.cos(a),10*Math.sin(a),49],[113*Math.cos(a),113*Math.sin(a),49]].map(p=>K.iso(p,P)));}return d;}
export function cordPaths(shape){return G.disc(shape.s0,shape.s1,shape.r,shape.F,P);}
// All path slots exist so a rotating cord can be updated without replacing DOM.
export function cordSvg(paths){return `<g class="material-silver"><g class="iso-solid" data-seamless=""><path class="iso-fill" d="${paths.fill}"/>${[0,1,2,3].map(i=>`<path class="iso-shade" data-shade="${i}" d="${paths.shades?.[i]||""}"/>`).join("")}<path class="iso-top" d="${paths.top||""}"/><path class="iso-line iso-edge" data-tone="mid" d="${paths.outline}"/></g></g>`;}
let fixed;
const massPaths=G.sphereOf([0,0,0],7,P,{steps:48});
const puckPaths=K.cylinder(0,0,7,0,8,P,64,.35),markerPaths=K.cylinder(0,0,2,0,1,P,32,.2);
export function massSvg(mode,at){return mode==="pendulum"?`<g class="material-brass" transform="${K.translateAlong(P,at)}">${K.solidSvg(massPaths,{tone:"mid",lit:true})}</g>`:`<g class="material-brass" transform="${K.translateAlong(P,[at[0],at[1],49])}">${K.solidSvg(puckPaths,{tone:"mid",lit:true,inner:line(K.ring(0,0,5,8,P))+line(K.ring(0,0,1,8,P))+stroke([[-1,0,8],[1,0,8]],"mid")})}</g>`;}
export function staticParts(){
  if(fixed)return fixed;
  const parts=[];
  const put=(name,at,paths,material,inner,shape)=>parts.push({name,at,svg:`<g class="material-${material}">${K.solidSvg(paths,{inner:inner||"",tone:name.startsWith("base")||name.startsWith("foot")?"lo":"mid"})}</g>`,shape});
  const cylinder=(name,x,y,r,z,h,m="brass",detail="")=>{const inner=detail==="knurl"?line(K.knurl(x,y,r,z,z+h,32,P,0)):detail==="screw"?stroke([[x-r,y,z+h],[x+r,y,z+h]],"mid"):detail==="ring"?line(K.ring(x,y,r-1.5,z+h,P)):detail;put(name,[x,y,z+h/2],K.cylinder(x,y,r,z,h,P,64,.35),m,inner,{type:"cylinder",x,y,r,z,h});};
  const slab=(name,plan,z,h,m="brass",inner="")=>put(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],K.slabOf(plan,z,h,P,8,.4),m,inner,{type:"slab",plan,z,h});
  const screw=(name,x,y,z,r=1.5)=>cylinder(name,x,y,r,z,.7,"silver","screw");
  for(const[i,[x,y]]of[[-155,-115],[150,-115],[-155,115],[150,115]].entries()){
    cylinder(`stand.pad.${i}`,x,y,11,-18,3,"iron");cylinder(`foot.shoe.${i}`,x,y,9,-15,3);
    cylinder(`foot.adjuster.${i}`,x,y,7,-12,10,"wood","knurl");cylinder(`foot.collar.${i}`,x,y,11,-2,4);
  }
  slab("base.trim",PLAN,2,3);slab("base.wood",PLAN,5,15,"wood",line(K.sideSeam(PLAN,8,P))+line(K.sideSeam(PLAN,17,P)));
  slab("base.top",PLAN,20,2,"enamel",line(K.planOutline(K.insetPlan(PLAN,7),22,P)));
  for(const[i,[x,y]]of[[-167,-131],[162,-131],[-167,131],[162,131]].entries())screw(`base.screw.${i}`,x,y,22,2);
  const plaque={x:-42,y:125,w:84,d:11,r:1.5};
  slab("plaque",plaque,22,.8,"brass",line(K.planOutline(K.insetPlan(plaque,1),22.8,P))+K.faceTextSvg(K.topMatrix([0,130.5],22.8,P),"CÍRCULOS · IX",{anchor:"middle",size:3.4,tone:"hi"}));
  screw("plaque.screw.0",-37,130.5,22.8,1);screw("plaque.screw.1",37,130.5,22.8,1);
  cylinder("rotor.pedestal",0,0,17,22,6,"brass","ring");cylinder("rotor.axle",0,0,8,28,12,"silver");
  cylinder("rotor.rim",0,0,121,40,4,"brass","ring");cylinder("rotor.body",0,0,118,44,4,"iron");
  let rings=[10,40,80,113].map(r=>line(K.ring(0,0,r,49,P))).join("");
  rings+=`<path class="iso-line" data-tone="lo" data-spokes d="${spokes(0)}"/>`;
  cylinder("rotor.face",0,0,118,48,1,"enamel",rings);
  cylinder("rotor.hub",0,0,5,49,8,"brass","ring");screw("rotor.screw",0,0,57,1.5);
  cylinder("support.mount",-145,0,15,22,6,"brass","ring");
  for(const[i,a]of[45,135,225,315].entries()){const t=a*Math.PI/180;screw(`support.screw.${i}`,-145+11*Math.cos(t),11*Math.sin(t),28,1.3);}
  cylinder("support.lower",-145,0,7,28,92,"iron");cylinder("support.collar",-145,0,10,120,8,"brass","knurl");
  cylinder("support.upper",-145,0,5,128,104,"iron");
  slab("support.arm",{x:-151,y:-6,w:157,d:12,r:0},232,6,"brass");
  screw("support.arm.screw.0",-145,0,238,2);screw("support.arm.screw.1",0,0,238,2);
  cylinder("pivot.bearing",0,0,6,231,1,"iron","ring");cylinder("pivot.neck",0,0,2,230,1,"brass");
  put("pivot.ball",PIVOT,G.sphereOf(PIVOT,2,P,{steps:32}),"brass","",{type:"ball",at:PIVOT,r:2});
  cylinder("dial.mount",130,105,20,22,4,"brass","ring");cylinder("dial.stem",130,105,8,26,7,"iron");
  cylinder("dial.case",130,105,18,33,7,"brass","knurl");cylinder("dial.rim",130,105,17,40,1,"iron","ring");
  let ticks=[11,13.8,15.5].map(r=>line(K.ring(130,105,r,42,P))).join("");
  for(let i=0;i<=24;i++){const a=(-210+i*10)*Math.PI/180,r=i%2?13.8:11;ticks+=stroke([[130+15.5*Math.cos(a),105+15.5*Math.sin(a),42],[130+r*Math.cos(a),105+r*Math.sin(a),42]],i%2?"lo":"mid");}
  ticks+=`<path class="iso-line" data-tone="hi" data-free="both" data-needle d="${needle(O.snapshot().force)}"/>`;
  cylinder("dial.face",130,105,16,41,1,"ivory",ticks);cylinder("dial.pin",130,105,1.3,42,.8,"brass");
  fixed=parts;return fixed;
}
export function scene(values=O.DEFAULTS,phase=0,draw=true){
  const s=O.snapshot(values,phase),pend=s.mode==="pendulum",d=[Math.cos(phase),Math.sin(phase),0];
  const at=pend?[SCALE*s.position[0],SCALE*s.position[1],228+SCALE*s.position[2]]:[SCALE*s.r*d[0],SCALE*s.r*d[1],53];
  const direction=pend?G.unit3(G.sub3(at,PIVOT)):d;
  const shape={type:"disc",F:G.frameAlong(pend?PIVOT:[0,0,53],direction),s0:pend?2:5,s1:pend?113:SCALE*s.r-7,r:.35};
  const cord={name:"subject.cord",at:G.add3(shape.F.o,G.mul3(direction,(shape.s0+shape.s1)/2)),shape,svg:draw?cordSvg(cordPaths(shape)):""};
  const mass={name:"subject.mass",at,shape:pend?{type:"ball",at,r:7}:{type:"cylinder",x:at[0],y:at[1],r:7,z:49,h:8},svg:draw?massSvg(s.mode,at):""};
  const x=-100*d[0],y=-100*d[1],marker={name:"rotor.marker",at:[x,y,49.5],shape:{type:"cylinder",x,y,r:2,z:49,h:1},svg:draw?`<g class="material-brass" transform="${K.translateAlong(P,[x,y,49])}">${K.solidSvg(markerPaths,{tone:"mid"})}</g>`:""};
  return [...staticParts(),cord,mass,marker];
}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>`<g data-part="${name}">${map.get(name).svg}</g>`).join("");}
