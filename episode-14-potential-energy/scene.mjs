import * as K from './kit/iso-kit.mjs';
import * as G from './kit/lathe.mjs';
import * as T from './kit/tube.mjs';
import * as O from './model.mjs';
export const WIDTH=1000,HEIGHT=680,SCALE=200,SPRING_SCALE=110,WIRE_RADIUS=.18,RADIUS=8,CENTRE_Z=46,LANES=[-44,-12];
export const PLAN={x:-164,y:-86,w:328,d:210,r:10};
export const P=K.fitProjection([...K.boxCorners(PLAN,-14,22),[-138,-54,103],[138,-54,103]],WIDTH,HEIGHT,{pad:36,azimuth:70,elevation:34});
const line=(d,tone='lo')=>K.lineSvg(d,{tone}),path=points=>K.pathOf(points.map(p=>K.iso(p,P)));
const make=(name,at,shape,paths,material='brass',inner='')=>({name,at,shape,paths,material,inner});
export function bodySvg(p){const a=p.paths;return `<g class="material-${p.material}"><g class="iso-solid" data-tone="mid"><path class="iso-fill" d="${a.fill}"/>${[0,1,2,3].map(i=>`<path class="iso-shade" data-shade="${i}" d="${a.shades[i]||''}"/>`).join('')}<path class="iso-top" d="${a.top||''}"/><path class="iso-line iso-crease" data-tone="faint" d="${a.crease||''}"/><path class="iso-line iso-edge" data-tone="mid" d="${a.outline}"/>${p.inner||''}</g></g>`;}
const FY={o:[0,0,0],a:[0,1,0],u:[1,0,0],v:[0,0,1]};
export function floorSamples(){
  const tangents=Array.from({length:81},(_,i)=>{const x=-.64+i*.016,s=x/O.R,n=Math.hypot(1,s),px=x*SCALE+RADIUS*s/n,pz=CENTRE_Z+SCALE*O.height(x)-RADIUS/n;return{x:px,z:pz,s,b:pz-s*px};});
  const joins=tangents.slice(0,-1).map((p,i)=>{const q=tangents[i+1],x=(q.b-p.b)/(p.s-q.s);return[x,p.s*x+p.b];});
  return tangents.map((t,i)=>{const a=i?joins[i-1]:[t.x,t.z],b=i===80?[t.x,t.z]:joins[i];return{a,b};});
}
let fixedParts;
export function fixed(){
  if(fixedParts)return fixedParts;const parts=[];
  const slab=(name,plan,z,h,m='brass',inner='')=>parts.push(make(name,[plan.x+plan.w/2,plan.y+plan.d/2,z+h/2],{type:'slab',plan,z,h},K.slabOf(plan,z,h,P,6,.35),m,inner));
  const c=(name,x,y,r,z,h,m='brass',inner='')=>parts.push(make(name,[x,y,z+h/2],{type:'cylinder',x,y,r,z,h},K.cylinder(x,y,r,z,h,P,40,.3),m,inner));
  const screw=(name,x,y,z,r=.9)=>c(name,x,y,r,z,.5,'silver',line(path([[x-r,y,z+.5],[x+r,y,z+.5]])));
  for(const[i,[x,y]]of[[-142,-67],[142,-67],[-142,105],[142,105]].entries()){c(`stand.pad.${i}`,x,y,9,-14,3,'iron');c(`foot.body.${i}`,x,y,6,-11,9,'brass',line(K.knurl(x,y,6,-11,-2,28,P,0)));c(`foot.collar.${i}`,x,y,10,-2,4);}
  slab('base.trim',PLAN,2,3);slab('base.wood',PLAN,5,15,'wood',line(K.sideSeam(PLAN,9,P,6))+line(K.sideSeam(PLAN,17,P,6)));slab('base.cover',PLAN,20,2,'enamel',line(K.planOutline(K.insetPlan(PLAN,5),22,P,6)));
  for(const[i,[x,y]]of[[-155,-77],[155,-77],[-155,115],[155,115]].entries())screw(`base.screw.${i}`,x,y,22,1.3);
  slab('well.plinth',{x:-139,y:-60,w:278,d:64,r:3},22,8,'enamel');
  for(const[j,y]of LANES.entries())for(const[i,{a,b}]of floorSamples().entries()){
    const polygon=[[a[0],30],[b[0],30],b,a],paths=G.prismOf(FY,polygon,y-10,y+10,P);
    paths.crease='';paths.outline=path([[a[0],y+10,30],[b[0],y+10,30]])+path([[a[0],y+10,a[1]],[b[0],y+10,b[1]]]);
    if(i===0)paths.outline+=path([[a[0],y-10,a[1]],[a[0],y+10,a[1]],[a[0],y+10,30]]);
    if(i===80)paths.outline+=path([[b[0],y-10,b[1]],[b[0],y+10,b[1]],[b[0],y+10,30]]);
    const coating=K.pathOf([[a[0],y-10,a[1]],[b[0],y-10,b[1]],[b[0],y+10,b[1]],[a[0],y+10,a[1]]].map(p=>K.iso(p,P)),true);
    const inner=`<path class="liner-face" d="${coating}"/>`+line(path([[a[0],y+10,33],[b[0],y+10,33]]),'faint');
    parts.push(make(`well.${j}.bed.${i}`,[(a[0]+b[0])/2,y,(30+(a[1]+b[1])/2)/2],{type:'prism',F:FY,polygon,s0:y-10,s1:y+10},paths,'wood',inner));
  }
  const rule={x:-129,y:13,w:258,d:6,r:1};slab('ruler.well',rule,22,.6,'ivory');const tick=K.topTicks(-125,125,4,5,13,22.6,[1.8,3.8],P);parts.at(-1).inner=line(tick.minor)+line(tick.major,'mid');
  for(const[y,id]of[[52,'rear'],[76,'front']]){slab(`spring.rail.${id}`,{x:-138,y,w:276,d:4,r:1},22,4,'silver');}
  for(const x of[-138,134]){slab(`spring.stop.${x}`,{x,y:50,w:4,d:32,r:1},26,5,'brass');screw(`spring.stop.screw.${x}.0`,x+2,53,31,.8);screw(`spring.stop.screw.${x}.1`,x+2,79,31,.8);}
  slab('spring.anchor',{x:-155,y:60,w:8,d:16,r:1},22,24,'enamel');screw('spring.anchor.screw.0',-151,63,46,.8);screw('spring.anchor.screw.1',-151,73,46,.8);
  const F=G.frameAlong([0,70,40],[1,0,0]);parts.push(make('spring.port.fixed',[-145,70,40],{type:'disc',F,s0:-147,s1:-143,r:1.8},G.disc(-147,-143,1.8,F,P),'brass'));
  const label={x:-48,y:104,w:96,d:8,r:1};slab('plaque',label,22,.6,'brass',line(K.planOutline(K.insetPlan(label,.7),22.6,P))+K.faceTextSvg(K.topMatrix([0,108],22.6,P),'POTENCIAL · XIV',{anchor:'middle',size:3,tone:'hi'}));screw('plaque.screw.0',-44,108,22.6,.7);screw('plaque.screw.1',44,108,22.6,.7);
  for(const p of parts)p.svg=bodySvg(p);fixedParts=parts;return parts;
}
export function defs(){return `<defs>${['brass','silver'].map(m=>`<radialGradient id="ball-${m}" class="material-${m}" cx="28%" cy="23%" r="80%"><stop offset="0" style="stop-color:var(--anatomy-top)"/><stop offset=".25" style="stop-color:var(--anatomy-shade-3)"/><stop offset=".7" style="stop-color:var(--anatomy-shade-1)"/><stop offset="1" style="stop-color:var(--anatomy-shade-0)"/></radialGradient>`).join('')}</defs>`;}
export function stripe(at,angle){const a=[Math.sin(angle),0,Math.cos(angle)],b=[0,1,0],V=G.viewOf(P),mid=Math.atan2(G.dot3(b,V),G.dot3(a,V));return path(Array.from({length:49},(_,i)=>{const t=mid-Math.PI/2+i*Math.PI/48;return G.add3(at,G.mul3(G.add3(G.mul3(a,Math.cos(t)),G.mul3(b,Math.sin(t))),RADIUS));}));}
export function balls(state){return state.balls.map((b,i)=>{const at=[b.x*SCALE,LANES[i],CENTRE_Z+O.height(b.x)*SCALE],[cx,cy]=K.iso(at,P),r=RADIUS*G.scaleOf(P),m=i?'silver':'brass',mark=stripe(at,b.angle);return{name:`ball.${b.id}`,at,shape:{type:'ball',at,r:RADIUS},ball:{cx,cy,r,mark},lit:!i,svg:`<g class="material-${m}"><circle class="ball-body" cx="${cx}" cy="${cy}" r="${r}" fill="url(#ball-${m})"/><circle class="ball-edge${i?'':' subject-edge'}" cx="${cx}" cy="${cy}" r="${r}"/><path class="iso-line ball-stripe" data-tone="lo" d="${mark}"/></g>`};});}
export function springRoute(x){
  const start=-143,end=x*SPRING_SCALE-9,from=start+3,to=end-3,points=[[start,70,40],[from,70,40]];
  for(let i=1;i<=240;i++){const u=i/240,f=u<.05?u*u/(.1*.95):u>.95?1-(1-u)**2/(.1*.95):(u-.025)/.95,a=12*Math.PI*f;points.push([from+(to-from)*u,67.5+2.5*Math.cos(a),40+2.5*Math.sin(a)]);}points.push([end,70,40]);return points;
}
export function springParts(x,render=true){
  const parts=[],wx=x*SPRING_SCALE,plan={x:wx-7,y:54,w:14,d:24,r:1.5};parts.push(make('spring.carriage',[wx,66,35],{type:'slab',plan,z:26,h:18},render?K.slabOf(plan,26,18,P,6,.5):null,'enamel',line(K.planOutline(K.insetPlan(plan,2),44,P))));
  const F=G.frameAlong([0,70,40],[1,0,0]);parts.push(make('spring.port.moving',[wx-8,70,40],{type:'disc',F,s0:wx-9,s1:wx-7,r:1.8},render?G.disc(wx-9,wx-7,1.8,F,P):null,'brass'));
  for(const[i,y]of[58,74].entries()){const r=.9,z=44,h=.5;parts.push(make(`spring.carriage.screw.${i}`,[wx,y,z+h/2],{type:'cylinder',x:wx,y,r,z,h},render?K.cylinder(wx,y,r,z,h,P,24,.2):null,'silver',line(path([[wx-r,y,z+h],[wx+r,y,z+h]]))));}
  const points=springRoute(x),length=G.pathLength(points),pieces=T.tubePieces(points,WIRE_RADIUS,P,{maxLength:1e6,spacing:.8,breaks:Array.from({length:31},(_,i)=>(i+1)*length/32),stripes:true});
  pieces.forEach((piece,i)=>parts.push({name:`spring.coil.${i}`,at:piece.mid,shape:{type:'tube',points:piece.points,r:WIRE_RADIUS,route:'spring.coil',chunk:i},tube:piece,svg:render?`<g class="material-silver">${T.tubeSvg(piece,{tone:'lo'})}</g>`:null}));
  if(render)for(const p of parts)if(!p.svg)p.svg=bodySvg(p);return parts;
}
export function scene(state=O.create()){return[...fixed(),...balls(state),...springParts(O.spring(state).x)];}
export function svgParts(parts,order){const map=new Map(parts.map(p=>[p.name,p]));return order.map(name=>`<g data-part="${name}">${map.get(name).svg}</g>`).join('');}
