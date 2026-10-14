const $=id=>document.getElementById(id),stage=document.querySelector('.stage'),machine=$('machine');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),cache=new WeakMap();
const refs=new Map([...machine.children].map(el=>[el.dataset.part,el]));
let state={...O.DEFAULTS},phase=0,playing=!reduced.matches,auto=!reduced.matches,visible=true,hover=false,drag=null,last=0,tour=0,renderedMode='',ordered='',dirty=true;
let raf=0;
const fmt=(n,d=2)=>n.toLocaleString('es-CR',{minimumFractionDigits:d,maximumFractionDigits:d});
const norm=p=>(p%O.TAU+O.TAU)%O.TAU;
let cordRefs,bodyRef,markerRef=refs.get('rotor.marker').firstElementChild;
const needleRef=document.querySelector('[data-needle]'),spokeRef=document.querySelector('[data-spokes]');
function stopTour(){auto=false;dirty=true;}
function setValues(values,announce=true){state=O.settings({...state,...values});dirty=true;if(announce)$('announcement').textContent=state.mode==='pendulum'?'Péndulo cónico preparado.':'Plataforma giratoria preparada.';}
function updateModel(){
  const s=O.snapshot(state,phase),pend=s.mode==='pendulum';
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===s.mode)));
  $('pendulum-controls').hidden=!pend;$('platform-controls').hidden=pend;
  for(const id of ['angle','mass','radius','rpm']){$(id).value=state[id];$(id+'-value').textContent=fmt(state[id],id==='angle'||id==='rpm'?0:2)+(id==='angle'?'°':id==='mass'?' kg':id==='radius'?' m':' rpm');}
  if(renderedMode!==s.mode)$('experiment-title').innerHTML=pend?'Un hilo.<br>Dos componentes.':'Más giro.<br>Más fuerza.';
  $('experiment-description').textContent=pend?'La tensión sostiene la esfera y la desvía hacia el centro. El hilo describe un cono; la esfera recorre un círculo horizontal.':'Una masa se desliza sin rozamiento sobre el disco. El hilo radial aporta la fuerza hacia el centro; la superficie sostiene su peso.';
  $('stage-mode').textContent=pend?'Péndulo · longitud de 1 m':'Plataforma · hilo radial';
  $('force-value').textContent=fmt(s.force);$('speed-value').textContent=fmt(s.speed);
  $('actual-radius').textContent=fmt(s.r)+' m';$('omega-value').textContent=fmt(s.omega)+' rad/s';$('period-value').textContent=s.omega?fmt(s.period)+' s':'Sin giro';
  $('tension-label').textContent=pend?'Tensión total del hilo':'Tensión radial del hilo';$('tension-value').textContent=fmt(s.tension)+' N';
  $('discovery').textContent=pend?'La componente vertical equilibra el peso. La horizontal produce el giro.':s.omega?'A igual radio, duplicar el giro exige cuatro veces más fuerza.':'Sin giro, la masa está en reposo y no necesita fuerza centrípeta.';
  $('readout').textContent=pend?`T · cos θ = ${fmt(s.vertical)} N = mg  /  T · sen θ = ${fmt(s.force)} N`:`Fuerza radial = ${fmt(s.mass)} × ${fmt(s.omega)}² × ${fmt(s.r)} = ${fmt(s.force)} N`;
  needleRef.setAttribute('d',S.needle(s.force));
  $('play-label').textContent=reduced.matches?'Avanzar':playing?'Pausar':'Continuar';$('play-symbol').textContent=reduced.matches?'＋':playing?'Ⅱ':'▶';
  stage.dataset.mode=s.mode;stage.dataset.force=s.force;stage.dataset.omega=s.omega;
  document.querySelectorAll('[data-compare]').forEach(b=>{const high=s.mode==='platform'&&Math.abs(s.r-.65)<1e-8&&(b.dataset.compare==='mass'?s.mass===.5&&state.rpm===30:s.mass===.25&&state.rpm===60);b.dataset.high=String(high);b.setAttribute('aria-pressed',String(high));b.textContent=b.dataset.compare==='mass'?(high?'Volver a 0,25 kg ↗':'Comparar 0,25 y 0,50 kg ↗'):(high?'Volver a 30 rpm ↗':'Comparar 30 y 60 rpm ↗');});
}
function render(){
  if(dirty){updateModel();dirty=false;}
  const parts=S.scene(state,phase,false),cord=parts.at(-3),mass=parts.at(-2),marker=parts.at(-1);
  if(renderedMode!==state.mode){
    refs.get('subject.mass').innerHTML=S.massSvg(state.mode,mass.at);bodyRef=refs.get('subject.mass').firstElementChild;
    // The cord's topology is constant; only its geometric path slots change.
    if(!cordRefs){const root=refs.get('subject.cord');cordRefs={fill:root.querySelector('.iso-fill'),top:root.querySelector('.iso-top'),outline:root.querySelector('.iso-edge'),shades:[...root.querySelectorAll('.iso-shade')]};}
    renderedMode=state.mode;
  }
  const paths=S.cordPaths(cord.shape);
  for(const key of ['fill','top','outline'])cordRefs[key].setAttribute('d',paths[key]||'');
  cordRefs.shades.forEach((el,i)=>el.setAttribute('d',paths.shades?.[i]||''));
  bodyRef.setAttribute('transform',K.translateAlong(S.P,state.mode==='pendulum'?mass.at:[mass.at[0],mass.at[1],49]));
  markerRef.setAttribute('transform',K.translateAlong(S.P,[marker.at[0],marker.at[1],49]));
  spokeRef.setAttribute('d',S.spokes(phase));
  const order=D.orderParts(parts,S.P,cache),key=order.join('|');
  if(key!==ordered){for(const name of order)machine.appendChild(refs.get(name));ordered=key;}
  const degrees=norm(phase)*180/Math.PI;
  $('phase').value=degrees;$('phase-value').textContent=`φ = ${fmt(degrees,0)}°`;
  const c=Math.cos(phase),q=Math.sin(phase),x=175+67*c,y=105-67*q;
  $('direction-mass').setAttribute('cx',x);$('direction-mass').setAttribute('cy',y);
  $('force-vector').setAttribute('d',`M${x} ${y}l${-40*c} ${40*q}`);
  $('velocity-vector').setAttribute('d',O.snapshot(state).omega?`M${x} ${y}l${-45*q} ${-45*c}`:'');
  $('force-vector').hidden=state.mode==='platform'&&state.rpm===0;
  $('force-vector').style.display=state.mode==='platform'&&state.rpm===0?'none':'';
  $('direction-note').textContent=state.mode==='platform'&&state.rpm===0?'Sin giro: velocidad y fuerza centrípeta nulas.':'La fuerza es perpendicular a la velocidad.';
  stage.dataset.phase=phase;
  stage.dataset.playing=String(playing&&!reduced.matches);
  stage.dataset.auto=String(auto);
  stage.dataset.active=String(visible&&!document.hidden&&!(auto&&hover));
  $('stage-state').textContent=drag?'Recorriendo el círculo':auto?'Demostración automática':reduced.matches?'Exploración paso a paso':!O.snapshot(state).omega?'En reposo':playing?'Movimiento circular uniforme':'Animación en pausa';
}
function scrub(p){stopTour();playing=false;phase=norm(p);dirty=true;render();}
for(const id of ['angle','mass','radius','rpm'])$(id).addEventListener('input',()=>{stopTour();setValues({[id]:+$(id).value},false);render();});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{stopTour();setValues({mode:b.dataset.mode});render();}));
$('phase').addEventListener('input',()=>scrub(+$('phase').value*Math.PI/180));
$('rate').addEventListener('change',stopTour);
function play(){stopTour();if(reduced.matches)phase=norm(phase+Math.PI/12);else playing=!playing;dirty=true;render();}
function reset(){stopTour();state={...O.DEFAULTS};phase=0;playing=false;dirty=true;render();$('announcement').textContent='Experimento restablecido.';}
$('play').addEventListener('click',play);$('reset').addEventListener('click',reset);
document.querySelectorAll('[data-compare]').forEach(b=>b.addEventListener('click',()=>{stopTour();const mass=b.dataset.compare==='mass';const high=b.dataset.high==='true';document.querySelectorAll('[data-compare]').forEach(x=>x.dataset.high='false');b.dataset.high=String(!high);setValues({mode:'platform',radius:.65,mass:mass&&!high?.5:.25,rpm:!mass&&!high?60:30});playing=!reduced.matches;phase=0;render();$('announcement').textContent=high?'Ejemplo inicial: 0,25 kg y 30 rpm.':mass?'Masa duplicada: la fuerza se duplica.':'Giro duplicado: la fuerza se cuadruplica.';stage.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});}));
stage.addEventListener('keydown',e=>{if(e.target!==stage)return;if(['ArrowLeft','ArrowRight','Home','End',' ','r','R'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key==='ArrowRight')scrub(phase+(e.key==='ArrowRight'?1:-1)*(e.shiftKey?15:5)*Math.PI/180);if(e.key==='Home')scrub(0);if(e.key==='End')scrub(O.TAU-1e-8);if(e.key===' ')play();if(e.key.toLowerCase()==='r')reset();});
stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;stopTour();playing=false;drag={x:e.clientX,phase,id:e.pointerId};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');dirty=true;render();});
stage.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){phase=norm(drag.phase+(e.clientX-drag.x)/stage.clientWidth*O.TAU);render();}});
function release(){drag=null;stage.classList.remove('dragging');render();}
stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',()=>{if(drag)release();});
document.querySelector('.exhibit').addEventListener('pointerenter',()=>{hover=true;render();});document.querySelector('.exhibit').addEventListener('pointerleave',()=>{hover=false;last=0;render();});
document.querySelector('.exhibit').addEventListener('focusin',stopTour);
new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;last=0;render();},{threshold:.08}).observe(stage);
document.addEventListener('visibilitychange',()=>{last=0;render();});
reduced.addEventListener('change',()=>{playing=!reduced.matches;auto=false;dirty=true;last=0;render();});
function themeLabel(){$('theme').setAttribute('aria-label',document.body.dataset.theme==='dark'?'Cambiar al tema claro':'Cambiar al tema oscuro');}
themeLabel();$('theme').addEventListener('click',()=>{document.body.dataset.theme=document.body.dataset.theme==='dark'?'light':'dark';themeLabel();});
function frame(now){
  raf=0;
  const dt=last?Math.min(.05,(now-last)/1000):0;last=now;
  if(visible&&!document.hidden&&!reduced.matches&&!(auto&&hover)&&!drag){
    if(auto){tour+=dt;const segment=Math.floor(tour/10)%4,t=tour%10/10;
      const values=segment<2?{mode:'pendulum',angle:segment===0?35+20*t:55-20*t,mass:.25}:{mode:'platform',rpm:segment===2?30+30*t:60-30*t,radius:.65,mass:.25};
      setValues(values,false);playing=true;
    }
    if(playing){phase=norm(phase+O.snapshot(state).omega*+$('rate').value*dt);render();}
  }
  raf=requestAnimationFrame(frame);
}
render();raf=requestAnimationFrame(frame);

MechanicalPlayback.bind({stop:()=>{if(raf)cancelAnimationFrame(raf);raf=0;last=0;},refresh:()=>{visible=MechanicalPlayback.inView(stage);hover=document.querySelector('.exhibit').matches(':hover');drag=null;},resume:()=>{render();if(!raf)raf=requestAnimationFrame(frame);}});
