const $=id=>document.getElementById(id),stage=document.querySelector('.stage'),lab=document.querySelector('.laboratory'),machine=document.querySelector('.machine');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fmt=(x,d=1)=>new Intl.NumberFormat('es-CR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Math.abs(x)<.5*10**(-d)?0:x).replace(/-/g,'−'),signed=(x,d=1)=>(x>0?'+':'')+fmt(x,d);
const put=(id,text)=>{const el=$(id);if(el.textContent!==text)el.textContent=text;},say=text=>put('announcement',text);
let params={amplitude:.35,side:1,factor:1},state=O.create(params),paused=reduced.matches,auto=!reduced.matches,rate=.5,delay=reduced.matches?0:1.4;
let pending=null,armed=false,opacity=1,records=[],lastRecorded=-1,hover=false,focusHold=false,visible=true,drag=null,raf=0,last=0,lastOrder='',curveKey='';
const fixed=S.fixed(),cache=new WeakMap(),refs=new Map([...machine.children].map(node=>[node.dataset.part,node])),restX=O.spring(state).x;
const ballRefs=new Map(['solid','hollow'].map(id=>{const node=refs.get(`ball.${id}`);return[id,{node,body:node.querySelector('.ball-body'),edge:node.querySelector('.ball-edge'),stripe:node.querySelector('.ball-stripe')}];}));
const coilRefs=new Map([...refs].filter(([name])=>name.startsWith('spring.coil.')).map(([name,node])=>[name,{node,body:node.querySelector('.tb-body'),shine:node.querySelector('.tb-shine'),shade:node.querySelector('.tb-shade'),edges:node.querySelector('.tb-edge')}]));
function paint(){
  const balls=S.balls(state),spring=O.spring(state),springs=S.springParts(spring.x,false),parts=[...fixed,...balls,...springs];
  for(const part of balls){const r=ballRefs.get(part.name.slice(5)),b=part.ball;for(const el of[r.body,r.edge]){el.setAttribute('cx',String(b.cx));el.setAttribute('cy',String(b.cy));}r.stripe.setAttribute('d',b.mark);r.node.setAttribute('opacity',String(opacity));}
  for(const p of springs){const node=refs.get(p.name);node.setAttribute('opacity',String(opacity));if(p.tube){const r=coilRefs.get(p.name);for(const key of['body','shine','shade','edges'])r[key].setAttribute('d',p.tube[key]);}else node.setAttribute('transform',K.translateAlong(S.P,[(spring.x-restX)*S.SPRING_SCALE,0,0]));}
  const order=D.orderParts(parts,S.P,cache),key=order.join('|');if(key!==lastOrder){const f=document.createDocumentFragment();for(const name of order)f.append(refs.get(name));machine.append(f);lastOrder=key;}
}
const plotX=x=>310+x/.55*270,plotY=U=>245-U/.4*220;
function renderPlot(s){
  const key=`${state.factor}:${state.amplitude}`;if(key!==curveKey){curveKey=key;const curve=factor=>K.pathOf(Array.from({length:161},(_,i)=>{const x=-.55+i*1.1/160;return[plotX(x),plotY(O.potential(x)*factor)];}));$('well-curve').setAttribute('d',curve(1));$('spring-curve').setAttribute('d',curve(state.factor));
    for(const[id,E]of[['well',s.E],['spring',s.spring.initial]])$(id+'-energy').setAttribute('d',`M${plotX(-state.amplitude)} ${plotY(E)}H${plotX(state.amplitude)}`);
  }
  for(const b of s.balls){const el=$(`marker-${b.id}`);el.setAttribute('cx',String(plotX(b.x)));el.setAttribute('cy',String(plotY(b.U)));}
  $('marker-spring').setAttribute('x',String(plotX(s.spring.x)-3.5));$('marker-spring').setAttribute('y',String(plotY(s.spring.U)-3.5));
}
function renderRecords(){const body=$('records');body.replaceChildren();if(!records.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.className='empty';td.textContent='Todavía no hay observaciones. Avanza, pausa y guarda un instante.';tr.append(td);body.append(tr);}for(const row of records){const tr=document.createElement('tr');for(const n of[row.t,row.x*100,row.U*1000,row.Ktr*1000,row.Krot*1000]){const td=document.createElement('td');td.textContent=fmt(n,2);tr.append(td);}body.append(tr);}put('record-count',`${records.length} / 3 observaciones`);$('clear-records').disabled=!records.length;}
function describe(){stage.setAttribute('aria-valuenow',String(Math.round(params.amplitude*100)));stage.setAttribute('aria-valuetext',`${fmt(params.amplitude*100,0)} centímetros de amplitud inicial`);}
function render(draw=true){
  const s=O.snapshot(state);if(draw)paint();renderPlot(s);put('time-value',fmt(state.t,2));put('start-height',fmt(O.height(state.amplitude)*100,2));put('initial-value',fmt(s.E*1000,1));
  put('amplitude-output',`${fmt(params.amplitude*100,0)} cm`);$('amplitude').value=String(Math.round(params.amplitude*100));$('stiffness').checked=params.factor===2;put('k-value',fmt(O.K0*params.factor,3));
  document.querySelectorAll('[data-side]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.side)===params.side)));
  for(const b of[...s.balls,s.spring]){put(`${b.id}-x`,signed(b.x*100,2));put(`${b.id}-speed`,fmt(b.speed,2));for(const key of['U','Ktr','Krot','total'])put(`${b.id}-${key}`,fmt(b[key]*1000,1));for(const key of['U','Ktr','Krot'])$(`${b.id}-bar-${key}`).style.width=`${b.initial?Math.max(0,b[key]/b.total)*100:0}%`;}
  put('prediction',params.amplitude===0?'En el mínimo y desde el reposo, los tres cuerpos permanecen en equilibrio.':params.factor===1?'Con k = mg/R, el pozo y el resorte tienen exactamente el mismo potencial U(x). Sus movimientos pueden ser distintos.':'Al duplicar k, el resorte almacena el doble de energía potencial para un mismo desplazamiento. Las bolas conservan su potencial.');
  put('curve-note',state.factor===1?'Las curvas coinciden: Upozo(x) = Uresorte(x).':'Para un mismo x: Uresorte(x) = 2Upozo(x).');
  put('record-context',`Bola maciza · amplitud ${fmt(state.amplitude*100,0)} cm · salida por la ${state.side<0?'izquierda':'derecha'}`);
  put('motion-state',pending?'Preparando una nueva prueba':state.amplitude===0?'En el mínimo · reposo':state.t===0?`Preparado · amplitud ${fmt(state.amplitude*100,0)} cm`:'Cada cuerpo conserva su propia energía');
  put('status',reduced.matches?'Movimiento reducido · avance manual':pending?armed?'Preparando · salida programada':'Preparando una nueva prueba':state.amplitude===0?'Equilibrio · sin movimiento':auto&&(hover||focusHold)?'Demostración en pausa':auto&&delay>0?'Demostración lista para comenzar':paused?'Reloj en pausa':auto?'Demostración automática':'Exploración libre');
  put('play',paused||auto&&(hover||focusHold)?'▶ Reanudar':'Ⅱ Pausar');$('play').disabled=reduced.matches||!!pending||state.amplitude===0;$('step').disabled=!!pending;
  put('release',reduced.matches?'Volver al inicio':pending?(armed?'Preparando…':'Soltar al preparar'):'Soltar los tres');$('release').disabled=!!pending&&armed;
  $('record').disabled=!!pending||records.length>=3||Math.abs(state.t-lastRecorded)<1e-8;$('tour').setAttribute('aria-pressed',String(auto));put('tour',reduced.matches?'Preparar demostración':'Demostración');
  Object.assign(lab.dataset,{time:String(state.t),amplitude:String(state.amplitude),side:String(state.side),factor:String(state.factor),k:String(s.k),initial:String(s.E),records:String(records.length),auto:String(auto),paused:String(paused),ready:String(!pending),opacity:String(opacity),visible:String(visible),reduced:String(reduced.matches),rate:String(rate)});
  for(const b of[...s.balls,s.spring])for(const key of['x','speed','U','Ktr','Krot','total','error'])lab.dataset[b.id+key[0].toUpperCase()+key.slice(1)]=String(b[key]);
}
function manual(){auto=false;delay=0;}
function applyPreparation(){state=O.create(params);records=[];lastRecorded=-1;renderRecords();}
function prepare(run=false){manual();paused=true;armed=run&&!reduced.matches;describe();if(reduced.matches){pending=null;opacity=1;applyPreparation();say('Prueba preparada desde el reposo. Avanza manualmente.');}else{pending='out';say('Se prepara una nueva liberación.');}render();wake();}
function frame(dt){if(pending){const target=pending==='out'?0:1;opacity=target+(opacity-target)*Math.exp(-dt/.07);if(pending==='out'&&opacity<.015){opacity=0;applyPreparation();pending='in';}else if(pending==='in'&&opacity>.998){opacity=1;pending=null;paused=!armed||reduced.matches;say(armed?'Comienza el movimiento de los tres cuerpos.':'Los tres cuerpos están preparados.');armed=false;}return;}if(paused)return;if(delay>0){delay=Math.max(0,delay-dt);return;}state=O.advance(state,dt*rate);}
function enabled(){return !document.hidden&&visible&&!(auto&&(hover||focusHold));}
function needsFrames(){return !reduced.matches&&(!!pending||!paused&&state.amplitude>0);}
function stopClock(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
function tick(now){raf=0;if(!enabled()){last=0;return;}const dt=last?Math.min(1/30,Math.max(0,(now-last)/1000)):0;last=now;frame(dt);render();if(needsFrames())raf=requestAnimationFrame(tick);else last=0;}
function wake(){if(enabled()&&needsFrames()&&!raf){last=0;raf=requestAnimationFrame(tick);}}
function step(){if(pending)return;manual();paused=true;state=O.advance(state,.1);render();say(`Tiempo del modelo: ${fmt(state.t,2)} segundos.`);wake();}
function togglePlay(){if(reduced.matches||pending||!state.amplitude)return;const held=auto&&(hover||focusHold);manual();paused=held?false:!paused;render(false);wake();}
function chooseAmplitude(value){params={...params,amplitude:O.clamp(Math.round(value),0,50)/100};prepare();}
function themeLabel(){$('theme').setAttribute('aria-label',document.body.dataset.theme==='dark'?'Cambiar al tema claro':'Cambiar al tema oscuro');}
$('amplitude').addEventListener('input',event=>chooseAmplitude(Number(event.target.value)));$('stiffness').addEventListener('change',()=>{params={...params,factor:$('stiffness').checked?2:1};prepare();});
document.querySelectorAll('[data-side]').forEach(b=>b.addEventListener('click',()=>{params={...params,side:Number(b.dataset.side)};prepare();}));
$('release').addEventListener('click',()=>{if(pending){armed=true;render(false);wake();}else prepare(true);});$('play').addEventListener('click',togglePlay);$('step').addEventListener('click',step);
$('reset').addEventListener('click',()=>{params={amplitude:.35,side:1,factor:1};rate=.5;$('rate').value='0.5';prepare();});
$('rate').addEventListener('change',event=>{manual();rate=Number(event.target.value);render(false);wake();});
$('tour').addEventListener('click',()=>{if(auto){manual();paused=true;render(false);}else{params={amplitude:.35,side:1,factor:1};prepare(!reduced.matches);auto=!reduced.matches;focusHold=false;render(false);wake();}});
$('record').addEventListener('click',()=>{if($('record').disabled)return;records.push({...O.snapshot(state).balls[0],t:state.t});lastRecorded=state.t;renderRecords();render(false);say(`Observación ${records.length} guardada.`);});
$('clear-records').addEventListener('click',()=>{records=[];lastRecorded=-1;renderRecords();render(false);say('Cuaderno vacío.');});
$('theme').addEventListener('click',()=>{document.body.dataset.theme=document.body.dataset.theme==='dark'?'light':'dark';themeLabel();});
stage.addEventListener('keydown',event=>{let value=null,increment=event.shiftKey?5:1;if(event.key==='ArrowRight'||event.key==='ArrowUp')value=params.amplitude*100+increment;if(event.key==='ArrowLeft'||event.key==='ArrowDown')value=params.amplitude*100-increment;if(event.key==='Home')value=0;if(event.key==='End')value=50;if(value!==null){event.preventDefault();chooseAmplitude(value);}if(event.code==='Space'){event.preventDefault();reduced.matches?step():togglePlay();}});
stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;manual();paused=true;drag={x:event.clientX,amplitude:params.amplitude*100};stage.setPointerCapture(event.pointerId);stage.classList.add('dragging');render(false);});
stage.addEventListener('pointermove',event=>{if(!drag)return;const value=O.clamp(Math.round(drag.amplitude+(event.clientX-drag.x)/stage.clientWidth*50),0,50);if(value!==Math.round(params.amplitude*100))chooseAmplitude(value);});
const endDrag=()=>{drag=null;stage.classList.remove('dragging');};stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);stage.addEventListener('lostpointercapture',endDrag);
lab.addEventListener('pointerenter',()=>{hover=true;if(auto)stopClock();render(false);});lab.addEventListener('pointerleave',()=>{hover=false;render(false);wake();});
document.querySelector('.page').addEventListener('focusin',event=>{if(event.target.closest('.laboratory,.playback')){focusHold=true;if(auto)stopClock();render(false);}});
document.querySelector('.page').addEventListener('focusout',event=>{focusHold=!!event.relatedTarget?.closest('.laboratory,.playback');render(false);wake();});
document.addEventListener('visibilitychange',()=>{stopClock();render(false);wake();});new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;stopClock();render(false);wake();}).observe(lab);
reduced.addEventListener('change',()=>{stopClock();manual();paused=true;if(pending){applyPreparation();pending=null;}opacity=1;render();wake();});
themeLabel();describe();renderRecords();render();wake();

MechanicalPlayback.bind({stop:()=>{stopClock();},refresh:()=>{visible=MechanicalPlayback.inView(lab,document.querySelector('.playback'));hover=lab.matches(':hover');focusHold=!!document.activeElement?.closest('.laboratory,.playback');drag=null;stage.classList.remove('dragging');},resume:()=>{render(false);wake();}});
