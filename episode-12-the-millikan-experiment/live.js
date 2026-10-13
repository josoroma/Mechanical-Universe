const $=id=>document.getElementById(id),stage=document.querySelector('.stage'),optic=document.querySelector('.optic-stage'),lab=document.querySelector('.laboratory');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),pointer=document.querySelector('.voltage-pointer'),oil=$('oil');
const fmt=(x,d=1)=>new Intl.NumberFormat('es-CR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Math.abs(x)<.5*10**(-d)?0:x).replace(/-/g,'−');
const signed=(x,d=1)=>(x>0?'+':'')+fmt(x,d),put=(id,value)=>{const el=$(id);if(el.textContent!==value)el.textContent=value;};
let index=0,serial=1,drop=O.dropAt(0),U=0,target=0,contact=null,paused=reduced.matches,auto=!reduced.matches;
let measurement=null,fallVelocity=null,records=[],recorded=new Set(),spawn=null,tourTime=0,phase=-1,clock=0,hover=false,focusHold=false,drag=null;
let visible=true,raf=0,last=0,theme=document.body.dataset.theme;
const intersections=new Map([[stage,true],[optic,true]]);
const currentKey=()=>`${serial}:${drop.n}`;
const inView=()=>!contact&&Math.abs(drop.z)<.0013;
const say=text=>put('announcement',text);
const canRecord=s=>fallVelocity!==null&&!measurement?.active&&!spawn&&s.balanced&&inView()&&!recorded.has(currentKey());
function cancelMeasurement(){if(measurement?.active){measurement=null;fallVelocity=null;}}
function manual(){auto=false;phase=-1;target=U;}
function setVoltage(value,{run=false}={}){
  manual();cancelMeasurement();target=O.clamp(value,-500,500);if(reduced.matches)U=target;
  if(run&&!reduced.matches)paused=false;render();wake();
}
function updateTheme(){document.body.dataset.theme=theme;$('theme').setAttribute('aria-label',theme==='dark'?'Cambiar al tema claro':'Cambiar al tema oscuro');}
function renderRecords(){
  const body=$('records');body.replaceChildren();
  if(!records.length){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=4;cell.className='empty';cell.textContent='Todavía no hay medidas. Mide la caída, ajusta el equilibrio y registra la carga.';row.append(cell);body.append(row);}
  for(const record of records){const row=document.createElement('tr');for(const value of [record.id,fmt(record.U,2),fmt(record.q/1e-19,4),fmt(record.units,3)]){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}body.append(row);}
  put('record-count',`${records.length} ${records.length===1?'carga registrada':'cargas registradas'}`);$('clear-records').disabled=!records.length;
}
function render(){
  const s=O.physics(drop,U),v=contact?0:s.velocity,ready=canRecord(s);
  pointer.setAttribute('d',S.pointer(U));
  oil.setAttribute('transform',`translate(218 ${180-drop.z*100000})`);
  const alpha=spawn?(spawn.age<.24?1-spawn.age/.24:Math.min(1,(spawn.age-.24)/.3)):1;
  oil.setAttribute('opacity',String(contact?0:alpha));oil.querySelector('.oil-body').setAttribute('r',String(6*drop.radius/.85e-6));
  put('actual-voltage',fmt(U,1));put('voltage-value',`${signed(target,1)} V`);put('field-value',fmt(Math.abs(s.field)/1000,2));
  $('voltage').value=String(target);stage.setAttribute('aria-valuenow',String(Math.round(U*10)/10));stage.setAttribute('aria-valuetext',`${signed(U,1)} voltios`);
  put('plate-state',Math.abs(U)<.05?'Placas sin campo':U>0?'Placa superior + · campo hacia abajo':'Placa superior − · campo hacia arriba');
  put('drop-id',`Gota ${drop.id} · ${String(serial).padStart(2,'0')}`);put('velocity-value',signed(v*1e6,1));put('height-value',signed(drop.z*1000,3));
  put('drop-state',contact?'Contacto con una placa':!inView()?'Gota fuera del campo visual':s.balanced?'La gota está casi suspendida':s.velocity>0?'La gota asciende':'La gota desciende');
  put('weight-force',fmt(s.weight/1e-15,2));put('electric-force',fmt(Math.abs(s.electric)/1e-15,2));put('electric-direction',Math.abs(s.electric)<1e-20?'sin fuerza':s.electric>0?'hacia arriba':'hacia abajo');
  put('field-description',Math.abs(U)<.05?'Sin diferencia de potencial no hay campo eléctrico entre las placas.':U>0?'El campo apunta hacia abajo; sobre la gota negativa ejerce una fuerza hacia arriba.':'Al invertir la polaridad, el campo apunta hacia arriba y empuja la gota negativa hacia abajo.');
  const air=contact?0:-s.drag*s.velocity;put('drag-force',fmt(Math.abs(air)/1e-15,2));put('drag-direction',Math.abs(air)<1e-20?'sin arrastre':air>0?'hacia arriba':'hacia abajo');
  $('record').disabled=!ready;$('measure').disabled=!!spawn||!!contact||!inView()||!!measurement?.active;$('electron').disabled=!!spawn||!!contact||!!measurement?.active||drop.n>=12;
  $('spawn').disabled=!!spawn;
  if(measurement?.active)put('measure-data',`Midiendo 0,20 mm sin campo…\nTiempo transcurrido: ${fmt(measurement.elapsed,3)} s`);
  else if(fallVelocity!==null){const radius=O.radiusFromFall(fallVelocity);put('measure-data',`Caída: 0,20 mm en ${fmt(measurement.elapsed,3)} s\nvcaída = ${fmt(fallVelocity*1e6,2)} μm/s · radio = ${fmt(radius*1e6,3)} μm`);}
  else put('measure-data','Primero mide la caída sin campo.\nAsí podrás inferir el radio de la gota.');
  let next=spawn?'El atomizador prepara otra gota.':contact||!inView()?'Pulveriza otra gota para continuar la observación.':measurement?.active?'El cronómetro se detendrá al completar 0,20 mm.':fallVelocity===null?'1. Mide cuánto tarda la gota en descender 0,20 mm con el campo apagado.':recorded.has(currentKey())?'Carga registrada. Captura un electrón o pulveriza otra gota y repite.':s.balanced?'3. La gota está casi suspendida: registra su carga en el cuaderno.':'2. Ajusta una tensión positiva hasta suspender la gota; también puedes usar la ayuda de equilibrio.';
  put('next-step',next);put('play',paused?'▶ Reanudar':'Ⅱ Pausar');$('play').disabled=reduced.matches;
  put('tour',reduced.matches?'Ver otro estado':'Demostración');$('tour').setAttribute('aria-pressed',String(auto));
  put('status',reduced.matches?'Movimiento reducido · avance manual':spawn?'Atomizador en funcionamiento':measurement?.active?'Cronometrando la caída libre':contact?'Observación terminada':paused?'Reloj en pausa':auto&&(hover||focusHold)?'Demostración en pausa':auto?'Demostración automática':'Exploración libre');
  Object.assign(lab.dataset,{u:String(U),target:String(target),z:String(drop.z),velocity:String(v),balanced:String(s.balanced),n:String(drop.n),serial:String(serial),radius:String(drop.radius),fallVelocity:String(fallVelocity??''),measuring:String(!!measurement?.active),elapsed:String(measurement?.elapsed??0),records:String(records.length),auto:String(auto),paused:String(paused),clock:String(clock),visible:String(visible),contact:contact??'',spawning:String(!!spawn),reduced:String(reduced.matches)});
}
function applyDrop(){index++;serial++;drop=O.dropAt(index);U=0;target=0;contact=null;measurement=null;fallVelocity=null;}
function introduce(automatic=false){
  if(!automatic){manual();cancelMeasurement();paused=reduced.matches;}if(spawn)return;
  if(reduced.matches){applyDrop();say(`Gota ${drop.id} introducida. Repite la medición de caída libre.`);}
  else spawn={age:0,applied:false};
  render();wake();
}
function finishMeasurement(){
  measurement.active=false;fallVelocity=O.MEASURE_DISTANCE/measurement.elapsed;paused=true;
  say(`Caída medida en ${fmt(measurement.elapsed,3)} segundos. Ajusta ahora la tensión para suspender la gota.`);
}
function advancePhysical(dt,instant=false){
  if(contact)return;
  if(measurement?.active){
    U=target=0;const velocity=O.physics(drop,0).freefall,remaining=Math.max(0,O.MEASURE_DISTANCE-(measurement.start-drop.z));
    const used=Math.min(dt,remaining/velocity);drop.z-=velocity*used;measurement.elapsed+=used;clock+=used;
    if(remaining-velocity*used<=1e-14){drop.z=measurement.start-O.MEASURE_DISTANCE;finishMeasurement();}
  }else{const step=O.advance(drop,U,target,dt,instant?0:.2);U=step.U;drop.z=step.z;contact=step.contact;clock+=dt;if(contact){paused=true;say('La gota tocó una placa. Pulveriza otra para continuar.');}}
}
function advanceFrame(dt){
  if(spawn){spawn.age+=dt;if(spawn.age>=.24&&!spawn.applied){applyDrop();spawn.applied=true;}if(spawn.age>=.54){spawn=null;say(`Gota ${drop.id} introducida.`);}return;}
  if(!paused){
    if(auto){tourTime+=dt;const next=Math.floor((tourTime%20)/4);if(next!==phase){phase=next;const eq=O.physics(drop,0).balance;target=[0,eq,eq*1.6,eq,0][phase];}if(tourTime>=20){tourTime%=20;phase=-1;introduce(true);return;}}
    advancePhysical(dt);
  }else if(Math.abs(target-U)>1e-7){U=target+(U-target)*Math.exp(-dt/.2);if(Math.abs(target-U)<1e-7)U=target;}
}
function enabled(){return !document.hidden&&visible&&!(auto&&(hover||focusHold));}
function needsFrames(){return !reduced.matches&&(!!spawn||Math.abs(target-U)>1e-7||(!paused&&!contact));}
function tick(now){raf=0;if(!enabled()){last=0;return;}const dt=last?Math.min(.05,Math.max(0,(now-last)/1000)):0;last=now;advanceFrame(dt);render();if(needsFrames())raf=requestAnimationFrame(tick);else last=0;}
function wake(){if(enabled()&&needsFrames()&&!raf){last=0;raf=requestAnimationFrame(tick);}}
function stopClock(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
function togglePlay(){if(reduced.matches)return;manual();paused=!paused;render();wake();}
function manualStep(){manual();paused=true;if(spawn){if(!spawn.applied)applyDrop();spawn=null;}advancePhysical(1,true);render();wake();}
function measure(){
  if($('measure').disabled)return;manual();U=target=0;fallVelocity=null;measurement={active:true,start:drop.z,elapsed:0};paused=reduced.matches;
  say(reduced.matches?'Medición preparada. Avanza de segundo en segundo hasta completar la caída.':'Comienza la medición de caída libre.');render();wake();
}
$('voltage').addEventListener('input',event=>setVoltage(Number(event.target.value)));
$('field-off').addEventListener('click',()=>setVoltage(0,{run:true}));
$('balance').addEventListener('click',()=>{setVoltage(O.physics(drop,0).balance,{run:true});say('Ayuda calculada: se ajusta la tensión de equilibrio.');});
$('reverse').addEventListener('click',()=>setVoltage(Math.abs(target)>.1?-target:-O.physics(drop,0).balance,{run:true}));
$('measure').addEventListener('click',measure);$('spawn').addEventListener('click',()=>introduce());
$('electron').addEventListener('click',()=>{manual();drop.n++;if(!reduced.matches)paused=false;say('La gota ha capturado un electrón. Su radio se conserva; busca la nueva tensión de equilibrio.');render();wake();});
$('record').addEventListener('click',()=>{
  const s=O.physics(drop,U);if(!canRecord(s))return;const result=O.measuredCharge(fallVelocity,U);
  records.push({id:`${drop.id} · ${String(serial).padStart(2,'0')}`,U,q:result.q,units:result.units});if(records.length>8)records.shift();recorded.add(currentKey());
  say(`Carga registrada: ${fmt(result.units,3)} veces la carga elemental en magnitud.`);renderRecords();render();
});
$('clear-records').addEventListener('click',()=>{records=[];recorded.clear();renderRecords();render();say('Cuaderno vacío.');});
$('play').addEventListener('click',togglePlay);$('step').addEventListener('click',manualStep);
$('tour').addEventListener('click',()=>{
  if(reduced.matches){const eq=O.physics(drop,0).balance,states=[0,eq,eq*1.6,-eq];phase=(phase+1)%states.length;auto=false;U=target=states[phase];cancelMeasurement();paused=true;}
  else{const start=!auto;manual();cancelMeasurement();auto=start;if(auto){tourTime=0;phase=-1;paused=false;}}
  render();wake();
});
$('reset').addEventListener('click',()=>{index=0;serial=1;drop=O.dropAt(0);U=target=0;contact=null;paused=reduced.matches;auto=false;spawn=null;measurement=null;fallVelocity=null;records=[];recorded.clear();tourTime=clock=0;phase=-1;renderRecords();render();say('Laboratorio restablecido y cuaderno vacío.');wake();});
$('theme').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';updateTheme();});
stage.addEventListener('keydown',event=>{
  let value=null;const increment=event.shiftKey?25:5;
  if(event.key==='ArrowRight'||event.key==='ArrowUp')value=(auto?U:target)+increment;
  if(event.key==='ArrowLeft'||event.key==='ArrowDown')value=(auto?U:target)-increment;
  if(event.key==='Home')value=-500;if(event.key==='End')value=500;
  if(value!==null){event.preventDefault();setVoltage(value);}
  if(event.code==='Space'){event.preventDefault();reduced.matches?manualStep():togglePlay();}
});
optic.addEventListener('keydown',event=>{if(event.code==='Space'){event.preventDefault();reduced.matches?manualStep():togglePlay();}});
stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;manual();cancelMeasurement();drag={x:event.clientX,U};stage.setPointerCapture(event.pointerId);stage.classList.add('dragging');render();});
stage.addEventListener('pointermove',event=>{if(!drag)return;target=O.clamp(drag.U+(event.clientX-drag.x)/stage.clientWidth*1000,-500,500);if(reduced.matches)U=target;render();wake();});
const endDrag=()=>{drag=null;stage.classList.remove('dragging');};stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);stage.addEventListener('lostpointercapture',endDrag);
lab.addEventListener('pointerenter',()=>{hover=true;if(auto)stopClock();render();});lab.addEventListener('pointerleave',()=>{hover=false;render();wake();});
document.querySelector('.page').addEventListener('focusin',event=>{if(event.target.closest('.laboratory,.playback')){focusHold=true;if(auto)stopClock();render();}});
document.querySelector('.page').addEventListener('focusout',event=>{focusHold=!!event.relatedTarget?.closest('.laboratory,.playback');render();wake();});
document.addEventListener('visibilitychange',()=>{stopClock();render();wake();});
const observer=new IntersectionObserver(entries=>{for(const entry of entries)intersections.set(entry.target,entry.isIntersecting);visible=[...intersections.values()].some(Boolean);stopClock();render();wake();});observer.observe(stage);observer.observe(optic);
reduced.addEventListener('change',()=>{stopClock();auto=false;paused=true;U=target;if(spawn){if(!spawn.applied)applyDrop();spawn=null;}render();wake();});
updateTheme();renderRecords();render();wake();
