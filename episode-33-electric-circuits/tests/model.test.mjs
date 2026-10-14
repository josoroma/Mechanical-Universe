import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12*Math.max(1,Math.abs(a),Math.abs(b)));
test('Serie: corriente única y suma de tensiones',()=>{const a=O.snapshot(O.create());near(a.current,a.i1);near(a.i1,a.i2);near(a.i2,a.i3);near(a.voltage,a.v1+a.v2+a.v3);near(a.equivalent,90);});
test('Paralelo: tensión común y conservación de corriente y potencia',()=>{const a=O.snapshot(O.create({mode:1}));near(a.v1,6);near(a.v2,6);near(a.v3,6);near(a.current,a.i1+a.i2+a.i3);near(a.voltage*a.current,a.p1+a.p2+a.p3);near(a.energy,0);});
test('Abrir corta la energía; integrar potencia da la energía acumulada',()=>{for(const mode of[0,1]){const a=O.snapshot(O.advance(O.create({mode}),20));near(a.energy,20*a.voltage*a.current);const b=O.snapshot(O.advance(O.create({mode,closed:0}),20));near(b.current,0);near(b.energy,0);}});
