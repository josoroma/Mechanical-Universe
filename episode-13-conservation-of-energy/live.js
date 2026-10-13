const $=id=>document.getElementById(id),stage=document.querySelector('.stage'),lab=document.querySelector('.laboratory'),machine=document.querySelector('.machine');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fmt=(x,d=1)=>new Intl.NumberFormat('es-CR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Math.abs(x)<.5*10**(-d)?0:x).replace(/-/g,'−');
const put=(id,text)=>{const el=$(id);if(el.textContent!==text)el.textContent=text;},say=text=>put('announcement',text);
let params={height:26,mass:500,gamma:0},state=O.create(params),paused=reduced.matches,auto=!reduced.matches,rate=.5,delay=reduced.matches?0:1.4;
let pending=null,armed=false,opacity=1,roll=0,records=[],hover=false,focusHold=false,visible=true,drag=null,raf=0,last=0,lastOrder='',lastRecorded=-1;
const fixed=S.fixed(),cache=new WeakMap(),refs=new Map([...machine.children].map(node=>[node.dataset.part,node]));
const paths=new Map([...refs].filter(([name])=>name.startsWith('car.')).map(([name,node])=>[name,{node,fill:node.querySelector('.iso-fill'),top:node.querySelector('.iso-top'),outline:node.querySelector('.iso-edge'),crease:node.querySelector('.iso-crease'),shades:[0,1,2,3].map(i=>node.querySelector(`[data-shade="${i}"]`)),details:[...node.querySelectorAll('.iso-line')].filter(el=>!el.matches('.iso-edge,.iso-crease'))}]));
function paint(){
  const cars=S.car(state.x,roll),parts=[...fixed,...cars];
  for(const part of cars){const r=paths.get(part.name),p=part.paths;for(const key of['fill','top','outline','crease'])r[key].setAttribute('d',p[key]||'');r.shades.forEach((el,i)=>el.setAttribute('d',p.shades[i]||''));r.details.forEach((el,i)=>el.setAttribute('d',part.details?.[i]||''));r.node.setAttribute('opacity',String(opacity));}
  const order=D.orderParts(parts,S.P,cache),signature=order.join('|');if(signature!==lastOrder){const fragment=document.createDocumentFragment();for(const name of order)fragment.append(refs.get(name));machine.append(fragment);lastOrder=signature;}
}
function renderRecords(){
  const tbody=$('records');tbody.replaceChildren();if(!records.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.className='empty';td.textContent='Todavía no hay observaciones. Avanza, pausa y guarda un instante del recorrido.';tr.append(td);tbody.append(tr);}
  for(const row of records){const tr=document.createElement('tr');for(const number of[row.t,row.h,row.speed,row.mechanical/1000,row.thermal/1000]){const td=document.createElement('td');td.textContent=fmt(number,2);tr.append(td);}tbody.append(tr);}
  put('record-count',`${records.length} / 3 observaciones`);$('clear-records').disabled=!records.length;
}
function describe(){stage.setAttribute('aria-valuenow',String(params.height));stage.setAttribute('aria-valuetext',`${fmt(params.height,0)} metros de altura inicial`);}
function render(draw=true){
  const s=O.snapshot(state);if(draw)paint();
  put('height-value',fmt(s.h,2));put('speed-value',fmt(s.speed,2));put('time-value',fmt(state.t,2));
  put('height-output',`${fmt(params.height,0)} m`);put('mass-output',`${fmt(params.mass,0)} kg`);$('height').value=String(params.height);$('mass').value=String(params.mass);$('friction').checked=!!params.gamma;
  for(const [name,value]of[['potential',s.potential],['kinetic',s.kinetic],['thermal',s.thermal],['total',s.total]])put(`${name}-value`,fmt(value/1000,1));
  for(const name of['potential','kinetic','thermal'])$(`bar-${name}`).style.width=`${Math.max(0,s[name]/s.total)*100}%`;
  put('initial-value',`Energía inicial: ${fmt(s.initial/1000,1)} kJ`);put('balance-description',state.gamma?'Con rozamiento: Eₘ disminuye; Eₘ + Q se conserva.':'Sin rozamiento: la energía mecánica Eₚ + E꜀ se conserva.');
  put('prediction',params.height>18?`Desde ${fmt(params.height,0)} m, la energía inicial permite superar la loma de 18 m si no hay rozamiento.`:params.height<18?`Desde ${fmt(params.height,0)} m, el carrito regresa antes de superar la loma de 18 m, incluso sin rozamiento.`:'18 m es la altura de la loma: el caso límite tiene rapidez nula en su cima.');
  put('record-context',`Prueba: ${fmt(state.h0,0)} m · ${fmt(state.mass,0)} kg · ${state.gamma?'con rozamiento':'sin rozamiento'}`);
  const speedRate=Math.sign(state.v)*(-O.G*s.slope/Math.hypot(1,s.slope)-state.gamma*state.v),change=Math.abs(speedRate)<.01?'rapidez casi constante':speedRate>0?'gana rapidez':'pierde rapidez';
  const location=Math.abs(s.slope)<.002?(s.h<3.01?'Cruza un valle':'Pasa por una cima'):s.descending?'Desciende':'Asciende';
  const move=pending?'Preparando la liberación':state.settled?'Equilibrio en un valle':s.speed<.02?(state.t?'Rapidez casi nula':`Preparado a ${fmt(s.h,0)} m`):`${location} · ${change}`;put('motion-state',move);
  put('status',reduced.matches?'Movimiento reducido · avance manual':pending?armed?'Preparando · salida programada':'Preparando una nueva prueba':auto&&(hover||focusHold)?'Demostración en pausa':auto&&delay>0?'Demostración lista para comenzar':paused?'Reloj en pausa':auto?'Demostración automática · sin rozamiento':state.gamma?'Exploración · con rozamiento':'Exploración · sin rozamiento');
  put('play',paused?'▶ Reanudar':'Ⅱ Pausar');$('play').disabled=reduced.matches||!!pending||state.settled;
  put('release',reduced.matches?'Volver al inicio':pending?(armed?'Preparando…':'Soltar al preparar'):'Soltar desde el inicio');$('release').disabled=!!pending&&armed;
  $('step').disabled=!!pending||state.settled;$('record').disabled=!!pending||records.length>=3||Math.abs(state.t-lastRecorded)<1e-8;
  $('tour').setAttribute('aria-pressed',String(auto));put('tour',reduced.matches?'Preparar demostración':'Demostración');
  Object.assign(lab.dataset,{x:String(state.x),v:String(state.v),height:String(s.h),height0:String(state.h0),mass:String(state.mass),gamma:String(state.gamma),time:String(state.t),speed:String(s.speed),potential:String(s.potential),kinetic:String(s.kinetic),thermal:String(s.thermal),total:String(s.total),initial:String(s.initial),error:String(s.error),turns:String(state.turns),records:String(records.length),auto:String(auto),paused:String(paused),ready:String(!pending),opacity:String(opacity),visible:String(visible),reduced:String(reduced.matches),rate:String(rate),settled:String(state.settled)});
}
function manual(){auto=false;delay=0;}
function applyPreparation(){state=O.create(params);roll=0;records=[];lastRecorded=-1;renderRecords();}
function prepare(run=false){manual();paused=true;armed=run&&!reduced.matches;describe();
  if(reduced.matches){pending=null;opacity=1;applyPreparation();say('Nueva prueba preparada desde el reposo. Avanza manualmente.');}
  else{pending='out';say('Se prepara una nueva liberación desde el reposo.');}
  render();wake();
}
function updateParams(){params={height:Number($('height').value),mass:Number($('mass').value),gamma:$('friction').checked?.09:0};prepare();}
function advancePhysical(dt){
  const before=state,oldSlope=O.track(before.x).slope*S.ZSCALE/S.XSCALE;state=O.advance(state,dt);
  const dx=(state.x-before.x)*S.XSCALE,dz=S.zAt(state.x)-S.zAt(before.x),newSlope=O.track(state.x).slope*S.ZSCALE/S.XSCALE;
  roll-=(dx*Math.cos(Math.atan(oldSlope))+dz*Math.sin(Math.atan(oldSlope)))/3.2+Math.atan(newSlope)-Math.atan(oldSlope);
  if(state.settled&&!before.settled){paused=true;say('El carrito se ha detenido en un valle. La energía transformada permanece en el balance térmico.');}
}
function frame(dt){
  if(pending){const target=pending==='out'?0:1;opacity=target+(opacity-target)*Math.exp(-dt/.07);
    if(pending==='out'&&opacity<.015){opacity=0;applyPreparation();pending='in';}
    else if(pending==='in'&&opacity>.998){opacity=1;pending=null;paused=!armed||reduced.matches;say(armed?'El carrito comienza el recorrido.':'Carrito preparado. Puedes soltarlo o avanzar manualmente.');armed=false;}return;}
  if(paused)return;if(delay>0){delay=Math.max(0,delay-dt);return;}advancePhysical(dt*rate);
}
function enabled(){return !document.hidden&&visible&&!(auto&&(hover||focusHold));}
function needsFrames(){return !reduced.matches&&(!!pending||!paused&&!state.settled);}
function stopClock(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
function tick(now){raf=0;if(!enabled()){last=0;return;}const dt=last?Math.min(1/30,Math.max(0,(now-last)/1000)):0;last=now;frame(dt);render();if(needsFrames())raf=requestAnimationFrame(tick);else last=0;}
function wake(){if(enabled()&&needsFrames()&&!raf){last=0;raf=requestAnimationFrame(tick);}}
function step(){if(pending)return;manual();paused=true;advancePhysical(.25);render();say(`Tiempo del modelo: ${fmt(state.t,2)} segundos.`);wake();}
function togglePlay(){if(reduced.matches||pending)return;manual();paused=!paused;render(false);wake();}
function themeLabel(){$('theme').setAttribute('aria-label',document.body.dataset.theme==='dark'?'Cambiar al tema claro':'Cambiar al tema oscuro');}
for(const id of['height','mass'])$(id).addEventListener('input',updateParams);$('friction').addEventListener('change',updateParams);
$('release').addEventListener('click',()=>{if(pending){armed=true;render(false);wake();}else prepare(true);});
$('play').addEventListener('click',togglePlay);$('step').addEventListener('click',step);
$('reset').addEventListener('click',()=>{params={height:26,mass:500,gamma:0};rate=.5;$('rate').value='0.5';prepare();});
$('rate').addEventListener('change',event=>{manual();rate=Number(event.target.value);render(false);wake();});
$('tour').addEventListener('click',()=>{if(auto){manual();paused=true;render(false);}else{params={height:26,mass:500,gamma:0};prepare(!reduced.matches);auto=!reduced.matches;focusHold=false;render(false);wake();}});
$('record').addEventListener('click',()=>{if($('record').disabled)return;const s=O.snapshot(state);records.push({t:state.t,h:s.h,speed:s.speed,mechanical:s.mechanical,thermal:s.thermal});lastRecorded=state.t;renderRecords();render(false);say(`Observación ${records.length} guardada a los ${fmt(state.t,2)} segundos.`);});
$('clear-records').addEventListener('click',()=>{records=[];lastRecorded=-1;renderRecords();render(false);say('Cuaderno vacío.');});
$('theme').addEventListener('click',()=>{document.body.dataset.theme=document.body.dataset.theme==='dark'?'light':'dark';themeLabel();});
function chooseHeight(value){params={...params,height:O.clamp(Math.round(value),8,30)};prepare();}
stage.addEventListener('keydown',event=>{let value=null,increment=event.shiftKey?5:1;if(event.key==='ArrowRight'||event.key==='ArrowUp')value=params.height+increment;if(event.key==='ArrowLeft'||event.key==='ArrowDown')value=params.height-increment;if(event.key==='Home')value=8;if(event.key==='End')value=30;if(value!==null){event.preventDefault();chooseHeight(value);}if(event.code==='Space'){event.preventDefault();reduced.matches?step():togglePlay();}});
stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;manual();paused=true;drag={x:event.clientX,height:params.height};stage.setPointerCapture(event.pointerId);stage.classList.add('dragging');render(false);});
stage.addEventListener('pointermove',event=>{if(!drag)return;const height=O.clamp(Math.round(drag.height+(event.clientX-drag.x)/stage.clientWidth*22),8,30);if(height!==params.height)chooseHeight(height);});
const endDrag=()=>{drag=null;stage.classList.remove('dragging');};stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);stage.addEventListener('lostpointercapture',endDrag);
lab.addEventListener('pointerenter',()=>{hover=true;if(auto)stopClock();render(false);});lab.addEventListener('pointerleave',()=>{hover=false;render(false);wake();});
document.querySelector('.page').addEventListener('focusin',event=>{if(event.target.closest('.laboratory,.playback')){focusHold=true;if(auto)stopClock();render(false);}});
document.querySelector('.page').addEventListener('focusout',event=>{focusHold=!!event.relatedTarget?.closest('.laboratory,.playback');render(false);wake();});
document.addEventListener('visibilitychange',()=>{stopClock();render(false);wake();});
new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;stopClock();render(false);wake();}).observe(lab);
reduced.addEventListener('change',()=>{stopClock();manual();paused=true;if(pending){applyPreparation();pending=null;}opacity=1;render();wake();});
themeLabel();describe();renderRecords();render();wake();
