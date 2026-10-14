import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12*Math.max(Math.abs(a),Math.abs(b),1e-20));
test('Invertir V conserva la atracción y la energía, pero invierte la fuerza de prueba',()=>{const a=O.snapshot(O.create()),b=O.snapshot(O.create({voltage:-200}));near(a.force,b.force);near(a.energy,b.energy);near(a.probeForce,-b.probeForce);});
test('Escalas: duplicar V cuadruplica F; duplicar d divide F por cuatro',()=>{const a=O.snapshot(O.create({voltage:100,gap:4}));near(O.snapshot(O.create({voltage:200,gap:4})).force,4*a.force);near(O.snapshot(O.create({voltage:100,gap:8})).force,a.force/4);});
test('Trabajo y energía usan la misma tensión',()=>{const a=O.snapshot(O.create());near(a.work,a.probeForce*a.distance);near(a.energy,a.force*a.distance);near(O.snapshot(O.advance(O.create(),3)).force,0);});
