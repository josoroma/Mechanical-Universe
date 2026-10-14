const $=id=>document.getElementById(id),stage=document.querySelector('.stage'),svg=document.querySelector('.drawing'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const refs={ball:$('ball'),halo:$('ball-halo'),trail:$('trail'),prediction:$('prediction'),impact:$('impact'),needle:document.querySelector('[data-needle]')};
const fnum=(n,d=1)=>new Intl.NumberFormat('es',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Math.abs(n)<.5*10**(-d)?0:n);
let f=O.flight(O.CIRCULAR),t=0,target=0,playing=false,automatic=!reduced.matches,visible=true,frame=0,last=0,tourWait=1.4,tourIndex=1,zoomed=false,drag=null,prepared;
const labels={impact:'Impacto con la Tierra',circle:'Órbita circular',ellipse:'Órbita elíptica',escape:'Trayectoria de escape'};
const headings={impact:'Avanzar.<br>Y volver al suelo.',circle:'Una caída<br>que da la vuelta.',ellipse:'Alejarse.<br>Y regresar.',escape:'Ir más allá.<br>Sin regresar.'};
const descriptions={impact:O.PRESETS[0].description,circle:O.PRESETS[1].description,ellipse:O.PRESETS[2].description,escape:'La energía permite alejarse indefinidamente. La bala pierde rapidez mientras asciende, pero no regresa a la Tierra.'};
function prepare(){
  const points=Array.from({length:401},(_,i)=>S.project(O.at(f,f.duration*i/400).s)),prefix=[];let path='';
  points.forEach((p,i)=>{path+=(i?'L':'M')+p.map(x=>x.toFixed(2)).join(' ');prefix.push(path);});
  prepared={points,prefix};refs.prediction.setAttribute('d',path);refs.needle.setAttribute('d',S.needle(f.v));
  $('velocity').value=f.v;$('velocity-value').textContent=fnum(f.v,3)+' km/s';
  $('trajectory-title').innerHTML=headings[f.orbit.kind];$('experiment-description').textContent=descriptions[f.orbit.kind];
  if(f.orbit.kind==='ellipse'&&f.v<O.CIRCULAR){$('trajectory-title').innerHTML='Acercarse.<br>Y alejarse.';$('experiment-description').textContent='La bala se acerca primero a la Tierra y gana rapidez. Su órbita elíptica evita el suelo gracias a la altura inicial; después vuelve a alejarse.';}
  if(Math.abs(f.v-O.ESCAPE)<1e-8)$('experiment-description').textContent=O.PRESETS[3].description;
  document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',Math.abs(O.PRESETS.find(p=>p.id===b.dataset.preset).v-f.v)<1e-8));
  $('orbit-type').textContent=labels[f.orbit.kind];
}
function stoppedByUser(){automatic=false;playing=false;tourWait=0;}
function setVelocity(v,user=true){if(user)stoppedByUser();f=O.flight(v);t=target=0;prepare();render();if(user)wake();}
function seek(fraction){stoppedByUser();target=O.clamp(fraction,0,1)*f.duration;if(reduced.matches||!visible||document.hidden)t=target;render();wake();}
function render(){
  const p=O.at(f,t),xy=S.project(p.s),i=Math.min(400,Math.floor(t/f.duration*400));
  for(const node of [refs.ball,refs.halo,refs.impact]){node.setAttribute('cx',xy[0].toFixed(3));node.setAttribute('cy',xy[1].toFixed(3));}
  refs.trail.setAttribute('d',t>0?prepared.prefix[i]+'L'+xy.map(x=>x.toFixed(2)).join(' '):'');
  const finished=t>=f.duration-1e-5;refs.impact.toggleAttribute('hidden',!(finished&&f.event==='impact'));
  refs.impact.style.display=finished&&f.event==='impact'?'':'none';
  $('height-value').textContent=fnum(p.height,0);$('speed-value').textContent=fnum(p.speed,3);
  $('time-value').textContent='t = '+fnum(t/60,1)+' min';$('time').value=t/f.duration*1000;
  const state=finished?f.event==='impact'?'La bala ha tocado la superficie':f.event==='view'?'Fuera del campo de visión':'Una vuelta completa':playing?'Bala en vuelo':t>0?'Vuelo en pausa':'Listo para lanzar';
  $('stage-state').textContent=(automatic?'Demostración · ':'')+state;
  $('discovery').textContent=finished&&f.event==='view'?(f.orbit.kind==='escape'?'Sale del campo y seguirá alejándose. La energía permite el escape.':'Sale del campo, pero sigue ligada a la Tierra. Su órbita continúa fuera del dibujo.'):f.orbit.kind==='circle'?'En órbita, la gravedad sigue actuando.':f.orbit.kind==='ellipse'?'Más lejos: menor rapidez. Más cerca: mayor rapidez.':f.orbit.kind==='escape'?'Escapar exige energía nula o positiva.':'La superficie interrumpe esta trayectoria.';
  $('readout').textContent='g = '+fnum(p.g,3)+' m/s²  ·  ε = '+fnum(p.energy,3)+' km²/s²';
  $('play-label').textContent=reduced.matches?'Avanzar':playing?'Pausar':finished?'Repetir':t>0?'Continuar':'Lanzar';$('play-symbol').textContent=playing?'Ⅱ':'▶';
  stage.dataset.time=t.toFixed(6);stage.dataset.velocity=f.v;stage.dataset.kind=f.orbit.kind;stage.dataset.event=f.event;stage.dataset.duration=f.duration;stage.dataset.visible=visible;stage.dataset.playing=playing;stage.dataset.automatic=automatic;
}
function wake(){if(!frame&&visible&&!document.hidden&&!reduced.matches){last=0;frame=requestAnimationFrame(tick);}}
function tick(now){
  frame=0;if(!visible||document.hidden||reduced.matches)return;
  const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  if(playing){t=Math.min(f.duration,t+dt*Number($('rate').value));target=t;if(t>=f.duration){playing=false;tourWait=2;}}
  else if(Math.abs(target-t)>.0001){t+=(target-t)*(1-Math.exp(-14*dt));if(Math.abs(target-t)<.001)t=target;}
  else if(automatic){tourWait-=dt;if(tourWait<=0){if(t>=f.duration-1e-5){tourIndex=(tourIndex+1)%O.PRESETS.length;setVelocity(O.PRESETS[tourIndex].v,false);}playing=true;}}
  render();if(playing||automatic||Math.abs(target-t)>.0001)frame=requestAnimationFrame(tick);
}
function togglePlay(){
  automatic=false;
  if(reduced.matches){playing=false;t=target=t>=f.duration-1e-5?0:Math.min(f.duration,t+f.duration/12);}
  else{if(t>=f.duration-1e-5)t=target=0;playing=!playing;target=t;}
  render();$('announcement').textContent=$('stage-state').textContent;wake();
}
$('play').addEventListener('click',togglePlay);
$('reset').addEventListener('click',()=>{stoppedByUser();t=target=0;render();});
$('velocity').addEventListener('input',e=>setVelocity(Number(e.target.value)));
$('time').addEventListener('input',e=>seek(Number(e.target.value)/1000));
$('rate').addEventListener('change',()=>{automatic=false;render();});
$('show-prediction').addEventListener('change',e=>{automatic=false;refs.prediction.style.display=e.target.checked?'':'none';render();});
function choose(id){setVelocity(O.PRESETS.find(p=>p.id===id).v);$('announcement').textContent=labels[f.orbit.kind]+'. Velocidad inicial: '+fnum(f.v,3)+' kilómetros por segundo.';}
for(const b of document.querySelectorAll('[data-preset]'))b.addEventListener('click',()=>choose(b.dataset.preset));
$('circular').addEventListener('click',()=>choose('circle'));$('escape').addEventListener('click',()=>choose('escape'));
$('try-circle').addEventListener('click',()=>{choose('circle');stage.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});stage.focus({preventScroll:true});});
$('circular-value').textContent=fnum(O.CIRCULAR,3)+' km/s';$('escape-value').textContent=fnum(O.ESCAPE,3)+' km/s';
$('theme').addEventListener('click',()=>{const dark=document.body.dataset.theme!=='dark';document.body.dataset.theme=dark?'dark':'light';$('theme').setAttribute('aria-label',dark?'Cambiar al tema claro':'Cambiar al tema oscuro');});
$('theme').setAttribute('aria-label',document.body.dataset.theme==='dark'?'Cambiar al tema claro':'Cambiar al tema oscuro');
const cannon=K.iso([-16,18,S.BALL_Z-8],S.P);
$('zoom').addEventListener('click',()=>{zoomed=!zoomed;stage.classList.toggle('zoomed',zoomed);svg.setAttribute('viewBox',zoomed?`${cannon[0]-180} ${cannon[1]-110} 360 260`:`0 0 ${S.WIDTH} ${S.HEIGHT}`);$('zoom').setAttribute('aria-pressed',zoomed);$('zoom').textContent=zoomed?'Ver el vuelo completo ↙':'Ampliar el cañón ↗';});
stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;stoppedByUser();drag={id:e.pointerId,x:e.clientX,fraction:t/f.duration};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');stage.focus({preventScroll:true});render();});
stage.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;seek(drag.fraction+(e.clientX-drag.x)/stage.getBoundingClientRect().width);});
const finishDrag=()=>{drag=null;stage.classList.remove('dragging');};stage.addEventListener('pointerup',finishDrag);stage.addEventListener('pointercancel',finishDrag);stage.addEventListener('lostpointercapture',finishDrag);
stage.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End',' ','r','R'].includes(e.key))e.preventDefault();else return;if(e.key===' ')togglePlay();else if(e.key==='Home')seek(0);else if(e.key==='End')seek(1);else if(e.key.toLowerCase()==='r'){stoppedByUser();t=target=0;render();}else setVelocity(f.v+(['ArrowRight','ArrowUp'].includes(e.key)?1:-1)*(e.shiftKey ? .5 : .1));});
function gravityRender(){
  const r=Number($('distance').value),ratio=(r/O.R)**2,g=O.gravity(r);
  $('distance-value').textContent=fnum(r,0)+' km';$('gravity-value').textContent=fnum(g,g<.01?6:3);$('gravity-ratio').textContent=ratio<1.00001?'1':('1 / '+fnum(ratio,0));
  $('distance-point').setAttribute('cx',67+(r-O.R)/(O.MOON_DISTANCE-O.R)*297);
  $('gravity-explanation').textContent=ratio<1.00001?'En la superficie, la aceleración idealizada es de unos 9,82 m/s².':`A ${fnum(r/O.R,2)} radios terrestres, la atracción es ${fnum(ratio,0)} veces menor que en la superficie.`;
  document.querySelectorAll('[data-distance]').forEach(b=>b.setAttribute('aria-pressed',Math.abs(Number(b.dataset.distance)-r)<1));
}
$('distance').addEventListener('input',gravityRender);for(const b of document.querySelectorAll('[data-distance]'))b.addEventListener('click',()=>{$('distance').value=b.dataset.distance;gravityRender();});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;stage.dataset.visible=visible;if(!visible){cancelAnimationFrame(frame);frame=0;last=0;}else wake();},{threshold:.01}).observe(stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else wake();});
reduced.addEventListener('change',()=>{if(reduced.matches){automatic=playing=false;cancelAnimationFrame(frame);frame=0;t=target;render();}else{render();wake();}});
prepare();gravityRender();render();wake();

MechanicalPlayback.bind({stop:()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;},refresh:()=>{visible=MechanicalPlayback.inView(stage);drag=null;},resume:()=>{render();wake();}});
