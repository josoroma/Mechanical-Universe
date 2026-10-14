const $=id=>document.getElementById(id),bench=document.querySelector('.comparison-bench');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const figures=[...document.querySelectorAll('.instrument')].map(el=>{
  const machine=el.querySelector('.machine'),refs=new Map([...machine.children].map(x=>[x.dataset.part,x]));
  const arms=[0,1].map(i=>{const root=refs.get(`beam.arm.${i}`);return {fill:root.querySelector('.iso-fill'),top:root.querySelector('.iso-top'),outline:root.querySelector('.iso-edge'),shades:[...root.querySelectorAll('.iso-shade')]};});
  return {el,machine,refs,arms,kind:el.dataset.kind,stage:el.querySelector('.stage'),cache:new WeakMap(),order:''};
});
const fmt=(n,d=2)=>n.toLocaleString('es-CR',{minimumFractionDigits:d,maximumFractionDigits:d});
const nN=n=>fmt(n*1e9,3),signed=n=>(n<0?'−':'+')+fmt(Math.abs(n),3);
let current={...O.DEFAULTS},target={...current},q2=-1,targetQ2=-1,auto=!reduced.matches,paused=false;
let tour=0,last=0,raf=0,visible=true,hover=false,drag=null;
const signedCharge=s=>s.charge*(s.polarity==='opposite'?-1:1);
const active=()=>visible&&!document.hidden&&!(auto&&hover);
const moving=()=>!paused&&(['distance','mass','charge'].some(k=>Math.abs(target[k]-current[k])>1e-7)||Math.abs(targetQ2-q2)>1e-7);
function controls(){
  for(const id of ['distance','mass','charge']){
    $(id).value=target[id];
    $(id).setAttribute('aria-valuetext',fmt(target[id],id==='charge'?3:2)+(id==='distance'?' metros':id==='mass'?' kilogramos':' nanoculombios'));
  }
  for(const {stage}of figures){stage.setAttribute('aria-valuenow',target.distance);stage.setAttribute('aria-valuetext',`Distancia: ${fmt(target.distance)} metros`);}
  document.querySelectorAll('[data-polarity]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.polarity===target.polarity)));
  document.querySelectorAll('[data-preset]').forEach(b=>{const preset=O.PRESETS.find(p=>p.id===b.dataset.preset);b.setAttribute('aria-pressed',String(['distance','mass','charge','polarity'].every(k=>preset.values[k]===target[k])));});
}
function render(){
  const s=O.snapshot(current,q2);
  for(const figure of figures){
    const {kind,refs,machine,arms,cache}=figure,parts=S.scene(current,kind,false,q2);
    for(const part of parts.slice(-8)){
      if(part.name.startsWith('beam.arm.')){
        const slots=arms[+part.name.at(-1)],paths=S.armPaths(part.shape);
        for(const key of ['fill','top','outline'])slots[key].setAttribute('d',paths[key]||'');
        slots.shades.forEach((el,i)=>el.setAttribute('d',paths.shades?.[i]||''));
      }else{
        const xyz=part.shape.type==='cylinder'?[part.shape.x,part.shape.y,part.shape.z]:part.at;
        refs.get(part.name).firstElementChild.setAttribute('transform',K.translateAlong(S.P,xyz));
      }
    }
    const order=D.orderParts(parts,S.P,cache),key=order.join('|');
    if(key!==figure.order){const fragment=document.createDocumentFragment();for(const name of order)fragment.append(refs.get(name));machine.append(fragment);figure.order=key;}
    const electric=kind==='electric',reading=electric?s.electrostatic:s.gravitational;
    const direction=electric?(s.electric===0?'Sin fuerza eléctrica':s.signedElectric>0?'Atracción':'Repulsión'):'Siempre atractiva';
    $(`${kind}-force`).textContent=nN(electric?s.electric:s.gravity);
    $(`${kind}-direction`).textContent=direction;
    $(`${kind}-direction`).dataset.direction=electric&&s.signedElectric<0?'repulsion':'attraction';
    figure.el.querySelector('.stage-state').textContent=direction;
    $(`${kind}-scale`).textContent=`±${nN(reading.span)} nN · ±18°`;
    $(`${kind}-pair`).textContent=electric?`q₁ = ${signed(s.q1)} nC · q₂ = ${signed(s.q2)} nC`:`m₁ = m₂ = ${fmt(s.mass)} kg · r = ${fmt(s.distance)} m`;
    figure.el.dataset.angle=reading.angle;
  }
  for(const id of ['distance','mass','charge'])$(id+'-value').textContent=fmt(s[id],id==='charge'?3:2)+(id==='distance'?' m':id==='mass'?' kg':' nC');
  $('ratio-value').textContent=fmt(s.ratio,s.ratio<10?3:2);
  $('ratio-description').textContent=s.electric===0?'Sin carga, la interacción eléctrica es nula en este modelo. La gravedad sigue actuando.':Math.abs(s.ratio-1)<.02?'Para estas masas y cargas, las dos magnitudes son casi iguales.':s.ratio>1?'La fuerza electrostática supera a la gravitatoria para estas masas y cargas.':'La fuerza gravitatoria supera a la electrostática para estas masas y cargas.';
  $('net-title').textContent=s.electric===0?'Solo queda la gravedad.':s.signedElectric>=0?'Las fuerzas se suman.':Math.abs(s.ratio-1)<.02?'Casi se compensan.':'Las fuerzas se oponen.';
  $('net-value').textContent=nN(Math.abs(s.net));
  $('net-description').textContent=Math.abs(s.net)<1e-22?'Resultante nula: las dos fuerzas se compensan.':s.net>0?'Hacia la esfera fuente: la resultante es atractiva.':'En sentido contrario a la esfera fuente: la resultante es repulsiva.';
  $('net-equation').textContent=`${nN(s.gravity)} ${s.signedElectric<0?'−':'+'} ${nN(s.electric)} = ${s.net<0?'−':''}${nN(Math.abs(s.net))} nN`;
  $('double-distance').textContent=target.distance>.75?'Volver a 0,50 m ↗':'Comparar 0,50 y 1,00 m ↗';
  $('demo-label').textContent=reduced.matches?'Ver otro ejemplo':auto?'Pausar':'Ver demostración';
  $('demo-symbol').textContent=reduced.matches?'＋':auto?'Ⅱ':'▶';
  $('demo').setAttribute('aria-pressed',String(auto));
  $('status').textContent=reduced.matches?'Exploración sin animación':auto&&hover?'Demostración en pausa al señalar':auto?'Demostración automática':moving()?'Ajustando las balanzas':paused?'Demostración en pausa':'Exploración manual';
  for(const key of ['distance','mass','q1','q2','gravity','electric','signedElectric','ratio','net'])bench.dataset[key]=s[key];
  bench.dataset.auto=auto;bench.dataset.active=active();bench.dataset.moving=moving();
}
function wake(){
  if(reduced.matches){current={...target};q2=targetQ2;render();return;}
  render();
  if(!raf&&active()&&(auto||moving())){last=0;raf=requestAnimationFrame(frame);}
}
function setValues(values,announcement=''){
  auto=false;paused=false;target=O.settings({...target,...values});targetQ2=signedCharge(target);
  controls();if(announcement)$('announcement').textContent=announcement;wake();
}
function demo(){
  if(reduced.matches){const i=O.PRESETS.findIndex(p=>['distance','mass','charge','polarity'].every(k=>p.values[k]===target[k]));const next=O.PRESETS[(i+1)%O.PRESETS.length];setValues(next.values,`${next.name}.`);return;}
  if(auto){auto=false;paused=true;}else{auto=true;paused=false;tour=0;}
  wake();
}
function tourValues(t){
  t=Math.max(0,t-1.4)%30;
  if(t<10)return {...O.DEFAULTS,distance:t<5?.5-.25*Math.sin(Math.PI*t/5):.5+.5*Math.sin(Math.PI*(t-5)/5)};
  if(t<18)return {...O.DEFAULTS,polarity:'same',distance:.5-.25*Math.sin(Math.PI*(t-10)/8)};
  if(t<23)return {...O.DEFAULTS,charge:0,polarity:'same'};
  return {...O.DEFAULTS};
}
function frame(now){
  raf=0;if(!active()){last=0;render();return;}
  const dt=last?Math.min(.05,(now-last)/1000):0;last=now;
  if(auto){tour+=dt;target=tourValues(tour);targetQ2=signedCharge(target);controls();}
  if(!paused){
    const alpha=1-Math.exp(-dt/.18);
    for(const key of ['distance','mass','charge']){current[key]+=(target[key]-current[key])*alpha;if(Math.abs(target[key]-current[key])<1e-7)current[key]=target[key];}
    q2+=(targetQ2-q2)*alpha;if(Math.abs(targetQ2-q2)<1e-7)q2=targetQ2;
    current.polarity=target.polarity;
  }
  render();if(auto||moving())raf=requestAnimationFrame(frame);else last=0;
}
for(const id of ['distance','mass','charge'])$(id).addEventListener('input',()=>setValues({[id]:+$(id).value}));
document.querySelector('.settings-strip').addEventListener('focusin',()=>{auto=false;paused=false;wake();});
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{const p=O.PRESETS.find(p=>p.id===b.dataset.preset);setValues(p.values,`Comparación: ${p.name.toLowerCase()}.`);}));
document.querySelectorAll('[data-polarity]').forEach(b=>b.addEventListener('click',()=>setValues({polarity:b.dataset.polarity},b.dataset.polarity==='same'?'Cargas del mismo signo: repulsión.':'Cargas de signos opuestos: atracción.')));
$('demo').addEventListener('click',demo);
$('reset').addEventListener('click',()=>setValues(O.DEFAULTS,'Comparación restablecida.'));
$('neutral').addEventListener('click',()=>setValues({charge:0},'Cargas nulas. La gravedad permanece.'));
$('double-distance').addEventListener('click',()=>setValues({...O.DEFAULTS,distance:target.distance>.75?.5:1},'Distancia comparada: las fuerzas varían con el inverso del cuadrado.'));
for(const {el,stage}of figures){
  stage.addEventListener('keydown',e=>{
    if(e.target!==stage)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End',' ','r','R'].includes(e.key))e.preventDefault();
    if(e.key.startsWith('Arrow'))setValues({distance:target.distance+(['ArrowRight','ArrowUp'].includes(e.key)?1:-1)*(e.shiftKey?.1:.01)});
    if(e.key==='Home')setValues({distance:.2});if(e.key==='End')setValues({distance:1});if(e.key===' ')demo();if(e.key.toLowerCase()==='r')setValues(O.DEFAULTS,'Comparación restablecida.');
  });
  stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;setValues({});drag={stage,x:e.clientX,distance:target.distance,id:e.pointerId};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});
  stage.addEventListener('pointermove',e=>{if(drag?.stage===stage&&drag.id===e.pointerId)setValues({distance:drag.distance+(e.clientX-drag.x)/stage.clientWidth*.8});});
  function release(){if(drag?.stage===stage){drag=null;stage.classList.remove('dragging');}}
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
  el.addEventListener('pointerenter',()=>{hover=true;wake();});el.addEventListener('pointerleave',()=>{hover=false;wake();});
  el.addEventListener('focusin',()=>{auto=false;paused=false;wake();});
}
const intersections=new Map(figures.map(f=>[f.stage,true]));
const observer=new IntersectionObserver(entries=>{for(const e of entries)intersections.set(e.target,e.isIntersecting);visible=[...intersections.values()].some(Boolean);last=0;wake();},{threshold:.02});
figures.forEach(f=>observer.observe(f.stage));
document.addEventListener('visibilitychange',()=>{last=0;wake();});
reduced.addEventListener('change',()=>{auto=false;paused=false;last=0;wake();});
function themeLabel(){$('theme').setAttribute('aria-label',document.body.dataset.theme==='dark'?'Cambiar al tema claro':'Cambiar al tema oscuro');}
$('theme').addEventListener('click',()=>{document.body.dataset.theme=document.body.dataset.theme==='dark'?'light':'dark';themeLabel();});
themeLabel();controls();wake();

MechanicalPlayback.bind({stop:()=>{if(raf)cancelAnimationFrame(raf);raf=0;last=0;},refresh:()=>{for(const f of figures)intersections.set(f.stage,MechanicalPlayback.inView(f.stage));visible=[...intersections.values()].some(Boolean);hover=figures.some(f=>f.el.matches(':hover'));drag=null;},resume:()=>{wake();}});
