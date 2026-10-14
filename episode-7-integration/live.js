import * as K from "./kit/iso-kit.mjs";
import * as O from "./model.mjs";
import * as S from "./scene.mjs";
import * as D from "./painter.mjs";

const byId=id=>document.getElementById(id),stage=document.querySelector(".stage"),drawing=document.querySelector(".drawing"),curve=document.querySelector(".curve"),machine=byId("machine");
const reduced=matchMedia("(prefers-reduced-motion: reduce)"),geometryCache=new WeakMap();
const refs=new Map([...machine.children].map(node=>[node.dataset.part,node])),rects=[...byId("rectangles").children];
const diskMark=machine.querySelector("[data-disk-lines]"),wheelMark=machine.querySelector("[data-wheel-lines]"),needleMark=machine.querySelector("[data-needle]");
const n=O.number,textCache=new Map(),set=(id,text)=>{if(textCache.get(id)!==text){byId(id).textContent=text;textCache.set(id,text);}};
let state={...O.DEFAULTS},x=state.x,target=x,playing=!reduced.matches,touched=false,visible=true,hover=false,focused=false,frame=0,previous=null,warmup=0,hold=0,tourIndex=0,zoom=false,zoomMix=0,lastOrder="",lastConfig="";
let plotWidth=720,plotStep=106;
const screenX=value=>52+plotStep*value,screenY=value=>123-48*value;
const path=points=>points.map((p,i)=>`${i?"L":"M"}${p[0].toFixed(3)} ${p[1].toFixed(3)}`).join("");
function layout(){
  plotWidth=matchMedia("(max-width:760px)").matches?380:720;plotStep=(plotWidth-84)/6;
  curve.setAttribute("viewBox",`0 0 ${plotWidth} 267`);
  let grid="";
  for(let i=0;i<=6;i++){const sx=screenX(i);grid+=`<path class="grid" d="M${sx} 27V219"/><text x="${sx}" y="242" text-anchor="middle">${i}</text>`;}
  for(const i of [-2,-1,0,1,2]){const sy=screenY(i);grid+=`<path class="grid" d="M52 ${sy}H${plotWidth-32}"/><text x="38" y="${sy+3}" text-anchor="end">${i<0?"−"+Math.abs(i):i}</text>`;}
  byId("plot-grid").innerHTML=grid;byId("plot-axis").setAttribute("d",`M52 27V219M52 123H${plotWidth-32}`);byId("axis-x-label").setAttribute("x",plotWidth-16);lastConfig="";
}
function sync(){
  for(const id of ["amplitude","a","n","speed"])byId(id).value=state[id];
  byId("x").min=state.a;byId("show-rectangles").checked=state.rectangles;
}
function configure(){
  const key=`${state.profile}/${state.amplitude}`;if(key===lastConfig)return;lastConfig=key;
  document.querySelectorAll("[data-profile]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.profile===state.profile)));
  set("experiment-description",O.PROFILES[state.profile].description);
  set("function-formula",`f(x) = ${n(state.amplitude)} × (${O.PROFILES[state.profile].formula})`);
  byId("function-curve").setAttribute("d",path(Array.from({length:181},(_,i)=>{const t=i/30;return[screenX(t),screenY(state.amplitude*O.ordinate(state.profile,t))];})));
}
function graph(s){
  const cuts=[state.a,...(state.profile==="signed"&&state.a<3&&x>3?[3]:[]),x];let positive="",negative="";
  for(let i=1;i<cuts.length;i++){
    const a=cuts[i-1],b=cuts[i];if(b-a<1e-9)continue;
    const points=[[screenX(a),screenY(0)],...Array.from({length:65},(_,j)=>{const t=a+(b-a)*j/64;return[screenX(t),screenY(state.amplitude*O.ordinate(state.profile,t))];}),[screenX(b),screenY(0)]];
    const d=path(points)+"Z";if(O.ordinate(state.profile,(a+b)/2)>=0)positive+=d;else negative+=d;
  }
  byId("area-positive").setAttribute("d",positive);byId("area-negative").setAttribute("d",negative);
  const boxes=O.rectangles(state,x);
  rects.forEach((rect,i)=>{const show=state.rectangles&&i<boxes.length&&x>state.a;rect.toggleAttribute("hidden",!show);if(show){const b=boxes[i];rect.setAttribute("x",screenX(b.left));rect.setAttribute("width",Math.max(0,plotStep*(b.right-b.left)));rect.setAttribute("y",Math.min(123,screenY(b.height)));rect.setAttribute("height",48*Math.abs(b.height));}});
  const sx=screenX(x),sa=screenX(state.a),sy=screenY(s.f);
  byId("bound-a").setAttribute("d",`M${sa} 27V219`);byId("bound-x").setAttribute("d",`M${sx} 27V219`);
  byId("curve-point").setAttribute("cx",sx);byId("curve-point").setAttribute("cy",sy);
  const together=Math.abs(sx-sa)<45;
  set("bound-label",together?Math.abs(x-state.a)<1e-8?`a = x = ${n(x,1)}`:`a = ${n(state.a,1)} · x = ${n(x,1)}`:`a = ${n(state.a,1)}`);byId("bound-label").setAttribute("x",sa);byId("bound-label").setAttribute("text-anchor",sa>plotWidth-130?"end":"start");
  byId("x-label").toggleAttribute("hidden",together);set("x-label",`x = ${n(x,1)}`);byId("x-label").setAttribute("x",sx);byId("x-label").setAttribute("text-anchor",sx>plotWidth-90?"end":"middle");
}
function draw(s){
  const parts=S.scene(state,x),order=D.orderParts(parts,S.P,geometryCache),translation=K.translateAlong(S.P,[s.r,0,0]);
  for(const p of parts)if(p.moving)refs.get(p.name).setAttribute("transform",translation);
  const key=order.join("/");
  if(key!==lastOrder){let next=null;for(let i=order.length-1;i>=0;i--){const node=refs.get(order[i]);if(node.nextElementSibling!==next)machine.insertBefore(node,next);next=node;}lastOrder=key;}
  diskMark.setAttribute("d",S.diskLines(s.theta));wheelMark.setAttribute("d",S.wheelLines(s.phi));needleMark.setAttribute("d",S.needle(s.phi));
  const factor=1+zoomMix*1.15,w=S.WIDTH/factor,h=S.HEIGHT/factor,focus=K.iso([5,0,123],S.P),cx=S.WIDTH/2+(focus[0]-S.WIDTH/2)*zoomMix,cy=S.HEIGHT/2+(focus[1]-S.HEIGHT/2)*zoomMix;
  drawing.setAttribute("viewBox",`${cx-w/2} ${cy-h/2} ${w} ${h}`);
}
function readings(s){
  set("area-value",n(s.net));set("turns-value",n(s.turns,3));set("amplitude-value",`${n(state.amplitude)}×`);set("a-value",`${n(state.a,1)} u`);
  set("model-x",`x = ${n(x)} u`);byId("x").value=x;
  set("readout",`f(x) = ${n(s.f)} u · radio con signo: ${n(s.r)} mm · disco: ${n(s.theta*180/Math.PI,1)}°`);
  for(const [id,value]of[["positive",s.positive],["negative",s.negative],["geometric",s.geometric],["sum",s.sum],["error",s.error]])set(`${id}-value`,`${n(value,id==="sum"||id==="error"?3:2)} u²`);
  set("discovery",Math.abs(s.f)<1e-8?"En el centro, la rueda se detiene; el área deja de cambiar por un instante.":s.f<0?"La rueda gira al revés: el área neta disminuye.":"La rueda gira hacia delante: el área neta aumenta.");
  set("stage-state",reduced.matches?"Recorrido manual · sin animación":s.finished?"Fin del recorrido":playing?(!touched&&(hover||focused)?"Recorrido automático en pausa":touched?"Recorrido en marcha":"Recorrido automático"):"Recorrido en pausa");
  const running=playing&&!reduced.matches;
  set("play-label",reduced.matches?"Avanzar":running?"Pausar":s.finished?"Repetir":"Reproducir");
  byId("play").setAttribute("aria-label",reduced.matches?"Avanzar x en 0,1 unidades sin animación":running?"Pausar el recorrido":"Reproducir el recorrido");
  byId("pause-icon").style.display=running?"block":"none";byId("play-icon").style.display=running?"none":"block";
  Object.assign(stage.dataset,{x:x.toFixed(8),target:target.toFixed(8),a:state.a,profile:state.profile,amplitude:state.amplitude,n:state.n,net:s.net.toFixed(10),geometric:s.geometric.toFixed(10),f:s.f.toFixed(10),r:s.r.toFixed(10),phi:s.phi.toFixed(10),theta:s.theta.toFixed(10),turns:s.turns.toFixed(10),rate:s.rate.toFixed(10),sum:s.sum.toFixed(10),error:s.error.toFixed(10),playing:String(playing),touring:String(!touched),visible:String(visible),finished:String(s.finished)});
}
function render(){configure();const s=O.snapshot(state,x);draw(s);graph(s);readings(s);}
function cancel(){if(frame)cancelAnimationFrame(frame);frame=0;previous=null;}
function manual(){touched=true;playing=false;hold=0;cancel();}
function needsFrame(){return !reduced.matches&&(Math.abs(target-x)>1e-6||Math.abs(zoomMix-(zoom?1:0))>1e-5||playing&&(touched||!hover&&!focused));}
function schedule(){if(!frame&&visible&&!document.hidden&&needsFrame())frame=requestAnimationFrame(tick);}
function tick(now){
  frame=0;if(!visible||document.hidden||reduced.matches){previous=null;return;}
  const dt=previous===null?0:Math.min(1/30,(now-previous)/1000);previous=now;
  zoomMix+=((zoom?1:0)-zoomMix)*(1-Math.exp(-10*dt));if(Math.abs(zoomMix-(zoom?1:0))<1e-5)zoomMix=zoom?1:0;
  if(playing&&(touched||!hover&&!focused)){
    warmup+=dt;
    if(touched||warmup>1.4){
      if(x>=O.END-1e-8){
        if(touched)playing=false;
        else{hold+=dt;if(hold>1.1){const tour=["wave","signed","ramp","constant"];tourIndex=(tourIndex+1)%tour.length;state.profile=tour[tourIndex];state.a=0;state.amplitude=1;x=target=0;hold=0;sync();}}
      }else x=target=Math.min(O.END,x+dt*state.speed);
    }
  }else if(Math.abs(target-x)>1e-6){x+=(target-x)*(1-Math.exp(-15*dt));if(Math.abs(target-x)<1e-5)x=target;}
  render();if(!needsFrame())previous=null;schedule();
}
function reset(values={},announcement=""){manual();Object.assign(state,values);x=target=state.a;sync();render();schedule();if(announcement)set("announcement",announcement);}
function choose(value,instant=false){manual();target=O.clamp(value,state.a,O.END);if(reduced.matches||instant||!visible)x=target;render();schedule();}
function action(){
  touched=true;
  if(reduced.matches){choose(x>=O.END?state.a:x+.1,true);return;}
  if(playing){playing=false;cancel();}else{target=x;if(x>=O.END)x=target=state.a;playing=true;previous=null;}
  render();schedule();
}
document.querySelectorAll("[data-profile]").forEach(button=>button.addEventListener("click",()=>reset({profile:button.dataset.profile},`Función seleccionada: ${O.PROFILES[button.dataset.profile].name}. Contador a cero.`)));
for(const id of ["amplitude","a"])byId(id).addEventListener("input",()=>reset({[id]:Number(byId(id).value)}));
byId("play").addEventListener("click",action);byId("reset").addEventListener("click",()=>reset({},"Recorrido reiniciado en x igual a a. Contador a cero."));
byId("x").addEventListener("input",()=>choose(Number(byId("x").value)));
byId("speed").addEventListener("change",()=>{touched=true;state.speed=Number(byId("speed").value);render();schedule();});
byId("n").addEventListener("change",()=>{manual();state.n=Number(byId("n").value);render();schedule();});
byId("show-rectangles").addEventListener("change",()=>{manual();state.rectangles=byId("show-rectangles").checked;render();schedule();});
function keyboard(e){
  if([" ","Enter","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key))e.preventDefault();
  if(e.key===" "||e.key==="Enter")action();
  else if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key))choose(target+(["ArrowRight","ArrowUp"].includes(e.key)?1:-1)*(e.shiftKey?.5:.1));
  else if(e.key==="Home"||e.key==="End")choose(e.key==="Home"?state.a:O.END);
  else if(e.key.toLowerCase()==="r")reset();else if(e.key==="Escape"){manual();target=x;render();}
}
stage.addEventListener("keydown",keyboard);curve.addEventListener("keydown",keyboard);
let drag=null;
function startDrag(e,source){if(e.button!==0)return;manual();source.focus({preventScroll:true});drag={source,start:e.clientX,x};source.setPointerCapture(e.pointerId);stage.classList.add("dragging");if(source===curve)moveDrag(e);}
function moveDrag(e){if(!drag)return;if(drag.source===curve){const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(curve.getScreenCTM().inverse());choose((point.x-52)/plotStep);}else choose(drag.x+(e.clientX-drag.start)/stage.clientWidth*6);}
function endDrag(){drag=null;stage.classList.remove("dragging");}
for(const source of [stage,curve]){source.addEventListener("pointerdown",e=>startDrag(e,source));source.addEventListener("pointermove",moveDrag);for(const event of ["pointerup","pointercancel","lostpointercapture"])source.addEventListener(event,endDrag);}
stage.addEventListener("pointerenter",()=>{hover=true;if(!touched)cancel();render();});stage.addEventListener("pointerleave",()=>{hover=false;previous=null;render();schedule();});
document.querySelector("main").addEventListener("focusin",()=>{focused=true;if(!touched)cancel();render();});
document.querySelector("main").addEventListener("focusout",()=>{queueMicrotask(()=>{focused=document.querySelector("main").contains(document.activeElement);previous=null;schedule();});});
const notes={disk:"El disco convierte el avance de x en un giro: 60° por unidad.",carriage:"El carro fija el radio con signo: r = 24 f(x) mm/u.",wheel:"La rueda acumula el área: una vuelta neta equivale a 3 u²."};
let inspected="";
function inspect(name){stage.dataset.inspect=name;set("part-note",notes[name]||"La esfera muestra la fracción de vuelta; el contador conserva las vueltas completas.");document.querySelectorAll("[data-inspect]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.inspect===name)));}
document.querySelectorAll("[data-inspect]").forEach(button=>{button.addEventListener("pointerenter",()=>inspect(button.dataset.inspect));button.addEventListener("pointerleave",()=>inspect(inspected));button.addEventListener("focus",()=>inspect(button.dataset.inspect));button.addEventListener("blur",()=>inspect(inspected));button.addEventListener("click",()=>{inspected=inspected===button.dataset.inspect?"":button.dataset.inspect;inspect(inspected);});});
byId("zoom").addEventListener("click",()=>{manual();zoom=!zoom;if(reduced.matches)zoomMix=zoom?1:0;stage.classList.toggle("zoomed",zoom);byId("zoom").setAttribute("aria-pressed",String(zoom));byId("zoom").setAttribute("aria-label",zoom?"Mostrar el aparato completo":"Ampliar el mecanismo");set("zoom",zoom?"Vista completa ↙":"Ampliar mecanismo ↗");render();schedule();});
byId("cancellation").addEventListener("click",()=>{reset({profile:"signed",amplitude:1,a:0},"Áreas positiva y negativa iguales: la integral entre 0 y 6 es cero.");choose(6,true);stage.scrollIntoView({block:"center",behavior:reduced.matches?"auto":"smooth"});});
function themeLabel(){byId("theme").setAttribute("aria-label",document.body.dataset.theme==="dark"?"Cambiar al tema claro":"Cambiar al tema oscuro");}
byId("theme").addEventListener("click",()=>{document.body.dataset.theme=document.body.dataset.theme==="dark"?"light":"dark";themeLabel();});
document.addEventListener("visibilitychange",()=>{cancel();schedule();});
new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;cancel();stage.dataset.visible=String(visible);schedule();},{threshold:.05}).observe(stage);
reduced.addEventListener("change",()=>{manual();x=target;zoomMix=zoom?1:0;render();});
window.addEventListener("resize",()=>{layout();render();});
layout();sync();render();themeLabel();schedule();

MechanicalPlayback.bind({stop:()=>{cancel();},refresh:()=>{visible=MechanicalPlayback.inView(stage);hover=stage.matches(':hover');focused=document.querySelector("main").contains(document.activeElement);drag=null;},resume:()=>{render();schedule();}});
