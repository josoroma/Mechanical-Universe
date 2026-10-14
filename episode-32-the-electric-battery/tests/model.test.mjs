import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
import {FARADAY} from '../../laboratory/electrical.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12*Math.max(Math.abs(a),Math.abs(b),1e-20));
test('Circuito abierto: tensión sin corriente ni consumo',()=>{const a=O.snapshot(O.advance(O.create({closed:0}),600));assert.equal(a.current,0);assert.equal(a.terminal,1.1);assert.equal(a.delivered,0);assert.equal(a.zinc,0);});
test('La energía química se reparte entre carga y pérdidas internas',()=>{for(const source of[0,1]){const a=O.snapshot(O.advance(O.create({source,cells:6}),600));near(a.chemical,a.delivered+a.heat);near(a.terminal,a.current*25);}});
test('Estequiometría de Daniell: dos electrones por zinc y por cobre',()=>{const a=O.snapshot(O.advance(O.create(),600));near(a.zinc/65.38,a.charge/(2*FARADAY));near(a.copper/63.546,a.zinc/65.38);const b=O.snapshot(O.advance(O.create({source:0,cells:6}),600));assert.equal(b.copper,0);near(b.zinc/65.38,6*b.charge/(2*FARADAY));});
