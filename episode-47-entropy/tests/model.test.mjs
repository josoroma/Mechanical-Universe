import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a),Math.abs(b)));
test('El estado separado tiene multiplicidad uno y la compuerta abre antes de mezclar',()=>{const a=O.snapshot(O.create()),b=O.snapshot(O.advance(O.create(),.5));assert.equal(a.a,20);assert.equal(a.b,0);assert.equal(a.entropy,0);assert.equal(b.entropy,0);near(b.lift,45);near(O.logChoose(5,2),Math.log(10));});
test('La entropía corresponde a los recuentos del dibujo y queda bajo nR ln2',()=>{for(const count of[20,40,60])for(let t=0;t<=12;t+=.05){const s=O.advance(O.create({count}),t),v=O.snapshot(s),p=O.particles(s);assert.equal(v.a,p.filter(q=>!q.group&&q.x<.5).length);assert.equal(v.b,p.filter(q=>q.group&&q.x<.5).length);near(v.entropy,O.AMOUNT*O.R/count*(O.logChoose(count/2,v.a)+O.logChoose(count/2,v.b)));assert.ok(v.entropy>=0&&v.entropy<=v.limit);}});
test('El mismo gas no adquiere entropía de mezcla por cambiar etiquetas',()=>{for(const t of[0,2,6,12])assert.equal(O.snapshot(O.advance(O.create({kind:1}),t)).entropy,0);near(O.snapshot(O.create({count:40})).returnLog,Math.log10(2**-40));});
