import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(a),Math.abs(b)));
test('La desmagnetización aislada conserva B/T, polarización y entropía',()=>{for(const bath of[.8,2])for(const initial of[1,4])for(const final of[.05,.5]){const s=O.create({bath,initial,final}),a=O.snapshot(O.advance(s,4));for(const t of[4,6,8,10,12]){const b=O.snapshot(O.advance(s,t));near(b.field/b.temperature,initial/bath);near(b.entropy,a.entropy);near(b.polarization,a.polarization);assert.ok(b.temperature>0);}near(O.snapshot(O.advance(s,12)).temperature,bath*final/initial);}});
test('Con contacto el baño mantiene la temperatura y aporta calor al desmagnetizar',()=>{const s=O.create({mode:1}),a=O.snapshot(O.advance(s,3)),b=O.snapshot(O.advance(s,10));near(b.temperature,s.bath);assert.ok(b.entropy>a.entropy);assert.ok(b.heatBath<a.heatBath);near(b.switchAngle,0);});
test('Sin campo hay dos niveles equiprobables y la magnetización isotérmica expulsa calor',()=>{near(O.spinEntropy(0),Math.log(2));const a=O.snapshot(O.create()),b=O.snapshot(O.advance(O.create(),3));near(a.polarization,0);assert.ok(b.entropy<a.entropy);assert.ok(b.heatBath>0);near(b.heatBath,1.5*(a.entropy-b.entropy));});
