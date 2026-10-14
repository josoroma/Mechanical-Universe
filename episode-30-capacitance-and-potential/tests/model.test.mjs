import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as O from '../model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12*Math.max(Math.abs(a),Math.abs(b),1e-20));
test('Duplicar la separación divide C por dos',()=>{near(O.snapshot(O.create({gap:8})).capacitance,O.snapshot(O.create({gap:4})).capacitance/2);});
test('El dieléctrico conserva Q aislada y divide V y U por κ',()=>{const a=O.snapshot(O.create({mode:0})),b=O.snapshot(O.create({mode:0,kappa:4}));near(a.charge,b.charge);near(b.voltage,a.voltage/4);near(b.energy,a.energy/4);});
test('Con batería, V permanece fija y Q y U crecen con κ',()=>{const a=O.snapshot(O.create()),b=O.snapshot(O.create({kappa:4}));near(a.voltage,b.voltage);near(b.charge,4*a.charge);near(b.energy,4*a.energy);for(const t of[0,3,6,9,12])near(O.snapshot(O.advance(O.create(),t)).voltage,100);});
