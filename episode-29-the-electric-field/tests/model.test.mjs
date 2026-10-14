import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
test('El campo es independiente de la sonda y la fuerza invierte su signo',()=>{const a=O.snapshot(O.create({charge:3})),b=O.snapshot(O.create({charge:-3}));assert.equal(a.field,500);assert.equal(a.field,b.field);assert.equal(a.force,-b.force);});
test('La cavidad ideal tiene campo, fuerza y potencial nulos',()=>{for(const t of[0,3,6,9,12]){const v=O.snapshot(O.advance(O.create({voltage:120,charge:5,shield:1}),t));assert.equal(v.field,0);assert.equal(v.force,0);assert.equal(v.potential,0);}});
test('La diferencia espacial del potencial reproduce −E',()=>{const a=O.snapshot(O.create()),b=O.snapshot(O.advance(O.create(),3));assert.ok(Math.abs((b.potential-a.potential)/(b.position-a.position)+a.field)<1e-10);});
