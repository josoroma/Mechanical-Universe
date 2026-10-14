import * as K from "./kit/iso-kit.mjs";
import * as O from "./model.mjs";
import * as S from "./scene.mjs";
import * as D from "./painter.mjs";

const byId=id=>document.getElementById(id),stage=document.querySelector(".stage"),drawing=document.querySelector(".drawing"),machine=byId("machine");
const reduced=matchMedia("(prefers-reduced-motion: reduce)"),cache=new WeakMap();
let state={...O.DEFAULTS},time=0,playing=!reduced.matches,touched=false,visible=true,frame=0,previous=null,hold=0,tourIndex=0,lastReadout=-1,lastMode="",lastOrder="",zoom=false,zoomMix=0;
let refs=new Map([...machine.children].map(node=>[node.dataset.part,node])),lastSVG=new Map();
const set=(id,text)=>{byId(id).textContent=text;},n=O.number;
const params=["m1","m2","v0","h1","h2","h3","angle","mass"];
function explain(){
  if(lastMode===state.mode)return;lastMode=state.mode;
  const at=state.mode==="atwood";
  document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mode===state.mode)));
  byId("atwood-settings").hidden=!at;byId("table-settings").hidden=at;byId("time-control").hidden=!at;byId("speed-control").hidden=!at;byId("table-time-note").hidden=at;
  set("experiment-tag",at?"01 · La máquina de Atwood":"02 · La mesa de fuerzas");
  byId("experiment-heading").innerHTML=at?"Dos masas.<br>Un mismo vínculo.":"Tres tensiones.<br>Una fuerza neta.";
  set("equation",at?"(m₂ − m₁)g = (m₁ + m₂)a":"ΣF = Ma₀");
  set("metric-a-label",at?"Aceleración del tramo":"Fuerza neta sobre M");set("metric-b-label",at?"Tensión de la cuerda":"Aceleración inicial");
  set("apparatus-note",at?"Polea ideal · cuerda inextensible":"Tres poleas · instante inicial");set("center-label",at?"La máquina de Atwood":"La mesa de fuerzas · t = 0");
  set("instrument-title",at?"La máquina de Atwood":"La mesa de fuerzas");
  set("instrument-description",at?"Dos portapesas cuelgan de una cuerda continua sobre una polea acanalada sostenida por un bastidor. Sus movimientos tienen igual módulo y sentidos opuestos.":"Tres cuerdas parten del cuerpo central y pasan sobre poleas hasta tres pesas colgantes. Las mordazas pueden sujetar el cuerpo. Un indicador muestra el módulo de su aceleración inicial.");
  set("force-intro",at?"Cada masa recibe su peso hacia abajo y la tensión hacia arriba. Sus fuerzas netas son distintas, aunque la cuerda impone aceleraciones de igual módulo y sentidos opuestos.":"Las tensiones actúan en las direcciones de las cuerdas. Con las mordazas cerradas hay que añadir su reacción; al liberar el cuerpo, la suma de las tensiones es Ma₀.");
  byId("force-equations").innerHTML=at?"<span>T − m₁g = m₁a</span><span>m₂g − T = m₂a</span>":"<span>ΣFₓ = Ma₀ₓ</span><span>ΣFᵧ = Ma₀ᵧ</span>";
  set("table-caption",at?"Fuerzas verticales · positivo hacia arriba":"Fuerzas horizontales sobre el cuerpo central · t = 0");
  byId("force-head").innerHTML=at?"<tr><th scope=\"col\">Cuerpo</th><th scope=\"col\">Masa (kg)</th><th scope=\"col\">Peso (N)</th><th scope=\"col\">Tensión (N)</th><th scope=\"col\">ΣFᵧ (N)</th></tr>":"<tr><th scope=\"col\">Fuerza</th><th scope=\"col\">Módulo (N)</th><th scope=\"col\">Fₓ (N)</th><th scope=\"col\">Fᵧ (N)</th></tr>";
  byId("force-body").innerHTML=at?[1,2].map(i=>`<tr><th scope="row">Masa m${i===1?"₁":"₂"}</th><td id="row-${i}-0"></td><td id="row-${i}-1"></td><td id="row-${i}-2"></td><td id="row-${i}-3"></td></tr>`).join(""):["Tensión 1","Tensión 2","Tensión 3","Mordazas","Fuerza neta"].map((label,i)=>`<tr><th scope="row">${label}</th><td id="row-${i}-0"></td><td id="row-${i}-1"></td><td id="row-${i}-2"></td></tr>`).join("");
  document.querySelectorAll("[data-preset]").forEach(b=>{b.hidden=O.PRESETS[b.dataset.preset].mode!==state.mode;});
}
function draw(){
  const parts=S.scene(state,time),P=S.PROJECTIONS[state.mode],order=D.orderParts(parts,P,cache),names=new Set(parts.map(p=>p.name));
  for(const [name,node]of refs)if(!names.has(name)){node.remove();refs.delete(name);lastSVG.delete(name);}
  for(const part of parts){
    let node=refs.get(part.name);if(!node){node=document.createElementNS("http://www.w3.org/2000/svg","g");node.dataset.part=part.name;refs.set(part.name,node);machine.append(node);}
    if(part.shape.type==="cylinder"&&node.firstElementChild&&lastSVG.has(part.name)){
      // Constant-size parts move by attributes. Only changed profiles rebuild.
      const signature=`${part.shape.r}/${part.shape.h}/${part.svg.slice(-50)}`;
      if(node.dataset.profile===signature)node.firstElementChild.setAttribute("transform",K.translateAlong(P,[part.shape.x,part.shape.y,part.shape.z]));
      else{node.innerHTML=part.svg;node.dataset.profile=signature;}
    }else if(lastSVG.get(part.name)!==part.svg){node.innerHTML=part.svg;if(part.shape.type==="cylinder")node.dataset.profile=`${part.shape.r}/${part.shape.h}/${part.svg.slice(-50)}`;}
    lastSVG.set(part.name,part.svg);
  }
  const key=`${state.mode}/${order.join("/")}`;
  if(key!==lastOrder){let next=null;for(let i=order.length-1;i>=0;i--){const node=refs.get(order[i]);if(node.nextElementSibling!==next)machine.insertBefore(node,next);next=node;}lastOrder=key;}
  const factor=1+zoomMix*(state.mode==="atwood"?1:.65),w=S.WIDTH/factor,h=S.HEIGHT/factor,focus=K.iso(state.mode==="atwood"?[0,0,235]:[0,0,160],P);
  const cx=S.WIDTH/2+(focus[0]-S.WIDTH/2)*zoomMix,cy=S.HEIGHT/2+(focus[1]-S.HEIGHT/2)*zoomMix;
  drawing.setAttribute("viewBox",`${cx-w/2} ${cy-h/2} ${w} ${h}`);
}
function syncControls(){for(const id of params)byId(id).value=state[id];byId("speed").value=state.speed;}
function readings(){
  explain();const at=state.mode==="atwood";
  for(const id of params){const digits=id==="angle"?1:id.startsWith("h")?3:2,unit=id==="angle"?"°":id==="v0"?" m/s":" kg";set(`${id}-value`,`${n(state[id],digits)}${unit}`);byId(id).setAttribute("aria-valuetext",`${n(state[id],digits)} ${id==="angle"?"grados":id==="v0"?"metros por segundo":"kilogramos"}`);}
  if(at){
    const s=O.atwood(state,time);set("metric-a",`${n(s.acceleration)} m/s²`);set("metric-b",`${n(s.tension)} N`);
    const equal=Math.abs(s.acceleration)<1e-9;
    set("experiment-description",equal?Math.abs(state.v0)<1e-9?"Los pesos son iguales y las tensiones los compensan. Sin velocidad inicial, las masas permanecen en reposo.":"Los pesos son iguales. La fuerza neta sobre cada masa es cero y ambas conservan su velocidad inicial.":s.acceleration>0?"m₂ tiende a descender y m₁ a ascender. La tensión es la misma en ambos extremos, pero no es igual a ninguno de los dos pesos.":"m₁ tiende a descender y m₂ a ascender. Al invertir el desequilibrio, también se invierte la aceleración.");
    set("discovery",equal?"Fuerza neta cero: la velocidad se conserva; no tiene por qué ser cero.":"El desequilibrio impulsa el sistema; la masa total se opone al cambio de velocidad.");
    for(const [i,m]of[[1,state.m1],[2,state.m2]])[m,m*O.G,s.tension,s.tension-m*O.G].forEach((v,j)=>set(`row-${i}-${j}`,n(v)));
    set("component-result",`${n(s.drive)} N ≈ ${n(s.total)} kg × ${n(s.acceleration)} m/s²`);
    set("readout",`t = ${n(s.time)} s · q = ${n(s.q)} m · v = ${n(s.velocity)} m/s`);
    set("model-time",`t = ${n(s.time)} s`);byId("time").value=1000*s.time/(Number.isFinite(s.endTime)?s.endTime:5);
    set("stage-state",s.finished?"Fotograma final · fin del tramo medido":reduced.matches?"Ensayo manual · movimiento reducido":playing?touched?"Ensayo en curso":"Ensayo automático":"Ensayo en pausa");
    set("play-label",reduced.matches?"Avanzar":playing?"Pausar":s.finished?"Repetir":"Reproducir");
    byId("play").setAttribute("aria-label",reduced.matches?"Avanzar una décima de segundo sin animación":playing?"Pausar el ensayo":"Reproducir el ensayo");
    set("result-note","Masas totales, incluidos los portapesas");
    Object.assign(stage.dataset,{time:s.time.toFixed(6),q:s.q.toFixed(6),velocity:s.velocity.toFixed(6),acceleration:s.acceleration.toFixed(8),tension:s.tension.toFixed(8),finished:String(s.finished)});
  }else{
    const s=O.table(state),acc=O.norm(s.acceleration),net=O.norm(s.net);
    set("metric-a",`${n(net)} N`);set("metric-b",`${n(acc)} m/s²`);
    set("experiment-description",state.held?"Las mordazas sujetan el cuerpo. Su reacción compensa la suma de las tres tensiones: la fuerza neta y la aceleración son cero.":s.balanced?"Las tres tensiones se compensan. Con las mordazas abiertas y partiendo del reposo, el cuerpo no acelera.":"Las mordazas están abiertas. La suma de las tensiones produce una aceleración inicial; las pesas colgantes también aceleran.");
    set("discovery",state.held?"Cuenta también las mordazas: una tracción desequilibrada puede coexistir con fuerza neta cero.":s.balanced?"Equilibrio: las fuerzas se compensan sin ayuda de las mordazas.":"Durante la aceleración, cada tensión puede diferir del peso de su pesa.");
    const forces=s.tensions.map((T,i)=>({magnitude:T,x:T*s.units[i].x,y:T*s.units[i].y}));forces.push({magnitude:O.norm(s.reaction),...s.reaction},{magnitude:net,...s.net});
    forces.forEach((v,i)=>[v.magnitude,v.x,v.y].forEach((v,j)=>set(`row-${i}-${j}`,n(v))));
    set("component-result",`(${n(s.net.x)}; ${n(s.net.y)}) N ≈ ${n(state.mass)} kg × (${n(s.acceleration.x)}; ${n(s.acceleration.y)}) m/s²`);
    set("readout",`Fₓ = ${n(s.net.x)} N · Fᵧ = ${n(s.net.y)} N · |a₀| = ${n(acc)} m/s²`);
    set("stage-state",state.held?"Mordazas cerradas · t = 0":"Cuerpo libre · instante inicial");set("play-label",state.held?"Liberar":"Sujetar");
    byId("play").setAttribute("aria-label",state.held?"Abrir las mordazas y observar el instante de liberación":"Cerrar las mordazas y sujetar el cuerpo");
    set("table-time-note",state.held?"Cuerpo sujeto y en reposo · t = 0":"Instante de liberación · t = 0");set("result-note",`Tracción: ${n(O.norm(s.traction))} N · reacción: ${n(O.norm(s.reaction))} N`);
    Object.assign(stage.dataset,{acceleration:acc.toFixed(8),fx:s.net.x.toFixed(8),fy:s.net.y.toFixed(8),held:String(state.held),balanced:String(s.balanced),angle:state.angle.toFixed(8)});
  }
  byId("pause-icon").style.display=at&&playing&&!reduced.matches?"block":"none";byId("play-icon").style.display=at&&playing&&!reduced.matches?"none":"block";
  document.querySelectorAll("[data-preset]").forEach(b=>{const p=O.PRESETS[b.dataset.preset];b.setAttribute("aria-pressed",String(Object.entries(p).every(([k,v])=>k==="name"||typeof v==="number"?k==="name"||Math.abs(state[k]-v)<1e-7:state[k]===v)));});
  Object.assign(stage.dataset,{mode:state.mode,playing:String(playing),touring:String(!touched),m1:state.m1,m2:state.m2});
}
function render(){explain();draw();readings();}
function pause(){playing=false;previous=null;hold=0;if(frame)cancelAnimationFrame(frame);frame=0;}
function schedule(){if(!frame&&visible&&!document.hidden&&!reduced.matches&&(playing||Math.abs(zoomMix-(zoom?1:0))>.0001))frame=requestAnimationFrame(tick);}
function tick(now){
  frame=0;if(!visible||document.hidden||reduced.matches){previous=null;return;}
  const dt=previous===null?0:Math.min(.08,(now-previous)/1000);previous=now;
  zoomMix+=((zoom?1:0)-zoomMix)*(1-Math.exp(-10*dt));if(Math.abs(zoomMix-(zoom?1:0))<.0001)zoomMix=zoom?1:0;
  if(playing&&state.mode==="atwood"){
    const before=O.atwood(state,time);if(before.finished||(!Number.isFinite(before.endTime)&&time>=5)){
      if(touched)playing=false;else{hold+=dt;if(hold>1.1){const tour=[O.DEFAULTS,O.PRESETS.equal,O.PRESETS.constant,O.PRESETS.reverse,O.PRESETS.inertia];tourIndex=(tourIndex+1)%tour.length;Object.assign(state,tour[tourIndex]);time=0;hold=0;syncControls();}}
    }else time=O.atwood(state,time+dt*state.speed).time;
  }
  draw();if(now-lastReadout>70||!playing){readings();lastReadout=now;}
  if(!playing&&zoomMix===(zoom?1:0))previous=null;schedule();
}
function change(values,announcement=""){
  touched=true;pause();const old=state.mode;Object.assign(state,values);time=0;
  if(old!==state.mode){machine.innerHTML="";refs.clear();lastSVG.clear();lastOrder="";lastMode="";}
  syncControls();render();schedule();if(announcement)set("announcement",announcement);
}
function action(){
  touched=true;
  if(state.mode==="table"){change({held:!state.held},state.held?"Mordazas abiertas. Se muestra el instante inicial de liberación.":"Mordazas cerradas. El cuerpo permanece sujeto.");return;}
  if(reduced.matches){pause();const s=O.atwood(state,time);time=s.finished?0:O.atwood(state,time+.1).time;render();return;}
  if(playing)pause();else{if(O.atwood(state,time).finished||time>=5&&!Number.isFinite(O.atwood(state).endTime))time=0;playing=true;previous=null;}
  render();schedule();
}
document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>change({mode:b.dataset.mode},`Aparato seleccionado: ${b.querySelector('.era-name').textContent}.`)));
document.querySelectorAll("[data-preset]").forEach(b=>b.addEventListener("click",()=>change(O.PRESETS[b.dataset.preset],`Caso seleccionado: ${O.PRESETS[b.dataset.preset].name}.`)));
byId("balance").addEventListener("click",()=>change(O.equilibrium(state),"La tercera fuerza compensa las dos primeras."));
for(const id of params)byId(id).addEventListener("input",()=>change({[id]:Number(byId(id).value)}));
byId("play").addEventListener("click",action);byId("reset").addEventListener("click",()=>change({...O.DEFAULTS,mode:state.mode},"Aparato e instante inicial restablecidos."));
byId("speed").addEventListener("change",()=>{touched=true;state.speed=Number(byId("speed").value);});
byId("time").addEventListener("input",()=>{touched=true;pause();const s=O.atwood(state);time=Number(byId("time").value)/1000*(Number.isFinite(s.endTime)?s.endTime:5);render();});
document.querySelector('[data-idea="constant"]').addEventListener("click",()=>{change(O.PRESETS.constant,"Masas iguales con velocidad inicial constante.");stage.scrollIntoView({block:"center",behavior:reduced.matches?"auto":"smooth"});});
stage.addEventListener("keydown",e=>{
  if(["1","2"," ","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key))e.preventDefault();
  if(e.key==="1"||e.key==="2")change({mode:e.key==="1"?"atwood":"table"});
  else if(e.key===" ")action();else if(e.key.toLowerCase()==="r")byId("reset").click();
  else if(e.key==="ArrowLeft"||e.key==="ArrowRight"){const sign=e.key==="ArrowRight"?1:-1;change(state.mode==="atwood"?{m2:O.clamp(state.m2+sign*.05,.25,1.25)}:{angle:O.clamp(state.angle+sign*5,185,295)});}
  else if(e.key==="ArrowUp"||e.key==="ArrowDown"){const sign=e.key==="ArrowUp"?1:-1;change(state.mode==="atwood"?{m1:O.clamp(state.m1+sign*.05,.25,1.25)}:{h3:O.clamp(state.h3+sign*.025,.1,.6)});}
  else if(e.key==="Home"||e.key==="End"){if(state.mode==="atwood"){touched=true;pause();const s=O.atwood(state);time=e.key==="Home"?0:Number.isFinite(s.endTime)?s.endTime:5;render();}else change({angle:e.key==="Home"?185:295});}
});
let drag=null;
stage.addEventListener("pointerdown",e=>{if(e.button!==0)return;touched=true;pause();stage.focus({preventScroll:true});drag={x:e.clientX,value:state.mode==="atwood"?state.m2:state.angle};stage.setPointerCapture(e.pointerId);stage.classList.add("dragging");});
stage.addEventListener("pointermove",e=>{if(!drag)return;const delta=(e.clientX-drag.x)/stage.clientWidth;if(state.mode==="atwood")change({m2:O.clamp(drag.value+delta,.25,1.25)});else change({angle:O.clamp(drag.value+delta*110,185,295)});});
const endDrag=()=>{drag=null;stage.classList.remove("dragging");};stage.addEventListener("pointerup",endDrag);stage.addEventListener("pointercancel",endDrag);stage.addEventListener("lostpointercapture",endDrag);
byId("zoom").addEventListener("click",()=>{touched=true;zoom=!zoom;if(reduced.matches)zoomMix=zoom?1:0;stage.classList.toggle("zoomed",zoom);byId("zoom").setAttribute("aria-pressed",String(zoom));byId("zoom").setAttribute("aria-label",zoom?"Mostrar el aparato completo":"Ampliar el mecanismo");set("zoom",zoom?"Vista completa ↙":"Ampliar mecanismo ↗");render();schedule();});
function themeLabel(){byId("theme").setAttribute("aria-label",document.body.dataset.theme==="dark"?"Cambiar al tema claro":"Cambiar al tema oscuro");}
byId("theme").addEventListener("click",()=>{touched=true;document.body.dataset.theme=document.body.dataset.theme==="dark"?"light":"dark";themeLabel();});
document.addEventListener("visibilitychange",()=>{previous=null;if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}schedule();});
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;previous=null;if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}schedule();},{threshold:.05}).observe(stage);
reduced.addEventListener("change",()=>{pause();zoomMix=zoom?1:0;render();});
syncControls();render();themeLabel();schedule();

MechanicalPlayback.bind({stop:()=>{if(frame)cancelAnimationFrame(frame);frame=0;previous=null;},refresh:()=>{visible=MechanicalPlayback.inView(stage);},resume:()=>{render();schedule();}});
