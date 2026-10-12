import {writeFileSync} from 'node:fs';
import {DEFAULTS,PRESETS,snapshot} from '../model.mjs';
const ev=code=>['eval',`(()=>{${code}})()`];
const data="const d=document.querySelector('.comparison-bench').dataset;";
const assert="const ok=(v,m)=>{if(!v)throw Error(m)};const near=(a,b)=>Math.abs(a-b)<1e-9*Math.max(1e-18,Math.abs(a),Math.abs(b));";
const set=(id,value)=>ev(`const el=document.getElementById('${id}');el.value=${value};el.dispatchEvent(new Event('input',{bubbles:true}));`);
const actions=[['wait',150],ev(`${data}${assert}ok(document.documentElement.lang==='es','Idioma');ok(d.auto==='false','Movimiento reducido');ok(document.querySelectorAll('[data-part]').length===112,'Piezas');return 'Idioma, movimiento reducido y 112 piezas correctos';`)];
for(const p of PRESETS){
  const s=snapshot(p.values);
  actions.push(ev(`document.querySelector('[data-preset="${p.id}"]').click();`));
  actions.push(ev(`${data}${assert}for(const [k,v]of Object.entries(${JSON.stringify(Object.fromEntries(['distance','mass','q1','q2','gravity','electric','signedElectric','ratio','net'].map(k=>[k,s[k]])))}))ok(near(+d[k],v),'${p.id}: '+k);return '${p.name}: lecturas correctas';`));
  for(const kind of ['gravity','electric'])actions.push(['lines',null,`.instrument[data-kind=${kind}]`]);
}
actions.push(ev("document.getElementById('reset').click();"),set('distance',1),ev(`${data}${assert}ok(near(+d.gravity,${snapshot().gravity/4}),'Inverso cuadrado gravedad');ok(near(+d.electric,${snapshot().electric/4}),'Inverso cuadrado carga');ok(near(+d.ratio,${snapshot().ratio}),'Razón invariante');return 'Distancia duplicada: ambas fuerzas divididas por cuatro';`));
actions.push(set('distance',.2),set('mass',5),set('charge',2));
for(const kind of ['gravity','electric'])actions.push(['lines',null,`.instrument[data-kind=${kind}]`]);
actions.push(ev("document.querySelector('[data-polarity=same]').click();"));
for(const kind of ['gravity','electric'])actions.push(['lines',null,`.instrument[data-kind=${kind}]`]);
actions.push(ev(`${data}${assert}ok(+d.signedElectric<0&&+document.querySelector('[data-kind=electric]').dataset.angle<0,'Repulsión geométrica');return 'Extremos de masa, carga y distancia correctos';`));
actions.push(ev("document.getElementById('reset').click();"),['scroll','.instrument[data-kind=gravity] .stage'],['key','ArrowRight','.instrument[data-kind=gravity] .stage'],ev(`${data}${assert}ok(near(+d.distance,.51),'Teclado');`),['key','Home','.instrument[data-kind=gravity] .stage'],ev(`${data}${assert}ok(near(+d.distance,.2),'Inicio');`),['key','End','.instrument[data-kind=gravity] .stage'],ev(`${data}${assert}ok(near(+d.distance,1),'Fin');`),['drag','.instrument[data-kind=gravity] .stage',.7,.6,.3,.6,12],ev(`${data}${assert}ok(+d.distance<.75&&+d.distance>.5,'Arrastre');ok(!document.querySelector('.dragging'),'Captura liberada');return 'Teclado y arrastre reales correctos';`));
actions.push(ev("document.getElementById('reset').click();document.getElementById('double-distance').click();"),ev(`${data}${assert}ok(near(+d.distance,1),'Ejemplo doble distancia');`),ev("document.getElementById('neutral').click();"),ev(`${data}${assert}ok(+d.electric===0&&+d.gravity>0,'Quitar cargas');`),ev("document.getElementById('demo').click();"),ev(`${data}${assert}ok(d.auto==='false','Demo sin animación');ok(+d.electric>0,'Otro ejemplo');return 'Comparaciones y alternativa sin animación correctas';`));
actions.push(ev("document.getElementById('reset').click();document.activeElement.blur();window.scrollTo(0,0);"),['wait',120]);
writeFileSync(new URL('reduced.json',import.meta.url),JSON.stringify(actions,null,2));
const shots=[['wait',150],['shot','shots/desktop-dark.png','.page',1],['shot','shots/gravity-dark-detail.png','.instrument[data-kind=gravity]',4],['shot','shots/electric-dark-detail.png','.instrument[data-kind=electric]',4]];
writeFileSync(new URL('dark-shots.json',import.meta.url),JSON.stringify(shots,null,2));
