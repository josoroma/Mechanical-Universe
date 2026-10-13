import test from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} ≠ ${b}`);
test('La pista conecta las alturas con pendiente y curvatura continuas',()=>{
  for(const[i,x]of[-24,-12,0,12,24].entries()){const s=O.track(x);near(s.h,O.HEIGHTS[i]);near(s.slope,0);near(s.curvature,0);}
  for(const x of[-12,0,12]){const a=O.track(x-1e-6),b=O.track(x+1e-6);near(a.h,b.h,1e-9);near(a.slope,b.slope,1e-10);near(a.curvature,b.curvature,2e-6);}
});
test('La liberación empieza en la altura solicitada y desde el reposo',()=>{
  for(const height of[8,12,18,26,30]){const s=O.create({height}),p=O.snapshot(s);assert.ok(s.x>-24&&s.x<-12);near(p.h,height);near(p.kinetic,0);near(p.thermal,0);near(p.initial,s.mass*O.G*height);assert.ok(O.advance(s,.25).v>0);}
});
test('Al descender sin rozamiento, la pérdida potencial se convierte en cinética',()=>{
  const s=O.create(),p=O.snapshot(O.advance(s,2));assert.ok(p.h<s.h0&&p.speed>0);near(p.initial-p.potential,p.kinetic,.002);near(p.speed,Math.sqrt(2*O.G*(s.h0-p.h)),1e-6);
});
test('La masa escala las energías y conserva la misma trayectoria',()=>{
  for(const gamma of[0,.09]){const a=O.advance(O.create({mass:500,gamma}),6),b=O.advance(O.create({mass:1000,gamma}),6),sa=O.snapshot(a),sb=O.snapshot(b);near(a.x,b.x);near(a.v,b.v);for(const key of['potential','kinetic','thermal','total'])near(sb[key],2*sa[key],1e-7);}
});
test('Sin rozamiento, el balance se conserva durante varios recorridos',()=>{
  for(const height of[8,14,26,30]){let s=O.create({height});for(let j=0;j<160;j++){s=O.advance(s,.25);const p=O.snapshot(s);assert.ok(Math.abs(p.error)/p.initial<2e-6);assert.equal(p.thermal,0);assert.ok(p.h<=height+.0001);}assert.ok(s.turns>=2);}
});
test('Con resistencia, la energía térmica aumenta y compensa la pérdida mecánica',()=>{
  let s=O.create({gamma:.09}),last=O.snapshot(s);for(let j=0;j<160;j++){s=O.advance(s,.25);const p=O.snapshot(s);assert.ok(p.thermal>=last.thermal);assert.ok(p.mechanical<=last.mechanical+.001);assert.ok(Math.abs(p.error)/p.initial<2e-6);last=p;}assert.ok(last.thermal>last.initial*.5);
});
test('Una liberación por debajo de la loma permanece en el valle izquierdo',()=>{
  let s=O.create({height:12});for(let j=0;j<240;j++){s=O.advance(s,.25);assert.ok(s.x<0);}assert.ok(s.turns>4);
});
test('Una liberación de 26 m cruza la loma y llega al valle derecho',()=>{
  let s=O.create(),right=false,maxSpeed=0;for(let j=0;j<120;j++){s=O.advance(s,.1);right||=s.x>12;maxSpeed=Math.max(maxSpeed,Math.abs(s.v));}assert.ok(right);near(maxSpeed,Math.sqrt(2*O.G*(26-3)),.03);
});
test('La duración física no depende de agrupar el avance en fotogramas',()=>{
  let small=O.create({gamma:.09});for(let j=0;j<24;j++)small=O.advance(small,.25);const big=O.advance(O.create({gamma:.09}),6);near(small.x,big.x,1e-10);near(small.v,big.v,1e-10);near(small.q,big.q,1e-10);near(small.t,6,1e-10);
});
test('Se rechazan parámetros y pasos temporales fuera del dominio',()=>{
  assert.throws(()=>O.create({height:31}),RangeError);assert.throws(()=>O.create({mass:0}),RangeError);assert.throws(()=>O.create({gamma:-.1}),RangeError);assert.throws(()=>O.advance(O.create(),-1),RangeError);assert.throws(()=>O.advance(O.create(),NaN),RangeError);assert.throws(()=>O.track(NaN),TypeError);near(O.advance(O.create(),0).t,0);
});
test('El equilibrio inestable en una cima no se confunde con el reposo en un valle',()=>{
  const crest={...O.create({gamma:.09}),x:0,v:0,q:O.G*(26-18)},next=O.advance(crest,.25);near(next.x,0);near(next.v,0);assert.equal(next.settled,false);near(O.snapshot(next).h,18);
});
